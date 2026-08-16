import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/env.js';
import { ALLOWED_MIME } from '../config/constants.js';
import { detectMime, isMimeAllowed } from '../utils/magicBytes.js';
import { buildUploadPath, ensureUploadDirs, uploadsRoot } from '../utils/fileUtils.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { getSettingNumber } from '../services/settings.service.js';

ensureUploadDirs();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(uploadsRoot, 'temp'));
  },
  filename: (req, file, cb) => {
    const { relativePath } = buildUploadPath('temp', file.originalname);
    req.tempFileRelative = relativePath;
    cb(null, path.basename(relativePath));
  },
});

const limitsByType = {
  image: config.uploads.maxImageMb * 1024 * 1024,
  video: config.uploads.maxVideoMb * 1024 * 1024,
  document: config.uploads.maxDocMb * 1024 * 1024,
  mixed: Math.max(config.uploads.maxVideoMb, config.uploads.maxDocMb) * 1024 * 1024,
};

function fileFilter(type) {
  return (req, file, cb) => {
    const allowed = ALLOWED_MIME[type] || [];
    if (!isMimeAllowed(file.mimetype, allowed)) {
      return cb(new ApiError(415, 'media.invalidType', {}, 'Unsupported file type'));
    }
    cb(null, true);
  };
}

export function uploadImage(field = 'image') {
  return multer({ storage, limits: { fileSize: limitsByType.image, files: 1 }, fileFilter: fileFilter('image') }).single(field);
}

export function uploadVideo(field = 'file') {
  return multer({ storage, limits: { fileSize: limitsByType.video, files: 1 }, fileFilter: fileFilter('video') }).single(field);
}

export function uploadDocument(field = 'file') {
  return multer({ storage, limits: { fileSize: limitsByType.document, files: 5 }, fileFilter: fileFilter('document') }).single(field);
}

export function uploadDocuments(field = 'files', maxFiles = 5) {
  return multer({
    storage,
    limits: { fileSize: limitsByType.document, files: maxFiles },
    fileFilter: fileFilter('document'),
  }).array(field, maxFiles);
}

export function uploadAny(field = 'file') {
  return multer({ storage, limits: { fileSize: limitsByType.mixed, files: 1 }, fileFilter: fileFilter('mixed') }).single(field);
}

export function verifyMagicBytes(type) {
  return async (req, res, next) => {
    try {
      await assertValidUploads(req, type);
      next();
    } catch (err) {
      next(err);
    }
  };
}

async function assertValidUploads(req, type) {
  const files = req.file ? [req.file] : req.files || [];
  if (!files.length) return;
  const allowed = ALLOWED_MIME[type] || ALLOWED_MIME.mixed || [];

  const sizeLimitMb = await getSettingNumber(
    `upload.${type === 'mixed' ? 'video' : type}MaxMb`,
    config.uploads[type === 'mixed' ? 'maxVideoMb' : type === 'image' ? 'maxImageMb' : type === 'document' ? 'maxDocMb' : 'maxVideoMb']
  );

  for (const file of files) {
    if (file.size > sizeLimitMb * 1024 * 1024) {
      try {
        fs.unlinkSync(file.path);
      } catch {
        /* noop */
      }
      throw new ApiError(413, 'media.fileTooLarge', { mb: sizeLimitMb }, 'File too large');
    }

    let buffer;
    try {
      buffer = fs.readFileSync(file.path, { bufferSize: 64 });
    } catch (err) {
      logger.error('Failed reading uploaded file:', err.message);
      throw new ApiError(400, 'media.invalidFile', {}, 'Failed reading uploaded file');
    }
    const detected = detectMime(buffer);
    if (!detected || !isMimeAllowed(detected, allowed)) {
      try {
        fs.unlinkSync(file.path);
      } catch {
        /* noop */
      }
      throw new ApiError(415, 'media.invalidType', {}, 'File content does not match allowed types');
    }
  }
}
