import { OFFER_STATUS, STAFF_ROLES } from "../config/constants.js";
import Invoice from "../models/invoice.model.js";
import Listing from "../models/listing.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildSortQuery, paginate, escapeRegex } from "../utils/helpers.js";
import { deleteMediaFromLocal } from "../utils/localMediaUtils.js";
import { makeOrderNumber } from "../utils/orderNumber.js";
import { getPricingSettings } from "../utils/pricingUtils.js";
import { paylinkCreateInvoice, paylinkGetInvoice } from "../services/paylink.client.js";
import { applyPaidEffects } from "./payments.controller.js";
import { sendInternalNotification } from "./notification.controller.js";


const OFFER_ALLOWED_FIELDS = [
  "title",
  "description",
  "category",
  "targetProfile",
  "offerDetails",
  "media",
  "contactInfo",
  "pricing",
  "seo",
  "expiryDate",
];

const updateExpiredListings = async () => {
  await Listing.updateMany(
    {
      expiryDate: { $lt: new Date() },
      status: OFFER_STATUS.ACTIVE,
    },
    { status: OFFER_STATUS.EXPIRED }
  );
};

const sanitizeListingForViewer = (offer, viewer, isStaff, unlockCost) => {
  const data = offer?.toJSON ? offer.toJSON() : { ...offer };
  if (!data) return data;
  if (!isStaff) {
    if (data.user && typeof data.user === "object") {
      delete data.user.email;
      delete data.user.phone;
    }
    const userId = String(viewer?._id || viewer?.id || "");
    const ownerId = data.user?._id
      ? String(data.user._id)
      : String(data.user || "");
    const isOwner = userId && ownerId === userId;
    if (!isOwner && data.contactInfo?.isHidden) {
      data.contactInfo = { isHidden: true, unlockCost: unlockCost ?? null };
    }
  }
  return data;
};

async function createListingInvoice(
  userId,
  offerId,
  product,
  amount,
  durationDays,
  featureType
) {
  const orderNo = makeOrderNumber(product, String(userId));
  return Invoice.create({
    orderNumber: orderNo,
    invoiceNumber: orderNo,
    userId,
    product,
    targetType: null,
    playerProfileId: null,
    durationDays: durationDays || 1,
    featureType: featureType || null,
    amount,
    currency: "SAR",
    status: "pending",
    relatedOffer: offerId,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
}

async function initiateInvoicePayment(invoice, user, req) {
  if (invoice.paymentUrl) {
    return invoice.paymentUrl;
  }

  const title = (() => {
    if (invoice.product === "add_offer") return "Add offer";
    if (invoice.product === "promote_offer")
      return `Promote offer (${invoice.durationDays || 15} days)`;
    if (invoice.product === "unlock_contact") return "Unlock contact";
    return invoice.product;
  })();

  const originFallback =
    req.get && req.get("origin") ? req.get("origin") : null;
  const frontUrl =
    process.env.FRONTEND_URL ||
    originFallback ||
    process.env.APP_URL ||
    "http://localhost:3000";
  const callBackUrl = `${frontUrl.replace(
    /\/$/,
    ""
  )}/profile?tab=payments&invoiceId=${String(invoice._id)}`;
  const cancelUrl = `${frontUrl.replace(/\/$/, "")}/profile?tab=payments`;

  const payload = {
    orderNumber: invoice.orderNumber,
    amount: invoice.amount,
    currency: invoice.currency || "SAR",
    clientName: user?.name || user?.email,
    clientEmail: user?.email,
    clientMobile: user?.phone || "0500000000",
    products: [{ title, price: invoice.amount, qty: 1, isDigital: true }],
    supportedCardBrands: ["mada", "visaMastercard", "stcpay"],
    callBackUrl,
    cancelUrl,
    note: `userId=${invoice.userId};product=${invoice.product};relatedOffer=${
      invoice.relatedOffer || ""
    };durationDays=${invoice.durationDays || ""};feature=${
      invoice.featureType || ""
    }`,
  };

  const data = await paylinkCreateInvoice(payload);
  invoice.provider = "paylink";
  invoice.providerInvoiceId = data.transactionNo || data.invoiceId || undefined;
  invoice.paymentUrl = data.url || null;
  if (!invoice.invoiceNumber) invoice.invoiceNumber = invoice.orderNumber;
  await invoice.save();
  return invoice.paymentUrl;
}

export const createListing = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const requirePayment = !STAFF_ROLES.includes(req.user.role);

  if (requirePayment && !req.user.verifiedBadge) {
    throw new ApiError(
      403,
      "Only verified clubs can create listings. Please complete KYC verification first"
    );
  }

  const data = {};
  for (const key of OFFER_ALLOWED_FIELDS) {
    if (key in req.body) data[key] = req.body[key];
  }

  if (requirePayment) {
    const pricing = await getPricingSettings();
    const amount = data.pricing?.addOfferCost || pricing.ADD_OFFER;

    const offer = await Listing.create({
      user: userId,
      ...data,
      payment: { isPaid: false },
      status: OFFER_STATUS.PENDING,
    });

    const invoice = await createListingInvoice(
      userId,
      offer._id,
      "add_offer",
      amount,
      1,
      null
    );
    const paymentUrl = await initiateInvoicePayment(invoice, req.user, req);

    await sendInternalNotification(
      userId,
      "Payment Required",
      "Please complete payment to activate your offer",
      { offerId: offer._id, invoiceId: String(invoice._id) }
    );

    res.status(201).json(
      new ApiResponse(
        201,
        {
          offer,
          paymentUrl,
          invoiceId: String(invoice._id),
        },
        "Please complete payment to activate your offer"
      )
    );
  } else {
    const offer = await Listing.create({
      user: userId,
      ...data,
      payment: { isPaid: true, paidAt: new Date() },
      status: OFFER_STATUS.ACTIVE,
    });

    await sendInternalNotification(
      userId,
      "Listing Created Successfully",
      `Your offer "${offer.title?.en || offer.title}" has been created and is now live!`,
      { offerId: offer._id }
    );

    res
      .status(201)
      .json(new ApiResponse(201, offer, "Listing created successfully"));
  }
});

