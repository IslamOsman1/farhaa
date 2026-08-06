import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { writeAuditLog } from '@/lib/admin-security';
import { getRequestIp, getRequestUserAgent } from '@/lib/request-utils';
import { ensureOpeningBySlug } from '@/lib/template-records';
import { buildStudioDraftFromSession, studioVariantSchema } from '@/lib/studio';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const actor = await requirePermission('studio.saveTemplate');
    const resolvedParams = await params;
    const payload = studioVariantSchema.parse(await request.json());

    const session = await prisma.studioSession.findUnique({
      where: { id: resolvedParams.id },
      include: {
        baseTemplate: true,
      },
    });

    if (!session) {
      return apiError(new Error('Studio session not found.'), { status: 404 });
    }

    const draft = buildStudioDraftFromSession({
      session,
      manifest: session.baseTemplate.manifest || { slug: session.baseTemplate.slug },
    });
    const opening = await ensureOpeningBySlug(draft.openingSlug);
    const variant = await prisma.templateVariant.create({
      data: {
        name: payload.name,
        nameAr: payload.nameAr || payload.name,
        slug: payload.slug || null,
        baseTemplateId: session.baseTemplateId,
        manifest: session.baseTemplate.manifest,
        config: session.config,
        content: session.content,
        mediaBindings: session.assets,
        openingId: opening.id,
        openingConfig: session.selectedOpeningConfig || session.config?.openingConfig || {},
        isInternal: true,
        isPublished: payload.isPublished,
        createdById: actor.id,
      },
    });

    await prisma.studioSession.update({
      where: { id: session.id },
      data: {
        templateVariantId: variant.id,
      },
    });

    await writeAuditLog({
      action: 'studio.variant.create',
      entityType: 'templateVariant',
      entityId: variant.id,
      actorId: actor.id,
      summary: `Saved template variant ${variant.name}`,
      details: {
        studioSessionId: session.id,
        baseTemplateId: session.baseTemplateId,
      },
      ip: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
    });

    return apiSuccess({ variant }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
