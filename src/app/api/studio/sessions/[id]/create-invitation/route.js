import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { writeAuditLog } from '@/lib/admin-security';
import { getRequestIp, getRequestUserAgent } from '@/lib/request-utils';
import { ensureOpeningBySlug } from '@/lib/template-records';
import { buildStudioDraftFromSession, studioInvitationSchema } from '@/lib/studio';

export const dynamic = 'force-dynamic';

function buildLegacyStory(contentConfig) {
  return {
    verseText: contentConfig.verseText || '',
    invitationText: contentConfig.invitationText || '',
    groomParentsLabel: contentConfig.groomParentsLabel || '',
    groomParents: contentConfig.groomParents || '',
    brideParentsLabel: contentConfig.brideParentsLabel || '',
    brideParents: contentConfig.brideParents || '',
    closingNote: contentConfig.closingNote || '',
    closingHashtag: contentConfig.closingHashtag || '',
    closingFamilies: contentConfig.closingFamilies || '',
    locationLink: contentConfig.locationLink || '',
    program: Array.isArray(contentConfig.program) ? contentConfig.program : [],
    notes: Array.isArray(contentConfig.notes) ? contentConfig.notes : [],
    contactLabel: contentConfig.contactLabel || '',
    contactName: contentConfig.contactName || '',
    contactPhone: contentConfig.contactPhone || '',
    venueImage: contentConfig.venueImage || '',
    galleryImages: Array.isArray(contentConfig.galleryImages) ? contentConfig.galleryImages : [],
  };
}

async function createInitialRevision({ invitationId, snapshot, actorId }) {
  await prisma.invitationRevision.create({
    data: {
      invitationId,
      revisionNumber: 1,
      snapshot,
      status: 'DRAFT',
      createdBy: actorId,
      changeSummary: 'Created from Template Studio',
    },
  });
}

export async function POST(request, { params }) {
  try {
    const actor = await requirePermission('studio.createInvitation');
    const resolvedParams = await params;
    const payload = studioInvitationSchema.parse(await request.json());

    const session = await prisma.studioSession.findUnique({
      where: { id: resolvedParams.id },
      include: {
        baseTemplate: true,
        templateVariant: true,
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
    const contentConfig = {
      ...(session.content || {}),
      ...(session.assets || {}),
    };
    const themeConfig = session.config?.themeConfig || {};
    const sectionConfig = session.config?.sectionConfig || {};
    const openingConfig = session.selectedOpeningConfig || session.config?.openingConfig || {};
    const legacyStory = buildLegacyStory(contentConfig);

    const invitation = await prisma.invitation.create({
      data: {
        slug: payload.slug,
        title: payload.title || `${contentConfig.groomName || ''} & ${contentConfig.brideName || ''}`.trim() || payload.slug,
        clientName: payload.clientName,
        clientPhone: payload.clientPhone || null,
        templateId: session.baseTemplateId,
        templateVariantId: session.templateVariantId,
        studioSessionId: session.id,
        openingId: opening.id,
        groomName: contentConfig.groomName || '',
        brideName: contentConfig.brideName || '',
        weddingDate: contentConfig.weddingDate ? new Date(contentConfig.weddingDate) : null,
        venueName: contentConfig.venueName || null,
        venueAddress: contentConfig.venueAddress || null,
        welcomeMessage: contentConfig.welcomeMessage || null,
        musicUrl: contentConfig.musicUrl || null,
        coverImage: contentConfig.venueImage || null,
        status: 'DRAFT',
        contentConfig,
        themeConfig,
        sectionConfig,
        openingConfig,
        coupleStory: JSON.stringify(legacyStory),
        customColors: JSON.stringify(themeConfig),
        customFonts: JSON.stringify(themeConfig),
        sections: JSON.stringify(sectionConfig),
        updatedBy: actor.id,
      },
    });

    await createInitialRevision({
      invitationId: invitation.id,
      actorId: actor.id,
      snapshot: {
        studioSessionId: session.id,
        templateSlug: session.baseTemplate.slug,
        openingSlug: draft.openingSlug,
        contentConfig,
        themeConfig,
        sectionConfig,
        openingConfig,
      },
    });

    await prisma.studioSession.update({
      where: { id: session.id },
      data: {
        invitationId: invitation.id,
      },
    });

    await writeAuditLog({
      action: 'studio.invitation.create',
      entityType: 'invitation',
      entityId: invitation.id,
      actorId: actor.id,
      summary: `Created invitation ${invitation.slug} from studio`,
      details: {
        studioSessionId: session.id,
        templateVariantId: session.templateVariantId,
      },
      ip: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
    });

    return apiSuccess(
      {
        invitation,
        editUrl: `/edit/${invitation.slug}`,
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
