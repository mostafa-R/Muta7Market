import { useLanguage } from "@/contexts/LanguageContext";

/**
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
 *
 * @param ltrClass
 * @param rtlClass
 * @returns
 */
export function useDirectionalClass(
  ltrClass: string,
  rtlClass: string
): string {
  const { language } = useLanguage();
  return dirClass(language, ltrClass, rtlClass);
}

/**
 *
 * @param baseClasses
 * @param language
 * @param ltrClass
 * @param rtlClass
 * @returns
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

 *
 * @param baseClasses 
 * @param ltrClass 
 * @param rtlClass 
 * @returns 
 */
export function useMergeDirectionalClasses(
  baseClasses: string,
  ltrClass: string,
  rtlClass: string
): string {
  const { language } = useLanguage();
  return mergeDirectionalClasses(baseClasses, language, ltrClass, rtlClass);
}
