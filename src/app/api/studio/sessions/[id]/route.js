import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { writeAuditLog } from '@/lib/admin-security';
import { getRequestIp, getRequestUserAgent } from '@/lib/request-utils';
import { ensureOpeningBySlug, ensureTemplateBySlug } from '@/lib/template-records';
import {
  buildStudioDraftFromSession,
  buildStudioSessionUpdateData,
  studioSessionUpdateSchema,
} from '@/lib/studio';

export const dynamic = 'force-dynamic';

function notFoundError() {
  return new Error('Studio session not found.');
}

function serializeSession(session, manifest) {
  const draft = buildStudioDraftFromSession({ session, manifest });

  return {
    ...session,
    selectedOpeningSlug: draft.openingSlug,
    draft,
  };
}

export async function GET(_request, { params }) {
  try {
    await requirePermission('studio.view');
    const resolvedParams = await params;
    const session = await prisma.studioSession.findUnique({
      where: { id: resolvedParams.id },
      include: {
        baseTemplate: true,
        templateVariant: true,
      },
    });

    if (!session) {
      return apiError(notFoundError(), { status: 404 });
    }

    const manifest = session.baseTemplate.manifest || {};
    return apiSuccess(serializeSession(session, manifest));
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const actor = await requirePermission('studio.edit');
    const resolvedParams = await params;
    const current = await prisma.studioSession.findUnique({
      where: { id: resolvedParams.id },
      include: {
        baseTemplate: true,
      },
    });

    if (!current) {
      return apiError(notFoundError(), { status: 404 });
    }

    const payload = studioSessionUpdateSchema.parse(await request.json());
    const { template, manifest } = await ensureTemplateBySlug(payload.templateSlug);
    const opening = await ensureOpeningBySlug(payload.openingSlug);
    const updateData = buildStudioSessionUpdateData({
      manifest,
      draft: payload,
      openingId: opening.id,
      invitationId: current.invitationId,
    });

    const session = await prisma.studioSession.update({
      where: { id: current.id },
      data: {
        baseTemplateId: template.id,
        name: payload.name || current.name,
        status: payload.status || current.status,
        selectedOpeningId: opening.id,
        selectedOpeningConfig: updateData.selectedOpeningConfig,
        devicePreview: updateData.devicePreview,
        config: updateData.config,
        content: updateData.content,
        assets: updateData.assets,
      },
      include: {
        baseTemplate: true,
        templateVariant: true,
      },
    });

    await writeAuditLog({
      action: 'studio.session.update',
      entityType: 'studioSession',
      entityId: session.id,
      actorId: actor.id,
      summary: `Updated studio session ${session.name}`,
      details: {
        templateSlug: payload.templateSlug,
        openingSlug: payload.openingSlug,
      },
      ip: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
    });

    return apiSuccess(serializeSession(session, manifest));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const actor = await requirePermission('studio.delete');
    const resolvedParams = await params;
    const session = await prisma.studioSession.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!session) {
      return apiError(notFoundError(), { status: 404 });
    }

    await prisma.studioSession.delete({
      where: { id: session.id },
    });

    await writeAuditLog({
      action: 'studio.session.delete',
      entityType: 'studioSession',
      entityId: session.id,
      actorId: actor.id,
      summary: `Deleted studio session ${session.name}`,
      ip: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
    });

    return apiSuccess({ id: session.id });
  } catch (error) {
    return apiError(error);
  }
}
