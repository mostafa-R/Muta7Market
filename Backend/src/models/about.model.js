import mongoose from "mongoose";

const items = new mongoose.Schema({
  name: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  description: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  icon: { type: String },
});

const list = new mongoose.Schema({
  title: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  description: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  items: [items],
});

const aboutSchema = mongoose.Schema(
  {
    title: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    list: [list],
  },
  { timestamps: true }
);


export const About = mongoose.models.About || mongoose.model("About", aboutSchema);