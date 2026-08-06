import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import RenderFrame from '@/components/invitation/RenderFrame';
import {
  buildInvitationRenderConfig,
  getOpeningBySlug,
  getTemplateManifest,
} from '@/lib/template-system';

export const dynamic = 'force-dynamic';

export default async function InvitationPage({ params }) {
  const resolvedParams = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      template: true,
      opening: true,
    },
  });

  if (!invitation) {
    return notFound();
  }

  const manifest = getTemplateManifest(invitation.template?.slug);
  if (!manifest) {
    return notFound();
  }

  const opening = invitation.opening || getOpeningBySlug('native-template');
  const renderConfig = buildInvitationRenderConfig({
    invitation,
    manifest,
    opening,
    preview: false,
  });
  const publicRenderConfig = {
    ...renderConfig,
    ui: {
      ...(renderConfig.ui || {}),
      showPromoBar: false,
    },
  };

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', background: '#f5efe8' }}>
      <RenderFrame
        templateSlug={manifest.slug}
        manifest={manifest}
        renderConfig={publicRenderConfig}
        className=""
        frameClassName=""
      />
    </div>
  );
}
