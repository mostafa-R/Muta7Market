const signatures = {
  jpg: [[0xff, 0xd8, 0xff]],
  jpeg: [[0xff, 0xd8, 0xff]],
  png: [[0x89, 0x50, 0x4e, 0x47]],
  webp: [
    [0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50],
  ],
  gif: [[0x47, 0x49, 0x46, 0x38]],
  mp4: [
    [0x00, 0x00, 0x00, null, 0x66, 0x74, 0x79, 0x70],
    [0x00, 0x00, 0x00, null, 0x6d, 0x6f, 0x6f, 0x76],
  ],
  mov: [[0x00, 0x00, 0x00, null, 0x6d, 0x6f, 0x6f, 0x76]],
  webm: [[0x1a, 0x45, 0xdf, 0xa3]],
  mkv: [[0x1a, 0x45, 0xdf, 0xa3]],
  pdf: [[0x25, 0x50, 0x44, 0x46]],
};

const extFromMime = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'application/pdf': 'pdf',
};

const mimeFromExt = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  pdf: 'application/pdf',
};

export function detectMime(buffer) {
  for (const [ext, patterns] of Object.entries(signatures)) {
    for (const pattern of patterns) {
      if (matches(buffer, pattern)) return mimeFromExt[ext] || null;
    }
  }
  return null;
}

export function detectExt(buffer) {
  const mime = detectMime(buffer);
  if (!mime) return null;
  return extFromMime[mime];
}

export function matches(buffer, pattern) {
  if (buffer.length < pattern.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] !== null && buffer[i] !== pattern[i]) return false;
  }
  return true;
}

export function isMimeAllowed(mime, allowedList) {
  return allowedList.includes(mime);
}
