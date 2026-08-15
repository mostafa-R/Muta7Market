import Coach from "../models/coach.model.js";
import User from "../models/user.model.js";
import Invoice from "../models/invoice.model.js";
import { PROFILE_STATUS, PAGINATION, STAFF_ROLES } from "../config/constants.js";
import mongoose from "mongoose";
import { paylinkCreateInvoice } from "../services/paylink.client.js";
import { makeOrderNumber } from "../utils/orderNumber.js";
import { getPricingSettings, computePromotionAmount } from "../utils/pricingUtils.js";
import { search } from "../services/search.service.js";
import { recordProfileChanges } from "../services/profileChange.service.js";
import { escapeRegex } from "../utils/helpers.js";


const isStaff = (role) => STAFF_ROLES.includes(role);

const COACH_CREATE_FIELDS = [
  "name",
  "age",
  "gender",
  "nationality",
  "category",
  "experience",
  "licenses",
  "monthlySalary",
  "annualContract",
  "contractEndDate",
  "contractStatus",
  "media",
  "socialLinks",
  "achievements",
  "contactInfo",
  "seo",
];

async function initiateCoachPromotionPayment(invoice, user, req) {
  if (invoice.paymentUrl) {
    return invoice.paymentUrl;
  }

  const days = Number(invoice.durationDays || 15);
  const tier = invoice.featureType === "premium" ? "premium" : "featured";
  const title = `Coach ${tier} promotion (${days} day${days === 1 ? "" : "s"})`;

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
    note: `userId=${invoice.userId};product=promotion;targetType=coach;profileId=${
      invoice.playerProfileId || ""
    };durationDays=${invoice.durationDays || ""}`,
  };

  const data = await paylinkCreateInvoice(payload);
  invoice.provider = "paylink";
  invoice.providerInvoiceId = data.transactionNo || data.invoiceId || undefined;
  invoice.paymentUrl = data.url || null;
  if (!invoice.invoiceNumber) invoice.invoiceNumber = invoice.orderNumber;
  await invoice.save();
  return invoice.paymentUrl;
}

export const createCoach = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingCoach = await Coach.findOne({ user: userId });
    if (existingCoach) {
      return res.status(400).json({
        success: false,
        message: "Coach profile already exists for this user",
      });
    }

    const coachData = {};
    for (const key of COACH_CREATE_FIELDS) {
      if (key in req.body) coachData[key] = req.body[key];
    }

    const coach = new Coach({ ...coachData, user: userId });
    await coach.save();

    await coach.populate("user", "email name");

    res.status(201).json({
      success: true,
      message: "Coach created successfully",
      data: coach,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating coach",
      error: error.message,
    });
  }
};

export const getAllCoaches = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      category,
      nationality,
      status,
      gender,
      minAge,
      maxAge,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      isPromoted,
      contractStatus,
      experience,
    } = req.query;

    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }
    if (nationality) {
      filter.nationality = nationality;
    }
    if (status) {
      filter.status = status;
    }
    if (gender) {
      filter.gender = gender;
    }
    if (contractStatus) {
      filter.contractStatus = contractStatus;
    }
    if (experience) {
      filter["experience.years"] = { $gte: parseInt(experience) };
    }
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) {
        filter.age.$gte = parseInt(minAge);
      }
      if (maxAge) {
        filter.age.$lte = parseInt(maxAge);
      }
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { "name.en": { $regex: safeSearch, $options: "i" } },
        { "name.ar": { $regex: safeSearch, $options: "i" } },
        { nationality: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (isPromoted === "true") {
      filter["isPromoted.status"] = true;
      filter["isPromoted.endDate"] = { $gt: new Date() };
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(
      PAGINATION.MAX_LIMIT,
      Math.max(1, parseInt(limit) || PAGINATION.DEFAULT_LIMIT)
    );
    const skip = (pageNum - 1) * limitNum;

    if (search) {
      const esResult = await search("coach", {
        q: search,
        filters: {
          category,
          nationality,
          gender,
          status,
          contractStatus,
          experienceMin: experience,
          ageMin: minAge,
          ageMax: maxAge,
          isPromoted: isPromoted === "true" ? true : undefined,
        },
        from: skip,
        size: limitNum,
        sortBy,
      });
      if (esResult) {
        const ids = esResult.ids;
        const coaches = ids.length
          ? await Coach.find({ _id: { $in: ids } })
              .populate("user", "email username")
              .lean()
          : [];
        const rank = new Map(ids.map((id, i) => [String(id), i]));
        coaches.sort(
          (a, b) => (rank.get(String(a._id)) ?? 0) - (rank.get(String(b._id)) ?? 0)
        );
        const total = esResult.total;
        const totalPages = Math.ceil(total / limitNum);
        return res.status(200).json({
          success: true,
          engine: "elasticsearch",
          data: coaches,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems: total,
            itemsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
          },
        });
      }
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const coaches = await Coach.find(filter)
      .populate("user", "email username")
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Coach.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: coaches,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching coaches",
      error: error.message,
    });
  }
};

