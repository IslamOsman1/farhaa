import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import StudioClient from '@/app/admin/studio/StudioClient';
import { requireAdminSession } from '@/lib/admin-session';
import { getMergedOpenings } from '@/lib/template-records';
import {
  getAllTemplateManifests,
  getTemplateManifest,
} from '@/lib/template-system';
import { scanTemplateStudioInventory } from '@/lib/studio-inventory';
import {
  buildStudioDraftFromSession,
  buildStudioSessionUpdateData,
  createStudioDraftFromInvitation,
} from '@/lib/studio';

export const dynamic = 'force-dynamic';

export default async function EditInvitationPage({ params }) {
  let actor;
  try {
    actor = await requireAdminSession('manageInvitations');
  } catch (error) {
    redirect('/admin/login');
  }

  const resolvedParams = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      template: true,
      opening: true,
      revisions: {
        orderBy: { revisionNumber: 'desc' },
        take: 10,
      },
    },
  });

  if (!invitation) {
    return notFound();
  }

  const manifest = getTemplateManifest(invitation.template?.slug);
  if (!manifest) {
    return notFound();
  }

  let session = await prisma.studioSession.findFirst({
    where: { invitationId: invitation.id },
    include: {
      baseTemplate: true,
      templateVariant: true,
    },
  });

  if (!session) {
    const draft = createStudioDraftFromInvitation({ invitation, manifest });
    const updateData = buildStudioSessionUpdateData({
      manifest,
      draft,
      openingId: invitation.openingId || invitation.opening?.id || null,
      invitationId: invitation.id,
    });

    session = await prisma.studioSession.create({
      data: {
        adminId: actor.id,
        invitationId: invitation.id,
        baseTemplateId: invitation.template.id,
        templateVariantId: invitation.templateVariantId || null,
        name: `تحرير ${invitation.slug}`,
        status: 'DRAFT',
        selectedOpeningId: invitation.openingId || invitation.opening?.id || null,
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
  } else {
    const draft = createStudioDraftFromInvitation({ invitation, manifest });
    const updateData = buildStudioSessionUpdateData({
      manifest,
      draft,
      openingId: invitation.openingId || invitation.opening?.id || null,
      invitationId: invitation.id,
    });

    session = await prisma.studioSession.update({
      where: { id: session.id },
      data: {
        baseTemplateId: invitation.template.id,
        templateVariantId: invitation.templateVariantId || null,
        name: `تحرير ${invitation.slug}`,
        selectedOpeningId: invitation.openingId || invitation.opening?.id || null,
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
  }

  const openings = await getMergedOpenings();
  const manifests = getAllTemplateManifests();
  const sessionManifest = manifests.find((item) => item.slug === session.baseTemplate.slug) || manifest;
  const hydratedSession = {
    ...JSON.parse(JSON.stringify(session)),
    draft: buildStudioDraftFromSession({
      session,
      manifest: sessionManifest,
    }),
  };

  return (
    <StudioClient
      session={hydratedSession}
      existingInvitation={JSON.parse(JSON.stringify(invitation))}
      mode="invitation"
      manifests={manifests}
      openings={openings}
      inventory={scanTemplateStudioInventory({ openings })}
    />
  );
}
