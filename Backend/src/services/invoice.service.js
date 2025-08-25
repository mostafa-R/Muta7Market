// src/services/invoice.service.js
import Invoice from "../models/invoice.model.js";
import Entitlement from "../models/entitlement.model.js";
import { makeOrderNumber } from "../utils/orderNumber.js";

const PRICE_CONTACTS = Number(process.env.PRICE_CONTACTS_ACCESS || 55);
const PRICE_LISTING = Number(process.env.PRICE_PLAYER_LISTING || 55);

/**
 * Ensure a single PENDING invoice exists for a product/user (+ optional profile).
 * Skips creation if an active entitlement already exists.
 * Returns the existing or newly created Invoice (or null if already granted).
 */
export async function ensurePendingInvoice({
  userId,
  product,
  playerProfileId = null,
  priceOverride,
}) {
  console.log("[invoice.service][ensurePendingInvoice] start", {
    userId: String(userId),
    product,
    playerProfileId: playerProfileId || null,
    priceOverride: priceOverride ?? null,
  });
  if (!userId) throw new Error("ensurePendingInvoice: userId is required");
  if (!["contacts_access", "player_listing"].includes(product)) {
    throw new Error(`ensurePendingInvoice: invalid product ${product}`);
  }
  // If already granted (paid before), don't create a new invoice
  const entQuery =
    product === "contacts_access"
      ? { userId, type: "contacts_access", playerProfileId: null, active: true }
      : { userId, type: "player_listed", playerProfileId, active: true };

  const alreadyGranted = await Entitlement.findOne(entQuery).lean();
  if (alreadyGranted) {
    console.log("[invoice] skip (entitlement active)", {
      userId: String(userId),
      product,
      playerProfileId,
    });
    return null;
  }

  // Reuse an existing pending invoice for the same purpose
  const existing = await Invoice.findOne({
    userId,
    product,
    playerProfileId: playerProfileId ?? null,
    status: "pending",
  });
  if (existing) {
    console.log("[invoice] reuse pending", {
      id: String(existing._id),
      product,
      userId: String(userId),
    });
    return existing;
  }

  const amount = product === "contacts_access" ? PRICE_CONTACTS : PRICE_LISTING;

  const invoice = await Invoice.create({
    orderNumber: makeOrderNumber(product, String(userId)),
    userId,
    product,
    amount: priceOverride ?? amount,
    currency: "SAR",
    status: "pending",
    playerProfileId: playerProfileId ?? null,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  console.log(
    "[invoice.service][ensurePendingInvoice] created new pending invoice",
    {
      id: String(invoice._id),
      orderNumber: invoice.orderNumber,
      amount: invoice.amount,
    }
  );

  return invoice;
}
