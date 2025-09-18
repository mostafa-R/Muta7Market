import mongoose, { Schema } from "mongoose";

const list = new Schema({
  title: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  description: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  icon: { type: String },
});

const termItemSchema = new Schema({
  title: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  description: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  list: [list],
});

const termSchema = new Schema(
  {
    headTitle: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    headDescription: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    terms: [termItemSchema],
  },
  { timestamps: true }
);

export const Term = mongoose.models.Term || mongoose.model("Term", termSchema);
