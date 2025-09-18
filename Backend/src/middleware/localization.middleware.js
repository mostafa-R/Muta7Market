import i18n from "i18n";
import Localization from "../models/localization.model.js";

const localizationMiddleware = async (req, res, next) => {
  try {
    const currentLocale = req.getLocale() || "en";

    const translations = await Localization.find({});

    const dbTranslations = {};

    translations.forEach((item) => {
      const group = item.group;
      const key = item.key;
      const translation = item.translations[currentLocale];

      if (!translation) return;

      if (!dbTranslations[group]) {
        dbTranslations[group] = {};
      }

      dbTranslations[group][key] = translation;
    });

    i18n.setLocale(currentLocale);

    const allTranslations = {};

    Object.entries(dbTranslations).forEach(([group, translations]) => {
      if (group === "general") {
        Object.entries(translations).forEach(([key, value]) => {
          allTranslations[key] = value;
        });
      } else {
        if (!allTranslations[group]) {
          allTranslations[group] = {};
        }
        Object.entries(translations).forEach(([key, value]) => {
          allTranslations[group][key] = value;
        });
      }
    });

    req.dbTranslations = allTranslations;

    req.__ = (key, options) => {
      if (req.dbTranslations && req.dbTranslations[key] !== undefined) {
        return req.dbTranslations[key];
      }
      return i18n.__(key, options);
    };

    req.__g = (group, key, options) => {
      if (
        req.dbTranslations &&
        req.dbTranslations[group] &&
        req.dbTranslations[group][key] !== undefined
      ) {
        return req.dbTranslations[group][key];
      }
      return i18n.__(`${group}.${key}`, options);
    };

    res.locals.translations = allTranslations;

    next();
  } catch (error) {
    console.error("Error in localization middleware:", error);
    next();
  }
};

export default localizationMiddleware;
