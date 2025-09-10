import { PRICING as DEFAULT_PRICING } from "../config/constants.js";
import SiteSettings from "../models/site-settings.model.js";

/**
 * Get pricing settings from database with fallback to constants
 * @returns {Object} Pricing settings
 */
export const getPricingSettings = async () => {
  try {
    // Get settings from database
    const settings = await SiteSettings.findOneOrCreate();

    if (!settings || !settings.pricing) {
      return DEFAULT_PRICING;
    }

    // Create a merged pricing object with database values and defaults for missing values
    const pricing = {
      // New pricing structure with prices and durations
      contacts_access_price: settings.pricing.contacts_access?.price || 190,
      contacts_access_days: settings.pricing.contacts_access?.days || 365,

      listing_price: {
        player: settings.pricing.listing_player?.price || 140,
        coach: settings.pricing.listing_coach?.price || 190,
      },

      listing_days: {
        player: settings.pricing.listing_player?.days || 365,
        coach: settings.pricing.listing_coach?.days || 365,
      },

      promotion_price: {
        player: settings.pricing.promotion_player?.price || 100,
        coach: settings.pricing.promotion_coach?.price || 100,
      },

      promotion_days: {
        player: settings.pricing.promotion_player?.days || 15,
        coach: settings.pricing.promotion_coach?.days || 15,
      },

      // Legacy support for old code
      contacts_access_year:
        settings.pricing.contacts_access?.price ||
        settings.pricing.contacts_access_year ||
        DEFAULT_PRICING.contacts_access_year,

      listing_year: {
        player:
          settings.pricing.listing_player?.price ||
          settings.pricing.listing_year?.player ||
          DEFAULT_PRICING.listing_year.player,
        coach:
          settings.pricing.listing_coach?.price ||
          settings.pricing.listing_year?.coach ||
          DEFAULT_PRICING.listing_year.coach,
      },

      promotion_year: {
        player:
          settings.pricing.promotion_player?.price ||
          settings.pricing.promotion_year?.player ||
          DEFAULT_PRICING.promotion_year.player,
        coach:
          settings.pricing.promotion_coach?.price ||
          settings.pricing.promotion_year?.coach ||
          DEFAULT_PRICING.promotion_year.coach,
      },

      promotion_per_day: {
        player:
          (settings.pricing.promotion_player?.price &&
          settings.pricing.promotion_player?.days
            ? settings.pricing.promotion_player.price /
              settings.pricing.promotion_player.days
            : settings.pricing.promotion_per_day?.player) ||
          DEFAULT_PRICING.promotion_per_day.player,
        coach:
          (settings.pricing.promotion_coach?.price &&
          settings.pricing.promotion_coach?.days
            ? settings.pricing.promotion_coach.price /
              settings.pricing.promotion_coach.days
            : settings.pricing.promotion_per_day?.coach) ||
          DEFAULT_PRICING.promotion_per_day.coach,
      },

      ONE_YEAR_DAYS:
        settings.pricing.listing_player?.days || DEFAULT_PRICING.ONE_YEAR_DAYS,
      PROMOTION_DEFAULT_DAYS:
        settings.pricing.promotion_player?.days ||
        settings.pricing.promotion_default_days ||
        DEFAULT_PRICING.PROMOTION_DEFAULT_DAYS,
    };

    return pricing;
  } catch (error) {
    console.error("Error getting pricing settings:", error);
    return DEFAULT_PRICING;
  }
};

/**
 * Get pricing settings synchronously (for cases where async/await can't be used)
 * This will return the default pricing from constants.js
 * @returns {Object} Default pricing settings
 */
export const getDefaultPricing = () => {
  return DEFAULT_PRICING;
};
