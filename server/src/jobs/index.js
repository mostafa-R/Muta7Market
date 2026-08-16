import cron from 'node-cron';
import { Subscription } from '../models/Subscription.js';
import { Offer } from '../models/Offer.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { Advertisement } from '../models/Advertisement.js';
import { Trial } from '../models/Trial.js';
import { Invoice } from '../models/Invoice.js';
import { OFFER_STATUS, SUBSCRIPTION_STATUS, AD_STATUS, TRIAL_STATUS, INVOICE_STATUS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

async function expireSubscriptions() {
  const now = new Date();
  const result = await Subscription.updateMany(
    { status: SUBSCRIPTION_STATUS.ACTIVE, endDate: { $lte: now } },
    { status: SUBSCRIPTION_STATUS.EXPIRED }
  );
  if (result.modifiedCount) logger.info(`Expired ${result.modifiedCount} subscriptions`);
}

async function expireOffers() {
  const now = new Date();
  const result = await Offer.updateMany(
    {
      status: { $in: [OFFER_STATUS.SENT, OFFER_STATUS.VIEWED] },
      expiresAt: { $lte: now },
    },
    { status: OFFER_STATUS.EXPIRED }
  );
  if (result.modifiedCount) logger.info(`Expired ${result.modifiedCount} offers`);
}

async function expireAdvertisements() {
  const now = new Date();
  const result = await Advertisement.updateMany(
    { status: AD_STATUS.ACTIVE, endsAt: { $lte: now } },
    { status: AD_STATUS.EXPIRED }
  );
  if (result.modifiedCount) logger.info(`Expired ${result.modifiedCount} advertisements`);
}

async function cleanupRefreshTokens() {
  const result = await RefreshToken.deleteMany({ expiresAt: { $lte: new Date() } });
  if (result.deletedCount) logger.info(`Deleted ${result.deletedCount} expired refresh tokens`);
}

async function cleanupStaleTrials() {
  const result = await Trial.updateMany(
    { status: TRIAL_STATUS.SCHEDULED, scheduledAt: { $lte: new Date() } },
    { status: TRIAL_STATUS.COMPLETED }
  );
  if (result.modifiedCount) logger.info(`Auto-completed ${result.modifiedCount} stale trials`);
}

async function expireInvoices() {
  const result = await Invoice.updateMany(
    { status: INVOICE_STATUS.PENDING, expiresAt: { $lte: new Date() } },
    { status: INVOICE_STATUS.EXPIRED, cancelledAt: new Date() }
  );
  if (result.modifiedCount) logger.info(`Expired ${result.modifiedCount} pending invoices`);
}

export function initCronJobs() {
  cron.schedule('0 * * * *', () => {
    expireSubscriptions().catch((e) => logger.error('Cron expireSubscriptions:', e.message));
    expireOffers().catch((e) => logger.error('Cron expireOffers:', e.message));
    expireAdvertisements().catch((e) => logger.error('Cron expireAdvertisements:', e.message));
    cleanupStaleTrials().catch((e) => logger.error('Cron cleanupStaleTrials:', e.message));
    expireInvoices().catch((e) => logger.error('Cron expireInvoices:', e.message));
  });

  cron.schedule('*/30 * * * *', () => {
    cleanupRefreshTokens().catch((e) => logger.error('Cron cleanupRefreshTokens:', e.message));
  });

  logger.info('Cron jobs initialized ✅');
}
