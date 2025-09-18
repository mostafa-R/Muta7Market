/**
 * @file
 * @description
 * @requires ../services/analytics.service.js
 * @requires ../utils/ApiError.js
 * @requires ../utils/ApiResponse.js
 * @requires ../utils/asyncHandler.js
 */

import analyticsService from "../services/analytics.service.js";
import ApiError from "../utils/ApiError.js";
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

    return res
      .status(200)
      .json(
        new ApiResponse(200, analyticsData, "تم جلب بيانات التحليلات بنجاح")
      );
  } catch (error) {
    throw new ApiError(500, "حدث خطأ أثناء جلب بيانات التحليلات");
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
    throw new ApiError(
      500,
      "حدث خطأ أثناء جلب بيانات التحليلات في الوقت الحقيقي"
    );
  }
});
