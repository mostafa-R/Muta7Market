import Joi from "joi";

export const getAnalyticsOverviewSchema = Joi.object({
  timeRange: Joi.string()
    .valid("7d", "30d", "90d", "12m")
    .default("7d")
    .messages({
      "any.only": "Time range must be one of: 7d, 30d, 90d, 12m",
    }),
});

export const getRealTimeAnalyticsSchema = Joi.object({
  // No additional parameters needed for real-time analytics
});

export const validateTimeRange = (req, res, next) => {
  const { error } = getAnalyticsOverviewSchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const message = error.details.map((detail) => detail.message).join(", ");
    return res.status(400).json({
      success: false,
      error: {
        message,
        details: error.details,
      },
    });
  }

  req.query.timeRange = req.query.timeRange || "7d";
  next();
};
