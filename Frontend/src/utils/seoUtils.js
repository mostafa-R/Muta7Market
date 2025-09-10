/**
 * Generates structured data for SEO based on settings
 * @param {Object} seo - SEO settings from backend
 * @param {string} language - Current language (ar or en)
 * @returns {Object} - Structured data for JSON-LD
 */
export function generateStructuredData(seo, language) {
  const siteName = seo?.metaTitle?.[language] || "Muta7Market";
  const siteDescription = seo?.metaDescription?.[language] || "";

  // Website Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    alternateName: language === "ar" ? "Muta7Market" : "متاح ماركت",
    url: "https://muta7markt.com",
    description: siteDescription,
    inLanguage: ["ar-SA", "en-US"],
    potentialAction: {
      "@type": "SearchAction",
      target: "https://muta7markt.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    sameAs: [
      "https://twitter.com/muta7market",
      "https://facebook.com/muta7market",
      "https://instagram.com/muta7market",
    ],
  };

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    alternateName: language === "ar" ? "Muta7Market" : "متاح ماركت",
    url: "https://muta7markt.com",
    logo: seo?.ogImage || "https://muta7markt.com/trophy.png",
    description: siteDescription,
    sameAs: [
      "https://twitter.com/muta7market",
      "https://facebook.com/muta7market",
      "https://instagram.com/muta7market",
    ],
    areaServed: {
      "@type": "Country",
      name: "Saudi Arabia",
    },
    serviceType: [
      "Sports Training",
      "Athlete Profiles",
      "Coach Profiles",
      "Sports Networking",
    ],
  };

  // WebApplication Schema
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteName,
    description: siteDescription,
    url: "https://muta7markt.com",
    applicationCategory: "SportsApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "SAR",
    },
    featureList: [
      "Player Profiles",
      "Coach Profiles",
      "Sports Categories",
      "Training Services",
      "Sports Networking",
      "Multi-language Support",
    ],
  };

  return {
    websiteSchema,
    organizationSchema,
    webAppSchema,
  };
}
