import mongoose from "mongoose";

const sportSchema = new mongoose.Schema(
  {
    name: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    // ✅ slug is needed because you still create it in the pre-validate hook
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    icon: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    positions: [
      {
        name: {
          ar: { type: String, required: true },
          en: { type: String, required: true },
        },
      },
    ],
    roleTypes: [
      {
        jop: {
          type: String,
          enum: ["player", "coach"],
          required: true,
        },
        name: {
          ar: { type: String, required: true },
          en: { type: String, required: true },
        },
      },
    ],
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
  { timestamps: true }
);

// Text index on names
sportSchema.index({ "name.ar": "text", "name.en": "text" });
// Keep slug unique
sportSchema.index({ slug: 1 }, { unique: true });

// Generate slug from English name
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
