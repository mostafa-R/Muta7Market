import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

// Updated for WebMail
const emailEnabled = Boolean(
  // Always enable email since we have hardcoded credentials as fallback
  !["0", "false", "no"].includes(
    String(process.env.EMAIL_ENABLED || "").toLowerCase()
  )
);

export const transporter = emailEnabled
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || "mail.muta7markt.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true, // true for port 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "otp@muta7markt.com",
        pass: process.env.SMTP_PASS || "0080FaHb#",
      },
    })
  : nodemailer.createTransport({ jsonTransport: true });

export const isEmailEnabled = emailEnabled;
