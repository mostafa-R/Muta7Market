// controllers/notification.controller.js
import OneSignal from 'onesignal-node';
import NotificationLog from '../models/notificationLog.model.js';
import NotificationTemplate from '../models/notificationTemplate.model.js';
import User from '../models/user.model.js';
import { initializeEmailService } from '../services/email.service.js';
import smsService from '../services/sms.service.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const oneSignalClient = new OneSignal.Client(
  process.env.ONESIGNAL_APP_ID,
  process.env.ONESIGNAL_API_KEY
);

const prepareRecipients = async (recipients, segment) => {
  let users = [];

  if (recipients === 'all') {
    users = await User.find({ isActive: true }).lean();
  } else if (Array.isArray(recipients)) {
    users = await User.find({
      _id: { $in: recipients },
      isActive: true
    }).lean();
  } else if (typeof recipients === 'string') {
    const user = await User.findById(recipients).lean();
    if (user && user.isActive) {
      users = [user];
    }
  }

  if (segment) {
    users = await applySegmentFilter(users, segment);
  }

  return users;
};

const applySegmentFilter = async (users, segment) => {
  const { criteria } = segment;

  return users.filter((user) => {
    if (criteria.role && user.role !== criteria.role) {
      return false;
    }
    if (
      criteria.isVerified &&
      (!user.isEmailVerified || !user.isPhoneVerified)
    ) {
      return false;
    }
    if (criteria.language && user.preferences.language !== criteria.language) {
      return false;
    }
    if (criteria.lastLoginDays) {
      const daysSinceLogin =
        (Date.now() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24);
      if (daysSinceLogin > criteria.lastLoginDays) {
        return false;
      }
    }
    return true;
  });
};

const renderTemplate = async (template, channel, context) => {
  const content = template.content[channel];
  if (!content) {
    throw new ApiError(400, `Template doesn't support ${channel} channel`);
  }

  const language = context.user.preferences?.language || 'en';
  const rendered = {
    subject: content.subject?.[language] || content.subject?.en,
    body: content.body[language] || content.body.en
  };

  const variables = {
    user_name: context.user.name,
    user_email: context.user.email,
    ...context.data
  };

  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    if (rendered.subject) {
      rendered.subject = rendered.subject.replace(regex, variables[key]);
    }
    rendered.body = rendered.body.replace(regex, variables[key]);
  });

  return rendered;
};

const logNotification = async (logData) => {
  try {
    await NotificationLog.create(logData);
  } catch (error) {
    logger.error('Failed to log notification:', error);
  }
};

const sendPushNotification = async (
  user,
  title,
  message,
  data = {},
  options = {}
) => {
  const notification = {
    headings: {
      en: title,
      ar: options.titleAr || title
    },
    contents: {
      en: message,
      ar: options.messageAr || message
    },
    data: {
      ...data,
      userId: user._id.toString()
    },
    filters: [
      {
        field: 'tag',
        key: 'userId',
        relation: '=',
        value: user._id.toString()
      }
    ]
  };

  if (options.imageUrl) {
    notification.big_picture = options.imageUrl;
  }

  if (options.actionButtons) {
    notification.buttons = options.actionButtons;
  }

  if (options.scheduleAt) {
    notification.send_after = options.scheduleAt;
  }

  if (options.priority === 'high') {
    notification.priority = 10;
  }

  try {
    const response = await oneSignalClient.createNotification(notification);
    return response;
  } catch (error) {
    logger.error('OneSignal push error:', error);
    throw new ApiError(500, `Push notification failed: ${error.message}`);
  }
};

