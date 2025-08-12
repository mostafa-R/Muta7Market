import crypto from 'crypto';

export const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

export function generateRandomString() {
  return crypto.randomInt(100000, 999999).toString().padStart(6, '0');
}

export const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

export const buildSortQuery = (sortBy) => {
  if (!sortBy) {return { createdAt: -1 };}

  const sortFields = sortBy.split(',').reduce((acc, field) => {
    const order = field.startsWith('-') ? -1 : 1;
    const fieldName = field.replace(/^-/, '');
    acc[fieldName] = order;
    return acc;
  }, {});

  return sortFields;
};

export const buildFilterQuery = (filters) => {
  const query = {};

  Object.keys(filters).forEach((key) => {
    if (filters[key] !== undefined && filters[key] !== '') {
      // Handle different filter types
      if (key.includes('_gte') || key.includes('_lte')) {
        const field = key.replace(/_gte|_lte/, '');
        query[field] = query[field] || {};
        if (key.includes('_gte')) {
          query[field].$gte = filters[key];
        } else {
          query[field].$lte = filters[key];
        }
      } else if (key.includes('_like')) {
        const field = key.replace(/_like/, '');
        query[field] = { $regex: filters[key], $options: 'i' };
      } else {
        query[key] = filters[key];
      }
    }
  });

  return query;
};