export const getAllListings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy,
    search,
    category,
    status,
    isPromoted,
    nationality,
    minSalary,
    maxSalary,
    location,
  } = req.query;

  const isStaff = STAFF_ROLES.includes(req.user?.role);

  const query = {
    isActive: true,
    "payment.isPaid": true,
  };

  if (!status) {
    query.status = { $ne: OFFER_STATUS.EXPIRED };
  }

  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { "title.en": { $regex: safeSearch, $options: "i" } },
      { "title.ar": { $regex: safeSearch, $options: "i" } },
      { "description.en": { $regex: safeSearch, $options: "i" } },
      { "description.ar": { $regex: safeSearch, $options: "i" } },
    ];
  }

  if (category) {
    query.category = category;
  }
  if (status) {
    query.status = status;
  }
  if (nationality) {
    query["targetProfile.nationality"] = nationality;
  }
  if (location) {
    query["offerDetails.location"] = {
      $regex: escapeRegex(location),
      $options: "i",
    };
  }

  if (minSalary || maxSalary) {
    if (minSalary) {
      query["targetProfile.salaryRange.min"] = { $gte: minSalary };
    }
    if (maxSalary) {
      query["targetProfile.salaryRange.max"] = { $lte: maxSalary };
    }
  }

  if (isPromoted !== undefined) {
    if (isPromoted === "true") {
      query["promotion.isPromoted"] = true;
      query["promotion.endDate"] = { $gt: new Date() };
    } else {
      query["promotion.isPromoted"] = false;
    }
  }

  await updateExpiredListings();

  const { skip, limit: limitNum } = paginate(page, limit);
  let sort = buildSortQuery(sortBy);

  if (!sortBy) {
    sort = {
      "promotion.position": 1,
      "promotion.startDate": -1,
      createdAt: -1,
    };
  }

  const [offers, total] = await Promise.all([
    Listing.find(query)
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .populate("user", "name email")
      .select(isStaff ? "" : "-unlockedBy")
      .lean(),
    Listing.countDocuments(query),
  ]);

  const pricing = await getPricingSettings();
  const sanitized = offers.map((o) =>
    sanitizeListingForViewer(o, req.user, isStaff, pricing.UNLOCK_CONTACT)
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        offers: sanitized,
        pagination: {
          total,
          pages: Math.ceil(total / limitNum),
          page: Math.max(1, parseInt(page) || 1),
          limit: limitNum,
        },
      },
      "Listings fetched successfully"
    )
  );
});

