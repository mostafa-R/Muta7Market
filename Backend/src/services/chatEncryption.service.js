import crypto from "crypto";
import logger from "../utils/logger.js";

const ALGORITHM = "aes-256-gcm";

if (!process.env.CHAT_ENCRYPTION_KEY) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CHAT_ENCRYPTION_KEY is required in production. Falling back to JWT_SECRET would decrypt all stored conversations if JWT_SECRET leaks."
    );
  }
  logger.warn(
    "CHAT_ENCRYPTION_KEY is not set. Negotiation messages will be encrypted with a key derived from JWT_SECRET. Set CHAT_ENCRYPTION_KEY for a dedicated key."
  );
}

const encryptionKey = crypto
  .createHash("sha256")
  .update(process.env.CHAT_ENCRYPTION_KEY || process.env.JWT_SECRET || "muta7-chat")
  .digest();

export function encryptMessage(plaintext) {
  const text = String(plaintext ?? "");
  if (!text) return null;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    algorithm: ALGORITHM,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    content: encrypted.toString("base64"),
  };
}

export function decryptMessage(encrypted) {
  if (!encrypted || !encrypted.content || !encrypted.iv || !encrypted.tag) {
    return null;
  }

  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      encryptionKey,
      Buffer.from(encrypted.iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(encrypted.tag, "base64"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted.content, "base64")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch (error) {
    logger.error("Failed to decrypt negotiation message:", error.message);
    return null;
  }
}