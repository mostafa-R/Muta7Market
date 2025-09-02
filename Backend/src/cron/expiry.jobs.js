import cron from "node-cron";
import Entitlement from "../models/entitlement.model.js";
import Player from "../models/player.model.js";
import User from "../models/user.model.js";

const TZ = "Africa/Cairo";

export async function runExpirySweep(now = new Date()) {
  const n = new Date(now); 
  const users = await User.updateMany(
    { isActive: true, activeExpireAt: { $ne: null, $lte: n } },
    { $set: { isActive: false }, $unset: { activeExpireAt: "" } }
  );

  const playersActive = await Player.updateMany(
    { isActive: true, activeExpireAt: { $ne: null, $lte: n } },
    {
      $set: { isActive: false, isListed: false },
      $unset: { activeExpireAt: "" },
    }
  );

  const playersPromo = await Player.updateMany(
    { "isPromoted.status": true, "isPromoted.endDate": { $ne: null, $lte: n } },
    {
      $set: { "isPromoted.status": false },
      $unset: {
        "isPromoted.endDate": "",
        "isPromoted.startDate": "",
        "isPromoted.type": "",
      },
    }
  );

 
  let entitlements = { modifiedCount: 0 };
  try {
    entitlements = await Entitlement.updateMany(
      { active: true, expiresAt: { $ne: null, $lte: n } },
      { $set: { active: false } }
    );
  } catch {
    /* Entitlement might not be critical — ignore if not present */
  }

  return {
    users: users.modifiedCount,
    playersActive: playersActive.modifiedCount,
    playersPromo: playersPromo.modifiedCount,
    entitlements: entitlements.modifiedCount,
  };
}

export function startExpiryCron() {
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        const res = await runExpirySweep();
      } catch (e) {}
    },
    { timezone: TZ }
  );
}