export const getListingById = asyncHandler(async (req, res) => {
  const offerId = req.params.id;
  const userId = req.user?._id;
  const isStaff = STAFF_ROLES.includes(req.user?.role);

  const offer = await Listing.findById(offerId).populate("user", "name email");

  if (
    !offer ||
    (!offer.isActive && (!userId || offer.user.toString() !== userId))
  ) {
    throw new ApiError(404, "Listing not found");
  }

  const isOwner = userId && offer.user.toString() === userId.toString();
  if (!isStaff && !isOwner && offer.status === OFFER_STATUS.EXPIRED) {
    throw new ApiError(404, "Listing not found");
  }

  if (!userId || userId.toString() !== offer.user.toString()) {
    offer.statistics.views += 1;
    await offer.save();
  }

  const hasUnlockedContact =
    userId && offer.hasUserUnlockedContact
      ? offer.hasUserUnlockedContact(userId)
      : false;

  const offerData = offer.toObject();
  if (
    !hasUnlockedContact &&
    offer.contactInfo?.isHidden &&
    (!userId || userId.toString() !== offer.user.toString())
  ) {
    const pricing = await getPricingSettings();
    offerData.contactInfo = {
      isHidden: true,
      unlockCost: offer.pricing?.unlockContactCost || pricing.UNLOCK_CONTACT,
    };
  }

  if (!isStaff && !isOwner && offerData.user && typeof offerData.user === "object") {
    delete offerData.user.email;
    delete offerData.user.phone;
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { offer: offerData, hasUnlockedContact },
        "Listing fetched successfully"
      )
    );
});

export const updateListing = asyncHandler(async (req, res) => {
  const offerId = req.params.id;
  const userId = req.user._id;
  const userRole = req.user.role;

  const offer = await Listing.findById(offerId);

  if (!offer) {
    throw new ApiError(404, "Listing not found");
  }

  if (!STAFF_ROLES.includes(userRole) && offer.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only update your own offers");
  }

  if (!offer.payment.isPaid && !STAFF_ROLES.includes(userRole)) {
    throw new ApiError(400, "Please complete payment before updating offer");
  }

  const updateData = {};
  for (const key of OFFER_ALLOWED_FIELDS) {
    if (key in req.body) updateData[key] = req.body[key];
  }
  Object.assign(offer, updateData);
  offer.updatedAt = new Date();
  await offer.save();

  await sendInternalNotification(
    offer.user,
    "Listing Updated",
    `Your offer "${offer.title?.en || offer.title}" has been updated successfully`,
    { offerId: offer._id }
  );

  res
    .status(200)
    .json(new ApiResponse(200, offer, "Listing updated successfully"));
});

export const deleteListing = asyncHandler(async (req, res) => {
  const offerId = req.params.id;
  const userId = req.user._id;
  const userRole = req.user.role;

  const offer = await Listing.findById(offerId);

  if (!offer) {
    throw new ApiError(404, "Listing not found");
  }

  if (!STAFF_ROLES.includes(userRole) && offer.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own offers");
  }

  if (offer.media?.images) {
    for (const image of offer.media.images) {
      if (image.publicId) {
        await deleteMediaFromLocal(image.publicId, "image");
      }
    }
  }

  if (offer.media?.documents) {
    for (const doc of offer.media.documents) {
      if (doc.publicId) {
        await deleteMediaFromLocal(doc.publicId, "raw");
      }
    }
  }

  offer.isActive = false;
  offer.status = OFFER_STATUS.INACTIVE;
  await offer.save();

  await sendInternalNotification(
    offer.user,
    "Listing Deleted",
    `Your offer "${offer.title?.en || offer.title}" has been deleted`,
    { offerId: offer._id }
  );

  res
    .status(200)
    .json(new ApiResponse(200, null, "Listing deleted successfully"));
});

export const getMyListings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { includeInactive = false, page = 1, limit = 10 } = req.query;

  const query = { user: userId };
  if (!includeInactive || includeInactive === "false") {
    query.isActive = true;
  }

  const { skip } = paginate(page, limit);

  const [offers, total] = await Promise.all([
    Listing.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate("unlockedBy.user", "name email"),
    Listing.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        offers,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
      "Your offers fetched successfully"
    )
  );
});

