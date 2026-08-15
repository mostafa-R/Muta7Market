// scripts/migrate-kyc-documents.js
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import mongoose from "mongoose";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Kyc from "../src/models/kyc.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_UPLOADS_DIR = join(__dirname, "../uploads/documents");
const PRIVATE_KYC_DIR = join(__dirname, "../privateUploads/kyc");
const KYC_DOCUMENT_ROUTE = "/api/v1/kyc/document/";

const buildBaseUrl = () => {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, "");
  }
  return `http://localhost:${process.env.PORT || 5000}`;
};

async function main() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) throw new Error("Missing MONGODB_URI/DATABASE_URL");
  await mongoose.connect(uri);

  if (!fs.existsSync(PRIVATE_KYC_DIR)) {
    fs.mkdirSync(PRIVATE_KYC_DIR, { recursive: true });
  }

  const baseUrl = buildBaseUrl();
  const base = mongoose.connection.db;
  const cursor = base
    .collection("kycs")
    .find({ documents: { $elemMatch: { url: /\/uploads\/documents\// } } })
    .cursor();

  let migrated = 0;
  let moved = 0;
  let missing = [];
  let skippedNoFile = 0;

  for await (const kyc of cursor) {
    let changed = false;
    let filesToDelete = [];

    for (const doc of kyc.documents || []) {
      if (!doc.url || !String(doc.url).includes("/uploads/documents/")) continue;

      const filename = decodeURIComponent(String(doc.url).split("/").pop().split("?")[0]);
      if (!filename) continue;

      const sourcePath = join(PUBLIC_UPLOADS_DIR, filename);
      const destPath = join(PRIVATE_KYC_DIR, filename);

      if (!fs.existsSync(sourcePath)) {
        skippedNoFile += 1;
        missing.push(filename);
        continue;
      }

      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(sourcePath, destPath);
      }
      moved += 1;

      const protectedUrl = `${baseUrl}${KYC_DOCUMENT_ROUTE}${encodeURIComponent(filename)}`;
      doc.url = protectedUrl;
      doc.publicId = filename;
      filesToDelete.push(sourcePath);
      changed = true;
    }

    if (changed) {
      await Kyc.updateOne({ _id: kyc._id }, { $set: { documents: kyc.documents } });
      for (const filePath of filesToDelete) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.warn("Failed to remove public copy:", filePath, err.message);
        }
      }
      migrated += 1;
    }
  }

  await mongoose.disconnect();

  console.log("KYC document migration finished");
  console.log(`  Records updated: ${migrated}`);
  console.log(`  Files moved to private storage: ${moved}`);
  console.log(`  Files not found on disk (record kept, URL untouched): ${skippedNoFile}`);
  if (missing.length) {
    console.log("  Missing files:", missing.slice(0, 20).join(", "));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});