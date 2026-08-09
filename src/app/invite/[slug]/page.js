import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import RenderFrame from '@/components/invitation/RenderFrame';
import {
  buildInvitationRenderConfig,
  getOpeningBySlug,
  getTemplateManifest,
} from '@/lib/template-system';
import {
  generateEntryPassQrDataUrl,
  getEntryPassPublicLink,
  getEntryPassQrRoute,
  getEntryPassRemaining,
} from '@/lib/entry-pass';

export const dynamic = 'force-dynamic';

function firstParam(value) {
  return Array.isArray(value) ? (value[0] || '') : (value || '');
}

export default async function InvitationPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
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

  const entryToken = firstParam(resolvedSearchParams?.entry);
  let entryPassUi = null;

  if (entryToken) {
    const entryPass = await prisma.entryPass.findFirst({
      where: {
        invitationId: invitation.id,
        linkToken: entryToken,
        isEnabled: true,
        status: { not: 'CANCELLED' },
      },
      select: {
        id: true,
        passCode: true,
        passType: true,
        guestName: true,
        allowedEntries: true,
        usedEntries: true,
        linkToken: true,
        tableNumber: true,
      },
    });

    if (entryPass) {
      entryPassUi = {
        id: entryPass.id,
        passCode: entryPass.passCode,
        passType: entryPass.passType,
        guestName: entryPass.guestName || '',
        allowedEntries: entryPass.allowedEntries || 0,
        usedEntries: entryPass.usedEntries || 0,
        remainingEntries: getEntryPassRemaining(entryPass),
        tableNumber: entryPass.tableNumber || '',
        publicLink: getEntryPassPublicLink({ invitation, entryPass }),
        qrCodeViewUrl: getEntryPassQrRoute(entryPass.id),
        qrCodeDownloadUrl: getEntryPassQrRoute(entryPass.id, true),
        qrCodeDataUrl: await generateEntryPassQrDataUrl({ invitation, entryPass }),
      };
    }
  }

  const publicRenderConfig = {
    ...renderConfig,
    ui: {
      ...(renderConfig.ui || {}),
      showPromoBar: false,
      entryPass: entryPassUi,
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
