import fs from "fs/promises";
import i18n from "i18n";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Localization from "../models/localization.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOCALES_DIR = join(__dirname, "../locales");

// Helper function to validate translation key
const validateTranslationKey = (key) => {
  // Key should be alphanumeric with underscores, periods, or hyphens
  return /^[a-z0-9_.-]+$/i.test(key);
};

// Get all translations
export const getAllTranslations = asyncHandler(async (req, res) => {
  const { group, language, page = 1, limit = 10, search } = req.query;
  let query = {};
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  if (group && group !== "all") {
    query.group = group;
  }

  // Add search functionality
  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { key: searchRegex },
      { "translations.en": searchRegex },
      { "translations.ar": searchRegex },
    ];
  }

  // If a specific language is requested, format the response accordingly
  if (language && (language === "ar" || language === "en")) {
    const translations = await Localization.find(query).sort({
      group: 1,
      key: 1,
    });

    const formattedTranslations = {};
    translations.forEach((item) => {
      const key =
        item.group === "general" ? item.key : `${item.group}.${item.key}`;
      formattedTranslations[key] = item.translations[language];
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          formattedTranslations,
          `Successfully retrieved ${language} translations`
        )
      );
  }

  // For admin dashboard, implement pagination
  const total = await Localization.countDocuments(query);
  const translations = await Localization.find(query)
    .sort({ group: 1, key: 1 })
    .skip(skip)
    .limit(limitNumber);

  // Return paginated results
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        translations,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil(total / limitNumber),
        },
      },
      "Successfully retrieved translations"
    )
  );
});

// Get translation groups
export const getTranslationGroups = asyncHandler(async (req, res) => {
  const groups = await Localization.distinct("group");

  return res
    .status(200)
    .json(
      new ApiResponse(200, groups, "Successfully retrieved translation groups")
    );
});

// Get translations by group
export const getTranslationsByGroup = asyncHandler(async (req, res) => {
  const { group } = req.params;

  const translations = await Localization.find({ group }).sort({ key: 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        translations,
        `Successfully retrieved translations for group: ${group}`
      )
    );
});

// Create a new translation
export const createTranslation = asyncHandler(async (req, res) => {
  const {
    key,
    group = "general",
    translations,
    isSystem = false,
    metadata,
  } = req.body;

  // Validate required fields
  if (!key || !translations || !translations.ar || !translations.en) {
    throw new ApiError(
      400,
      "Key and translations for Arabic and English are required"
    );
  }

  // Format key (lowercase, replace spaces with underscores)
  const formattedKey = key.toLowerCase().replace(/\s+/g, "_");

  // Validate key format
  if (!validateTranslationKey(formattedKey)) {
    throw new ApiError(
      400,
      "Key must contain only letters, numbers, underscores, periods, or hyphens"
    );
  }

  // Check if translation already exists
  const existingTranslation = await Localization.findOne({
    key: formattedKey,
    group,
  });

  if (existingTranslation) {
    throw new ApiError(
      409,
      "Translation with this key and group already exists"
    );
  }

  // Create new translation
  const newTranslation = await Localization.create({
    key: formattedKey,
    group,
    translations,
    isSystem,
    metadata,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newTranslation, "Translation created successfully")
    );
});

// Update an existing translation
export const updateTranslation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { translations, metadata } = req.body;

  // Find the translation
  const translation = await Localization.findById(id);

  if (!translation) {
    throw new ApiError(404, "Translation not found");
  }

  // Update fields
  if (translations) {
    if (translations.ar) translation.translations.ar = translations.ar;
    if (translations.en) translation.translations.en = translations.en;
  }

  if (metadata) {
    translation.metadata = { ...translation.metadata, ...metadata };
  }

  // Save changes
  await translation.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, translation, "Translation updated successfully")
    );
});

// Delete a translation
export const deleteTranslation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the translation
  const translation = await Localization.findById(id);

  if (!translation) {
    throw new ApiError(404, "Translation not found");
  }

  // Prevent deletion of system translations
  if (translation.isSystem) {
    throw new ApiError(403, "Cannot delete system translations");
  }

  // Delete the translation
  await translation.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, { id }, "Translation deleted successfully"));
});

// Bulk update translations
export const bulkUpdateTranslations = asyncHandler(async (req, res) => {
  const { translations } = req.body;

  if (!Array.isArray(translations)) {
    throw new ApiError(400, "Translations must be an array");
  }

  const results = {
    updated: [],
    failed: [],
  };

  // Process each translation
  for (const item of translations) {
    try {
      if (!item._id) {
        results.failed.push({
          item,
          error: "Missing translation ID",
        });
        continue;
      }

      const translation = await Localization.findById(item._id);

      if (!translation) {
        results.failed.push({
          item,
          error: "Translation not found",
        });
        continue;
      }

      if (item.translations) {
        if (item.translations.ar)
          translation.translations.ar = item.translations.ar;
        if (item.translations.en)
          translation.translations.en = item.translations.en;
      }

      if (item.metadata) {
        translation.metadata = { ...translation.metadata, ...item.metadata };
      }

      await translation.save();
      results.updated.push(translation);
    } catch (error) {
      results.failed.push({
        item,
        error: error.message,
      });
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        results,
        `Updated ${results.updated.length} translations, ${results.failed.length} failed`
      )
    );
});

