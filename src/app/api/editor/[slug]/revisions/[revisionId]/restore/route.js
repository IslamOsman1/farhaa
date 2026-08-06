import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { getOpeningBySlug, getTemplateManifest } from '@/lib/template-system';
import { buildInvitationRenderConfig } from '@/lib/template-system';
import { writeAuditLog } from '@/lib/admin-security';
import { getRequestIp, getRequestUserAgent } from '@/lib/request-utils';

async function createRevision(invitationId, snapshot, actorId, status, changeSummary) {
  const latest = await prisma.invitationRevision.findFirst({
    where: { invitationId },
    orderBy: { revisionNumber: 'desc' },
  });

  const revisionNumber = latest ? latest.revisionNumber + 1 : 1;

  await prisma.invitationRevision.create({
    data: {
      invitationId,
      revisionNumber,
      snapshot,
      status,
      createdBy: actorId,
      changeSummary,
    },
  });

  return revisionNumber;
}

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const actor = await requirePermission('invitations.restore');
    const { slug, revisionId } = await params;
    const body = await request.json().catch(() => ({}));
    const publish = Boolean(body.publish);

    const invitation = await prisma.invitation.findUnique({
      where: { slug },
      include: { template: true, opening: true },
    });

    if (!invitation) {
      return apiError(new Error('الدعوة غير موجودة.'), { status: 404 });
    }

    const revision = await prisma.invitationRevision.findUnique({
      where: { id: revisionId },
    });

    if (!revision || revision.invitationId !== invitation.id) {
      return apiError(new Error('النسخة المطلوبة غير موجودة.'), { status: 404 });
    }

    const snapshot = revision.snapshot || {};
    const templateSlug = snapshot.templateSlug || invitation.template.slug;
    const openingSlug = snapshot.openingSlug || invitation.opening?.slug || 'native-template';
    const template = await prisma.template.findUnique({ where: { slug: templateSlug } });
    const opening = await prisma.opening.findUnique({ where: { slug: openingSlug } });

    const updated = await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        templateId: template?.id || invitation.templateId,
        openingId: opening?.id || invitation.openingId,
        contentConfig: snapshot.contentConfig || invitation.contentConfig,
        themeConfig: snapshot.themeConfig || invitation.themeConfig,
        sectionConfig: snapshot.sectionConfig || invitation.sectionConfig,
        openingConfig: snapshot.openingConfig || invitation.openingConfig,
        status: publish ? 'PUBLISHED' : 'DRAFT',
        updatedBy: actor.id,
        publishedAt: publish ? new Date() : invitation.publishedAt,
      },
      include: { template: true, opening: true },
    });

    const manifest = getTemplateManifest(templateSlug);
    const renderConfig = buildInvitationRenderConfig({
      invitation: updated,
      manifest,
      opening: opening || getOpeningBySlug(openingSlug),
      preview: true,
    });

    const rollbackRevisionNumber = await createRevision(
      invitation.id,
      {
        ...snapshot,
        renderConfig,
      },
      actor.id,
      publish ? 'PUBLISHED' : 'DRAFT',
      `Restored from revision #${revision.revisionNumber}`,
    );

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        draftVersion: rollbackRevisionNumber,
        publishedVersion: publish ? rollbackRevisionNumber : invitation.publishedVersion,
      },
    });

    await writeAuditLog({
      action: 'invitation.restore',
      entityType: 'invitation',
      entityId: invitation.id,
      actorId: actor.id,
      summary: `Restored invitation ${slug} from revision #${revision.revisionNumber}`,
      details: {
        restoredRevisionId: revision.id,
        restoredRevisionNumber: revision.revisionNumber,
        publish,
      },
      ip: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
    });

    return apiSuccess(
      {
        invitation: updated,
        revisionNumber: rollbackRevisionNumber,
        restoredFrom: revision.revisionNumber,
      },
      { message: 'تمت استعادة النسخة بنجاح.' },
    );
  } catch (error) {
    return apiError(error);
  }
}
