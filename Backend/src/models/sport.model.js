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

sportSchema.index({ "name.ar": "text", "name.en": "text" });
sportSchema.index({ slug: 1 }, { unique: true });

sportSchema.pre("validate", function (next) {
  if (this.isNew || this.isModified("name.en")) {
    if (this.name && this.name.en) {
      this.slug = this.name.en
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    } else {
      this.slug = `sport-${Date.now()}`;
    }
  }
  next();
});

export default mongoose.model("Sport", sportSchema);
