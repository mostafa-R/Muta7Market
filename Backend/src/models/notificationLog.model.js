import mongoose from 'mongoose';

const notificationLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    channel: {
      type: String,
      enum: ['email', 'sms', 'push', 'in_app'],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NotificationTemplate',
      index: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: [
        'pending',
        'sent',
        'delivered',
        'read',
        'clicked',
        'failed',
        'bounced'
      ],
      default: 'pending',
      required: true,
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'critical'],
      default: 'normal'
    },
    error: {
      message: String,
      code: String,
      details: mongoose.Schema.Types.Mixed
    },
    delivery: {
      sentAt: Date,
      deliveredAt: Date,
      readAt: Date,
      clickedAt: Date,
      failedAt: Date,
      attempts: {
        type: Number,
        default: 0
      },
      maxAttempts: {
        type: Number,
        default: 3
      },
      nextRetryAt: Date
    },
    recipient: {
      email: String,
      phone: String,
      deviceId: String,
      playerId: String // OneSignal player ID
    },
    metadata: {
      deviceId: String,
      platform: {
        type: String,
        enum: ['ios', 'android', 'web', 'desktop']
      },
      deviceType: {
        type: String,
        enum: ['mobile', 'tablet', 'desktop']
      },
      browser: String,
      os: String,
      ip: String,
      userAgent: String,
      location: {
        country: String,
        city: String,
        timezone: String
      },
      campaign: {
        id: String,
        name: String,
        source: String,
        medium: String
      }
    },
    tracking: {
      messageId: String, // External service message ID
      batchId: String, // For bulk notifications
      correlationId: String, // For tracking related notifications
      tags: [String]
    },
    content: {
      subject: String, // For email
      body: String,
      htmlBody: String, // For email HTML content
      attachments: [
        {
          filename: String,
          size: Number,
          contentType: String,
          url: String
        }
      ],
      actionButtons: [
        {
          id: String,
          text: String,
          url: String,
          clicked: {
            type: Boolean,
            default: false
          },
          clickedAt: Date
        }
      ]
    },
    analytics: {
      openCount: {
        type: Number,
        default: 0
      },
      clickCount: {
        type: Number,
        default: 0
      },
      lastOpenedAt: Date,
      lastClickedAt: Date,
      timeToOpen: Number, // Milliseconds from sent to first open
      timeToClick: Number // Milliseconds from sent to first click
    },
    preferences: {
      language: {
        type: String,
        default: 'en'
      },
      timezone: String,
      frequency: {
        type: String,
        enum: ['immediate', 'daily', 'weekly', 'monthly'],
        default: 'immediate'
      }
    },
    scheduling: {
      scheduledAt: Date,
      timezone: String,
      recurring: {
        enabled: {
          type: Boolean,
          default: false
        },
        pattern: {
          type: String,
          enum: ['daily', 'weekly', 'monthly', 'yearly']
        },
        interval: Number, // Every N days/weeks/months
        endDate: Date,
        nextRun: Date
      }
    },
    segmentation: {
      segment: String,
      criteria: mongoose.Schema.Types.Mixed,
      audienceSize: Number
    },
    compliance: {
      consentGiven: {
        type: Boolean,
        default: false
      },
      consentDate: Date,
      unsubscribeToken: String,
      suppressionReason: String,
      gdprCompliant: {
        type: Boolean,
        default: true
      }
    },
    cost: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      provider: String // SMS/Email provider
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for better query performance
notificationLogSchema.index({ user: 1, createdAt: -1 });
notificationLogSchema.index({ user: 1, status: 1 });
notificationLogSchema.index({ user: 1, channel: 1, createdAt: -1 });
notificationLogSchema.index({ status: 1, channel: 1 });
notificationLogSchema.index({ templateId: 1, createdAt: -1 });
notificationLogSchema.index({ 'delivery.nextRetryAt': 1, status: 1 });
notificationLogSchema.index({ 'tracking.batchId': 1 });
notificationLogSchema.index({ 'tracking.correlationId': 1 });
notificationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // Auto-delete after 90 days

// Virtual for calculating delivery time
notificationLogSchema.virtual('deliveryTime').get(function () {
  if (this.delivery.sentAt && this.delivery.deliveredAt) {
    return this.delivery.deliveredAt - this.delivery.sentAt;
  }
  return null;
});

// Virtual for calculating read time
notificationLogSchema.virtual('readTime').get(function () {
  if (this.delivery.sentAt && this.delivery.readAt) {
    return this.delivery.readAt - this.delivery.sentAt;
  }
  return null;
});

// Virtual for engagement status
notificationLogSchema.virtual('isEngaged').get(function () {
  return (
    this.status === 'read' ||
    this.status === 'clicked' ||
    this.analytics.clickCount > 0
  );
});

// Instance methods
notificationLogSchema.methods.markAsSent = function () {
  this.status = 'sent';
  this.delivery.sentAt = new Date();
  this.delivery.attempts += 1;
  return this.save();
};

notificationLogSchema.methods.markAsDelivered = function () {
  this.status = 'delivered';
  this.delivery.deliveredAt = new Date();
  return this.save();
};

