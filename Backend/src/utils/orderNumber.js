// src/utils/orderNumber.js
export function makeOrderNumber(product, userId) {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `PAY-v1:${product}:${userId}:${ts}:${rand}`;
}
