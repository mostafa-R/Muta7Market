import { Term } from "../models/terms.model.js";

export const createTerm = async (payload) => {
  const doc = await Term.create(payload);
  return doc.toObject();
};

export const getTerms = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Term.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Term.countDocuments({}),
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

export const getTermById = async (id) => {
  return Term.findById(id).lean();
};

export const updateTermById = async (id, payload) => {
  return Term.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();
};

export const patchTermById = async (id, payload) => {
  return Term.findByIdAndUpdate(
    id,
    { $set: payload },
    {
      new: true,
      runValidators: true,
    }
  ).lean();
};

export const deleteTermById = async (id) => {
  const res = await Term.findByIdAndDelete(id).lean();
  return res;
};
