import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/admin-session';
import RenderFrame from '@/components/invitation/RenderFrame';
import { getOpeningBySlug, getTemplateManifest } from '@/lib/template-system';
import { buildStudioDraftFromSession, buildStudioRenderPayload } from '@/lib/studio';

export const dynamic = 'force-dynamic';

export default async function StudioPreviewPage({ params }) {
  try {
    await requirePermission('studio.view');
  } catch (error) {
    redirect('/admin/login');
  }

  const resolvedParams = await params;
  const session = await prisma.studioSession.findUnique({
    where: { id: resolvedParams.sessionId },
    include: {
      baseTemplate: true,
    },
  });

  if (!session) {
    return notFound();
  }

  const manifest = getTemplateManifest(session.baseTemplate.slug);
  if (!manifest) {
    return notFound();
  }

  const draft = buildStudioDraftFromSession({ session, manifest });
  const opening = getOpeningBySlug(draft.openingSlug);
  const { renderConfig } = buildStudioRenderPayload({ session, manifest, opening });

  return (
    <div className="studio-fullscreen-preview">
      <div className="studio-fullscreen-bar">
        <div>
          <strong>{session.name}</strong>
          <span>{manifest.nameAr}</span>
        </div>
        <Link href={`/admin/studio/${session.id}`} className="mini-btn">
          العودة للاستوديو
        </Link>
      </div>
      <div className="studio-fullscreen-body">
        <RenderFrame
          templateSlug={manifest.slug}
          renderConfig={renderConfig}
          manifest={manifest}
          className="studio-fullscreen-frame-wrap"
          frameClassName="studio-fullscreen-frame"
          disablePromoBar
          disableOpening
        />
      </div>
    </div>
  );
}
