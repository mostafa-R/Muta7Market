import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';
import { logger } from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsRoot = path.resolve(__dirname, `../../${config.uploads.dir}`);

export function ensureUploadDirs() {
  ['images', 'videos', 'documents', 'temp'].forEach((dir) => {
    const full = path.join(uploadsRoot, dir);
    if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
  });
}

export function buildUploadPath(type, originalName = '') {
  ensureUploadDirs();
  const ext = path.extname(originalName).toLowerCase() || '';
  const fileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  const relative = `${type}/${fileName}`;
  return {
    relativePath: relative,
    absolutePath: path.join(uploadsRoot, relative),
  };
}

export function fileExists(relativePath) {
  const abs = toAbsolute(relativePath);
  return fs.existsSync(abs);
}

export function toAbsolute(relativePath) {
  if (!relativePath) return null;
  if (path.isAbsolute(relativePath)) return relativePath;
  const abs = path.resolve(uploadsRoot, relativePath);
  if (!abs.startsWith(uploadsRoot)) return null;
  return abs;
}

export function deleteFile(relativePath) {
  if (!relativePath) return;
  const abs = toAbsolute(relativePath);
  if (!abs || !fs.existsSync(abs)) return;
  try {
    fs.unlinkSync(abs);
    logger.debug(`Deleted file: ${relativePath}`);
  } catch (err) {
    logger.warn(`Failed to delete file ${relativePath}:`, err.message);
  }
}

export function moveUploadedFile(req, targetType) {
  if (!req.file) return null;
  const tempRel = req.tempFileRelative || `temp/${req.file.filename}`;
  const { relativePath, absolutePath } = buildUploadPath(targetType, req.file.originalname);
  fs.renameSync(toAbsolute(tempRel), absolutePath);
  return { path: relativePath, size: req.file.size, originalName: req.file.originalname, mimeType: req.file.mimetype };
}

export function publicFileUrl(relativePath) {
  if (!relativePath) return null;
  return `/media/file/${relativePath.replace(/\\/g, '/')}`;
}
