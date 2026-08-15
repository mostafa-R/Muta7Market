import mongoose from "mongoose";
import { STAFF_ROLES } from "../config/constants.js";
import { deleteLocalFile } from "../middleware/localUpload.middleware.js";
import Advertisement from "../models/advertisement.model.js";
import Invoice from "../models/invoice.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { handleMediaUpload } from "../utils/localMediaUtils.js";
import { makeOrderNumber } from "../utils/orderNumber.js";
import { paylinkCreateInvoice } from "../services/paylink.client.js";

const DEFAULT_AD_COST = 100;

async function initiateAdvertisementPayment(invoice, user, req) {
  if (invoice.paymentUrl) return invoice.paymentUrl;

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
    products: [
      { title: "Advertisement", price: invoice.amount, qty: 1, isDigital: true },
    ],
    supportedCardBrands: ["mada", "visaMastercard", "stcpay"],
    callBackUrl,
    cancelUrl,
    note: `userId=${invoice.userId};product=advertisement;relatedAdvertisement=${
      invoice.relatedAdvertisement || ""
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

export const getAllAdvertisements = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    type,
    position,
    isActive,
    search,
  } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
  };

  const filter = {};

  if (type) {
    filter.type = type;
  }

  if (position) {
    filter.position = position;
  }

  if (isActive !== undefined && isActive !== "") {
    filter.isActive = isActive === "true";
  }

  if (search) {
    filter.$or = [
      { "title.ar": { $regex: search, $options: "i" } },
      { "title.en": { $regex: search, $options: "i" } },
      { "advertiser.name": { $regex: search, $options: "i" } },
    ];
  }

  const advertisements = await Advertisement.find(filter)
    .sort(options.sort)
    .skip((options.page - 1) * options.limit)
    .limit(options.limit);

  const totalAdvertisements = await Advertisement.countDocuments(filter);

  const pagination = {
    totalDocs: totalAdvertisements,
    totalPages: Math.ceil(totalAdvertisements / options.limit),
    currentPage: options.page,
    hasNextPage: options.page < Math.ceil(totalAdvertisements / options.limit),
    hasPrevPage: options.page > 1,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { advertisements, pagination },
        "تم الحصول على قائمة الإعلانات بنجاح"
      )
    );
});

export const getAdvertisementById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف الإعلان غير صالح");
  }

  const advertisement = await Advertisement.findById(id);

  if (!advertisement) {
    throw new ApiError(404, "الإعلان غير موجود");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, advertisement, "تم الحصول على الإعلان بنجاح"));
});

export const createAdvertisement = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    source,
    googleAd,
    type,
    position,
    link,
    displayPeriod,
    isActive,
    priority,
    advertiser,
    targeting,
    trial,
  } = req.body;

  if (!title || !type || !position || !displayPeriod || !advertiser) {
    throw new ApiError(400, "يرجى توفير جميع البيانات المطلوبة");
  }

  let advertisementData = {
    title,
    description,
    type,
    position,
    displayPeriod,
    isActive: isActive !== undefined ? isActive : false,
    priority: priority || 0,
    advertiser,
    pricing: { cost: 0, currency: "SAR" },
    source: source || "internal",
  };

  if (targeting) {
    advertisementData.targeting = {
      countries: targeting.countries || [],
      cities: targeting.cities || [],
      sports: targeting.sports || [],
    };
  }

  if (trial) {
    advertisementData.trial = {
      isTrial: Boolean(trial.isTrial),
      academyName: trial.academyName || null,
      registrationLink: trial.registrationLink || null,
      ageGroups: trial.ageGroups || [],
      startDate: trial.startDate || null,
      endDate: trial.endDate || null,
    };
  }

  if (advertisementData.source === "google") {
    if (!googleAd || !googleAd.adSlotId) {
      throw new ApiError(
        400,
        "يرجى توفير معرف الوحدة الإعلانية لإعلانات Google"
      );
    }
    advertisementData.googleAd = {
      adSlotId: googleAd.adSlotId,
      adFormat: googleAd.adFormat || "auto",
    };
    advertisementData.media = {
      desktop: { url: "", publicId: "", width: 0, height: 0 },
    };
    advertisementData.link = {};
  } else {
    if (!req.files || !req.files.desktop) {
      throw new ApiError(400, "يرجى تحميل صورة الإعلان للنسخة المكتبية");
    }

    const desktopImageUploadResult = await handleMediaUpload(
      req.files.desktop[0],
      req,
      "image"
    );

    if (!desktopImageUploadResult.url) {
      throw new ApiError(500, "فشل في تحميل صورة الإعلان للنسخة المكتبية");
    }

    let mobileImageUploadResult = null;

    if (req.files.mobile && req.files.mobile[0]) {
      mobileImageUploadResult = await handleMediaUpload(
        req.files.mobile[0],
        req,
        "image"
      );

      if (!mobileImageUploadResult.url) {
        throw new ApiError(500, "فشل في تحميل صورة الإعلان للنسخة المحمولة");
      }
    }

    advertisementData.media = {
      desktop: {
        url: desktopImageUploadResult.url,
        publicId: desktopImageUploadResult.publicId,
        width: desktopImageUploadResult.width || 0,
        height: desktopImageUploadResult.height || 0,
      },
      mobile: mobileImageUploadResult
        ? {
            url: mobileImageUploadResult.url,
            publicId: mobileImageUploadResult.publicId,
            width: mobileImageUploadResult.width || 0,
            height: mobileImageUploadResult.height || 0,
          }
        : undefined,
    };
    advertisementData.link = link;
  }

  const newAdvertisement = await Advertisement.create(advertisementData);

  const isStaff = STAFF_ROLES.includes(req.user.role);
  if (isStaff && req.body.paid === false) {
    return res
      .status(201)
      .json(new ApiResponse(201, newAdvertisement, "تم إنشاء الإعلان بنجاح"));
  }

  const advertiserUser = String(advertiser?.email || "").toLowerCase();
  const advertiserOwner = advertiser?.userId || req.user._id;

  const cost = Math.max(
    1,
    Number(req.body.pricing?.cost || newAdvertisement.pricing?.cost || DEFAULT_AD_COST)
  );
  const durationDays = Math.max(
    1,
    Number(
      req.body.displayPeriod?.days ||
        newAdvertisement.displayPeriod?.days ||
        30
    )
  );

  const orderNo = makeOrderNumber("advertisement", String(advertiserOwner));
  const invoice = await Invoice.create({
    orderNumber: orderNo,
    invoiceNumber: orderNo,
    userId: advertiserOwner,
    product: "advertisement",
    targetType: null,
    playerProfileId: null,
    durationDays,
    featureType: null,
    amount: cost,
    currency: String(req.body.pricing?.currency || "SAR"),
    status: "pending",
    relatedAdvertisement: newAdvertisement._id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const paymentUrl = await initiateAdvertisementPayment(
    invoice,
    { ...req.user, email: advertiserUser || req.user.email },
    req
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        advertisement: newAdvertisement,
        invoiceId: String(invoice._id),
        paymentUrl,
      },
      "تم إنشاء الإعلان، يرجى إتمام الدفع لتفعيله"
    )
  );
});

export const updateAdvertisement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    source,
    googleAd,
    type,
    position,
    link,
    displayPeriod,
    isActive,
    priority,
    advertiser,
    pricing,
    targeting,
    trial,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف الإعلان غير صالح");
  }

  const advertisement = await Advertisement.findById(id);

  if (!advertisement) {
    throw new ApiError(404, "الإعلان غير موجود");
  }

  if (title) {
    if (title.ar) advertisement.title.ar = title.ar;
    if (title.en) advertisement.title.en = title.en;
  }

  if (description) {
    if (description.ar) advertisement.description.ar = description.ar;
    if (description.en) advertisement.description.en = description.en;
  }

  if (type) {
    advertisement.type = type;
  }

  if (position) {
    advertisement.position = position;
  }

  if (link) {
    advertisement.link = {
      ...advertisement.link,
      ...link,
    };
  }

  if (displayPeriod) {
    if (displayPeriod.startDate)
      advertisement.displayPeriod.startDate = displayPeriod.startDate;
    if (displayPeriod.endDate)
      advertisement.displayPeriod.endDate = displayPeriod.endDate;
  }

  if (isActive !== undefined) {
    advertisement.isActive = isActive;
  }

  if (priority !== undefined) {
    advertisement.priority = priority;
  }

  if (advertiser) {
    advertisement.advertiser = {
      ...advertisement.advertiser,
      ...advertiser,
    };
  }

  if (pricing) {
    advertisement.pricing = {
      ...advertisement.pricing,
      ...pricing,
    };
  }

  if (source) {
    advertisement.source = source;
  }

  if (googleAd) {
    advertisement.googleAd = {
      ...advertisement.googleAd,
      ...googleAd,
    };
  }

  if (targeting) {
    advertisement.targeting = {
      ...(advertisement.targeting || {}),
      countries: targeting.countries ?? advertisement.targeting?.countries ?? [],
      cities: targeting.cities ?? advertisement.targeting?.cities ?? [],
      sports: targeting.sports ?? advertisement.targeting?.sports ?? [],
    };
  }

  if (trial) {
    advertisement.trial = {
      ...(advertisement.trial || {}),
      isTrial: trial.isTrial ?? advertisement.trial?.isTrial ?? false,
      academyName: trial.academyName ?? advertisement.trial?.academyName ?? null,
      registrationLink:
        trial.registrationLink ?? advertisement.trial?.registrationLink ?? null,
      ageGroups: trial.ageGroups ?? advertisement.trial?.ageGroups ?? [],
      startDate: trial.startDate ?? advertisement.trial?.startDate ?? null,
      endDate: trial.endDate ?? advertisement.trial?.endDate ?? null,
    };
  }

  await advertisement.save();

  return res
    .status(200)
    .json(new ApiResponse(200, advertisement, "تم تحديث الإعلان بنجاح"));
});

export const updateAdvertisementMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف الإعلان غير صالح");
  }

  const advertisement = await Advertisement.findById(id);

  if (!advertisement) {
    throw new ApiError(404, "الإعلان غير موجود");
  }

  if (req.files && req.files.desktop && req.files.desktop[0]) {
    if (advertisement.media.desktop && advertisement.media.desktop.publicId) {
      await deleteLocalFile(advertisement.media.desktop.publicId);
    }

    const desktopImageUploadResult = await handleMediaUpload(
      req.files.desktop[0],
      req,
      "image"
    );

    if (!desktopImageUploadResult.url) {
      throw new ApiError(500, "فشل في تحميل صورة الإعلان للنسخة المكتبية");
    }

    advertisement.media.desktop = {
      url: desktopImageUploadResult.url,
      publicId: desktopImageUploadResult.publicId,
      width: desktopImageUploadResult.width || 0,
      height: desktopImageUploadResult.height || 0,
    };
  }

  if (req.files && req.files.mobile && req.files.mobile[0]) {
    if (advertisement.media.mobile && advertisement.media.mobile.publicId) {
      await deleteLocalFile(advertisement.media.mobile.publicId);
    }

    const mobileImageUploadResult = await handleMediaUpload(
      req.files.mobile[0],
      req,
      "image"
    );

    if (!mobileImageUploadResult.url) {
      throw new ApiError(500, "فشل في تحميل صورة الإعلان للنسخة المحمولة");
    }

    advertisement.media.mobile = {
      url: mobileImageUploadResult.url,
      publicId: mobileImageUploadResult.publicId,
      width: mobileImageUploadResult.width || 0,
      height: mobileImageUploadResult.height || 0,
    };
  }

  await advertisement.save();

  return res
    .status(200)
    .json(new ApiResponse(200, advertisement, "تم تحديث صور الإعلان بنجاح"));
});

export const deleteAdvertisement = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف الإعلان غير صالح");
  }

  const advertisement = await Advertisement.findById(id);

  if (!advertisement) {
    throw new ApiError(404, "الإعلان غير موجود");
  }

  if (advertisement.media.desktop && advertisement.media.desktop.publicId) {
    await deleteLocalFile(advertisement.media.desktop.publicId);
  }

  if (advertisement.media.mobile && advertisement.media.mobile.publicId) {
    await deleteLocalFile(advertisement.media.mobile.publicId);
  }

  await Advertisement.findByIdAndDelete(id);

  return res.status(200).json(new ApiResponse(200, {}, "تم حذف الإعلان بنجاح"));
});

export const registerAdvertisementClick = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "معرف الإعلان غير صالح");
  }

  const advertisement = await Advertisement.findById(id);

  if (!advertisement) {
    throw new ApiError(404, "الإعلان غير موجود");
  }

  await advertisement.registerClick();

  if (advertisement.link && advertisement.link.url) {
    let url = advertisement.link.url;
    if (!/^https/i.test(url) && !/^http/i.test(url)) {
      url = `https://${url}`;
    }
    return res.redirect(302, url);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "تم تسجيل النقرة بنجاح، ولكن لا يوجد رابط.")
    );
});

export const getActiveAdvertisementsByPosition = asyncHandler(
  async (req, res) => {
    const { position } = req.params;
    const {
      limit = 5,
      source = "internal",
      country,
      city,
      sport,
      trial,
    } = req.query;

    const advertisements = await Advertisement.getActiveAds(
      position,
      parseInt(limit, 10),
      source,
      {
        country,
        city,
        sport,
        trialOnly: trial,
      }
    );

    if (source === "internal") {
      for (const ad of advertisements) {
        await ad.registerView();
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          advertisements,
          "تم الحصول على الإعلانات النشطة بنجاح"
        )
      );
  }
);