export const promoteListing = asyncHandler(async (req, res) => {
  const offerId = req.params.id;
  const userId = req.user._id;
  const userRole = req.user.role;
  const { days, type = "featured" } = req.body;

  if (!days || days < 1) {
    throw new ApiError(
      400,
      "Please specify valid number of days for promotion"
    );
  }

  const offer = await Listing.findById(offerId);

  if (!offer) {
    throw new ApiError(404, "Listing not found");
  }

  if (!STAFF_ROLES.includes(userRole) && offer.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only promote your own offers");
  }

  if (!offer.payment.isPaid && !STAFF_ROLES.includes(userRole)) {
    throw new ApiError(400, "Please complete initial payment before promoting");
  }

  if (offer.isCurrentlyPromoted) {
    throw new ApiError(400, "Listing is already promoted");
  }

  const pricing = await getPricingSettings();
  const promotionCost =
    days *
    (offer.pricing?.promotionCost?.perDay || pricing.PROMOTE_OFFER_PER_DAY);

  const invoice = await createListingInvoice(
    userId,
    offer._id,
    "promote_offer",
    promotionCost,
    days,
    type
  );
  const paymentUrl = await initiateInvoicePayment(invoice, req.user, req);

  await sendInternalNotification(
    userId,
    "Promotion Payment Required",
    `Complete payment to promote your offer for ${days} days`,
    { offerId: offer._id, invoiceId: String(invoice._id), promotionCost }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { paymentUrl, promotionCost, invoiceId: String(invoice._id) },
        "Please complete payment to promote your offer"
      )
    );
});

export const unlockContact = asyncHandler(async (req, res) => {
  const offerId = req.params.id;
  const userId = req.user._id;

  const offer = await Listing.findById(offerId);

  if (!offer) {
    throw new ApiError(404, "Listing not found");
  }

  if (offer.user.toString() === userId.toString()) {
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { contactInfo: offer.contactInfo },
          "You own this offer"
        )
      );
    return;
  }

  if (offer.hasUserUnlockedContact && offer.hasUserUnlockedContact(userId)) {
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { contactInfo: offer.contactInfo },
          "Contact already unlocked"
        )
      );
    return;
  }

  const pricing = await getPricingSettings();
  const unlockCost = offer.pricing?.unlockContactCost || pricing.UNLOCK_CONTACT;

  const invoice = await createListingInvoice(
    userId,
    offer._id,
    "unlock_contact",
    unlockCost,
    1,
    null
  );
  const paymentUrl = await initiateInvoicePayment(invoice, req.user, req);

  await sendInternalNotification(
    userId,
    "Contact Unlock Payment",
    "Complete payment to unlock contact information for this offer",
    { offerId: offer._id, invoiceId: String(invoice._id), unlockCost }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { paymentUrl, unlockCost, invoiceId: String(invoice._id) },
        "Please complete payment to unlock contact information"
      )
    );
});

export const getListingStatistics = asyncHandler(async (req, res) => {
  const offerId = req.params.id;
  const userId = req.user._id;

  const offer = await Listing.findById(offerId).populate(
    "unlockedBy.user",
    "name email phone"
  );

  if (!offer) {
    throw new ApiError(404, "Listing not found");
  }

  if (offer.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only view statistics for your own offers");
  }

  const pricing = await getPricingSettings();
  const unlockCost = offer.pricing?.unlockContactCost || pricing.UNLOCK_CONTACT;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        statistics: offer.statistics,
        unlockedBy: offer.unlockedBy || [],
        totalRevenue: (offer.unlockedBy?.length || 0) * unlockCost,
      },
      "Listing statistics fetched successfully"
    )
  );
});

export const confirmListingPayment = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;
  const userId = req.user._id;
  const isStaff = STAFF_ROLES.includes(req.user.role);

  const q = isStaff
    ? { _id: invoiceId }
    : { _id: invoiceId, $or: [{ userId }, { user: userId }] };

  const invoice = await Invoice.findOne(q);
  if (!invoice) throw new ApiError(404, "Invoice not found");

  let verify = null;
  if (invoice.providerInvoiceId) {
    try {
      verify = await paylinkGetInvoice(String(invoice.providerInvoiceId));
    } catch (e) {
      verify = null;
    }
  }

  const paid = verify
    ? String(verify.orderStatus || "").toLowerCase() === "paid"
    : false;

  if (paid && invoice.status !== "paid") {
    await applyPaidEffects(invoice, verify);
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        invoiceId: String(invoice._id),
        orderNumber: invoice.orderNumber,
        status: invoice.status,
        paid,
      },
      "Payment status confirmed"
    )
  );
});