// Import translations from JSON
export const importTranslations = asyncHandler(async (req, res) => {
  const { translations, overwrite = false } = req.body;

  if (!translations || typeof translations !== "object") {
    throw new ApiError(400, "Invalid translations format");
  }

  const results = {
    created: [],
    updated: [],
    skipped: [],
    failed: [],
  };

  // Process translations
  for (const group in translations) {
    const groupTranslations = translations[group];

    for (const key in groupTranslations) {
      try {
        const translationValue = groupTranslations[key];

        // Skip if not in correct format
        if (!translationValue || !translationValue.ar || !translationValue.en) {
          results.skipped.push({
            group,
            key,
            reason: "Invalid translation format",
          });
          continue;
        }

        // Check if translation exists
        const existingTranslation = await Localization.findOne({ group, key });

        if (existingTranslation) {
          if (overwrite) {
            // Update existing translation
            existingTranslation.translations = translationValue;
            await existingTranslation.save();
            results.updated.push(existingTranslation);
          } else {
            results.skipped.push({ group, key, reason: "Already exists" });
          }
        } else {
          // Create new translation
          const newTranslation = await Localization.create({
            key,
            group,
            translations: translationValue,
          });
          results.created.push(newTranslation);
        }
      } catch (error) {
        results.failed.push({
          group,
          key,
          error: error.message,
        });
      }
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        results,
        `Imported translations: ${results.created.length} created, ${results.updated.length} updated, ${results.skipped.length} skipped, ${results.failed.length} failed`
      )
    );
});

// Export translations to JSON
export const exportTranslations = asyncHandler(async (req, res) => {
  const { group } = req.query;

  let query = {};
  if (group) {
    query.group = group;
  }

  const translations = await Localization.find(query);

  // Format translations as structured object
  const formattedTranslations = {};

  translations.forEach((item) => {
    if (!formattedTranslations[item.group]) {
      formattedTranslations[item.group] = {};
    }
    formattedTranslations[item.group][item.key] = item.translations;
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        formattedTranslations,
        "Translations exported successfully"
      )
    );
});

// Sync with i18n locale files
export const syncWithLocaleFiles = asyncHandler(async (req, res) => {
  try {
    // Read locale files
    const enLocale = JSON.parse(
      await fs.readFile(join(LOCALES_DIR, "en.json"), "utf8")
    );
    const arLocale = JSON.parse(
      await fs.readFile(join(LOCALES_DIR, "ar.json"), "utf8")
    );

    const results = {
      created: [],
      updated: [],
      skipped: [],
    };

    // Process each key in the English locale file
    const processObject = async (obj, arObj, prefix = "") => {
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        // If value is an object, recurse
        if (
          obj[key] !== null &&
          typeof obj[key] === "object" &&
          !Array.isArray(obj[key])
        ) {
          await processObject(obj[key], arObj[key] || {}, fullKey);
        } else {
          // It's a leaf node, create/update translation
          const group = prefix || "general";
          const translationKey = prefix ? key : fullKey;

          // Check if translation exists
          const existingTranslation = await Localization.findOne({
            group,
            key: translationKey,
          });

          const enValue = obj[key];
          const arValue = arObj && arObj[key];

          if (!arValue) {
            results.skipped.push({
              group,
              key: translationKey,
              reason: "Missing Arabic translation",
            });
            continue;
          }

          if (existingTranslation) {
            // Update if values are different
            if (
              existingTranslation.translations.en !== enValue ||
              existingTranslation.translations.ar !== arValue
            ) {
              existingTranslation.translations = {
                en: enValue,
                ar: arValue,
              };
              await existingTranslation.save();
              results.updated.push(existingTranslation);
            } else {
              results.skipped.push({
                group,
                key: translationKey,
                reason: "No changes",
              });
            }
          } else {
            // Create new translation
            const newTranslation = await Localization.create({
              key: translationKey,
              group,
              translations: {
                en: enValue,
                ar: arValue,
              },
              isSystem: true, // Mark as system translation
            });
            results.created.push(newTranslation);
          }
        }
      }
    };

    await processObject(enLocale, arLocale);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          results,
          `Synced translations: ${results.created.length} created, ${results.updated.length} updated, ${results.skipped.length} skipped`
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Error syncing with locale files: ${error.message}`
    );
  }
});

// Export to i18n locale files
export const exportToLocaleFiles = asyncHandler(async (req, res) => {
  try {
    // Get all translations
    const translations = await Localization.find({});

    // Create structured objects for each language
    const enTranslations = {};
    const arTranslations = {};

    translations.forEach((item) => {
      // Handle nested keys (using dot notation)
      const keyParts = item.key.split(".");
      let enCurrent = enTranslations;
      let arCurrent = arTranslations;

      // If the translation has a group other than "general", add it as a top-level key
      if (item.group !== "general") {
        if (!enCurrent[item.group]) enCurrent[item.group] = {};
        if (!arCurrent[item.group]) arCurrent[item.group] = {};

        enCurrent = enCurrent[item.group];
        arCurrent = arCurrent[item.group];
      }

      // Handle nested keys
      for (let i = 0; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        if (!enCurrent[part]) enCurrent[part] = {};
        if (!arCurrent[part]) arCurrent[part] = {};

        enCurrent = enCurrent[part];
        arCurrent = arCurrent[part];
      }

      // Set the values
      const lastKey = keyParts[keyParts.length - 1];
      enCurrent[lastKey] = item.translations.en;
      arCurrent[lastKey] = item.translations.ar;
    });

    // Write to locale files
    await fs.writeFile(
      join(LOCALES_DIR, "en.json"),
      JSON.stringify(enTranslations, null, 2),
      "utf8"
    );

    await fs.writeFile(
      join(LOCALES_DIR, "ar.json"),
      JSON.stringify(arTranslations, null, 2),
      "utf8"
    );

    // Reload i18n
    i18n.init();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { enTranslations, arTranslations },
          "Successfully exported translations to locale files"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      `Error exporting to locale files: ${error.message}`
    );
  }
});
