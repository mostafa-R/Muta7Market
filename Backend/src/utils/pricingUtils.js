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

      // Premium promotion tier (admin-controlled pricing)
      promotion_premium_price: {
        player: settings.pricing.promotion_player_premium?.price || 150,
        coach: settings.pricing.promotion_coach_premium?.price || 150,
      },

      promotion_premium_days: {
        player: settings.pricing.promotion_player_premium?.days || 15,
        coach: settings.pricing.promotion_coach_premium?.days || 15,
      },

      promotion_premium_year: {
        player:
          settings.pricing.promotion_player_premium?.price ||
          DEFAULT_PRICING.promotion_premium_year.player,
        coach:
          settings.pricing.promotion_coach_premium?.price ||
          DEFAULT_PRICING.promotion_premium_year.coach,
      },

      promotion_premium_per_day: {
        player:
          (settings.pricing.promotion_player_premium?.price &&
          settings.pricing.promotion_player_premium?.days
            ? settings.pricing.promotion_player_premium.price /
              settings.pricing.promotion_player_premium.days
            : settings.pricing.promotion_premium_per_day?.player) ||
          DEFAULT_PRICING.promotion_premium_per_day.player,
        coach:
          (settings.pricing.promotion_coach_premium?.price &&
          settings.pricing.promotion_coach_premium?.days
            ? settings.pricing.promotion_coach_premium.price /
              settings.pricing.promotion_coach_premium.days
            : settings.pricing.promotion_premium_per_day?.coach) ||
          DEFAULT_PRICING.promotion_premium_per_day.coach,
      },

      ONE_YEAR_DAYS:
        settings.pricing.listing_player?.days || DEFAULT_PRICING.ONE_YEAR_DAYS,
      PROMOTION_DEFAULT_DAYS:
        settings.pricing.promotion_player?.days ||
        settings.pricing.promotion_default_days ||
        DEFAULT_PRICING.PROMOTION_DEFAULT_DAYS,

      // Offer pricing
      ADD_OFFER: settings.pricing.add_offer || DEFAULT_PRICING.ADD_OFFER,
      PROMOTE_OFFER_PER_DAY: settings.pricing.promote_offer_per_day || DEFAULT_PRICING.PROMOTE_OFFER_PER_DAY,
      UNLOCK_CONTACT: settings.pricing.unlock_contact || DEFAULT_PRICING.UNLOCK_CONTACT,

      // Player Pro plan pricing
      pro_player: {
        month:
          settings.pricing.pro_player?.monthly ||
          settings.pricing.pro_player?.price ||
          DEFAULT_PRICING.pro_player?.month,
        year:
          settings.pricing.pro_player?.yearly ||
          settings.pricing.pro_player?.year ||
          DEFAULT_PRICING.pro_player?.year,
      },
      PRO_DEFAULT_DAYS:
        settings.pricing.pro_player?.days ||
        settings.pricing.pro_default_days ||
        process.env.PRO_DEFAULT_DAYS ||
        DEFAULT_PRICING.PRO_DEFAULT_DAYS,
    };

    return pricing;
  } catch (error) {
    console.error("Error getting pricing settings:", error);
    return DEFAULT_PRICING;
  }
};

/**
 * Compute promotion amount + duration for a given tier.
 * Prices come from admin-controlled pricing settings.
 * @returns {{ amount: number, durationDays: number }}
 */
export const computePromotionAmount = (PRICING, targetType, tier, requestedDays) => {
  const t = targetType === "coach" ? "coach" : "player";
  const isPremium = tier === "premium";

  const perDay = (isPremium ? PRICING.promotion_premium_per_day : PRICING.promotion_per_day)?.[t] || (isPremium ? 10 : 15);
  const year = (isPremium ? PRICING.promotion_premium_year : PRICING.promotion_year)?.[t] || 0;
  const defaultDays = isPremium
    ? PRICING.promotion_premium_days?.[t] || 15
    : Number(PRICING.PROMOTION_DEFAULT_DAYS || 15);

  const d = Number(requestedDays) || defaultDays;

  if (d >= (PRICING.ONE_YEAR_DAYS || 365) && year > 0) {
    return { amount: year, durationDays: PRICING.ONE_YEAR_DAYS || 365 };
  }

  return { amount: perDay * d, durationDays: d };
};

/**
 * Get pricing settings synchronously (for cases where async/await can't be used)
 * This will return the default pricing from constants.js
 * @returns {Object} Default pricing settings
 */
export const getDefaultPricing = () => {
  return DEFAULT_PRICING;
};
