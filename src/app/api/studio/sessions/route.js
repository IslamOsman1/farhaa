import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { writeAuditLog } from '@/lib/admin-security';
import { getRequestIp, getRequestUserAgent } from '@/lib/request-utils';
import { ensureTemplateBySlug } from '@/lib/template-records';
import {
  buildStudioDraftFromSession,
  buildStudioSessionUpdateData,
  createStudioDraftFromManifest,
  studioSessionCreateSchema,
} from '@/lib/studio';

export const dynamic = 'force-dynamic';

function serializeSession(session, manifest) {
  const draft = buildStudioDraftFromSession({ session, manifest });

  return {
    ...session,
    selectedOpeningSlug: draft.openingSlug,
    draft,
  };
}

export async function GET() {
  try {
    await requirePermission('studio.view');
    const sessions = await prisma.studioSession.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        baseTemplate: true,
        templateVariant: true,
      },
      take: 48,
    });

    const items = sessions.map((session) => serializeSession(session, session.baseTemplate.manifest || { slug: session.baseTemplate.slug }));
    return apiSuccess(items);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request) {
  try {
    const actor = await requirePermission('studio.create');
    const payload = studioSessionCreateSchema.parse(await request.json());
    const { template, manifest } = await ensureTemplateBySlug(payload.templateSlug);
    const draft = createStudioDraftFromManifest(manifest);
    const updateData = buildStudioSessionUpdateData({ manifest, draft: { ...draft, name: payload.name } });

    const session = await prisma.studioSession.create({
      data: {
        adminId: actor.id,
        baseTemplateId: template.id,
        name: payload.name || `جلسة ${manifest.nameAr}`,
        status: 'DRAFT',
        config: updateData.config,
        content: updateData.content,
        assets: updateData.assets,
        selectedOpeningConfig: draft.openingConfig,
        devicePreview: draft.devicePreview,
      },
      include: {
        baseTemplate: true,
        templateVariant: true,
      },
    });

    await writeAuditLog({
      action: 'studio.session.create',
      entityType: 'studioSession',
      entityId: session.id,
      actorId: actor.id,
      summary: `Created studio session from ${manifest.slug}`,
      details: {
        templateSlug: manifest.slug,
        sessionName: session.name,
      },
      ip: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
    });

    return apiSuccess(serializeSession(session, manifest), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
