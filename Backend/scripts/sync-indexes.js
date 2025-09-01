// scripts/sync-indexes.js
import dotenv from 'dotenv'; dotenv.config();
import mongoose from 'mongoose';
import Invoice from '../src/models/invoice.model.js';
import Entitlement from '../src/models/entitlement.model.js';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL);
  await Invoice.syncIndexes();
  await Entitlement.syncIndexes();
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });