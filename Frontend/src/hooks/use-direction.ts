"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo } from "react";

/**
 *
 * @returns Object with direction utilities
 */
export function useDirection() {
  const { language, isRTL, dir } = useLanguage();

  const directionUtils = useMemo(
    () => ({
      language,

      isRTL,

      dir,

      classes: {
        flexDirection: isRTL ? "flex-row-reverse" : "flex-row",
        flexColumn: isRTL ? "flex-col-reverse" : "flex-col",

        gridFlow: isRTL ? "grid-flow-row-reverse" : "grid-flow-row",

        textAlign: isRTL ? "text-right" : "text-left",

        marginStart: isRTL ? "mr-auto" : "ml-auto",
        marginEnd: isRTL ? "ml-auto" : "mr-auto",

        marginStart1: isRTL ? "mr-1" : "ml-1",
        marginStart2: isRTL ? "mr-2" : "ml-2",
        marginStart3: isRTL ? "mr-3" : "ml-3",
        marginStart4: isRTL ? "mr-4" : "ml-4",
        marginEnd1: isRTL ? "ml-1" : "mr-1",
        marginEnd2: isRTL ? "ml-2" : "mr-2",
        marginEnd3: isRTL ? "ml-3" : "mr-3",
        marginEnd4: isRTL ? "ml-4" : "mr-4",

        paddingStart: isRTL ? "pr" : "pl",
        paddingEnd: isRTL ? "pl" : "pr",

        paddingStart1: isRTL ? "pr-1" : "pl-1",
        paddingStart2: isRTL ? "pr-2" : "pl-2",
        paddingStart3: isRTL ? "pr-3" : "pl-3",
        paddingStart4: isRTL ? "pr-4" : "pl-4",
        paddingEnd1: isRTL ? "pl-1" : "pr-1",
        paddingEnd2: isRTL ? "pl-2" : "pr-2",
        paddingEnd3: isRTL ? "pl-3" : "pr-3",
        paddingEnd4: isRTL ? "pl-4" : "pr-4",

        float: isRTL ? "float-right" : "float-left",
        floatEnd: isRTL ? "float-left" : "float-right",

        roundedStart: isRTL ? "rounded-r" : "rounded-l",
        roundedEnd: isRTL ? "rounded-l" : "rounded-r",
        roundedStartSm: isRTL ? "rounded-r-sm" : "rounded-l-sm",
        roundedEndSm: isRTL ? "rounded-l-sm" : "rounded-r-sm",
        roundedStartMd: isRTL ? "rounded-r-md" : "rounded-l-md",
        roundedEndMd: isRTL ? "rounded-l-md" : "rounded-r-md",
        roundedStartLg: isRTL ? "rounded-r-lg" : "rounded-l-lg",
        roundedEndLg: isRTL ? "rounded-l-lg" : "rounded-r-lg",

        start0: isRTL ? "right-0" : "left-0",
        end0: isRTL ? "left-0" : "right-0",
        insetStart: isRTL ? "inset-r" : "inset-l",
        insetEnd: isRTL ? "inset-l" : "inset-r",

        borderStart: isRTL ? "border-r" : "border-l",
        borderEnd: isRTL ? "border-l" : "border-r",

        scrollDirection: isRTL ? "rtl" : "ltr",
        scrollPaddingStart: isRTL ? "scroll-pr" : "scroll-pl",
        scrollPaddingEnd: isRTL ? "scroll-pl" : "scroll-pr",

        rotate180IfRtl: isRTL ? "rotate-180" : "",

        fontFamily: language === "ar" ? "font-arabic" : "",
      },

      styles: {
        direction: {
          direction: isRTL ? "rtl" : "ltr",
        },

        flexDirection: {
          flexDirection: isRTL ? "row-reverse" : "row",
        },

        transform: {
          transform: isRTL ? "scaleX(-1)" : "none",
        },

        textAlign: {
          textAlign: isRTL ? "right" : "left",
        },

        position: {
          left: isRTL ? "auto" : 0,
          right: isRTL ? 0 : "auto",
        },

        marginStart: (value: string | number) => ({
          marginRight: isRTL ? value : undefined,
          marginLeft: !isRTL ? value : undefined,
        }),

        marginEnd: (value: string | number) => ({
          marginLeft: isRTL ? value : undefined,
          marginRight: !isRTL ? value : undefined,
        }),

        paddingStart: (value: string | number) => ({
          paddingRight: isRTL ? value : undefined,
          paddingLeft: !isRTL ? value : undefined,
        }),

        paddingEnd: (value: string | number) => ({
          paddingLeft: isRTL ? value : undefined,
          paddingRight: !isRTL ? value : undefined,
        }),
      },

      helpers: {
        getValueBasedOnDir: <T>(ltrValue: T, rtlValue: T): T => {
          return isRTL ? rtlValue : ltrValue;
        },

        sortByDirection: <T>(array: T[]): T[] => {
          return isRTL ? [...array].reverse() : array;
        },

        reverseIfRtl: (text: string): string => {
          return isRTL ? text.split("").reverse().join("") : text;
        },

        getStartValue: <T>(startEndObject: { start: T; end: T }): T => {
          return isRTL ? startEndObject.end : startEndObject.start;
        },

        getEndValue: <T>(startEndObject: { start: T; end: T }): T => {
          return isRTL ? startEndObject.start : startEndObject.end;
        },
      },
    }),
    [language, isRTL, dir]
  );

  return directionUtils;
}
