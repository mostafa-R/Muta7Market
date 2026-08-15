import fs from "fs";
import ApiError from "./ApiError.js";

const FTYP = Buffer.from("ftyp");

const SIGNATURES = {
  jpeg: [Buffer.from([0xff, 0xd8, 0xff])],
  png: [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
  gif: [Buffer.from([0x47, 0x49, 0x46, 0x38])],
  bmp: [Buffer.from([0x42, 0x4d])],
  tiff: [
    Buffer.from([0x49, 0x49, 0x2a, 0x00]),
    Buffer.from([0x4d, 0x4d, 0x00, 0x2a]),
  ],
  pdf: [Buffer.from("%PDF-")],
  ole2: [Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])],
  zip: [
    Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    Buffer.from([0x50, 0x4b, 0x05, 0x06]),
    Buffer.from([0x50, 0x4b, 0x07, 0x08]),
  ],
  matroska: [Buffer.from([0x1a, 0x45, 0xdf, 0xa3])],
  riff: [Buffer.from("RIFF")],
  flv: [Buffer.from("FLV")],
  asf: [
    Buffer.from([
      0x30, 0x26, 0xb2, 0x75, 0x8e, 0x66, 0xcf, 0x11, 0xa6, 0xd9, 0x00,
      0xaa, 0x00, 0x62, 0xce, 0x6c,
    ]),
  ],
  mpegps: [Buffer.from([0x00, 0x00, 0x01, 0xba])],
};

const MIMETYPE_KINDS = {
  "image/jpeg": ["jpeg"],
  "image/jpg": ["jpeg"],
  "image/png": ["png"],
  "image/gif": ["gif"],
  "image/webp": ["webp"],
  "video/mp4": ["mp4"],
  "video/quicktime": ["mov"],
  "video/webm": ["matroska"],
  "video/x-matroska": ["matroska"],
  "video/x-msvideo": ["avi"],
  "video/x-ms-wmv": ["asf"],
  "video/mpeg": ["mpegps", "mpegts"],
  "video/3gpp": ["3gp"],
  "video/x-flv": ["flv"],
  "application/pdf": ["pdf"],
  "application/msword": ["ole2"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    "zip",
  ],
};

const matchesAt = (buf, sig, offset = 0) => {
  if (offset + sig.length > buf.length) return false;
  for (let i = 0; i < sig.length; i++) {
    if (buf[offset + i] !== sig[i]) return false;
  }
  return true;
};

/**
 * Detect the real file type from its header (magic bytes).
 * Returns a canonical kind string or "unknown".
 */
export const detectFileType = (filePath) => {
  let fd;
  try {
    fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(4096);
    const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
    const header = buf.subarray(0, bytesRead);

    if (header.length === 0) return "unknown";

    for (const [kind, sigs] of Object.entries(SIGNATURES)) {
      if (sigs.some((sig) => matchesAt(header, sig))) {
        if (kind === "riff") {
          if (matchesAt(header, Buffer.from("AVI "), 8)) return "avi";
          if (matchesAt(header, Buffer.from("WEBP"), 8)) return "webp";
          return "riff";
        }
        return kind;
      }
    }

    if (header[0] === 0x47 && header[188] === 0x47) return "mpegts";

    for (let off = 0; off + 12 <= header.length; off += 4) {
      if (matchesAt(header, FTYP, off + 4)) {
        const brand = header.toString("ascii", off + 8, off + 12);
        if (brand.startsWith("3gp") || brand.startsWith("3gg")) return "3gp";
        if (brand === "qt  ") return "mov";
        return "mp4";
      }
    }

    return "unknown";
  } catch (err) {
    return "unknown";
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
};

export const removeLocalUpload = (file) => {
  try {
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  } catch (err) {
    console.error("Failed to delete rejected upload:", err.message);
  }
};

/**
 * Verify that an uploaded file's content (magic bytes) matches its declared
 * mimetype. Throws ApiError(400) on mismatch so the file is never served.
 */
export const validateFileSignature = (file, { deleteOnFail = true } = {}) => {
  if (!file) return { ok: true };

  const mimetype = String(file.mimetype || "").toLowerCase();
  if (!mimetype) {
    if (deleteOnFail) removeLocalUpload(file);
    throw new ApiError(400, "File mimetype is missing");
  }

  const accepted = MIMETYPE_KINDS[mimetype];
  if (!accepted) return { ok: true, skipped: true };

  if (!file.path) return { ok: true, skipped: true };

  const detected = detectFileType(file.path);
  if (!accepted.includes(detected)) {
    if (deleteOnFail) removeLocalUpload(file);
    throw new ApiError(
      400,
      `File content does not match its declared type (${file.mimetype}). Upload rejected.`
    );
  }

  return { ok: true, detected };
};

/**
 * Validate all files attached to a request (req.file or req.files).
 * Stops at the first mismatch.
 */
export const validateUploadedFiles = (req) => {
  const all = [];

  if (req.file) all.push(req.file);

  if (req.files) {
    if (Array.isArray(req.files)) {
      all.push(...req.files);
    } else if (typeof req.files === "object") {
      for (const key of Object.keys(req.files)) {
        if (Array.isArray(req.files[key])) all.push(...req.files[key]);
      }
    }
  }

  for (const file of all) {
    validateFileSignature(file);
  }

  return all;
};
