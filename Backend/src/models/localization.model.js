import fs from "fs/promises";
import mongoose from "mongoose";
import path from "path";

function flattenObject(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? `${prefix}.` : "";
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      Object.assign(acc, flattenObject(obj[key], `${pre}${key}`));
    } else {
      acc[`${pre}${key}`] = obj[key];
    }
    return acc;
  }, {});
}

const translationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    group: {
      type: String,
      required: true,
      trim: true,
      default: "general",
      index: true,
    },
    translations: {
      ar: {
        type: String,
        required: true,
        trim: true,
      },
      en: {
        type: String,
        required: true,
        trim: true,
      },
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    metadata: {
      description: String,
      usageExamples: [String],
    },
  },
  { timestamps: true }
);

translationSchema.index({ key: 1, group: 1 }, { unique: true });

translationSchema.statics.findByKeyAndGroup = function (
  key,
  group = "general"
) {
  return this.findOne({ key, group });
};

translationSchema.statics.findByGroup = function (group = "general") {
  return this.find({ group });
};

translationSchema.statics.getAllAsObject = async function () {
  const translations = await this.find({});
  const result = {};

  translations.forEach((item) => {
    if (!result[item.group]) {
      result[item.group] = {};
    }
    result[item.group][item.key] = item.translations;
  });

  return result;
};

translationSchema.statics.getLanguageTranslations = async function (
  language = "en"
) {
  const translations = await this.find({});
  const result = {};

  translations.forEach((item) => {
    const key =
      item.group === "general" ? item.key : `${item.group}.${item.key}`;
    result[key] = item.translations[language];
  });

  return result;
};

translationSchema.statics.syncWithLocaleFiles = async function (locales) {
  try {
    const supportedLanguages = Object.keys(locales);
    if (!supportedLanguages.length) {
      throw new Error("No locale files provided");
    }

    const updates = [];
    const newEntries = [];

    for (const lang of supportedLanguages) {
      const locale = locales[lang];

      const flattenedLocale = flattenObject(locale);

      for (const [path, value] of Object.entries(flattenedLocale)) {
        let group = "general";
        let key = path;

        if (path.includes(".")) {
          const parts = path.split(".");
          group = parts[0];
          key = parts.slice(1).join(".");
        }

        const existingTranslation = await this.findOne({ key, group });

        if (existingTranslation) {
          if (!existingTranslation.isSystem) {
            existingTranslation.translations[lang] = value;
            updates.push(existingTranslation.save());
          }
        } else {
          const newTranslation = {
            key,
            group,
            translations: {
              ...supportedLanguages.reduce(
                (acc, l) => ({ ...acc, [l]: "" }),
                {}
              ),
              [lang]: value,
            },
            isSystem: false,
          };

          newEntries.push(this.create(newTranslation));
        }
      }
    }

    await Promise.all([...updates, ...newEntries]);

    return {
      updated: updates.length,
      created: newEntries.length,
      total: updates.length + newEntries.length,
    };
  } catch (error) {
    console.error("Error syncing with locale files:", error);
    throw error;
  }
};

translationSchema.statics.exportToLocaleFiles = async function (directory) {
  try {
    try {
      await fs.access(directory);
    } catch (error) {
      await fs.mkdir(directory, { recursive: true });
    }

    const translations = await this.find({});

    const languageMap = {};

    const supportedLanguages = ["ar", "en"];
    supportedLanguages.forEach((lang) => {
      languageMap[lang] = {};
    });

    translations.forEach((translation) => {
      const { key, group, translations: langValues } = translation;

      supportedLanguages.forEach((lang) => {
        if (!languageMap[lang][group]) {
          languageMap[lang][group] = {};
        }

        languageMap[lang][group][key] = langValues[lang] || "";
      });
    });

    const fileWrites = [];

    for (const [lang, groups] of Object.entries(languageMap)) {
      const fileContent = {};

      for (const [group, keys] of Object.entries(groups)) {
        if (group === "general") {
          Object.assign(fileContent, keys);
        } else {
          fileContent[group] = keys;
        }
      }

      const filePath = path.join(directory, `${lang}.json`);
      const fileData = JSON.stringify(fileContent, null, 2);
      fileWrites.push(fs.writeFile(filePath, fileData, "utf8"));
    }

    await Promise.all(fileWrites);

    return {
      languages: supportedLanguages,
      files: supportedLanguages.map((lang) => `${lang}.json`),
      directory,
    };
  } catch (error) {
    console.error("Error exporting to locale files:", error);
    throw error;
  }
};

const Localization = mongoose.model("Localization", translationSchema);

export default Localization;