export const sendNotification = asyncHandler(async (req, res) => {
  const { recipients, title, message, data = {}, options = {} } = req.body;

  if (!recipients || !title || !message) {
    throw new ApiError(400, 'Recipients, title, and message are required');
  }

  const { channels = ['push', 'email'], templateId, segment } = options;

  let template;
  if (templateId) {
    template = await NotificationTemplate.findById(templateId);
    if (!template || !template.isActive) {
      throw new ApiError(404, 'Notification template not found');
    }
  }

  const recipientUsers = await prepareRecipients(recipients, segment);

  const results = {
    push: { success: 0, failed: 0, errors: [] },
    email: { success: 0, failed: 0, errors: [] },
    sms: { success: 0, failed: 0, errors: [] }
  };

  for (const user of recipientUsers) {
    const userChannels = channels.filter(
      (channel) => user.preferences?.notifications?.[channel] !== false
    );

    for (const channel of userChannels) {
      try {
        switch (channel) {
        case 'push':
          await sendPushNotification(user, title, message, data, options);
          results.push.success++;
          break;

        case 'email': {
          const emailContent = template
            ? await renderTemplate(template, 'email', { user, data })
            : { subject: title, body: message };
          await initializeEmailService.sendNotificationEmail(
            user.email,
            emailContent.subject,
            emailContent.body,
            data
          );
          results.email.success++;
          break;
        }

        case 'sms': {
          const smsContent = template
            ? await renderTemplate(template, 'sms', { user, data })
            : message;
          await smsService.sendSMS(user.phone, smsContent);
          results.sms.success++;
          break;
        }
        }

        await logNotification({
          user: user._id,
          channel,
          title,
          message,
          templateId,
          data,
          status: 'sent'
        });
      } catch (error) {
        results[channel].failed++;
        results[channel].errors.push({
          userId: user._id,
          error: error.message
        });

        await logNotification({
          user: user._id,
          channel,
          title,
          message,
          templateId,
          data,
          status: 'failed',
          error: error.message
        });
      }
    }
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalRecipients: recipientUsers.length,
        results
      },
      'Notifications sent successfully'
    )
  );
});

export const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { channel, status, from, to, limit = 50, page = 1 } = req.query;

  const query = { user: userId };

  if (channel) {
    query.channel = channel;
  }
  if (status) {
    query.status = status;
  }

  if (from || to) {
    query.createdAt = {};
    if (from) {
      query.createdAt.$gte = new Date(from);
    }
    if (to) {
      query.createdAt.$lte = new Date(to);
    }
  }

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    NotificationLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    NotificationLog.countDocuments(query)
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      },
      'Notifications fetched successfully'
    )
  );
});

export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { notificationIds } = req.body;

  if (!notificationIds || !Array.isArray(notificationIds)) {
    throw new ApiError(400, 'Notification IDs array is required');
  }

  const result = await NotificationLog.updateMany(
    {
      user: userId,
      _id: { $in: notificationIds },
      readAt: null
    },
    { readAt: new Date() }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { modified: result.modifiedCount },
        'Notifications marked as read'
      )
    );
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const count = await NotificationLog.countDocuments({
    user: userId,
    readAt: null,
    channel: 'push'
  });

  res
    .status(200)
    .json(new ApiResponse(200, { unreadCount: count }, 'Unread count fetched'));
});

export const sendBulkNotifications = asyncHandler(async (req, res) => {
  const { notifications, options = {} } = req.body;
  const { batchSize = 100 } = options;

  if (!notifications || !Array.isArray(notifications)) {
    throw new ApiError(400, 'Notifications array is required');
  }

  const results = [];

  for (let i = 0; i < notifications.length; i += batchSize) {
    const batch = notifications.slice(i, i + batchSize);

    const batchPromises = batch.map(async (notification) => {
      try {
        const recipientUsers = await prepareRecipients(
          notification.recipients,
          notification.options?.segment
        );

        return { success: true, recipients: recipientUsers.length };
      } catch (error) {
        return {
          error: true,
          message: error.message,
          notification
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    if (i + batchSize < notifications.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        total: notifications.length,
        successful: results.filter((r) => !r.error).length,
        failed: results.filter((r) => r.error).length,
        results
      },
      'Bulk notifications processed'
    )
  );
});


export const createTemplate = asyncHandler(async (req, res) => {
  const template = await NotificationTemplate.create(req.body);

  res
    .status(201)
    .json(new ApiResponse(201, template, 'Template created successfully'));
});

export const getAllTemplates = asyncHandler(async (req, res) => {
  const { category, isActive, page = 1, limit = 10 } = req.query;

  const query = {};
  if (category) {
    query.category = category;
  }
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const skip = (page - 1) * limit;

  const [templates, total] = await Promise.all([
    NotificationTemplate.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip),
    NotificationTemplate.countDocuments(query)
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        templates,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      },
      'Templates fetched successfully'
    )
  );
});

export const getTemplateById = asyncHandler(async (req, res) => {
  const template = await NotificationTemplate.findById(req.params.id);

  if (!template) {
    throw new ApiError(404, 'Template not found');
  }

  res
    .status(200)
    .json(new ApiResponse(200, template, 'Template fetched successfully'));
});

export const updateTemplate = asyncHandler(async (req, res) => {
  const template = await NotificationTemplate.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!template) {
    throw new ApiError(404, 'Template not found');
  }

  res
    .status(200)
    .json(new ApiResponse(200, template, 'Template updated successfully'));
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  const template = await NotificationTemplate.findByIdAndDelete(req.params.id);

  if (!template) {
    throw new ApiError(404, 'Template not found');
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, 'Template deleted successfully'));
});

