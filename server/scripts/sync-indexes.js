import 'dotenv/config';
import mongoose from 'mongoose';
import { config } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { RefreshToken } from '../src/models/RefreshToken.js';
import { PlayerProfile } from '../src/models/PlayerProfile.js';
import { CoachProfile } from '../src/models/CoachProfile.js';
import { ClubProfile } from '../src/models/ClubProfile.js';
import { AgentProfile } from '../src/models/AgentProfile.js';
import { Media } from '../src/models/Media.js';
import { Shortlist } from '../src/models/Shortlist.js';
import { Offer } from '../src/models/Offer.js';
import { Negotiation } from '../src/models/Negotiation.js';
import { Message } from '../src/models/Message.js';
import { KycRequest } from '../src/models/KycRequest.js';
import { Trial } from '../src/models/Trial.js';
import { Rating } from '../src/models/Rating.js';
import { SubscriptionPlan } from '../src/models/SubscriptionPlan.js';
import { Subscription } from '../src/models/Subscription.js';
import { Advertisement } from '../src/models/Advertisement.js';
import { Notification } from '../src/models/Notification.js';
import { ContactRequest } from '../src/models/ContactRequest.js';
import { Sport } from '../src/models/Sport.js';
import { Invoice } from '../src/models/Invoice.js';
import { Setting } from '../src/models/Setting.js';
import { logger } from '../src/utils/logger.js';

const models = [
  User,
  RefreshToken,
  PlayerProfile,
  CoachProfile,
  ClubProfile,
  AgentProfile,
  Media,
  Shortlist,
  Offer,
  Negotiation,
  Message,
  KycRequest,
  Trial,
  Rating,
  SubscriptionPlan,
  Subscription,
  Advertisement,
  Notification,
  ContactRequest,
  Sport,
  Invoice,
  Setting,
];

async function main() {
  for (const model of models) {
    try {
      await model.syncIndexes();
      logger.info(`Synced indexes: ${model.modelName}`);
    } catch (err) {
      logger.error(`Failed syncing indexes for ${model.modelName}:`, err.message);
    }
  }
}

mongoose
  .connect(config.mongodbUri)
  .then(async () => {
    await main();
    await mongoose.disconnect();
    logger.info('Index sync complete ✅');
    process.exit(0);
  })
  .catch((err) => {
    logger.error('Index sync failed:', err);
    process.exit(1);
  });
