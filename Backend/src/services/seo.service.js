import { SitemapStream, streamToPromise } from "sitemap";
import { createReadStream, createWriteStream } from "fs";
import { Readable } from "stream";
import path from "path";
import Player from "../models/player.model.js";
import Coach from "../models/coach.model.js";
import Offer from "../models/offer.model.js";
import MetaTag from "../models/metaTag.model.js";
import logger from "../utils/logger.js";

class SEOService {
  constructor() {
    this.baseUrl = process.env.FRONTEND_URL || "https://sports-platform.com";
    this.defaultMeta = {
      title: {
        en: "Sports Platform - Find Players and Coaches",
        ar: "منصة الرياضة - ابحث عن اللاعبين والمدربين",
      },
      description: {
        en: "Professional platform for sports players and coaches marketing",
        ar: "منصة احترافية لتسويق اللاعبين والمدربين الرياضيين",
      },
      keywords: [
        "sports",
        "players",
        "coaches",
        "transfer",
        "football",
        "saudi",
      ],
      ogImage: `${this.baseUrl}/images/og-default.jpg`,
    };
  }

  /**
   * Generate complete sitemap
   */
  async generateSitemap() {
    try {
      const sitemap = new SitemapStream({ hostname: this.baseUrl });
      const links = [];

      // Static pages
      links.push(
        { url: "/", changefreq: "daily", priority: 1.0 },
        { url: "/players", changefreq: "daily", priority: 0.9 },
        { url: "/coaches", changefreq: "daily", priority: 0.9 },
        { url: "/offers", changefreq: "hourly", priority: 0.8 },
        { url: "/about", changefreq: "monthly", priority: 0.5 },
        { url: "/contact", changefreq: "monthly", priority: 0.5 }
      );

      // Dynamic pages - Players
      const players = await Player.find({ isActive: true })
        .select("_id updatedAt")
        .lean();

      players.forEach((player) => {
        links.push({
          url: `/players/${player._id}`,
          lastmod: player.updatedAt,
          changefreq: "weekly",
          priority: 0.7,
          img: [
            {
              url: `${this.baseUrl}/api/v1/players/${player._id}/image`,
              title: "Player profile image",
            },
          ],
        });
      });

      // Dynamic pages - Coaches
      const coaches = await Coach.find({ isActive: true })
        .select("_id updatedAt")
        .lean();

      coaches.forEach((coach) => {
        links.push({
          url: `/coaches/${coach._id}`,
          lastmod: coach.updatedAt,
          changefreq: "weekly",
          priority: 0.7,
        });
      });

      // Dynamic pages - Offers
      const offers = await Offer.find({
        isActive: true,
        "payment.isPaid": true,
      })
        .select("_id updatedAt promotion.isPromoted")
        .lean();

      offers.forEach((offer) => {
        links.push({
          url: `/offers/${offer._id}`,
          lastmod: offer.updatedAt,
          changefreq: "daily",
          priority: offer.promotion?.isPromoted ? 0.8 : 0.6,
        });
      });

      // Write links to sitemap
      const stream = Readable.from(links).pipe(sitemap);
      const data = await streamToPromise(stream);

      // Save sitemap to file
      const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
      await fs.writeFile(sitemapPath, data.toString());

      logger.info(`Sitemap generated with ${links.length} URLs`);

      return {
        success: true,
        urlCount: links.length,
        path: "/sitemap.xml",
      };
    } catch (error) {
      logger.error("Sitemap generation error:", error);
      throw new ApiError(500, "Failed to generate sitemap");
    }
  }

