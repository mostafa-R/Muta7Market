// scripts/migrate-payments-to-invoices.js
import dotenv from 'dotenv'; dotenv.config();
import mongoose from 'mongoose';
import Payment from '../src/models/payment.model.js';
import Invoice from '../src/models/invoice.model.js';
import Entitlement from '../src/models/entitlement.model.js';
import User from '../src/models/user.model.js';
import Player from '../src/models/player.model.js';

const typeMap = {
  activate_user: 'unlock_contacts',
  promote_player: 'publish_profile',
};

const statusMap = (s) => {
  const v = String(s || '').toLowerCase();
  if (v === 'completed' || v === 'paid') return 'paid';
  if (v === 'pending') return 'pending';
  if (v === 'failed' || v === 'cancelled' || v === 'canceled') return 'failed';
  return 'created';
};

function orderNumber(userId, feature) {
  return `U-${userId}-${feature}`;
}

async function main() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) throw new Error('Missing MONGODB_URI/DATABASE_URL');
  await mongoose.connect(uri);

  // Ensure indexes exist
  await Invoice.syncIndexes();
  await Entitlement.syncIndexes();

  // Only migrate known types
  const cursor = Payment.find({
    type: { $in: Object.keys(typeMap) }
  }).cursor();

  let migrated = 0;
  for await (const p of cursor) {
    const feature = typeMap[p.type];
    const ord = orderNumber(p.user, feature);

    // Upsert invoice by orderNumber (idempotent)
    const inv = await Invoice.findOneAndUpdate(
      { orderNumber: ord },
      {
        user: p.user,
        type: feature,
        amount: p.amount,
        currency: p.currency || 'SAR',
        provider: 'paylink',
        providerInvoiceId: p.gatewayResponse?.checkoutId || null,
        paymentUrl: p.gatewayResponse?.checkoutUrl || null,
        status: statusMap(p.status),
        invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random()*1e6)}`,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // If paid, create entitlement idempotently and apply side-effects
    if (inv.status === 'paid') {
      const exists = await Entitlement.findOne({ sourceInvoice: inv._id });
      if (!exists) {
        await Entitlement.create({
          user: inv.user,
          type: inv.type,
          sourceInvoice: inv._id,
          active: true,
        });
        if (inv.type === 'unlock_contacts') {
          await User.findByIdAndUpdate(inv.user, { isActive: true });
        }
        if (inv.type === 'publish_profile') {
          const player = await Player.findOne({ user: inv.user });
          if (player) {
            player.isActive = true;
            await player.save();
          }
        }
      }
    }
    migrated += 1;
  }

  console.log(`Migration done. Processed: ${migrated}`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });