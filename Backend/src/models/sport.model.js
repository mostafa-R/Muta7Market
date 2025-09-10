import mongoose from "mongoose";

const sportSchema = new mongoose.Schema(
  {
    name: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    icon: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    description: {
      ar: { type: String, default: null },
      en: { type: String, default: null },
    },
    positions: [
      {
        name: {
          ar: { type: String, required: true },
          en: { type: String, required: true },
        },
        description: {
          ar: { type: String, default: null },
          en: { type: String, default: null },
        },
      },
    ],
    roleTypes: [
      {
        name: {
          ar: { type: String, required: true },
          en: { type: String, required: true },
        },
        description: {
          ar: { type: String, default: null },
          en: { type: String, default: null },
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
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

// إنشاء فهرس للبحث النصي
sportSchema.index({ "name.ar": "text", "name.en": "text" });
sportSchema.index({ slug: 1 }, { unique: true });
sportSchema.index({ isActive: 1, displayOrder: 1 });

// دالة مساعدة لإنشاء slug من الاسم
sportSchema.pre("validate", function (next) {
  if (this.isNew || this.isModified("name.en")) {
    this.slug = this.name.en
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

export default mongoose.model("Sport", sportSchema);
