import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import {
  buildPublicFontLibraryPayload,
  extractUploadedFontLibrary,
  mergeFontLibraryIntoFooterConfig,
} from '@/lib/font-library';
import { deleteLocalAsset, deleteRemoteAsset, persistUploadedFile } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const deleteSchema = z.object({
  id: z.string().trim().min(1),
});

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function guessFormat(value = '') {
  const lower = String(value).toLowerCase();
  if (lower.endsWith('.woff2')) return 'woff2';
  if (lower.endsWith('.woff')) return 'woff';
  if (lower.endsWith('.otf')) return 'opentype';
  if (lower.endsWith('.ttf')) return 'truetype';
  return 'woff2';
}

function normalizeFamily(value = '', fallback = 'Custom Font') {
  const nextValue = sanitizeText(value);
  return nextValue || fallback;
}

export async function GET() {
  try {
    await requirePermission('settings.manage');
    const settings = await prisma.siteSettings.findFirst();
    return apiSuccess(buildPublicFontLibraryPayload(settings));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request) {
  try {
    await requirePermission('settings.manage');
    const formData = await request.formData();
    const uploadedFile = formData.get('file');
    const family = normalizeFamily(
      formData.get('family'),
      normalizeFamily(formData.get('nameEn') || formData.get('nameAr'), 'Custom Font'),
    );
    const nameAr = sanitizeText(formData.get('nameAr')) || family;
    const nameEn = sanitizeText(formData.get('nameEn')) || family;
    const externalUrl = sanitizeText(formData.get('url'));

    let asset = null;
    if (uploadedFile instanceof File && uploadedFile.size > 0) {
      asset = await persistUploadedFile(uploadedFile, 'font-library');
    } else if (externalUrl) {
      asset = {
        url: externalUrl,
        storageKey: '',
        provider: 'external',
        originalName: externalUrl.split('/').pop() || family,
        fileName: externalUrl.split('/').pop() || family,
      };
    } else {
      throw new Error('اختر ملف خط أو أدخل رابط خط صالح.');
    }

    const currentSettings = await prisma.siteSettings.findFirst();
    const uploadedFonts = extractUploadedFontLibrary(currentSettings);
    const nextEntry = {
      id: `font-${Date.now().toString(36)}`,
      family,
      nameAr,
      nameEn,
      url: asset.url,
      format: guessFormat(asset.url || asset.fileName || asset.originalName || ''),
      provider: asset.provider || 'custom',
      providerLabel: asset.provider === 'cloudinary' ? 'Cloudinary' : asset.provider === 'external' ? 'External URL' : 'Local Upload',
      storageKey: asset.storageKey || '',
      originalName: asset.originalName || asset.fileName || family,
      createdAt: new Date().toISOString(),
      source: 'upload',
      isActive: true,
    };

    const footerConfig = mergeFontLibraryIntoFooterConfig(currentSettings, [...uploadedFonts, nextEntry]);

    if (currentSettings) {
      await prisma.siteSettings.update({
        where: { id: currentSettings.id },
        data: { footerConfig },
      });
    } else {
      await prisma.siteSettings.create({
        data: {
          contactPhone: '',
          contactEmail: '',
          whatsapp: '',
          instagram: '',
          facebook: '',
          footerConfig,
        },
      });
    }

    const updatedSettings = await prisma.siteSettings.findFirst();
    return apiSuccess(buildPublicFontLibraryPayload(updatedSettings), {
      status: 201,
      message: 'تمت إضافة الخط إلى المكتبة بنجاح.',
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request) {
  try {
    await requirePermission('settings.manage');
    const body = deleteSchema.parse(await request.json());
    const currentSettings = await prisma.siteSettings.findFirst();
    const uploadedFonts = extractUploadedFontLibrary(currentSettings);
    const targetFont = uploadedFonts.find((entry) => entry.id === body.id);

    if (!targetFont) {
      throw new Error('الخط المطلوب غير موجود.');
    }

    if (targetFont.provider === 'cloudinary' && targetFont.storageKey) {
      await deleteRemoteAsset('cloudinary', targetFont.storageKey, 'font');
    } else if (targetFont.provider === 'local' && targetFont.storageKey) {
      await deleteLocalAsset(targetFont.storageKey);
    }

    const footerConfig = mergeFontLibraryIntoFooterConfig(
      currentSettings,
      uploadedFonts.filter((entry) => entry.id !== body.id),
    );

    if (currentSettings) {
      await prisma.siteSettings.update({
        where: { id: currentSettings.id },
        data: { footerConfig },
      });
    }

    const updatedSettings = await prisma.siteSettings.findFirst();
    return apiSuccess(buildPublicFontLibraryPayload(updatedSettings), {
      message: 'تم حذف الخط من المكتبة.',
    });
  } catch (error) {
    return apiError(error);
  }
}
