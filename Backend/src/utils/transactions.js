import mongoose from "mongoose";

const TRANSACTION_UNSUPPORTED_RE =
  /Transaction numbers are only allowed on a replica set member or mongos/i;

function isTransactionUnsupported(err) {
  return (
    err?.code === 20 ||
    TRANSACTION_UNSUPPORTED_RE.test(String(err?.message || ""))
  );
}

/**
 * Runs `fn(session)` inside a multi-document transaction when the connected
 * MongoDB server supports it (replica set / sharded cluster). Falls back to
 * running `fn(null)` on standalone servers where transactions are illegal,
 * so local development and tests keep working.
 */
export async function runInTransaction(fn) {
  const session = await mongoose.startSession();
  try {
    try {
      return await session.withTransaction(() => fn(session));
    } catch (err) {
      if (isTransactionUnsupported(err)) {
        return await fn(null);
      }
      throw err;
    }
  } finally {
    session.endSession();
  }
}
