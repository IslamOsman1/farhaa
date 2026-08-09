import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import CheckInClient from './CheckInClient';

export const dynamic = 'force-dynamic';

export default async function InvitationCheckInPage({ params }) {
  const { slug } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      groomName: true,
      brideName: true,
      weddingDate: true,
      entryConfig: true,
    },
  });

  if (!invitation) {
    notFound();
  }

  const entryConfig =
    invitation.entryConfig && typeof invitation.entryConfig === 'object' && !Array.isArray(invitation.entryConfig)
      ? invitation.entryConfig
      : {};

  return (
    <CheckInClient
      initialInvitation={{
        id: invitation.id,
        slug: invitation.slug,
        groomName: invitation.groomName || '',
        brideName: invitation.brideName || '',
        weddingDate: invitation.weddingDate ? invitation.weddingDate.toISOString() : '',
        entryConfig: {
          enabled: entryConfig.enabled !== false,
          pinRequired: Boolean(String(entryConfig.staffPin || '').trim()),
          gateLabelDefault: String(entryConfig.gateLabelDefault || ''),
        },
      }}
    />
  );
}
