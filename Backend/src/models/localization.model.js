import mongoose from "mongoose";

// Schema for individual translation entries
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
      // Can be extended for more languages in the future
    },
    isSystem: {
      type: Boolean,
      default: false, // True for system translations that shouldn't be deleted
    },
    metadata: {
      description: String,
      usageExamples: [String],
    },
  },
  { timestamps: true }
);

// Compound index for faster lookups
translationSchema.index({ key: 1, group: 1 }, { unique: true });

// Static methods
translationSchema.statics.findByKeyAndGroup = function (
  key,
  group = "general"
) {
  return this.findOne({ key, group });
};

translationSchema.statics.findByGroup = function (group = "general") {
  return this.find({ group });
};

// Method to get all translations as a structured object by group
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

// Method to get all translations for a specific language as a flat object
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

// Method to sync with i18n locale files
translationSchema.statics.syncWithLocaleFiles = async function (locales) {
  // Implementation to sync with i18n locale files
  // This will be used to keep the database in sync with the locale files
};

// Method to export translations to i18n locale files
translationSchema.statics.exportToLocaleFiles = async function (directory) {
  // Implementation to export translations to i18n locale files
  // This will be used to update the locale files from the database
};

const Localization = mongoose.model("Localization", translationSchema);

export default Localization;
