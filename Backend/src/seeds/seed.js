import dotenv from 'dotenv'; dotenv.config();
import mongoose from 'mongoose';
import Invoice from '../models/invoice.model.js';
import Entitlement from '../models/entitlement.model.js';
import User from '../models/user.model.js';
import Player from '../models/player.model.js';

const typeMap = { activate_user: 'unlock_contacts', promote_player: 'publish_profile' };

const statusMap = (s) => {
  const v = String(s || '').toLowerCase();
  if (v === 'completed' || v === 'paid') return 'paid';
  if (v === 'pending') return 'pending';
  if (v === 'failed' || v === 'cancelled' || v === 'canceled') return 'failed';
  return 'created';
};

function orderNumber(userId, feature) { return `U-${userId}-${feature}`; }

async function main() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) throw new Error('Missing MONGODB_URI/DATABASE_URL');
  await mongoose.connect(uri);

  await Invoice.syncIndexes();
  await Entitlement.syncIndexes();

  const payments = await Payment.find({ type: { $in: Object.keys(typeMap) } }).lean();
  let createdInv = 0, createdEnt = 0;
  for (const p of payments) {
    const feature = typeMap[p.type];
    const ord = orderNumber(p.user, feature);
    const baseUpdate = {
      user: p.user,
      type: feature,
      amount: p.amount,
      currency: p.currency || 'SAR',
      provider: 'paylink',
      status: statusMap(p.status),
      invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random()*1e6)}`,
    };
    if (p.gatewayResponse?.checkoutId) baseUpdate.providerInvoiceId = p.gatewayResponse.checkoutId;
    if (p.gatewayResponse?.checkoutUrl) baseUpdate.paymentUrl = p.gatewayResponse.checkoutUrl;

    let inv = await Invoice.findOneAndUpdate(
      { orderNumber: ord },
      baseUpdate,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    createdInv++;

    if (inv.status === 'paid') {
      const ent = await Entitlement.findOne({ sourceInvoice: inv._id });
      if (!ent) {
        await Entitlement.create({ user: inv.user, type: inv.type, sourceInvoice: inv._id, active: true });
        if (inv.type === 'unlock_contacts') await User.findByIdAndUpdate(inv.user, { isActive: true });
        if (inv.type === 'publish_profile') { const player = await Player.findOne({ user: inv.user }); if (player) { player.isActive = true; await player.save(); } }
        createdEnt++;
      }
    }
  }

  console.log(`Seed complete. Invoices upserted: ${createdInv}, entitlements created: ${createdEnt}`);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
