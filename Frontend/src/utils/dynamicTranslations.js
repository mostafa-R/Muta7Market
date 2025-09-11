import { useEffect, useState } from "react";
import useTranslationsStore from "../stores/translationsStore";
import i18n from "./i18n";

/**
 * Initializes dynamic translations from the backend
 * @param {boolean} forceRefresh - Whether to force refresh translations from backend
 * @returns {Promise<boolean>} - Success status
 */
export const initDynamicTranslations = async (forceRefresh = false) => {
  const { fetchTranslations } = useTranslationsStore.getState();

  try {
    // Fetch translations from the backend
    await fetchTranslations(forceRefresh);
    return true;
  } catch (error) {
    console.error("Failed to initialize dynamic translations:", error);
    return false;
  }
};

/**
 * Custom hook for dynamic translations
 * @returns {Object} - Object with translation utilities
 */
export const useDynamicTranslation = () => {
  const {
    getTranslation,
    fetchTranslations,
    isLoading,
    error,
    debugMode,
    setDebugMode,
    getAllTranslationKeys,
    clearCache,
  } = useTranslationsStore();
  const [missingKeys, setMissingKeys] = useState([]);

  // Track missing translation keys
  useEffect(() => {
    if (debugMode) {
      console.log("Translation debug mode enabled");
    }
    return () => {
      if (missingKeys.length > 0 && debugMode) {
        console.log("Missing translation keys:", missingKeys);
      }
    };
  }, [debugMode, missingKeys]);

  /**
   * Get translation for a key
   * @param {string} key - Translation key
   * @param {string} language - Optional language override
   * @param {Object} options - Additional options
   * @returns {string} - Translated text
   */
  const dt = (key, language = null, options = {}) => {
    // First try to get from dynamic translations
    const dynamicTranslation = getTranslation(key, language);

    // If the dynamic translation returns the key itself (not found), try i18next
    if (dynamicTranslation === key) {
      // Track missing keys in debug mode
      if (debugMode && !missingKeys.includes(key)) {
        setMissingKeys((prev) => [...prev, key]);
      }

      const i18nTranslation = i18n.t(key, {
        ns: "dynamic",
        ...options,
        defaultValue: options.defaultValue || key,
      });

      return i18nTranslation;
    }

    return dynamicTranslation;
  };

  /**
   * Force refresh translations from backend
   */
  const refreshTranslations = async () => {
    await fetchTranslations(true);
  };

  return {
    dt,
    refreshTranslations,
    isLoading,
    error,
    debugMode,
    setDebugMode,
    getAllTranslationKeys,
    clearCache,
    missingKeys,
  };
};

/**
 * Debug component to show translation status
 * @param {Object} props - Component props
 * @returns {JSX.Element|null} - Debug overlay or null if debug mode is off
 */
export const TranslationDebugger = ({ position = "bottom-right" }) => {
  const {
    debugMode,
    setDebugMode,
    missingKeys,
    refreshTranslations,
    clearCache,
    getAllTranslationKeys,
  } = useDynamicTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [availableKeys, setAvailableKeys] = useState([]);

  useEffect(() => {
    if (debugMode) {
      setAvailableKeys(getAllTranslationKeys());
    }
  }, [debugMode, getAllTranslationKeys]);

  if (!debugMode) return null;

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-2 rounded-full shadow-lg"
      >
        {isOpen ? "✕" : "🌐"}
      </button>

      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl p-4 mt-2 w-80 max-h-96 overflow-auto">
          <h3 className="font-bold text-lg mb-2">Translation Debugger</h3>

          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => refreshTranslations()}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              Refresh
            </button>
            <button
              onClick={() => clearCache()}
              className="bg-yellow-600 text-white px-3 py-1 rounded text-sm"
            >
              Clear Cache
            </button>
            <button
              onClick={() => setDebugMode(false)}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Disable Debug
            </button>
          </div>

          {missingKeys.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-red-600">
                Missing Keys ({missingKeys.length}):
              </h4>
              <ul className="text-xs bg-red-50 p-2 rounded max-h-24 overflow-y-auto">
                {missingKeys.map((key) => (
                  <li key={key} className="mb-1">
                    {key}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-semibold">
              Available Keys ({availableKeys.length}):
            </h4>
            <ul className="text-xs bg-gray-50 p-2 rounded max-h-24 overflow-y-auto">
              {availableKeys.map((key) => (
                <li key={key} className="mb-1">
                  {key}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
