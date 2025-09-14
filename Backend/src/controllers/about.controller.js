// services/about.service.js

import { About } from "../models/about.model.js";

export const createAbout = async (payload) => {
  const doc = await About.create(payload);
  return doc.toObject();
};

export const getAbouts = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    About.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    About.countDocuments({}),
  ]);

  return {
    data: items,
    pagination: {
      page,
      limit,
      totalItems: total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

export const getAboutById = async (id) => {
  return About.findById(id).lean();
};

export const updateAboutById = async (id, payload) => {
  return About.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();
};

export const patchAboutById = async (id, payload) => {
  return About.findByIdAndUpdate(id, { $set: payload }, {
    new: true,
    runValidators: true,
  }).lean();
};

export const deleteAboutById = async (id) => {
  const res = await About.findByIdAndDelete(id).lean();
  return res; // null if not found
};
