import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { writeAuditLog } from '@/lib/admin-security';
import { getRequestIp, getRequestUserAgent } from '@/lib/request-utils';
import { deleteLocalAsset, deleteRemoteAsset } from '@/lib/storage';
import { findMediaUsage } from '@/lib/media-library';

const updateSchema = z.object({
  fileName: z.string().trim().min(1).max(200).optional(),
  altText: z.string().trim().max(200).optional().or(z.literal('')),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    await requirePermission('media.view');
    const { id } = await params;
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });

    if (!asset) {
      return apiError(new Error('الملف غير موجود.'), { status: 404 });
    }

    const usageRefs = await findMediaUsage(asset.url);
    return apiSuccess({
      ...asset,
      usageRefs,
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const actor = await requirePermission('media.edit');
    const { id } = await params;
    const payload = updateSchema.parse(await request.json());

    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) {
      return apiError(new Error('الملف غير موجود.'), { status: 404 });
    }

    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: {
        fileName: payload.fileName ?? existing.fileName,
        altText: payload.altText ?? existing.altText,
        description: payload.description ?? existing.description,
      },
    });

    await writeAuditLog({
      action: 'media.update',
      entityType: 'media',
      entityId: id,
      actorId: actor.id,
      summary: `Updated media asset ${id}`,
      details: { before: existing, after: updated },
      ip: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
    });

    return apiSuccess(updated, { message: 'تم تحديث بيانات الملف.' });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const actor = await requirePermission('media.delete');
    const { id } = await params;
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });

    if (!asset) {
      return apiError(new Error('الملف غير موجود.'), { status: 404 });
    }

    const usageRefs = await findMediaUsage(asset.url);
    if (usageRefs.length > 0) {
      return apiError(new Error('لا يمكن حذف ملف مستخدم حاليًا.'), {
        status: 409,
        validationErrors: { usageRefs },
      });
    }

    await prisma.mediaAsset.delete({ where: { id } });

    if (asset.provider === 'local' && asset.storageKey) {
      try {
        await deleteLocalAsset(asset.storageKey);
      } catch (error) {
        console.error('Failed to delete local media file:', error);
      }
    }

    if (asset.provider === 'cloudinary' && asset.storageKey) {
      try {
        await deleteRemoteAsset(asset.provider, asset.storageKey, asset.fileType || asset.type);
      } catch (error) {
        console.error('Failed to delete remote media file:', error);
      }
    }

    await writeAuditLog({
      action: 'media.delete',
      entityType: 'media',
      entityId: id,
      actorId: actor.id,
      summary: `Deleted media asset ${id}`,
      details: { asset },
      ip: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
    });

    return apiSuccess({ id }, { message: 'تم حذف الملف.' });
  } catch (error) {
    return apiError(error);
  }
}
