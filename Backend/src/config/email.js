import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

export const isEmailEnabled = !["0", "false", "no"].includes(
  String(process.env.EMAIL_ENABLED || "").toLowerCase()
);

export const transporter = isEmailEnabled
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  : nodemailer.createTransport({ jsonTransport: true });

export async function sendEmail(to, subject, text, html) {
  if (!isEmailEnabled) {
    console.log("📨 Email disabled, mock email:", { to, subject, text });
    return { success: true, mock: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Muta7markt" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return { success: true, info };
  } catch (err) {
    console.error("❌ Error sending email:", err);
    return { success: false, error: err };
  }
}