  /**
   * Get meta tags for a specific page/entity
   */
  async getMetaTags(type, id, language = "en") {
    try {
      let entity;
      let meta = { ...this.defaultMeta };

      switch (type) {
        case "player":
          entity = await Player.findById(id).populate("user", "name").lean();

          if (entity) {
            meta.title = {
              en: `${entity.name.en} - Player Profile | Sports Platform`,
              ar: `${entity.name.ar} - ملف اللاعب | منصة الرياضة`,
            };
            meta.description = {
              en: `${entity.name.en}, ${entity.age} years old ${
                entity.nationality
              } ${entity.position.en}. ${
                entity.status === "available"
                  ? "Available for transfer"
                  : "Transferred"
              }`,
              ar: `${entity.name.ar}، ${entity.age} سنة، ${
                entity.nationality
              }، ${entity.position.ar}. ${
                entity.status === "available" ? "متاح للانتقال" : "تم انتقاله"
              }`,
            };
            meta.keywords = [
              entity.name.en,
              entity.nationality,
              entity.position.en,
              "player",
              "football",
            ];
            if (entity.media?.profileImage?.url) {
              meta.ogImage = entity.media.profileImage.url;
            }
          }
          break;

        case "coach":
          entity = await Coach.findById(id).populate("user", "name").lean();

          if (entity) {
            meta.title = {
              en: `${entity.name.en} - Coach Profile | Sports Platform`,
              ar: `${entity.name.ar} - ملف المدرب | منصة الرياضة`,
            };
            meta.description = {
              en: `${entity.name.en}, ${
                entity.experience.years
              } years experience, ${entity.nationality} coach. ${
                entity.status === "available" ? "Available" : "Not available"
              }`,
              ar: `${entity.name.ar}، ${
                entity.experience.years
              } سنوات خبرة، مدرب ${entity.nationality}. ${
                entity.status === "available" ? "متاح" : "غير متاح"
              }`,
            };
            meta.keywords = [
              entity.name.en,
              entity.nationality,
              entity.category,
              "coach",
              "football",
            ];
            if (entity.media?.profileImage?.url) {
              meta.ogImage = entity.media.profileImage.url;
            }
          }
          break;

        case "offer":
          entity = await Offer.findById(id).lean();

          if (entity) {
            meta.title = entity.title;
            meta.description = {
              en: entity.description.en.substring(0, 160),
              ar: entity.description.ar.substring(0, 160),
            };
            meta.keywords = [
              entity.category,
              entity.targetProfile?.type,
              "offer",
              "opportunity",
            ];
          }
          break;

        case "custom":
          // Get custom meta tags from database
          const customMeta = await MetaTag.findOne({
            pageId: id,
            isActive: true,
          });
          if (customMeta) {
            meta = { ...meta, ...customMeta.tags };
          }
          break;
      }

      // Add structured data
      const structuredData = this.generateStructuredData(
        type,
        entity,
        language
      );

      return {
        title: meta.title[language] || meta.title.en,
        description: meta.description[language] || meta.description.en,
        keywords: meta.keywords.join(", "),
        ogTitle: meta.title[language] || meta.title.en,
        ogDescription: meta.description[language] || meta.description.en,
        ogImage: meta.ogImage,
        ogUrl: `${this.baseUrl}/${type}s/${id}`,
        twitterCard: "summary_large_image",
        canonical: `${this.baseUrl}/${type}s/${id}`,
        structuredData,
        alternateLanguages: [
          { lang: "en", url: `${this.baseUrl}/en/${type}s/${id}` },
          { lang: "ar", url: `${this.baseUrl}/ar/${type}s/${id}` },
        ],
      };
    } catch (error) {
      logger.error("Get meta tags error:", error);
      return this.defaultMeta;
    }
  }

  /**
   * Generate structured data (JSON-LD)
   */
  generateStructuredData(type, entity, language = "en") {
    if (!entity) return null;

    const baseStructure = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      url: `${this.baseUrl}/${type}s/${entity._id}`,
      inLanguage: language,
    };

    switch (type) {
      case "player":
      case "coach":
        return {
          ...baseStructure,
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            name: entity.name[language] || entity.name.en,
            nationality: entity.nationality,
            jobTitle:
              type === "player" ? entity.position[language] : entity.category,
            image: entity.media?.profileImage?.url,
            sameAs: [
              entity.socialLinks?.instagram,
              entity.socialLinks?.twitter,
            ].filter(Boolean),
          },
        };

      case "offer":
        return {
          ...baseStructure,
          "@type": "JobPosting",
          title: entity.title[language] || entity.title.en,
          description: entity.description[language] || entity.description.en,
          datePosted: entity.createdAt,
          validThrough: entity.expiryDate,
          employmentType: "FULL_TIME",
          hiringOrganization: {
            "@type": "Organization",
            name: entity.offerDetails?.club || "Sports Club",
          },
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: entity.offerDetails?.location,
            },
          },
        };

      default:
        return baseStructure;
    }
  }

  /**
   * Update meta tags for a page
   */
  async updateMetaTags(pageId, type, tags, userId) {
    try {
      const metaTag = await MetaTag.findOneAndUpdate(
        { pageId, type },
        {
          pageId,
          type,
          tags,
          updatedBy: userId,
          isActive: true,
        },
        { new: true, upsert: true }
      );

      return metaTag;
    } catch (error) {
      logger.error("Update meta tags error:", error);
      throw new ApiError(500, "Failed to update meta tags");
    }
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt() {
    const content = `# Sports Platform Robots.txt
User-agent: *
Allow: /

# Directories
Allow: /players/
Allow: /coaches/
Allow: /offers/

# Disallow admin and API
Disallow: /admin/
Disallow: /api/

# Sitemap
Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1
`;

    return content;
  }

  /**
   * Submit sitemap to search engines
   */
  async submitSitemap() {
    const sitemapUrl = `${this.baseUrl}/sitemap.xml`;
    const searchEngines = [
      `https://www.google.com/ping?sitemap=${sitemapUrl}`,
      `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
    ];

    const results = await Promise.allSettled(
      searchEngines.map((url) =>
        axios
          .get(url)
          .then(() => ({ url, success: true }))
          .catch((error) => ({ url, success: false, error: error.message }))
      )
    );

    return results.map((result) => result.value);
  }
}

// Meta Tag Model
const metaTagSchema = new mongoose.Schema(
  {
    pageId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["player", "coach", "offer", "custom", "static"],
      required: true,
    },
    tags: {
      title: {
        en: String,
        ar: String,
      },
      description: {
        en: String,
        ar: String,
      },
      keywords: [String],
      ogTitle: {
        en: String,
        ar: String,
      },
      ogDescription: {
        en: String,
        ar: String,
      },
      ogImage: String,
      twitterCard: String,
      canonical: String,
      robots: String,
      author: String,
      customTags: [
        {
          name: String,
          content: String,
        },
      ],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

metaTagSchema.index({ pageId: 1, type: 1 }, { unique: true });

export const MetaTag = mongoose.model("MetaTag", metaTagSchema);

export default new SEOService();
