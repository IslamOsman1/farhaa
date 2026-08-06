import { z } from 'zod';
import prisma from '@/lib/prisma';
import { OPENING_LIBRARY } from '@/lib/template-system';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { writeAuditLog } from '@/lib/admin-security';
import { getRequestIp, getRequestUserAgent } from '@/lib/request-utils';

export const dynamic = 'force-dynamic';

const openingSchema = z.object({
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
});

function normalizeOpeningRecord(opening, usageCount = 0) {
  return {
    ...opening,
    compatibilityRules: opening.compatibilityRules || {},
    compatibleTemplates: opening.compatibleTemplates || [],
    defaultConfig: opening.defaultConfig || {},
    textConfig: opening.textConfig || {},
    mediaConfig: opening.mediaConfig || {},
    themeConfig: opening.themeConfig || {},
    usageCount,
  };
}

export async function GET() {
  try {
    await requirePermission('openings.view');
    const [storedOpenings, usage] = await Promise.all([
      prisma.opening.findMany({
        orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }],
      }),
      prisma.invitation.groupBy({
        by: ['openingId'],
        _count: { openingId: true },
        where: { openingId: { not: null } },
      }),
    ]);

    const usageMap = new Map(usage.map((item) => [item.openingId, item._count.openingId]));
    const storedMap = new Map(storedOpenings.map((opening) => [opening.slug, opening]));

    const merged = [
      ...OPENING_LIBRARY.map((opening) => {
        const dbValue = storedMap.get(opening.slug);
        const current = dbValue || {
          ...opening,
          compatibleTemplates: opening.compatibilityRules?.allowedTemplateSlugs || [],
        };
        return normalizeOpeningRecord(current, usageMap.get(current.id) || 0);
      }),
      ...storedOpenings
        .filter((opening) => !OPENING_LIBRARY.some((libraryItem) => libraryItem.slug === opening.slug))
        .map((opening) => normalizeOpeningRecord(opening, usageMap.get(opening.id) || 0)),
    ];

    return apiSuccess(merged);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request) {
  try {
    const actor = await requirePermission('openings.create');
    const payload = openingSchema.parse(await request.json());

    if (payload.isDefault) {
      await prisma.opening.updateMany({ data: { isDefault: false } });
    }

    const opening = await prisma.opening.create({
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
      action: 'opening.create',
      entityType: 'opening',
      entityId: opening.id,
      actorId: actor.id,
      summary: `Created opening ${opening.slug}`,
      details: opening,
      ip: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
    });

    return apiSuccess(opening, { status: 201, message: 'تم إنشاء الافتتاحية.' });
  } catch (error) {
    return apiError(error);
  }
}
