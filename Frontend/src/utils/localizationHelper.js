import { useTranslation } from "react-i18next";
import i18n from "./i18n";

const TRANSLATION_CACHE_KEY = "muta7market_translation_cache";
const TRANSLATION_CACHE_VERSION = "1";

/**
 * Read the cached translations from localStorage
 * @returns {Object} - Map of language -> translations
 */
const readTranslationCache = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TRANSLATION_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== TRANSLATION_CACHE_VERSION) return {};
    return parsed.data && typeof parsed.data === "object" ? parsed.data : {};
  } catch {
    return {};
  }
};

/**
 * Persist translations for a language into localStorage so they can be
 * restored synchronously on the next visit (avoids key flash on first paint).
 * @param {string} language - Language code
 * @param {Object} data - Flat map of translation key -> value
 */
const writeTranslationCache = (language, data) => {
  if (typeof window === "undefined") return;
  try {
    if (!data || typeof data !== "object") return;
    const cache = readTranslationCache();
    cache[language] = data;
    localStorage.setItem(
      TRANSLATION_CACHE_KEY,
      JSON.stringify({
        version: TRANSLATION_CACHE_VERSION,
        data: cache,
      })
    );
  } catch {
    // Ignore quota/storage errors - cache is best-effort
  }
};

/**
 * Synchronously add cached translations for a language into i18next.
 * Call before the first render so t() returns real text instead of keys.
 * @param {string} language - Language code
 * @returns {boolean} - true if cached translations were loaded
 */
export const hydrateTranslationsSync = (language) => {
  if (typeof window === "undefined") return false;
  const data = readTranslationCache()[language];
  if (!data || typeof data !== "object") return false;

  Object.entries(data).forEach(([key, value]) => {
    i18n.addResource(language, "common", key, value);
    i18n.addResource(language, "dynamic", key, value);
  });

  return true;
};

/**
 * Remove the cached translations from localStorage
 */
export const clearTranslationCache = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TRANSLATION_CACHE_KEY);
  } catch {
    // Ignore
  }
};

/**
 * Custom hook to get translations with dynamic loading from backend
 * @returns {Object} - Translation utilities
 */
export const useLocalizedText = () => {
  const { t, i18n: i18nInstance } = useTranslation();

  /**
   * Get a translation by key
   * @param {string} key - Translation key
   * @param {Object} options - Translation options
   * @returns {string} - Translated text
   */
  const getText = (key, options = {}) => {
    return t(key, options);
  };

  /**
   * Get a translation by group and key
   * @param {string} group - Translation group
   * @param {string} key - Translation key
   * @param {Object} options - Translation options
   * @returns {string} - Translated text
   */
  const getGroupText = (group, key, options = {}) => {
    return t(`${group}.${key}`, options);
  };

  /**
   * Get current language
   * @returns {string} - Current language code
   */
  const getCurrentLanguage = () => {
    return i18nInstance.language;
  };

  /**
   * Change language
   * @param {string} lang - Language code
   */
  const changeLanguage = (lang) => {
    i18nInstance.changeLanguage(lang);
  };

  /**
   * Fetch dynamic translations from backend
   * @param {string} language - Language code
   * @param {boolean} forceRefresh - Whether to force a refresh of translations
   * @returns {Promise<object>} - The loaded translations
   */
  const loadDynamicTranslations = async (
    language = i18nInstance.language,
    forceRefresh = false
  ) => {
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

      console.log(
        `🔄 ${
          forceRefresh ? "Refreshing" : "Loading"
        } translations for ${language}...`
      );

      const response = await fetch(
        `${API_BASE_URL}/localization?language=${language}`,
        { cache: forceRefresh ? "no-cache" : "default" }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log(
          `✅ Loaded ${
            Object.keys(result.data).length
          } translations for ${language}`
        );

        // Clear existing resources if forcing refresh
        if (forceRefresh) {
          i18nInstance.reloadResources([language], ["common", "dynamic"]);
        }

        // Add translations to i18n in both namespaces to ensure availability
        Object.entries(result.data).forEach(([key, value]) => {
          i18nInstance.addResource(language, "common", key, value);
          i18nInstance.addResource(language, "dynamic", key, value);
        });

        // Cache translations for instant restore on next visit
        writeTranslationCache(language, result.data);

        return result.data;
      }

      return {};
    } catch (error) {
      console.error("Error loading dynamic translations:", error);
      return {};
    }
  };

  return {
    t: getText,
    tg: getGroupText,
    currentLanguage: getCurrentLanguage(),
    changeLanguage,
    loadDynamicTranslations,
  };
};

