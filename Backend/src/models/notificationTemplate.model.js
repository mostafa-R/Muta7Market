import mongoose from 'mongoose';

const notificationTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      enum: ['transactional', 'marketing', 'system', 'promotional'],
      default: 'transactional',
      required: true
    },
    content: {
      email: {
        subject: {
          en: {
            type: String,
            required () {
              return this.content.email !== undefined;
            }
          },
          ar: String
        },
        body: {
          en: {
            type: String,
            required () {
              return this.content.email !== undefined;
            }
          },
          ar: String
        },
        template: String, // HTML template name or ID
        attachments: [
          {
            filename: String,
            path: String,
            contentType: String
          }
        ]
      },
      sms: {
        body: {
          en: {
            type: String,
            maxlength: 160, // SMS character limit
            required () {
              return this.content.sms !== undefined;
            }
          },
          ar: {
            type: String,
            maxlength: 160
          }
        }
      },
      push: {
        title: {
          en: {
            type: String,
            required () {
              return this.content.push !== undefined;
            }
          },
          ar: String
        },
        body: {
          en: {
            type: String,
            required () {
              return this.content.push !== undefined;
            }
          },
          ar: String
        },
        icon: String, // URL to notification icon
        image: String, // URL to big picture
        actionButtons: [
          {
            id: String,
            text: {
              en: String,
              ar: String
            },
            icon: String,
            url: String
          }
        ],
        sound: String,
        badge: Number
      }
    },
    variables: [
      {
        name: {
          type: String,
          required: true
        },
        description: String,
        type: {
          type: String,
          enum: ['string', 'number', 'date', 'boolean', 'object'],
          default: 'string'
        },
        required: {
          type: Boolean,
          default: false
        },
        defaultValue: mongoose.Schema.Types.Mixed,
        validation: {
          pattern: String, // Regex pattern for validation
          min: Number, // For numbers
          max: Number, // For numbers
          minLength: Number, // For strings
          maxLength: Number // For strings
        }
      }
    ],
    triggers: [
      {
        event: {
          type: String,
          required: true,
          enum: [
            'user_registration',
            'email_verification',
            'phone_verification',
            'password_reset',
            'offer_created',
            'offer_activated',
            'offer_promoted',
            'offer_expired',
            'contact_unlocked',
            'payment_success',
            'payment_failed',
            'subscription_created',
            'subscription_renewed',
            'subscription_cancelled',
            'custom'
          ]
        },
        conditions: [
          {
            field: String,
            operator: {
              type: String,
              enum: [
                'equals',
                'not_equals',
                'contains',
                'not_contains',
                'greater_than',
                'less_than'
              ]
            },
            value: mongoose.Schema.Types.Mixed
          }
        ],
        delay: {
          value: Number,
          unit: {
            type: String,
            enum: ['minutes', 'hours', 'days'],
            default: 'minutes'
          }
        }
      }
    ],
    settings: {
      priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'critical'],
        default: 'normal'
      },
      channels: {
        type: [String],
        enum: ['email', 'sms', 'push'],
        default: ['push']
      },
      frequency: {
        maxPerDay: {
          type: Number,
          default: null // null means no limit
        },
        maxPerWeek: {
          type: Number,
          default: null
        },
        cooldownPeriod: {
          value: Number,
          unit: {
            type: String,
            enum: ['minutes', 'hours', 'days'],
            default: 'hours'
          }
        }
      },
      segmentation: {
        userRoles: [String],
        userStatuses: [String],
        languages: [String],
        countries: [String],
        customCriteria: mongoose.Schema.Types.Mixed
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    version: {
      type: Number,
      default: 1
    },
    testData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    analytics: {
      totalSent: {
        type: Number,
        default: 0
      },
      totalDelivered: {
        type: Number,
        default: 0
      },
      totalRead: {
        type: Number,
        default: 0
      },
      totalClicked: {
        type: Number,
        default: 0
      },
      totalFailed: {
        type: Number,
        default: 0
      },
      lastUsed: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better performance
notificationTemplateSchema.index({ name: 1 });
notificationTemplateSchema.index({ category: 1, isActive: 1 });
notificationTemplateSchema.index({ 'triggers.event': 1 });
notificationTemplateSchema.index({ createdBy: 1 });

// Virtual for calculating engagement rate
notificationTemplateSchema.virtual('engagementRate').get(function () {
  if (this.analytics.totalSent === 0) {return 0;}
  return (
    Math.round(
      (this.analytics.totalRead / this.analytics.totalSent) * 100 * 100
    ) / 100
  );
});

// Method to validate template variables
notificationTemplateSchema.methods.validateVariables = function (providedData) {
  const errors = [];

  for (const variable of this.variables) {
    if (variable.required && !providedData.hasOwnProperty(variable.name)) {
      errors.push(`Required variable '${variable.name}' is missing`);
      continue;
    }

    const value = providedData[variable.name];
    if (value !== undefined && value !== null) {
      // Type validation
      if (variable.type === 'number' && isNaN(value)) {
        errors.push(`Variable '${variable.name}' must be a number`);
      }

      // String length validation
      if (variable.type === 'string' && typeof value === 'string') {
        if (
          variable.validation?.minLength &&
          value.length < variable.validation.minLength
        ) {
          errors.push(
            `Variable '${variable.name}' must be at least ${variable.validation.minLength} characters`
          );
        }
        if (
          variable.validation?.maxLength &&
          value.length > variable.validation.maxLength
        ) {
          errors.push(
            `Variable '${variable.name}' must be no more than ${variable.validation.maxLength} characters`
          );
        }
        if (
          variable.validation?.pattern &&
          !new RegExp(variable.validation.pattern).test(value)
        ) {
          errors.push(
            `Variable '${variable.name}' does not match required pattern`
          );
        }
      }

      // Number range validation
      if (variable.type === 'number' && typeof value === 'number') {
        if (variable.validation?.min && value < variable.validation.min) {
          errors.push(
            `Variable '${variable.name}' must be at least ${variable.validation.min}`
          );
        }
        if (variable.validation?.max && value > variable.validation.max) {
          errors.push(
            `Variable '${variable.name}' must be no more than ${variable.validation.max}`
          );
        }
      }
    }
  }

  return errors;
};

// Method to render template with variables
notificationTemplateSchema.methods.render = function (
  channel,
  language = 'en',
  variables = {}
) {
  const content = this.content[channel];
  if (!content) {
    throw new Error(`Template doesn't support ${channel} channel`);
  }

  // Validate variables first
  const validationErrors = this.validateVariables(variables);
  if (validationErrors.length > 0) {
    throw new Error(
      `Template validation failed: ${validationErrors.join(', ')}`
    );
  }

  const result = {
    title: content.title?.[language] || content.title?.en || '',
    subject: content.subject?.[language] || content.subject?.en || '',
    body: content.body?.[language] || content.body?.en || ''
  };

  // Add default values for missing variables
  const allVariables = { ...variables };
  this.variables.forEach((variable) => {
    if (
      !allVariables.hasOwnProperty(variable.name) &&
      variable.defaultValue !== undefined
    ) {
      allVariables[variable.name] = variable.defaultValue;
    }
  });

  // Replace variables in all text fields
  Object.keys(result).forEach((key) => {
    if (result[key]) {
      Object.keys(allVariables).forEach((varName) => {
        const regex = new RegExp(`{{\\s*${varName}\\s*}}`, 'g');
        result[key] = result[key].replace(regex, allVariables[varName] || '');
      });
    }
  });

  return result;
};

// Method to create a test notification
notificationTemplateSchema.methods.createTestNotification = function (
  channel,
  language = 'en'
) {
  return this.render(channel, language, this.testData);
};

// Static method to find templates by event
notificationTemplateSchema.statics.findByEvent = function (
  event,
  conditions = {}
) {
  return this.find({
    'triggers.event': event,
    isActive: true,
    ...conditions
  });
};

// Pre-save middleware to update version and analytics
notificationTemplateSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
    this.updatedBy = this.constructor.currentUser; // Set by middleware
  }
  next();
});

const NotificationTemplate = mongoose.model(
  'NotificationTemplate',
  notificationTemplateSchema
);

export default NotificationTemplate;
