import mongoose from "mongoose";

const legalDocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["terms", "privacy", "refund", "cookies", "disclaimer", "custom"],
      required: true,
    },
    title: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    content: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    version: {
      type: String,
      required: true,
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
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
    // تاريخ التحديثات
    revisions: [
      {
        version: { type: String, required: true },
        content: {
          ar: { type: String, required: true },
          en: { type: String, required: true },
        },
        publishedDate: { type: Date, default: Date.now },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        changeDescription: {
          ar: { type: String, default: null },
          en: { type: String, default: null },
        },
      },
    ],
    // بيانات SEO
    seo: {
      metaTitle: {
        ar: { type: String, default: null },
        en: { type: String, default: null },
      },
      metaDescription: {
        ar: { type: String, default: null },
        en: { type: String, default: null },
      },
      keywords: [String],
    },
  },
  {
    timestamps: true,
  }
);

// إنشاء فهارس للبحث والتصفية
legalDocumentSchema.index({ type: 1, isActive: 1 });
legalDocumentSchema.index({ slug: 1 }, { unique: true });
legalDocumentSchema.index({
  "title.ar": "text",
  "title.en": "text",
  "content.ar": "text",
  "content.en": "text",
});

// دالة مساعدة لإنشاء slug من العنوان
legalDocumentSchema.pre("validate", function (next) {
  if (this.isNew || this.isModified("title.en")) {
    this.slug = this.title.en
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

// دالة للحصول على أحدث نسخة من المستند القانوني حسب النوع
legalDocumentSchema.statics.getActiveByType = async function (type) {
  return this.findOne({ type, isActive: true }).sort({ effectiveDate: -1 });
};

// دالة لإنشاء نسخة جديدة من المستند
legalDocumentSchema.statics.createNewVersion = async function (
  type,
  title,
  content,
  version,
  userId,
  changeDescription = null
) {
  // البحث عن آخر نسخة نشطة
  const currentActive = await this.findOne({ type, isActive: true }).sort({
    effectiveDate: -1,
  });

  if (currentActive) {
    // إضافة النسخة الحالية إلى سجل التحديثات
    currentActive.revisions.push({
      version: currentActive.version,
      content: currentActive.content,
      publishedDate: currentActive.publishedDate,
      updatedBy: currentActive.updatedBy || currentActive.createdBy,
      changeDescription,
    });

    // تحديث المستند بالمحتوى الجديد
    currentActive.title = title;
    currentActive.content = content;
    currentActive.version = version;
    currentActive.publishedDate = new Date();
    currentActive.updatedBy = userId;

    return currentActive.save();
  } else {
    // إنشاء مستند جديد إذا لم يكن هناك نسخة نشطة
    return this.create({
      type,
      title,
      content,
      version,
      createdBy: userId,
      isDefault: true,
    });
  }
};

export default mongoose.model("LegalDocument", legalDocumentSchema);