/**
 * Initialize dynamic translations for the application
 * @param {string} preferredLanguage - Optional preferred language to load first
 * @returns {Promise<void>}
 */
export const initDynamicTranslations = async (preferredLanguage = null) => {
  try {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

    // Fetch translations for both languages, but prioritize the preferred language
    const languages = preferredLanguage
      ? [
          preferredLanguage,
          ...["en", "ar"].filter((lang) => lang !== preferredLanguage),
        ]
      : ["ar", "en"]; // Default to Arabic first

    console.log("🌐 Initializing translations from backend API...");

    // Restore any cached translations immediately so text is available
    // before the network requests resolve.
    if (preferredLanguage) {
      hydrateTranslationsSync(preferredLanguage);
    }

    // Set default language to Arabic
    if (!i18n.language || i18n.language === "cimode") {
      i18n.changeLanguage("ar");
    }

    for (const lang of languages) {
      console.log(`📥 Fetching ${lang} translations...`);

      try {
        // First try to get all translations
        const response = await fetch(
          `${API_BASE_URL}/localization?language=${lang}`,
          { cache: "no-store" } // Don't cache translations
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          console.log(
            `✅ Loaded ${Object.keys(result.data).length} ${lang} translations`
          );

          // Add translations to i18n
          Object.entries(result.data).forEach(([key, value]) => {
            // Add to the common namespace to replace the static JSON files
            i18n.addResource(lang, "common", key, value);
          });

          // Cache translations for instant restore on next visit
          writeTranslationCache(lang, result.data);

          // If this is the first language (preferred), ensure it's set as current
          if (lang === languages[0]) {
            i18n.changeLanguage(lang);
          }
        }
      } catch (error) {
        console.error(`❌ Error loading ${lang} translations:`, error);

        // Fallback: Try to load translations by group
        try {
          console.log(
            `⚠️ Attempting to load translations by group for ${lang}...`
          );
          const groupsResponse = await fetch(
            `${API_BASE_URL}/localization/groups`
          );

          if (groupsResponse.ok) {
            const groupsResult = await groupsResponse.json();

            if (groupsResult.success && Array.isArray(groupsResult.data)) {
              for (const group of groupsResult.data) {
                const groupResponse = await fetch(
                  `${API_BASE_URL}/localization/group/${group}?language=${lang}`
                );

                if (groupResponse.ok) {
                  const groupResult = await groupResponse.json();

                  if (groupResult.success) {
                    console.log(
                      `✅ Loaded ${
                        Object.keys(groupResult.data).length
                      } ${lang} translations for group: ${group}`
                    );

                    // Add group translations
                    groupResult.data.forEach((item) => {
                      const key =
                        group === "general" ? item.key : `${group}.${item.key}`;
                      i18n.addResource(
                        lang,
                        "common",
                        key,
                        item.translations[lang]
                      );
                    });
                  }
                }
              }
            }
          }
        } catch (fallbackError) {
          console.error(
            `❌ Fallback loading failed for ${lang}:`,
            fallbackError
          );
        }
      }
    }

    console.log("🎉 Translation initialization complete");
  } catch (error) {
    console.error("❌ Error initializing dynamic translations:", error);
  }
};

export default useLocalizedText;