notificationLogSchema.methods.markAsRead = function () {
  if (this.status !== 'read') {
    this.status = 'read';
    this.delivery.readAt = new Date();
    this.analytics.openCount += 1;

    if (!this.analytics.lastOpenedAt) {
      this.analytics.lastOpenedAt = new Date();
      if (this.delivery.sentAt) {
        this.analytics.timeToOpen = Date.now() - this.delivery.sentAt.getTime();
      }
    }
  }
  return this.save();
};

notificationLogSchema.methods.markAsClicked = function (buttonId = null) {
  this.status = 'clicked';
  this.delivery.clickedAt = new Date();
  this.analytics.clickCount += 1;
  this.analytics.lastClickedAt = new Date();

  if (this.delivery.sentAt && !this.analytics.timeToClick) {
    this.analytics.timeToClick = Date.now() - this.delivery.sentAt.getTime();
  }

  // Mark specific button as clicked
  if (buttonId && this.content.actionButtons) {
    const button = this.content.actionButtons.find(
      (btn) => btn.id === buttonId
    );
    if (button) {
      button.clicked = true;
      button.clickedAt = new Date();
    }
  }

  return this.save();
};

notificationLogSchema.methods.markAsFailed = function (error) {
  this.status = 'failed';
  this.delivery.failedAt = new Date();
  this.delivery.attempts += 1;

  if (error) {
    this.error = {
      message: error.message || error,
      code: error.code,
      details: error.details || error
    };
  }

  // Schedule retry if attempts < maxAttempts
  if (this.delivery.attempts < this.delivery.maxAttempts) {
    const retryDelay = Math.pow(2, this.delivery.attempts) * 60 * 1000; // Exponential backoff
    this.delivery.nextRetryAt = new Date(Date.now() + retryDelay);
    this.status = 'pending';
  }

  return this.save();
};

notificationLogSchema.methods.shouldRetry = function () {
  return (
    this.status === 'pending' &&
    this.delivery.attempts < this.delivery.maxAttempts &&
    this.delivery.nextRetryAt &&
    this.delivery.nextRetryAt <= new Date()
  );
};

// Static methods
notificationLogSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    user: userId,
    status: { $in: ['sent', 'delivered'] },
    channel: { $in: ['push', 'in_app'] }
  });
};

notificationLogSchema.statics.getAnalytics = function (filters = {}) {
  const pipeline = [
    { $match: filters },
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
        count: { $sum: 1 },
        totalCost: { $sum: '$cost.amount' }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        stats: {
          $push: {
            channel: '$_id.channel',
            status: '$_id.status',
            count: '$count',
            cost: '$totalCost'
          }
        },
        totalCount: { $sum: '$count' },
        totalCost: { $sum: '$totalCost' }
      }
    },
    { $sort: { _id: -1 } }
  ];

  return this.aggregate(pipeline);
};

notificationLogSchema.statics.getPendingRetries = function () {
  return this.find({
    status: 'pending',
    'delivery.nextRetryAt': { $lte: new Date() },
    'delivery.attempts': {
      $lt: this.schema.paths['delivery.maxAttempts'].defaultValue
    }
  });
};

notificationLogSchema.statics.getEngagementStats = function (
  userId,
  timeframe = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);

  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSent: { $sum: 1 },
        totalRead: {
          $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
        },
        totalClicked: {
          $sum: { $cond: [{ $eq: ['$status', 'clicked'] }, 1, 0] }
        },
        avgTimeToOpen: { $avg: '$analytics.timeToOpen' },
        avgTimeToClick: { $avg: '$analytics.timeToClick' }
      }
    }
  ]);
};

// Pre-save middleware
notificationLogSchema.pre('save', function (next) {
  // Generate unsubscribe token if not exists
  if (this.channel === 'email' && !this.compliance.unsubscribeToken) {
    this.compliance.unsubscribeToken = require('crypto')
      .randomBytes(32)
      .toString('hex');
  }

  // Set timezone if not provided
  if (!this.preferences.timezone) {
    this.preferences.timezone = 'UTC';
  }

  next();
});

// Post-save middleware for analytics
notificationLogSchema.post('save', async function (doc) {
  // Update template analytics if templateId exists
  if (doc.templateId && doc.isModified('status')) {
    const Template = mongoose.model('NotificationTemplate');
    const updateField = {};

    switch (doc.status) {
    case 'sent':
      updateField['analytics.totalSent'] = 1;
      updateField['analytics.lastUsed'] = new Date();
      break;
    case 'delivered':
      updateField['analytics.totalDelivered'] = 1;
      break;
    case 'read':
      updateField['analytics.totalRead'] = 1;
      break;
    case 'clicked':
      updateField['analytics.totalClicked'] = 1;
      break;
    case 'failed':
      updateField['analytics.totalFailed'] = 1;
      break;
    }

    if (Object.keys(updateField).length > 0) {
      await Template.findByIdAndUpdate(
        doc.templateId,
        { $inc: updateField },
        { upsert: false }
      );
    }
  }
});

const NotificationLog = mongoose.model(
  'NotificationLog',
  notificationLogSchema
);

export default NotificationLog;
