import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { translate } from '../i18n/index.js';
import { logger } from '../utils/logger.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (config.smtp.host && config.smtp.user) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }
  return transporter;
}

function wrapLayout(lang, title, contentHtml) {
  const t = (k, p = {}) => translate(lang, k, p);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  return `
  <div dir="${dir}" style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:32px 12px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#0f172a;color:#ffffff;padding:20px 28px;text-align:${dir === 'rtl' ? 'right' : 'left'};">
        <span style="font-size:20px;font-weight:700;">Muta7 <span style="color:#22c55e;">Market</span></span>
      </div>
      <div style="padding:28px;">
        <h2 style="color:#0f172a;margin:0 0 12px;">${title}</h2>
        ${contentHtml}
      </div>
      <div style="padding:16px 28px;background:#f8fafc;color:#64748b;font-size:12px;text-align:center;border-top:1px solid #e5e7eb;">
        ${t('email.footer')} · © ${new Date().getFullYear()} Muta7 Market — ${t('email.rights')}
      </div>
    </div>
  </div>`;
}

function actionButton(lang, url, labelKey) {
  const t = (k, p = {}) => translate(lang, k, p);
  return `
  <div style="margin:24px 0;text-align:center;">
    <a href="${url}" style="display:inline-block;background:#22c55e;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
      ${t(labelKey)}
    </a>
  </div>
  <p style="color:#64748b;font-size:13px;">${t('email.verifyAlt')}</p>
  <p style="word-break:break-all;background:#f1f5f9;padding:10px;border-radius:6px;font-size:12px;color:#334155;">${url}</p>`;
}

export async function sendEmail({ to, lang = 'en', subject, html }) {
  const tr = getTransporter();
  if (!tr) {
    logger.info(`[MAIL:DEV] to=${to} subject=${subject}`);
    logger.debug(html);
    return { dev: true };
  }
  try {
    const info = await tr.sendMail({ from: config.smtp.from, to, subject, html });
    logger.info(`Email sent to ${to}: ${subject} (${info.messageId})`);
    return info;
  } catch (err) {
    logger.error(`Failed sending email to ${to}:`, err.message);
    throw err;
  }
}

export async function sendVerificationEmail({ to, lang, name, token }) {
  const t = (k, p = {}) => translate(lang, k, p);
  const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  const html = wrapLayout(
    lang,
    `${t('email.verifyTitle')} 🎉`,
    `
    <p style="color:#334155;font-size:15px;line-height:1.7;">${t('email.verifyBody')}, ${name || ''}</p>
    ${actionButton(lang, url, 'email.verifyButton')}
    `
  );
  return sendEmail({ to, lang, subject: t('email.verifySubject'), html });
}

export async function sendResetPasswordEmail({ to, lang, token }) {
  const t = (k, p = {}) => translate(lang, k, p);
  const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const html = wrapLayout(
    lang,
    t('email.resetTitle'),
    `
    <p style="color:#334155;font-size:15px;line-height:1.7;">${t('email.resetBody')}</p>
    ${actionButton(lang, url, 'email.resetButton')}
    `
  );
  return sendEmail({ to, lang, subject: t('email.resetSubject'), html });
}

export async function sendOfferEmail({ to, lang, clubName, type }) {
  const t = (k, p = {}) => translate(lang, k, p);
  const typeLabel = type === 'official' ? t('offer.officialSent') : t('offer.interestSent');
  const html = wrapLayout(
    lang,
    t('email.offerTitle', { type: typeLabel }),
    `<p style="color:#334155;font-size:15px;line-height:1.7;">${t('email.offerBody', { club: clubName, type: typeLabel })}</p>`
  );
  return sendEmail({ to, lang, subject: t('email.offerSubject'), html });
}

export async function sendContactEmail({ to, lang, senderName }) {
  const t = (k, p = {}) => translate(lang, k, p);
  const html = wrapLayout(
    lang,
    t('email.contactSubject'),
    `<p style="color:#334155;font-size:15px;line-height:1.7;">${t('email.contactBody', { sender: senderName })}</p>`
  );
  return sendEmail({ to, lang, subject: t('email.contactSubject'), html });
}