export const getCoachById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coach ID",
      });
    }

    const coach = await Coach.findById(id).populate("user", "email name");

    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found",
      });
    }

    coach.views += 1;
    await coach.save();

    res.status(200).json({
      success: true,
      data: coach,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching coach",
      error: error.message,
    });
  }
};

export const updateCoach = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coach ID",
      });
    }

    const current = await Coach.findById(id);
    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Coach not found",
      });
    }

    const beforeSnapshot = current.toObject();

    const ownerId = current.user || null;
    const isOwner =
      ownerId &&
      String(ownerId) === String(req.user._id || req.user.id);
    if (!isOwner && !isStaff(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this coach",
      });
    }

    const allowed = [
      "name",
      "age",
      "gender",
      "nationality",
      "category",
      "experience",
      "licenses",
      "monthlySalary",
      "annualContract",
      "contractEndDate",
      "media",
      "socialLinks",
      "achievements",
      "contactInfo",
      "seo",
    ];

    const updateData = {};
    for (const key of allowed) {
      if (key in req.body) updateData[key] = req.body[key];
    }

    const coach = await Coach.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("user", "email name");

    try {
      await recordProfileChanges({
        profileType: "coach",
        before: beforeSnapshot,
        after: coach,
        changedBy: req.user._id || req.user.id,
        changedByRole: req.user.role,
      });
    } catch (recordError) {
      console.error("Failed to record coach profile changes:", recordError.message);
    }

    res.status(200).json({
      success: true,
      message: "Coach updated successfully",
      data: coach,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating coach",
      error: error.message,
    });
  }
};

export const deleteCoach = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coach ID",
      });
    }

    const current = await Coach.findById(id);
    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Coach not found",
      });
    }

    const ownerId = current.user || null;
    const isOwner =
      ownerId && String(ownerId) === String(req.user._id || req.user.id);
    if (!isOwner && !isStaff(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this coach",
      });
    }

    await Coach.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Coach deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting coach",
      error: error.message,
    });
  }
};

