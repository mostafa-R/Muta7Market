import { google } from "googleapis";
import logger from "../utils/logger.js";
import cacheService from "./cache.service.js";

class AnalyticsService {
  constructor() {
    this.analytics = google.analyticsdata("v1beta");
    this.jwt = null;
    this.isInitialized = false;
    this.initializeAuth();
  }

  initializeAuth() {
    try {
      const requiredEnvVars = [
        "GOOGLE_CLIENT_EMAIL",
        "GOOGLE_PRIVATE_KEY",
        "GA_PROPERTY_ID",
      ];

      const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName]
      );

      if (missingVars.length > 0) {
        logger.warn(
          `Missing Google Analytics environment variables: ${missingVars.join(
            ", "
          )}`
        );
        return;
      }

      this.jwt = new google.auth.JWT(
        process.env.GOOGLE_CLIENT_EMAIL,
        null,
        process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        ["https://www.googleapis.com/auth/analytics.readonly"]
      );

      this.isInitialized = true;
      logger.info("Google Analytics service initialized");
    } catch (error) {
      logger.error("Failed to initialize Google Analytics service:", error);
    }
  }

  async authorize() {
    if (!this.jwt || !this.isInitialized) {
      logger.warn(
        "Google Analytics not properly configured, returning fallback data"
      );
      return false;
    }

    try {
      await this.jwt.authorize();
      return true;
    } catch (error) {
      logger.error("Google Analytics authorization failed:", error);
      return false;
    }
  }

  calculateDateRange(timeRange) {
    const endDate = new Date();
    let startDate;

    const rangeCalculators = {
      "7d": () => new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      "30d": () => new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      "90d": () => new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000),
      "12m": () => new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000),
    };

    startDate = rangeCalculators[timeRange]
      ? rangeCalculators[timeRange]()
      : rangeCalculators["7d"]();

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      previousStartDate: new Date(startDate.getTime() - (endDate - startDate))
        .toISOString()
        .split("T")[0],
      previousEndDate: new Date(startDate.getTime() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    };
  }

  async runReports(requests) {
    const isAuthorized = await this.authorize();

    if (!isAuthorized) {
      logger.warn("Google Analytics not authorized, returning empty results");
      return requests.map(() => ({ data: { rows: [] } }));
    }

    try {
      return await Promise.all(requests);
    } catch (error) {
      logger.error("Google Analytics API error:", error);
      // Return empty results instead of throwing
      return requests.map(() => ({ data: { rows: [] } }));
    }
  }

  formatSessionDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  calculatePercentageChange(current, previous) {
    if (previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  }

  translateData(data, mapping) {
    return data.map((item) => ({
      ...item,
      name: mapping[item.name] || item.name,
    }));
  }

  getUnavailableAnalyticsResponse() {
    logger.warn(
      "Google Analytics is not configured - returning unavailable response"
    );
    return {
      error: "Analytics service unavailable",
      message: "Google Analytics is not properly configured",
      configured: false,
    };
  }

  async getOverviewData(timeRange = "7d") {
    try {
      // Check if Google Analytics is properly configured
      if (!this.isInitialized || !process.env.GA_PROPERTY_ID) {
        return this.getUnavailableAnalyticsResponse();
      }

      // Check cache first
      const cachedData = await cacheService.getAnalyticsData("overview", {
        timeRange,
      });
      if (cachedData) {
        logger.info(
          `Analytics overview data served from cache for timeRange: ${timeRange}`
        );
        return cachedData;
      }

      const { startDate, endDate, previousStartDate, previousEndDate } =
        this.calculateDateRange(timeRange);

      const reportRequests = [
        // Main metrics
        this.analytics.properties.runReport({
          auth: this.jwt,
          property: `properties/${process.env.GA_PROPERTY_ID}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "date" }],
            metrics: [
              { name: "totalUsers" },
              { name: "screenPageViews" },
              { name: "averageSessionDuration" },
              { name: "bounceRate" },
            ],
          },
        }),

        // Device breakdown
        this.analytics.properties.runReport({
          auth: this.jwt,
          property: `properties/${process.env.GA_PROPERTY_ID}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "deviceCategory" }],
            metrics: [{ name: "totalUsers" }],
          },
        }),

        // Traffic sources
        this.analytics.properties.runReport({
          auth: this.jwt,
          property: `properties/${process.env.GA_PROPERTY_ID}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "sessionSource" }],
            metrics: [{ name: "totalUsers" }],
            orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
            limit: 5,
          },
        }),

        // Top pages
        this.analytics.properties.runReport({
          auth: this.jwt,
          property: `properties/${process.env.GA_PROPERTY_ID}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "pagePath" }],
            metrics: [{ name: "screenPageViews" }],
            orderBys: [
              { metric: { metricName: "screenPageViews" }, desc: true },
            ],
            limit: 5,
          },
        }),

        // Daily trends
        this.analytics.properties.runReport({
          auth: this.jwt,
          property: `properties/${process.env.GA_PROPERTY_ID}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "date" }],
            metrics: [{ name: "totalUsers" }, { name: "screenPageViews" }],
            orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
          },
        }),

        // Previous period comparison
        this.analytics.properties.runReport({
          auth: this.jwt,
          property: `properties/${process.env.GA_PROPERTY_ID}`,
          requestBody: {
            dateRanges: [
              { startDate: previousStartDate, endDate: previousEndDate },
            ],
            metrics: [
              { name: "totalUsers" },
              { name: "screenPageViews" },
              { name: "averageSessionDuration" },
              { name: "bounceRate" },
            ],
          },
        }),

        // Countries
        this.analytics.properties.runReport({
          auth: this.jwt,
          property: `properties/${process.env.GA_PROPERTY_ID}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "country" }],
            metrics: [{ name: "totalUsers" }],
            orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
            limit: 5,
          },
        }),
      ];

      const [
        visitorsResponse,
        devicesResponse,
        sourcesResponse,
        topPagesResponse,
        dailyTrendsResponse,
        previousPeriodResponse,
        countryResponse,
      ] = await this.runReports(reportRequests);

      // Process data
      const processedData = this.processOverviewData({
        visitorsResponse,
        devicesResponse,
        sourcesResponse,
        topPagesResponse,
        dailyTrendsResponse,
        previousPeriodResponse,
        countryResponse,
      });

      // Cache the result for 5 minutes
      await cacheService.setAnalyticsData(
        "overview",
        { timeRange },
        processedData,
        300
      );

      return processedData;
    } catch (error) {
      logger.error("Failed to fetch analytics overview data:", error);
      return {
        error: "Failed to fetch analytics data",
        message: error.message,
        configured: true,
      };
    }
  }

  processOverviewData(responses) {
    const {
      visitorsResponse,
      devicesResponse,
      sourcesResponse,
      topPagesResponse,
      dailyTrendsResponse,
      previousPeriodResponse,
      countryResponse,
    } = responses;

    // Check if we have data
    if (
      !visitorsResponse.data.rows ||
      visitorsResponse.data.rows.length === 0
    ) {
      return {
        visitors: { total: 0, change: 0, data: [] },
        pageViews: { total: 0, change: 0, data: [] },
        sessionDuration: { total: "0:00", change: 0 },
        bounceRate: { total: "0.0", change: 0 },
        devices: [],
        sources: [],
        topPages: [],
        countries: [],
      };
    }

    // Calculate totals
    const visitorStats = visitorsResponse.data.rows.reduce(
      (acc, row) => {
        acc.totalUsers += parseInt(row.metricValues[0].value);
        acc.pageViews += parseInt(row.metricValues[1].value);
        return acc;
      },
      { totalUsers: 0, pageViews: 0 }
    );

    const currentMetrics = {
      totalUsers: visitorStats.totalUsers,
      pageViews: visitorStats.pageViews,
      averageSessionDuration: parseFloat(
        visitorsResponse.data.rows[0]?.metricValues[2]?.value || 0
      ),
      bounceRate: parseFloat(
        visitorsResponse.data.rows[0]?.metricValues[3]?.value || 0
      ),
    };

    const previousMetrics = {
      totalUsers: parseInt(
        previousPeriodResponse.data.rows?.[0]?.metricValues[0]?.value || 0
      ),
      pageViews: parseInt(
        previousPeriodResponse.data.rows?.[0]?.metricValues[1]?.value || 0
      ),
      averageSessionDuration: parseFloat(
        previousPeriodResponse.data.rows?.[0]?.metricValues[2]?.value || 0
      ),
      bounceRate: parseFloat(
        previousPeriodResponse.data.rows?.[0]?.metricValues[3]?.value || 0
      ),
    };

    // Format daily data
    const dailyData = dailyTrendsResponse.data.rows.map((row) => {
      const date = row.dimensionValues[0].value;
      const year = date.substring(0, 4);
      const month = date.substring(4, 6);
      const day = date.substring(6, 8);
      const formattedDate = new Date(year, month - 1, day);

      const dayNames = [
        "الأحد",
        "الإثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "السبت",
      ];
      const dayName = dayNames[formattedDate.getDay()];

      return {
        name: dayName,
        date: `${year}-${month}-${day}`,
        visitors: parseInt(row.metricValues[0].value),
        pageViews: parseInt(row.metricValues[1].value),
      };
    });

    // Mapping for translations
    const deviceMapping = { mobile: "هاتف", desktop: "حاسوب", tablet: "تابلت" };
    const sourceMapping = {
      google: "بحث عضوي",
      direct: "مباشر",
      "(direct)": "مباشر",
      facebook: "فيسبوك",
      instagram: "انستغرام",
      twitter: "تويتر",
      youtube: "يوتيوب",
    };
    const pageMapping = {
      "/": "الرئيسية",
      "/players": "اللاعبين",
      "/coaches": "المدربين",
      "/sports": "الرياضات",
      "/signup": "التسجيل",
      "/signin": "تسجيل الدخول",
      "/profile": "الملف الشخصي",
    };
    const countryMapping = {
      "Saudi Arabia": "السعودية",
      Egypt: "مصر",
      "United Arab Emirates": "الإمارات",
      Kuwait: "الكويت",
      Qatar: "قطر",
      Bahrain: "البحرين",
      Oman: "عمان",
      Jordan: "الأردن",
      Lebanon: "لبنان",
    };

    // Process device data
    const deviceData = devicesResponse.data.rows.map((row) => ({
      name:
        deviceMapping[row.dimensionValues[0].value] ||
        row.dimensionValues[0].value,
      value: parseInt(row.metricValues[0].value),
    }));

    // Process source data
    const sourceData = sourcesResponse.data.rows.map((row) => ({
      name:
        sourceMapping[row.dimensionValues[0].value] ||
        row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value),
    }));

    // Process page data
    const pageData = topPagesResponse.data.rows.map((row) => ({
      path: row.dimensionValues[0].value,
      name:
        pageMapping[row.dimensionValues[0].value] ||
        row.dimensionValues[0].value,
      views: parseInt(row.metricValues[0].value),
    }));

    // Process country data
    const countryData =
      countryResponse?.data?.rows?.map((row) => ({
        name:
          countryMapping[row.dimensionValues[0].value] ||
          row.dimensionValues[0].value,
        users: parseInt(row.metricValues[0].value),
      })) || [];

    return {
      visitors: {
        total: currentMetrics.totalUsers,
        change: this.calculatePercentageChange(
          currentMetrics.totalUsers,
          previousMetrics.totalUsers
        ),
        data: dailyData,
      },
      pageViews: {
        total: currentMetrics.pageViews,
        change: this.calculatePercentageChange(
          currentMetrics.pageViews,
          previousMetrics.pageViews
        ),
        data: dailyData,
      },
      sessionDuration: {
        total: this.formatSessionDuration(
          currentMetrics.averageSessionDuration
        ),
        change: this.calculatePercentageChange(
          currentMetrics.averageSessionDuration,
          previousMetrics.averageSessionDuration
        ),
      },
      bounceRate: {
        total: parseFloat(currentMetrics.bounceRate).toFixed(1),
        change: (
          parseFloat(previousMetrics.bounceRate) -
          parseFloat(currentMetrics.bounceRate)
        ).toFixed(1),
      },
      devices: deviceData,
      sources: sourceData,
      topPages: pageData,
      countries: countryData,
    };
  }

  async getRealTimeData() {
    try {
     
      if (!this.isInitialized || !process.env.GA_PROPERTY_ID) {
        return this.getUnavailableAnalyticsResponse();
      }

     
      const cachedData = await cacheService.getAnalyticsData("realtime", {});
      if (cachedData) {
        logger.info("Real-time analytics data served from cache");
        return cachedData;
      }

      const realtimeRequests = [
        this.analytics.properties.runReport({
          auth: this.jwt,
          property: `properties/${process.env.GA_PROPERTY_ID}`,
          requestBody: {
            dateRanges: [{ startDate: "today", endDate: "today" }],
            metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
          },
        }),

        this.analytics.properties.runReport({
          auth: this.jwt,
          property: `properties/${process.env.GA_PROPERTY_ID}`,
          requestBody: {
            dateRanges: [{ startDate: "today", endDate: "today" }],
            dimensions: [{ name: "pagePath" }],
            metrics: [{ name: "activeUsers" }],
            orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
            limit: 1,
          },
        }),
      ];

      const [realtimeResponse, activePageResponse] = await this.runReports(
        realtimeRequests
      );

      if (
        !realtimeResponse.data.rows ||
        realtimeResponse.data.rows.length === 0
      ) {
        return {
          error: "No real-time data available",
          message: "No active users or data found",
          configured: true,
        };
      }

      const realTimeData = {
        activeUsers: parseInt(
          realtimeResponse.data.rows[0]?.metricValues[0]?.value || 0
        ),
        pageViewsPerMinute: Math.round(
          parseInt(realtimeResponse.data.rows[0]?.metricValues[1]?.value || 0) /
            24
        ),
        topActivePage:
          activePageResponse.data.rows[0]?.dimensionValues[0]?.value || "/",
      };

      await cacheService.setAnalyticsData("realtime", {}, realTimeData, 60);

      return realTimeData;
    } catch (error) {
      logger.error("Failed to fetch real-time analytics data:", error);
      return {
        error: "Failed to fetch real-time analytics data",
        message: error.message,
        configured: true,
      };
    }
  }
}

export default new AnalyticsService();
