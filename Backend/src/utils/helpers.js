import crypto from "crypto";

export const generateOTP = (length = 6) => {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < length; i++) {
    OTP += digits[crypto.randomInt(0, 10)];
  }
  return OTP;
};

export function generateRandomString() {
  return crypto.randomInt(100000, 999999).toString().padStart(6, "0");
}

export const paginate = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;
  return { skip, limit: limitNum };
};

export const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const buildSortQuery = (sortBy) => {
  if (!sortBy) {
    return { createdAt: -1 };
  }

  const sortFields = sortBy.split(",").reduce((acc, field) => {
    const order = field.startsWith("-") ? -1 : 1;
    const fieldName = field.replace(/^-/, "");
    acc[fieldName] = order;
    return acc;
  }, {});

  return sortFields;
};
