/**
 * @file
 * @description
 * @requires ../services/analytics.service.js
 * @requires ../utils/ApiError.js
 * @requires ../utils/ApiResponse.js
 * @requires ../utils/asyncHandler.js
 */

import analyticsService from "../services/analytics.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * @route
 * @desc
 * @access
 */
export const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const { timeRange = "7d" } = req.query;

  try {
    const analyticsData = await analyticsService.getOverviewData(timeRange);

    // Check if the response contains an error
    if (analyticsData.error) {
      const statusCode = analyticsData.configured === false ? 503 : 500;
      return res.status(statusCode).json({
        success: false,
        error: {
          message: analyticsData.message,
          type: analyticsData.error,
          configured: analyticsData.configured,
        },
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, analyticsData, "تم جلب بيانات التحليلات بنجاح")
      );
  } catch (error) {
    console.error("Analytics overview error:", error);

    // Return a proper error response instead of throwing
    return res.status(500).json({
      success: false,
      error: {
        message: "حدث خطأ أثناء جلب بيانات التحليلات",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
    });
  }
});

/**
 * @route
 * @desc
 * @access
 */
export const getRealTimeAnalytics = asyncHandler(async (req, res) => {
  try {
    const realTimeData = await analyticsService.getRealTimeData();

    // Check if the response contains an error
    if (realTimeData.error) {
      const statusCode = realTimeData.configured === false ? 503 : 500;
      return res.status(statusCode).json({
        success: false,
        error: {
          message: realTimeData.message,
          type: realTimeData.error,
          configured: realTimeData.configured,
        },
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          realTimeData,
          "تم جلب بيانات التحليلات في الوقت الحقيقي بنجاح"
        )
      );
  } catch (error) {
    console.error("Real-time analytics error:", error);

    // Return a proper error response instead of throwing
    return res.status(500).json({
      success: false,
      error: {
        message: "حدث خطأ أثناء جلب بيانات التحليلات في الوقت الحقيقي",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
    });
  }
});