export const searchListings = asyncHandler(async (req, res) => {
  const {
    q: search,
    category,
    location,
    minSalary,
    maxSalary,
    nationality,
    page = 1,
    limit = 10,
    sortBy = "date",
  } = req.query;

  if (!search) {
    throw new ApiError(400, "Search query is required");
  }

  const query = {
    isActive: true,
    "payment.isPaid": true,
    $or: [
      { "title.en": { $regex: escapeRegex(search), $options: "i" } },
      { "title.ar": { $regex: escapeRegex(search), $options: "i" } },
      { "description.en": { $regex: escapeRegex(search), $options: "i" } },
      { "description.ar": { $regex: escapeRegex(search), $options: "i" } },
    ],
  };

  if (category) {
    query.category = category;
  }
  if (location) {
    query["offerDetails.location"] = { $regex: escapeRegex(location), $options: "i" };
  }
  if (nationality) {
    query["targetProfile.nationality"] = nationality;
  }

  if (minSalary || maxSalary) {
    if (minSalary) {
      query["targetProfile.salaryRange.min"] = { $gte: parseInt(minSalary) };
    }
    if (maxSalary) {
      query["targetProfile.salaryRange.max"] = { $lte: parseInt(maxSalary) };
    }
  }

  const { skip, limit: limitNum } = paginate(page, limit);

  let sort = { createdAt: -1 };
  if (sortBy === "salary") {
    sort = { "targetProfile.salaryRange.max": -1 };
  }
  if (sortBy === "popularity") {
    sort = { "statistics.views": -1 };
  }

  const [offers, total] = await Promise.all([
    Listing.find(query)
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .populate("user", "name email")
      .select("-unlockedBy")
      .lean(),
    Listing.countDocuments(query),
  ]);

  const pricing = await getPricingSettings();
  const sanitized = offers.map((o) =>
    sanitizeListingForViewer(
      o,
      req.user,
      STAFF_ROLES.includes(req.user?.role),
      pricing.UNLOCK_CONTACT
    )
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        offers: sanitized,
        searchQuery: search,
        pagination: {
          total,
          pages: Math.ceil(total / limitNum),
          page: Math.max(1, parseInt(page) || 1),
          limit: limitNum,
        },
      },
      `Found ${total} offers matching your search`
    )
  );
});

export const getFeaturedListings = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 6));

  const query = {
    isActive: true,
    "payment.isPaid": true,
    "promotion.isPromoted": true,
    "promotion.endDate": { $gt: new Date() },
  };

  const offers = await Listing.find(query)
    .sort({ "promotion.position": 1, "promotion.startDate": -1 })
    .limit(limitNum)
    .populate("user", "name email")
    .select("-unlockedBy")
    .lean();

  const pricing = await getPricingSettings();
  const sanitized = offers.map((o) =>
    sanitizeListingForViewer(
      o,
      req.user,
      STAFF_ROLES.includes(req.user?.role),
      pricing.UNLOCK_CONTACT
    )
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, sanitized, "Featured offers fetched successfully")
    );
});

export const getSimilarListings = asyncHandler(async (req, res) => {
  const offerId = req.params.id;
  const { limit = 5 } = req.query;
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 5));

  const currentListing = await Listing.findById(offerId);
  if (!currentListing) {
    throw new ApiError(404, "Listing not found");
  }

  const query = {
    _id: { $ne: offerId },
    isActive: true,
    "payment.isPaid": true,
    status: { $ne: OFFER_STATUS.EXPIRED },
    $or: [
      { category: currentListing.category },
      { "seo.keywords": { $in: currentListing.seo?.keywords || [] } },
      { "offerDetails.location": currentListing.offerDetails?.location },
    ],
  };

  const similarListings = await Listing.find(query)
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .populate("user", "name email")
    .select("-unlockedBy")
    .lean();

  const pricing = await getPricingSettings();
  const sanitized = similarListings.map((o) =>
    sanitizeListingForViewer(
      o,
      req.user,
      STAFF_ROLES.includes(req.user?.role),
      pricing.UNLOCK_CONTACT
    )
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, sanitized, "Similar offers fetched successfully")
    );
});


