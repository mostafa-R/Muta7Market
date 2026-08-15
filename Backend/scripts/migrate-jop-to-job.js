// scripts/migrate-jop-to-job.js
// One-time data migration: rename the legacy "jop" field to "job"
// on players collection and sports.roleTypes[].jop -> roleTypes[].job.
// Idempotent: only documents that still carry "jop" are updated.
import dotenv from 'dotenv'; dotenv.config();
import mongoose from 'mongoose';

async function main() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) throw new Error('Missing MONGODB_URI/DATABASE_URL');
  await mongoose.connect(uri);

  const db = mongoose.connection.db;

  // 1) players: { jop: ... } -> { job: ... }
  const players = db.collection('players');
  const playersWithJop = await players.countDocuments({ jop: { $exists: true } });
  if (playersWithJop > 0) {
    const res = await players.updateMany(
      { jop: { $exists: true } },
      [
        {
          $set: {
            job: { $ifNull: ['$jop', '$job'] },
          },
        },
        { $unset: 'jop' },
      ]
    );
    console.log(`players: migrated ${res.modifiedCount} of ${playersWithJop} docs (jop -> job)`);
  } else {
    console.log('players: no docs carry jop, nothing to migrate');
  }

  // 2) sports: roleTypes[].jop -> roleTypes[].job
  const sports = db.collection('sports');
  const sportsWithJop = await sports.countDocuments({ 'roleTypes.jop': { $exists: true } });
  if (sportsWithJop > 0) {
    const res = await sports.updateMany(
      { 'roleTypes.jop': { $exists: true } },
      [
        {
          $set: {
            roleTypes: {
              $map: {
                input: '$roleTypes',
                as: 'rt',
                in: {
                  $mergeObjects: [
                    '$$rt',
                    {
                      job: { $ifNull: ['$$rt.jop', '$$rt.job'] },
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $set: {
            roleTypes: {
              $map: {
                input: '$roleTypes',
                as: 'rt',
                in: {
                  $arrayToObject: {
                    $filter: {
                      input: { $objectToArray: '$$rt' },
                      as: 'kv',
                      cond: { $ne: ['$$kv.k', 'jop'] },
                    },
                  },
                },
              },
            },
          },
        },
      ]
    );
    console.log(`sports: migrated ${res.modifiedCount} of ${sportsWithJop} docs (roleTypes.jop -> roleTypes.job)`);
  } else {
    console.log('sports: no docs carry roleTypes.jop, nothing to migrate');
  }

  await mongoose.disconnect();
  console.log('Migration finished.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});