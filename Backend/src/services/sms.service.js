import axios from "axios";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

class SMSService {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY;
    this.apiUrl = process.env.SMS_API_URL;
    this.senderId = process.env.SMS_SENDER_ID || "SPORTS";
    this.templates = new Map();
    this.loadTemplates();
  }

  async loadTemplates() {
    this.templates.set("otp", {
      en: "Your verification code is: {{otp}}. Valid for {{minutes}} minutes.",
      ar: "رمز التحقق الخاص بك هو: {{otp}}. صالح لمدة {{minutes}} دقيقة.",
    });

    this.templates.set("welcome", {
      en: "Welcome to Sports Platform! Your account has been created successfully.",
      ar: "مرحبًا بك في منصة الرياضة! تم إنشاء حسابك بنجاح.",
    });

    this.templates.set("payment_success", {
      en: "Payment of {{amount}} {{currency}} completed successfully. Reference: {{reference}}",
      ar: "تم إتمام دفعة {{amount}} {{currency}} بنجاح. المرجع: {{reference}}",
    });

    this.templates.set("offer_promoted", {
      en: 'Your offer "{{title}}" has been promoted successfully for {{days}} days.',
      ar: 'تم ترويج عرضك "{{title}}" بنجاح لمدة {{days}} يوم.',
    });
  }

  /**
   * @param {string} phone
   * @param {string} message
   * @param {Object} options
   */
  async sendSMS(phone, message, options = {}) {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);

      if (message.length > 160) {
        logger.warn(`SMS message exceeds 160 characters: ${message.length}`);
      }

      const payload = {
        api_key: this.apiKey,
        sender_id: options.senderId || this.senderId,
        phone: formattedPhone,
        message,
        language: options.language || "en",
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000,
      });

      if (response.data.status === "success") {
        logger.info(`SMS sent successfully to ${formattedPhone}`);
        return {
          success: true,
          messageId: response.data.message_id,
          credits: response.data.credits_used,
        };
      }
      throw new Error(response.data.message || "SMS sending failed");
    } catch (error) {
      logger.error("SMS sending error:", error);

      if (error.response) {
        throw new ApiError(
          error.response.status,
          `SMS service error: ${error.response.data.message || error.message}`
        );
      }

      throw new ApiError(500, `Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * @param {string} phone
   * @param {string} otp
   * @param {number} validityMinutes
   */
  async sendOTP(phone, otp, validityMinutes = 10) {
    const template = this.templates.get("otp");
    const message = this.renderTemplate(template.en, {
      otp,
      minutes: validityMinutes,
    });

    return this.sendSMS(phone, message, {
      priority: "high",
    });
  }

  /**
   * @param {string} phone
   * @param {string} templateName
   * @param {Object} variables
   * @param {string} language
   */
  async sendTemplatedSMS(phone, templateName, variables = {}, language = "en") {
    const template = this.templates.get(templateName);

    if (!template) {
      throw new ApiError(400, `SMS template '${templateName}' not found`);
    }

    const message = this.renderTemplate(
      template[language] || template.en,
      variables
    );

    return this.sendSMS(phone, message, { language });
  }

  /**
   * @param {Array} recipients
   * @param {Object} options
   */
  async sendBulkSMS(recipients, options = {}) {
    const { batchSize = 100, delayMs = 1000 } = options;
    const results = {
      sent: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const promises = batch.map((recipient) => {
        const message =
          recipient.message ||
          this.renderTemplate(
            this.templates.get(recipient.template)[recipient.language || "en"],
            recipient.variables
          );

        return this.sendSMS(recipient.phone, message)
          .then((result) => {
            results.sent++;
            return {
              phone: recipient.phone,
              success: true,
              messageId: result.messageId,
            };
          })
          .catch((error) => {
            results.failed++;
            results.errors.push({
              phone: recipient.phone,
              error: error.message,
            });
            return {
              phone: recipient.phone,
              success: false,
              error: error.message,
            };
          });
      });

      await Promise.all(promises);

      if (i + batchSize < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }

  /**
   * @param {string} template
   * @param {Object} variables
   */
  renderTemplate(template, variables) {
    let rendered = template;

    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      rendered = rendered.replace(regex, variables[key]);
    });

    return rendered;
  }

  /**
   * @param {string} phone
   */
  formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, "");

    if (cleaned.startsWith("966")) {
      return cleaned;
    } else if (cleaned.startsWith("5") && cleaned.length === 9) {
      return `966${cleaned}`;
    } else if (cleaned.startsWith("05") && cleaned.length === 10) {
      return `966${cleaned.substring(1)}`;
    } else if (cleaned.startsWith("+966")) {
      return cleaned.substring(1);
    }

    return cleaned;
  }

  /**
   * @param {string} phone
   */
  validatePhoneNumber(phone) {
    const formatted = this.formatPhoneNumber(phone);
    const saudiPhoneRegex = /^966[0-9]{9}$/;

    return saudiPhoneRegex.test(formatted);
  }

  /**
   * @param {string} messageId
   */
  async getDeliveryStatus(messageId) {
    try {
      const response = await axios.get(`${this.apiUrl}/status/${messageId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return {
        messageId,
        status: response.data.status,
        deliveredAt: response.data.delivered_at,
        error: response.data.error,
      };
    } catch (error) {
      logger.error("Failed to get SMS status:", error);
      throw new ApiError(500, "Failed to retrieve SMS status");
    }
  }

  async getBalance() {
    try {
      const response = await axios.get(`${this.apiUrl}/balance`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return {
        balance: response.data.balance,
        currency: response.data.currency || "credits",
      };
    } catch (error) {
      logger.error("Failed to get SMS balance:", error);
      throw new ApiError(500, "Failed to retrieve SMS balance");
    }
  }
}

export default new SMSService();
