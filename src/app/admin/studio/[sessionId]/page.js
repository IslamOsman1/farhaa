import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/admin-session';
import { getAllTemplateManifests, OPENING_LIBRARY } from '@/lib/template-system';
import { scanTemplateStudioInventory } from '@/lib/studio-inventory';
import { buildStudioDraftFromSession } from '@/lib/studio';
import StudioClient from '../StudioClient';

export const dynamic = 'force-dynamic';

export default async function StudioSessionPage({ params }) {
  try {
    await requirePermission('studio.edit');
  } catch (error) {
    redirect('/admin/login');
  }

  const resolvedParams = await params;
  const session = await prisma.studioSession.findUnique({
    where: { id: resolvedParams.sessionId },
    include: {
      baseTemplate: true,
      templateVariant: true,
    },
  });

  if (!session) {
    return notFound();
  }

  const manifests = getAllTemplateManifests();
  const currentManifest = manifests.find((item) => item.slug === session.baseTemplate.slug);
  if (!currentManifest) {
    return notFound();
  }

  const hydratedSession = {
    ...JSON.parse(JSON.stringify(session)),
    draft: buildStudioDraftFromSession({
      session,
      manifest: currentManifest,
    }),
  };

  return (
    <StudioClient
      session={hydratedSession}
      manifests={manifests}
      openings={OPENING_LIBRARY}
      inventory={scanTemplateStudioInventory()}
    />
  );
}
