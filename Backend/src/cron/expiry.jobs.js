import cron from "node-cron";
import Entitlement from "../models/entitlement.model.js";
import Player from "../models/player.model.js";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";
import logger from "../utils/logger.js";

const TZ = "Africa/Cairo";

let running = false;

async function runExpirySweep(now = new Date()) {
  if (running) {
    logger.warn("[expiry-sweep] previous run still in progress, skipping");
    return { skipped: true };
  }

  running = true;
  try {
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
      {
        "isPromoted.status": true,
        "isPromoted.endDate": { $ne: null, $lte: n },
      },
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
        { $set: { active: false, revokedAt: n } }
      );
    } catch (err) {
      logger.error("[expiry-sweep] entitlement sweep failed", err);
    }

    const subscriptions = await Subscription.updateMany(
      { status: "active", endDate: { $ne: null, $lte: n } },
      { $set: { status: "expired", autoRenew: false } }
    );

    const playersPro = await Player.updateMany(
      { isPro: true, proExpiresAt: { $ne: null, $lte: n } },
      {
        $set: { isPro: false },
        $unset: { proExpiresAt: "", proSince: "" },
      }
    );

    const result = {
      users: users.modifiedCount,
      playersActive: playersActive.modifiedCount,
      playersPromo: playersPromo.modifiedCount,
      playersPro: playersPro.modifiedCount,
      entitlements: entitlements.modifiedCount,
      subscriptions: subscriptions.modifiedCount,
    };

    logger.info("[expiry-sweep] completed", result);
    return result;
  } catch (error) {
    logger.error("[expiry-sweep] failed", error);
    throw error;
  } finally {
    running = false;
  }
}

function startExpiryCron() {
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        await runExpirySweep();
      } catch (e) {
        logger.error("[expiry-sweep] cron tick error", e);
      }
    },
    { timezone: TZ }
  );
}

export function createCronJobs() {
  startExpiryCron();
}
