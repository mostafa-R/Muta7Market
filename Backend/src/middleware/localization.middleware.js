import i18n from "i18n";
import Localization from "../models/localization.model.js";

/**
 * Middleware to enhance i18n with database translations
 * This middleware loads translations from the database and merges them with i18n
 */
const localizationMiddleware = async (req, res, next) => {
  try {
    // Get the current locale from the request (set by i18n.init middleware)
    const currentLocale = req.getLocale() || "en";

    // Get all translations from the database
    const translations = await Localization.find({});

    // Create a translation object for the current locale
    const dbTranslations = {};

    // Process each translation and organize by group and key
    translations.forEach((item) => {
      const group = item.group;
      const key = item.key;
      const translation = item.translations[currentLocale];

      // Skip if no translation for current locale
      if (!translation) return;

      // Initialize group if it doesn't exist
      if (!dbTranslations[group]) {
        dbTranslations[group] = {};
      }

      // Add translation to the group
      dbTranslations[group][key] = translation;
    });

    // Set the locale for this request
    i18n.setLocale(currentLocale);

    // Create a temporary object to hold all translations
    const allTranslations = {};

    // Organize translations in the format expected by i18n
    Object.entries(dbTranslations).forEach(([group, translations]) => {
      if (group === "general") {
        // For general group, add directly to the root level
        Object.entries(translations).forEach(([key, value]) => {
          allTranslations[key] = value;
        });
      } else {
        // For other groups, create nested objects
        if (!allTranslations[group]) {
          allTranslations[group] = {};
        }
        Object.entries(translations).forEach(([key, value]) => {
          allTranslations[group][key] = value;
        });
      }
    });

    // Add translations to the request for this specific request only
    req.dbTranslations = allTranslations;

    // Add helper functions to get translations from both i18n and our custom translations
    req.__ = (key, options) => {
      // First try to get from our custom translations
      if (req.dbTranslations && req.dbTranslations[key] !== undefined) {
        return req.dbTranslations[key];
      }
      // Fall back to i18n
      return i18n.__(key, options);
    };

    req.__g = (group, key, options) => {
      // First try to get from our custom translations
      if (
        req.dbTranslations &&
        req.dbTranslations[group] &&
        req.dbTranslations[group][key] !== undefined
      ) {
        return req.dbTranslations[group][key];
      }
      // Fall back to i18n
      return i18n.__(`${group}.${key}`, options);
    };

    // Make the translations available to the response locals
    res.locals.translations = allTranslations;

    next();
  } catch (error) {
    console.error("Error in localization middleware:", error);
    next(); // Continue even if there's an error
  }
};

export default localizationMiddleware;
