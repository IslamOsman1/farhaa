import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { writeAuditLog } from '@/lib/admin-security';
import { getRequestIp, getRequestUserAgent } from '@/lib/request-utils';

const updateSchema = z.object({
  name: z.string().trim().min(1),
  nameAr: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().optional().or(z.literal('')),
  descriptionAr: z.string().trim().optional().or(z.literal('')),
  type: z.string().trim().min(1),
  thumbnail: z.string().trim().optional().or(z.literal('')),
  previewImage: z.string().trim().optional().or(z.literal('')),
  previewVideo: z.string().trim().optional().or(z.literal('')),
  previewMediaUrl: z.string().trim().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  compatibleTemplates: z.array(z.string()).default([]),
  defaultConfig: z.record(z.any()).default({}),
  textConfig: z.record(z.any()).default({}),
  mediaConfig: z.record(z.any()).default({}),
  themeConfig: z.record(z.any()).default({}),
  durationMs: z.number().int().min(0).nullable().default(null),
  transition: z.string().trim().optional().or(z.literal('')),
  autoplay: z.boolean().default(false),
  requiresUserInteraction: z.boolean().default(false),
  duplicate: z.boolean().optional(),
});

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    await requirePermission('openings.view');
    const { id } = await params;
    const opening = await prisma.opening.findUnique({ where: { id } });

    if (!opening) {
      return apiError(new Error('الافتتاحية غير موجودة.'), { status: 404 });
    }

    return apiSuccess(opening);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const actor = await requirePermission('openings.edit');
    const { id } = await params;
    const payload = updateSchema.parse(await request.json());
    const existing = await prisma.opening.findUnique({ where: { id } });

    if (!existing) {
      return apiError(new Error('الافتتاحية غير موجودة.'), { status: 404 });
    }

    if (payload.duplicate) {
      const duplicated = await prisma.opening.create({
        data: {
          ...existing,
          id: undefined,
          slug: `${existing.slug}-${Date.now()}`,
          name: `${existing.name} Copy`,
          nameAr: `${existing.nameAr} نسخة`,
          isDefault: false,
          createdAt: undefined,
          updatedAt: undefined,
        },
      });

      return apiSuccess(duplicated, { status: 201, message: 'تم نسخ الافتتاحية.' });
    }

    if (payload.isDefault) {
      await prisma.opening.updateMany({ data: { isDefault: false } });
    }

    const updated = await prisma.opening.update({
      where: { id },
      data: {
        ...payload,
        thumbnailUrl: payload.thumbnail || null,
        compatibilityRules: {
          allowedTemplateSlugs: payload.compatibleTemplates,
        },
        status: payload.isActive ? 'ACTIVE' : 'DISABLED',
      },
    });

    await writeAuditLog({
      action: 'opening.update',
      entityType: 'opening',
      entityId: id,
      actorId: actor.id,
      summary: `Updated opening ${updated.slug}`,
      details: { before: existing, after: updated },
      ip: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
    });

    return apiSuccess(updated, { message: 'تم تحديث الافتتاحية.' });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const actor = await requirePermission('openings.delete');
    const { id } = await params;
    const existing = await prisma.opening.findUnique({ where: { id } });

    if (!existing) {
      return apiError(new Error('الافتتاحية غير موجودة.'), { status: 404 });
    }

    const usageCount = await prisma.invitation.count({ where: { openingId: id } });
    if (usageCount > 0) {
      return apiError(new Error('لا يمكن حذف افتتاحية مستخدمة في دعوات حالية.'), { status: 409 });
    }

    await prisma.opening.delete({ where: { id } });

    await writeAuditLog({
      action: 'opening.delete',
      entityType: 'opening',
      entityId: id,
      actorId: actor.id,
      summary: `Deleted opening ${existing.slug}`,
      details: existing,
      ip: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
    });

    return apiSuccess({ id }, { message: 'تم حذف الافتتاحية.' });
  } catch (error) {
    return apiError(error);
  }
}
