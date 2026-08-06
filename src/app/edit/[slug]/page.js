import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import EditorClient from './EditorClient';
import { requireAdminSession } from '@/lib/admin-session';
import {
  buildInvitationRenderConfig,
  getAllTemplateManifests,
  getOpeningBySlug,
  getTemplateManifest,
  normalizeInvitationData,
  OPENING_LIBRARY,
} from '@/lib/template-system';

export const dynamic = 'force-dynamic';

export default async function EditInvitationPage({ params }) {
  try {
    await requireAdminSession('manageInvitations');
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

  const normalized = normalizeInvitationData(invitation);
  const opening = invitation.opening || getOpeningBySlug('native-template');
  const renderConfig = buildInvitationRenderConfig({
    invitation,
    manifest,
    opening,
    preview: true,
  });

  return (
    <EditorClient
      invitation={JSON.parse(JSON.stringify(invitation))}
      manifest={manifest}
      manifests={getAllTemplateManifests()}
      openings={OPENING_LIBRARY}
      normalized={normalized}
      initialRenderConfig={renderConfig}
    />
  );
}
