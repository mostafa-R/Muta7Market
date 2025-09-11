"use client";

import { useEffect } from "react";
import useSiteSettingsStore from "../../stores/siteSettingsStore";

const DynamicFavicon = () => {
  const { favicon, fetchSettings } = useSiteSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (favicon?.url) {
      // Update the favicon link
      const link = document.querySelector(
        "link[rel*='icon']"
      ) as HTMLLinkElement;
      if (link) {
        link.href = favicon.url;
      } else {
        // Create new favicon link if it doesn't exist
        const newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.href = favicon.url;
        document.head.appendChild(newLink);
      }

      // Update apple-touch-icon
      const appleLink = document.querySelector(
        "link[rel*='apple-touch-icon']"
      ) as HTMLLinkElement;
      if (appleLink) {
        appleLink.href = favicon.url;
      } else {
        const newAppleLink = document.createElement("link");
        newAppleLink.rel = "apple-touch-icon";
        newAppleLink.href = favicon.url;
        document.head.appendChild(newAppleLink);
      }

      // Update shortcut icon
      const shortcutLink = document.querySelector(
        "link[rel*='shortcut']"
      ) as HTMLLinkElement;
      if (shortcutLink) {
        shortcutLink.href = favicon.url;
      } else {
        const newShortcutLink = document.createElement("link");
        newShortcutLink.rel = "shortcut icon";
        newShortcutLink.href = favicon.url;
        document.head.appendChild(newShortcutLink);
      }
    }
  }, [favicon]);

  return null; // This component doesn't render anything
};

export default DynamicFavicon;
