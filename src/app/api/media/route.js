import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { findMediaUsage } from '@/lib/media-library';
import { getRequestIp, getRequestUserAgent } from '@/lib/request-utils';
import { persistFileLocally } from '@/lib/storage';
import { writeAuditLog } from '@/lib/admin-security';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(18),
  search: z.string().trim().optional(),
  type: z.enum(['all', 'image', 'video', 'audio', 'file']).default('all'),
  sort: z.enum(['newest', 'oldest', 'name', 'size']).default('newest'),
  view: z.enum(['grid', 'list']).optional(),
});

function buildOrderBy(sort) {
  if (sort === 'oldest') return { createdAt: 'asc' };
  if (sort === 'name') return { fileName: 'asc' };
  if (sort === 'size') return { sizeBytes: 'desc' };
  return { createdAt: 'desc' };
}

export async function GET(request) {
  try {
    await requirePermission('media.view');
    const parsed = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()));
    const where = {
      ...(parsed.type !== 'all' ? { fileType: parsed.type } : {}),
      ...(parsed.search
        ? {
            OR: [
              { fileName: { contains: parsed.search, mode: 'insensitive' } },
              { originalName: { contains: parsed.search, mode: 'insensitive' } },
              { altText: { contains: parsed.search, mode: 'insensitive' } },
              { description: { contains: parsed.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, assets] = await Promise.all([
      prisma.mediaAsset.count({ where }),
      prisma.mediaAsset.findMany({
        where,
        orderBy: buildOrderBy(parsed.sort),
        skip: (parsed.page - 1) * parsed.pageSize,
        take: parsed.pageSize,
      }),
    ]);

    const withUsage = await Promise.all(
      assets.map(async (asset) => ({
        ...asset,
        usageRefs: asset.usageRefs || (await findMediaUsage(asset.url)),
      })),
    );

    return apiSuccess({
      items: withUsage,
      pagination: {
        page: parsed.page,
        pageSize: parsed.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
      },
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request) {
  try {
    const actor = await requirePermission('media.upload');
    const formData = await request.formData();
    const folder = String(formData.get('folder') || 'general');
    const entries = formData.getAll('files');

    if (entries.length === 0) {
      return apiError(new Error('لم يتم اختيار ملفات للرفع.'), { status: 400 });
    }

    const created = [];
    const duplicates = [];

    for (const entry of entries) {
      if (!(entry instanceof File)) {
        continue;
      }

      const duplicate = await prisma.mediaAsset.findFirst({
        where: {
          originalName: entry.name,
          sizeBytes: entry.size,
          mimeType: entry.type,
        },
      });

      if (duplicate) {
        duplicates.push(duplicate);
        continue;
      }

      const stored = await persistFileLocally(entry, folder);
      const usageRefs = await findMediaUsage(stored.url);
      const asset = await prisma.mediaAsset.create({
        data: {
          url: stored.url,
          providerKey: stored.storageKey,
          type: stored.fileType,
          fileName: stored.fileName,
          originalName: stored.originalName,
          storageKey: stored.storageKey,
          mimeType: stored.mimeType,
          fileType: stored.fileType,
          sizeBytes: stored.size,
          folder,
          provider: stored.provider,
          originalFilename: stored.originalName,
          usageRefs,
          createdById: actor.id,
          uploadedBy: actor.id,
        },
      });

      created.push(asset);
    }

    await writeAuditLog({
      action: 'media.upload',
      entityType: 'media',
      actorId: actor.id,
      summary: `Uploaded ${created.length} media asset(s)`,
      details: {
        createdIds: created.map((item) => item.id),
        duplicateIds: duplicates.map((item) => item.id),
      },
      ip: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
    });

    return apiSuccess(
      {
        created,
        duplicates,
      },
      { status: 201, message: 'تم رفع الملفات بنجاح.' },
    );
  } catch (error) {
    return apiError(error);
  }
}
