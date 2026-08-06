import { createHash, randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'application/pdf',
];

function sanitizeFilename(name = 'file') {
  return name
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export function getFileTypeFromMime(mimeType = '') {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'file';
}

export function validateUploadFile(file) {
  if (!file) {
    throw new Error('لم يتم العثور على ملف للرفع.');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('نوع الملف غير مسموح به.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('حجم الملف أكبر من الحد المسموح.');
  }

  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    throw new Error('اسم الملف غير آمن.');
  }
}

export async function persistFileLocally(file, folder = 'general') {
  validateUploadFile(file);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const hash = createHash('sha1').update(buffer).digest('hex');
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const safeBase = sanitizeFilename(file.name.replace(/\.[^.]+$/, '')) || 'asset';
  const safeFolder = sanitizeFilename(folder) || 'general';
  const fileName = `${safeBase}-${hash.slice(0, 10)}-${randomUUID().slice(0, 8)}.${ext}`;
  const relativeDir = join('uploads', safeFolder);
  const absoluteDir = join(process.cwd(), 'public', relativeDir);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(join(absoluteDir, fileName), buffer);

  return {
    fileName,
    originalName: file.name,
    url: `/${relativeDir.replaceAll('\\', '/')}/${fileName}`,
    storageKey: `${safeFolder}/${fileName}`,
    provider: 'local',
    size: file.size,
    mimeType: file.type,
    fileType: getFileTypeFromMime(file.type),
  };
}

export async function deleteLocalAsset(storageKey) {
  if (!storageKey || storageKey.includes('..')) {
    throw new Error('مسار الملف غير صالح.');
  }

  const absolutePath = join(process.cwd(), 'public', 'uploads', storageKey);
  await unlink(absolutePath);
}

export function getUploadConstraints() {
  return {
    maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
  };
}
