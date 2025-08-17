import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Allow disabling email in dev or when credentials are missing
const emailEnabled = Boolean(
  process.env.SENDGRID_API_KEY &&
  process.env.EMAIL_FROM &&
  !['0', 'false', 'no'].includes(String(process.env.EMAIL_ENABLED || '').toLowerCase())
);

export const transporter = emailEnabled
  ? nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    })
  : // Fallback transport that does not send but succeeds (useful for local/dev)
    nodemailer.createTransport({ jsonTransport: true });

export const isEmailEnabled = emailEnabled;
