import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

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
  : 
    nodemailer.createTransport({ jsonTransport: true });

export const isEmailEnabled = emailEnabled;
