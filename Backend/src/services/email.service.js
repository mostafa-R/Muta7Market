import fs from "fs/promises";
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let transporter;
const templates = new Map();

async function initializeEmailService() {
  transporter = createTransporter();
  await loadTemplates();
}

function createTransporter() {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: (process.env.SMTP_PORT || "465") === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  const transporter = nodemailer.createTransport(config);

  transporter.verify((error, _success) => {
    if (error) {
      logger.error("Email transporter error:", error);
    } else {
      logger.info("Email service ready");
    }
  });

  return transporter;
}

async function loadTemplates() {
  try {
    const templateDir = path.join(__dirname, "..", "templates", "email");
    const templateFiles = await fs.readdir(templateDir);

    for (const file of templateFiles) {
      if (file.endsWith(".hbs")) {
        const templateName = file.replace(".hbs", "");
        const templatePath = path.join(templateDir, file);
        const templateContent = await fs.readFile(templatePath, "utf-8");

        templates.set(templateName, handlebars.compile(templateContent));
      }
    }

    registerHelpers();
  } catch (error) {
    logger.error("Failed to load email templates:", error);
  }
}

function registerHelpers() {
  handlebars.registerHelper("formatDate", (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  handlebars.registerHelper("formatCurrency", (amount, currency = "SAR") => {
    return new Intl.NumberFormat("en-SA", {
      style: "currency",
      currency,
    }).format(amount);
  });

  handlebars.registerHelper("if_eq", function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });
}

async function sendEmail(options) {
  const {
    to,
    subject,
    html,
    text,
    attachments = [],
    cc,
    bcc,
    replyTo,
    template,
    context = {},
  } = options;

  try {
    let htmlContent = html;
    let textContent = text;

    if (template && templates.has(template)) {
      const compiledTemplate = templates.get(template);
      htmlContent = compiledTemplate(context);

      if (!textContent) {
        textContent = htmlContent.replace(/<[^>]*>?/gm, "");
      }
    }

    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME || "Muta7Market"} <${
        process.env.SMTP_FROM_EMAIL || "otp@muta7markt.com"
      }>`,
      to,
      subject,
      html: htmlContent,
      text: textContent,
      attachments,
      cc,
      bcc,
      replyTo: replyTo || process.env.SMTP_REPLY_TO || "support@muta7markt.com",
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    logger.error("Email sending error:", error);
    throw new ApiError(500, `Failed to send email: ${error.message}`);
  }
}

async function sendNotificationEmail(email, subject, body, data = {}) {
  return sendEmail({
    to: email,
    subject,
    template: "notification",
    context: {
      subject,
      body,
      ...data,
      actionUrl: data.actionUrl || process.env.FRONTEND_URL,
    },
  });
}

async function testEmailConnection() {
  try {
    await transporter.verify();
    return { success: true, message: "Email service is working" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export { initializeEmailService, sendNotificationEmail, testEmailConnection };
