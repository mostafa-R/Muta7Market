import mongoose from "mongoose";
import { OFFER_STATUS } from "../config/constants.js";

const promotionalOfferSchema = new mongoose.Schema(
  {
    name: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      ar: { type: String, default: null },
      en: { type: String, default: null },
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed_amount", "free"],
      required: true,
    },
    value: {
      type: Number,
      required: function () {
        return this.type !== "free";
      },
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    applicableTo: [
      {
        type: String,
        enum: [
          "contacts_access_year",
          "listing_year_player",
          "listing_year_coach",
          "promotion_year_player",
          "promotion_year_coach",
          "promotion_per_day_player",
          "promotion_per_day_coach",
        ],
      },
    ],
    validityPeriod: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    usageLimit: {
      perUser: { type: Number, default: 1 },
      total: { type: Number, default: null },
    },
    currentUsage: {
      total: { type: Number, default: 0 },
      byUsers: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          count: { type: Number, default: 1 },
          lastUsed: { type: Date, default: Date.now },
        },
      ],
    },
    minimumPurchase: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(OFFER_STATUS),
      default: OFFER_STATUS.PENDING,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    media: {
      image: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// إنشاء فهارس للبحث والتصفية
promotionalOfferSchema.index({ code: 1 }, { unique: true });
promotionalOfferSchema.index({ isActive: 1, status: 1 });
promotionalOfferSchema.index({
  "validityPeriod.startDate": 1,
  "validityPeriod.endDate": 1,
});

// دالة للتحقق من صلاحية العرض
promotionalOfferSchema.virtual("isCurrentlyValid").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.status === OFFER_STATUS.ACTIVE &&
    this.validityPeriod.startDate <= now &&
    this.validityPeriod.endDate >= now &&
    (this.usageLimit.total === null ||
      this.currentUsage.total < this.usageLimit.total)
  );
});

// دالة للتحقق من إمكانية استخدام العرض من قبل مستخدم معين
promotionalOfferSchema.methods.canBeUsedBy = function (userId) {
  if (!this.isCurrentlyValid) {
    return false;
  }

  const userUsage = this.currentUsage.byUsers.find(
    (usage) => usage.userId.toString() === userId.toString()
  );

  return !userUsage || userUsage.count < this.usageLimit.perUser;
};

// دالة لتطبيق العرض على سعر معين
promotionalOfferSchema.methods.applyDiscount = function (originalPrice) {
  if (this.type === "percentage") {
    const discountAmount = (originalPrice * this.value) / 100;
    return this.maxDiscount !== null
      ? Math.max(originalPrice - Math.min(discountAmount, this.maxDiscount), 0)
      : Math.max(originalPrice - discountAmount, 0);
  } else if (this.type === "fixed_amount") {
    return Math.max(originalPrice - this.value, 0);
  } else if (this.type === "free") {
    return 0;
  }

  return originalPrice;
};

// دالة لتسجيل استخدام العرض
promotionalOfferSchema.methods.recordUsage = async function (userId) {
  const userUsageIndex = this.currentUsage.byUsers.findIndex(
    (usage) => usage.userId.toString() === userId.toString()
  );

  if (userUsageIndex >= 0) {
    this.currentUsage.byUsers[userUsageIndex].count += 1;
    this.currentUsage.byUsers[userUsageIndex].lastUsed = new Date();
  } else {
    this.currentUsage.byUsers.push({
      userId,
      count: 1,
      lastUsed: new Date(),
    });
  }

  this.currentUsage.total += 1;

  // تحديث حالة العرض إذا وصل للحد الأقصى
  if (
    this.usageLimit.total !== null &&
    this.currentUsage.total >= this.usageLimit.total
  ) {
    this.status = OFFER_STATUS.EXPIRED;
  }

  return this.save();
};

// دالة للحصول على العروض الترويجية النشطة
promotionalOfferSchema.statics.getActiveOffers = async function () {
  const now = new Date();
  return this.find({
    isActive: true,
    status: OFFER_STATUS.ACTIVE,
    "validityPeriod.startDate": { $lte: now },
    "validityPeriod.endDate": { $gte: now },
  }).sort({ "validityPeriod.endDate": 1 });
};

// دالة للتحقق من صلاحية رمز العرض
promotionalOfferSchema.statics.validateCode = async function (
  code,
  userId,
  serviceType,
  price
) {
  const offer = await this.findOne({ code: code.toUpperCase() });

  if (!offer) {
    return { valid: false, message: "رمز العرض غير صالح" };
  }

  if (!offer.isCurrentlyValid) {
    return { valid: false, message: "انتهت صلاحية العرض" };
  }

  if (!offer.canBeUsedBy(userId)) {
    return { valid: false, message: "تم استخدام الحد الأقصى من هذا العرض" };
  }

  if (!offer.applicableTo.includes(serviceType)) {
    return { valid: false, message: "هذا العرض غير متاح لهذه الخدمة" };
  }

  if (price < offer.minimumPurchase) {
    return {
      valid: false,
      message: `الحد الأدنى للشراء هو ${offer.minimumPurchase} ريال`,
    };
  }

  const discountedPrice = offer.applyDiscount(price);

  return {
    valid: true,
    offer,
    originalPrice: price,
    discountedPrice,
    discount: price - discountedPrice,
  };
};

export default mongoose.model("PromotionalOffer", promotionalOfferSchema);