export const promoteCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const { days, type = "featured" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coach ID",
      });
    }

    if (!days || days <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid number of days is required",
      });
    }

    const coach = await Coach.findById(id);
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found",
      });
    }

    const ownerId = coach.user || null;
    const isOwner =
      ownerId && String(ownerId) === String(req.user._id || req.user.id);
    if (!isOwner && !isStaff(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to promote this coach",
      });
    }

    if (isStaff(req.user.role)) {
      await coach.promote(days, type === "premium" ? "premium" : "featured");

      return res.status(200).json({
        success: true,
        message: "Coach promoted successfully",
        data: coach,
      });
    }

    const PRICING = await getPricingSettings();
    const tier = type === "premium" ? "premium" : "featured";
    const { amount, durationDays: d } = computePromotionAmount(
      PRICING,
      "coach",
      tier,
      days
    );

    let invoice = await Invoice.findOne({
      userId: req.user._id || req.user.id,
      product: "promotion",
      targetType: "coach",
      playerProfileId: coach._id,
      status: "pending",
    });

    if (invoice) {
      if (!invoice.paymentUrl) {
        invoice.durationDays = d;
        invoice.featureType = tier;
        invoice.amount = amount;
        await invoice.save();
      }
    } else {
      const orderNo = makeOrderNumber(
        "promotion",
        String(req.user._id || req.user.id)
      );
      invoice = await Invoice.create({
        orderNumber: orderNo,
        invoiceNumber: orderNo,
        userId: req.user._id || req.user.id,
        product: "promotion",
        targetType: "coach",
        playerProfileId: coach._id,
        durationDays: d,
        featureType: tier,
        amount,
        currency: "SAR",
        status: "pending",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    const paymentUrl = await initiateCoachPromotionPayment(
      invoice,
      req.user,
      req
    );

    return res.status(201).json({
      success: true,
      message: "Please complete payment to promote this coach",
      data: { coach, paymentUrl, invoiceId: String(invoice._id) },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error promoting coach",
      error: error.message,
    });
  }
};

export const transferCoach = async (req, res) => {
  try {
    const { id } = req.params;
    const { clubName, amount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coach ID",
      });
    }

    if (!clubName) {
      return res.status(400).json({
        success: false,
        message: "Club name is required",
      });
    }

    const coach = await Coach.findById(id);
    if (!coach) {
      return res.status(404).json({
        success: false,
        message: "Coach not found",
      });
    }

    const ownerId = coach.user || null;
    const isOwner =
      ownerId && String(ownerId) === String(req.user._id || req.user.id);
    if (!isOwner && !isStaff(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to transfer this coach",
      });
    }

    await coach.transfer(clubName, amount);

    res.status(200).json({
      success: true,
      message: "Coach transferred successfully",
      data: coach,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error transferring coach",
      error: error.message,
    });
  }
};

export const getCoachesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } =
      req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit) || PAGINATION.DEFAULT_LIMIT));
    const skip = (pageNum - 1) * limitNum;

    const coaches = await Coach.find({
      category,
      isActive: true,
      status: PROFILE_STATUS.AVAILABLE,
    })
      .populate("user", "email username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Coach.countDocuments({
      category,
      isActive: true,
      status: PROFILE_STATUS.AVAILABLE,
    });

    res.status(200).json({
      success: true,
      data: coaches,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching coaches by category",
      error: error.message,
    });
  }
};

export const getPromotedCoaches = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      type,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(PAGINATION.MAX_LIMIT, Math.max(1, parseInt(limit) || PAGINATION.DEFAULT_LIMIT));
    const skip = (pageNum - 1) * limitNum;

    const filter = {
      isActive: true,
      "isPromoted.status": true,
      "isPromoted.endDate": { $gt: new Date() },
    };

    if (type) {
      filter["isPromoted.type"] = type;
    }

    const coaches = await Coach.find(filter)
      .populate("user", "email username")
      .sort({ "isPromoted.startDate": -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Coach.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: coaches,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching promoted coaches",
      error: error.message,
    });
  }
};

export const getCoachStats = async (req, res) => {
  try {
    const stats = await Coach.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCoaches: { $sum: 1 },
          availableCoaches: {
            $sum: {
              $cond: [{ $eq: ["$status", PROFILE_STATUS.AVAILABLE] }, 1, 0],
            },
          },
          transferredCoaches: {
            $sum: {
              $cond: [{ $eq: ["$status", PROFILE_STATUS.TRANSFERRED] }, 1, 0],
            },
          },
          promotedCoaches: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isPromoted.status", true] },
                    { $gt: ["$isPromoted.endDate", new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const categoryStats = await Coach.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const nationalityStats = await Coach.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$nationality",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        general: stats[0] || {
          totalCoaches: 0,
          availableCoaches: 0,
          transferredCoaches: 0,
          promotedCoaches: 0,
        },
        byCategory: categoryStats,
        byNationality: nationalityStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching coach statistics",
      error: error.message,
    });
  }
};


