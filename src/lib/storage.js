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

function isConfiguredValue(value) {
  return Boolean(value) && !String(value).includes('<') && !String(value).includes('>');
}

function getCloudinaryConfig() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (isConfiguredValue(cloudinaryUrl)) {
    try {
      const parsed = new URL(cloudinaryUrl);
      return {
        cloudName: parsed.hostname,
        apiKey: decodeURIComponent(parsed.username),
        apiSecret: decodeURIComponent(parsed.password),
      };
    } catch (_error) {
      throw new Error('قيمة CLOUDINARY_URL غير صالحة.');
    }
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (isConfiguredValue(cloudName) && isConfiguredValue(apiKey) && isConfiguredValue(apiSecret)) {
    return { cloudName, apiKey, apiSecret };
  }

  return null;
}

function shouldUseRemoteStorage() {
  return Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';
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

function getCloudinaryResourceType(fileType) {
  if (fileType === 'image') return 'image';
  if (fileType === 'video') return 'video';
  if (fileType === 'audio') return 'video';
  return 'raw';
}

async function persistFileToCloudinary(file, folder = 'general') {
  const cloudinary = getCloudinaryConfig();
  if (!cloudinary) {
    throw new Error('رفع الملفات على الخادم يحتاج إعداد Cloudinary في متغيرات البيئة.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const hash = createHash('sha1').update(buffer).digest('hex');
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const safeBase = sanitizeFilename(file.name.replace(/\.[^.]+$/, '')) || 'asset';
  const safeFolder = sanitizeFilename(folder) || 'general';
  const publicId = `farha/${safeFolder}/${safeBase}-${hash.slice(0, 10)}-${randomUUID().slice(0, 8)}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `folder=farha/${safeFolder}&public_id=${publicId}&timestamp=${timestamp}${cloudinary.apiSecret}`;
  const signature = createHash('sha1').update(signaturePayload).digest('hex');
  const formData = new FormData();

  formData.append('file', new Blob([buffer], { type: file.type }), file.name);
  formData.append('api_key', cloudinary.apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', `farha/${safeFolder}`);
  formData.append('public_id', publicId);
  formData.append('use_filename', 'false');
  formData.append('unique_filename', 'false');

  const resourceType = getCloudinaryResourceType(getFileTypeFromMime(file.type));
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/${resourceType}/upload`;
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'تعذر رفع الملف إلى Cloudinary.');
  }

  return {
    fileName: `${publicId.split('/').pop()}.${ext}`,
    originalName: file.name,
    url: payload.secure_url || payload.url,
    storageKey: payload.public_id,
    providerKey: payload.asset_id || payload.public_id,
    provider: 'cloudinary',
    size: file.size,
    mimeType: file.type,
    fileType: getFileTypeFromMime(file.type),
  };
}

async function persistFileLocally(file, folder = 'general') {
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
    providerKey: `${safeFolder}/${fileName}`,
    provider: 'local',
    size: file.size,
    mimeType: file.type,
    fileType: getFileTypeFromMime(file.type),
  };
}

export async function persistUploadedFile(file, folder = 'general') {
  validateUploadFile(file);

  if (shouldUseRemoteStorage()) {
    return persistFileToCloudinary(file, folder);
  }

  return persistFileLocally(file, folder);
}

export async function deleteLocalAsset(storageKey) {
  if (!storageKey || storageKey.includes('..')) {
    throw new Error('مسار الملف غير صالح.');
  }

  const absolutePath = join(process.cwd(), 'public', 'uploads', storageKey);
  await unlink(absolutePath);
}

export async function deleteRemoteAsset(provider, storageKey, fileType = 'image') {
  if (provider !== 'cloudinary' || !storageKey) {
    return;
  }

  const cloudinary = getCloudinaryConfig();
  if (!cloudinary) {
    return;
  }

  const resourceType = getCloudinaryResourceType(fileType);
  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `public_id=${storageKey}&timestamp=${timestamp}${cloudinary.apiSecret}`;
  const signature = createHash('sha1').update(signaturePayload).digest('hex');
  const formData = new FormData();

  formData.append('public_id', storageKey);
  formData.append('api_key', cloudinary.apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);

  await fetch(`https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/${resourceType}/destroy`, {
    method: 'POST',
    body: formData,
  });
}

export function getUploadConstraints() {
  return {
    maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
  };
}
