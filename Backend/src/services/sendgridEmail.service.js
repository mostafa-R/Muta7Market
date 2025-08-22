import { isEmailEnabled, transporter } from "../config/email.js";

export const sendEmail = async (to, subject, text, html = null) => {
  try {
    if (!isEmailEnabled) {
      return { success: true, messageId: "email-disabled" };
    }
    const info = await transporter.sendMail({
      from: {
        name: "Muta7Market",
        address: process.env.EMAIL_FROM,
      },
      to,
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Log and continue without blocking auth flows
    const payload = { message: error.message, to, subject };
    try {
      console.error("Email Error:", payload);
    } catch {}
    return { success: false, error: payload };
  }
};
