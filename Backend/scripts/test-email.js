import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load environment variables
dotenv.config();

async function main() {

  // Create transporter with WebMail settings
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "mail.muta7markt.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || "otp@muta7markt.com",
      pass: process.env.SMTP_PASS || "0080FaHb#",
    },
    // Optional: Enable for debugging
    // logger: true,
    // debug: true,
  });

  // Verify connection
  try {
    await transporter.verify();
  } catch (error) {
    return;
  }

  // Email test destination
  const testEmail = process.argv[2] || "your-test-email@example.com";

  // Send test email
  try {
    const info = await transporter.sendMail({
      from: `"Muta7Market Test" <${
        process.env.SMTP_FROM_EMAIL || "otp@muta7markt.com"
      }>`,
      to: testEmail,
      subject: "Test Email from Muta7Market",
      text: "This is a test email to verify the email configuration is working correctly.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #4a6cf7;">Muta7Market Email Test</h2>
          <p>This is a test email to verify the email configuration is working correctly.</p>
          <p>If you're seeing this, the WebMail SMTP configuration is working!</p>
          <p>Configuration details:</p>
          <ul>
            <li>Host: ${process.env.SMTP_HOST || "mail.muta7markt.com"}</li>
            <li>Port: ${process.env.SMTP_PORT || "465"}</li>
            <li>Username: ${process.env.SMTP_USER || "otp@muta7markt.com"}</li>
          </ul>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated test email. Please do not reply.</p>
        </div>
      `,
    });

  } catch (error) {
    console.error("❌ Failed to send test email:", error.message);
  }
}

main().catch(console.error);
