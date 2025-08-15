import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Utility function to conditionally apply RTL-specific classes
 * Can be used outside React components where hooks can't be used
 *
 * @param language Current language code (e.g., "en" or "ar")
 * @param ltrClass Class to apply in LTR mode
 * @param rtlClass Class to apply in RTL mode
 * @returns The appropriate class based on language direction
 */
export function dirClass(
  language: string,
  ltrClass: string,
  rtlClass: string
): string {
  return language === "ar" ? rtlClass : ltrClass;
}

/**
 * React hook version for use within components
 *
 * @param ltrClass Class to apply in LTR mode
 * @param rtlClass Class to apply in RTL mode
 * @returns The appropriate class based on current language direction
 */
export function useDirectionalClass(
  ltrClass: string,
  rtlClass: string
): string {
  const { language } = useLanguage();
  return dirClass(language, ltrClass, rtlClass);
}

/**
 * Utility function to merge direction-specific classes with base classes
 *
 * @param baseClasses Base classes that apply regardless of direction
 * @param language Current language code (e.g., "en" or "ar")
 * @param ltrClass Class to apply in LTR mode
 * @param rtlClass Class to apply in RTL mode
 * @returns Combined classes string
 */
export function mergeDirectionalClasses(
  baseClasses: string,
  language: string,
  ltrClass: string,
  rtlClass: string
): string {
  const dirSpecificClass = dirClass(language, ltrClass, rtlClass);
  return `${baseClasses} ${dirSpecificClass}`.trim();
}

/**
 * React hook version for merging directional classes
 *
 * @param baseClasses Base classes that apply regardless of direction
 * @param ltrClass Class to apply in LTR mode
 * @param rtlClass Class to apply in RTL mode
 * @returns Combined classes string
 */
export function useMergeDirectionalClasses(
  baseClasses: string,
  ltrClass: string,
  rtlClass: string
): string {
  const { language } = useLanguage();
  return mergeDirectionalClasses(baseClasses, language, ltrClass, rtlClass);
}