export const getNotificationAnalytics = asyncHandler(async (req, res) => {
  const { from, to, channel, status } = req.query;

  const matchQuery = {};
  if (from || to) {
    matchQuery.createdAt = {};
    if (from) {
      matchQuery.createdAt.$gte = new Date(from);
    }
    if (to) {
      matchQuery.createdAt.$lte = new Date(to);
    }
  }
  if (channel) {
    matchQuery.channel = channel;
  }
  if (status) {
    matchQuery.status = status;
  }

  const analytics = await NotificationLog.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          channel: '$channel',
          status: '$status',
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        channels: {
          $push: {
            channel: '$_id.channel',
            status: '$_id.status',
            count: '$count'
          }
        }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  const summaryStats = await NotificationLog.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalSent: { $sum: 1 },
        totalDelivered: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        totalRead: {
          $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
        },
        totalFailed: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        }
      }
    }
  ]);

  const stats = summaryStats[0] || {
    totalSent: 0,
    totalDelivered: 0,
    totalRead: 0,
    totalFailed: 0
  };

  const deliveryRate = stats.totalSent
    ? ((stats.totalDelivered / stats.totalSent) * 100).toFixed(2)
    : 0;
  const readRate = stats.totalSent
    ? ((stats.totalRead / stats.totalSent) * 100).toFixed(2)
    : 0;
  const failureRate = stats.totalSent
    ? ((stats.totalFailed / stats.totalSent) * 100).toFixed(2)
    : 0;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        analytics,
        summary: {
          ...stats,
          deliveryRate,
          readRate,
          failureRate
        }
      },
      'Analytics fetched successfully'
    )
  );
});

export const sendInternalNotification = async (
  recipients,
  title,
  message,
  data = {},
  options = {}
) => {
  try {
    const { channels = ['push'], templateId } = options;

    let template;
    if (templateId) {
      template = await NotificationTemplate.findById(templateId);
    }

    const recipientUsers = await prepareRecipients(recipients);

    for (const user of recipientUsers) {
      const userChannels = channels.filter(
        (channel) => user.preferences?.notifications?.[channel] !== false
      );

      for (const channel of userChannels) {
        try {
          switch (channel) {
          case 'push':
            await sendPushNotification(user, title, message, data, options);
            break;

          case 'email': {
            const emailContent = template
              ? await renderTemplate(template, 'email', { user, data })
              : { subject: title, body: message };
            await initializeEmailService.sendNotificationEmail(
              user.email,
              emailContent.subject,
              emailContent.body,
              data
            );
            break;
          }

          case 'sms': {
            const smsContent = template
              ? await renderTemplate(template, 'sms', { user, data })
              : message;
            await smsService.sendSMS(user.phone, smsContent);
            break;
          }
          }

          await logNotification({
            user: user._id,
            channel,
            title,
            message,
            templateId,
            data,
            status: 'sent'
          });
        } catch (error) {
          await logNotification({
            user: user._id,
            channel,
            title,
            message,
            templateId,
            data,
            status: 'failed',
            error: error.message
          });
        }
      }
    }

    return { success: true };
  } catch (error) {
    logger.error('Internal notification error:', error);
    throw error;
  }
};
