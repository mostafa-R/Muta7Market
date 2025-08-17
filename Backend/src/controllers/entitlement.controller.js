// src/controllers/entitlement.controller.js
import Entitlement from "../models/entitlement.model.js";

/**
 * GET /api/v1/entitlements/check?type=contacts_access
 * GET /api/v1/entitlements/check?type=player_listed&playerProfileId=<id>
 */
export const checkEntitlement = async (req, res) => {
  const userId = req.user?._id;
  if (!userId)
    return res.status(401).json({ success: false, message: "unauthorized" });

  const { type, playerProfileId } = req.query || {};
  if (!["contacts_access", "player_listed"].includes(type)) {
    return res.status(400).json({ success: false, message: "invalid_type" });
  }

  const q = { userId, type, active: true };
  if (type === "player_listed") {
    if (!playerProfileId) {
      return res
        .status(400)
        .json({ success: false, message: "playerProfileId_required" });
    }
    q.playerProfileId = playerProfileId;
  } else {
    q.playerProfileId = null;
  }

  const ent = await Entitlement.findOne(q).lean();
  return res.status(200).json({ success: true, data: { active: !!ent } });
};

/**
 * GET /api/v1/entitlements/me
 * (Your routes file calls this getMyEntitlements)
 */
export const getMyEntitlements = async (req, res) => {
  const userId = req.user?._id;
  if (!userId)
    return res.status(401).json({ success: false, message: "unauthorized" });

  const items = await Entitlement.find({ userId, active: true })
    .sort({ grantedAt: -1 })
    .lean();

  return res.status(200).json({
    success: true,
    data: items.map((e) => ({
      id: String(e._id),
      type: e.type,
      playerProfileId: e.playerProfileId,
      grantedAt: e.grantedAt,
      sourceInvoice: String(e.sourceInvoice),
    })),
  });
};
