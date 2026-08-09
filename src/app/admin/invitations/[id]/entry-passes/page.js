import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/admin-session';
import { buildInvitationOwnerPortalPath, ensureInvitationOwnerPortalToken } from '@/lib/owner-portal';
import EntryPassesClient from './EntryPassesClient';

export const dynamic = 'force-dynamic';

export default async function InvitationEntryPassesPage({ params }) {
  await requirePermission('rsvps.manage');
  const { id } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { id },
    select: {
      id: true,
      shareConfig: true,
    },
  });

  if (!invitation) {
    return <div className="admin-card">الدعوة غير موجودة.</div>;
  }

  const ownerPortalToken = await ensureInvitationOwnerPortalToken(invitation.id, invitation.shareConfig);
  const ownerOverviewPath = buildInvitationOwnerPortalPath({
    invitationId: invitation.id,
    token: ownerPortalToken,
  });
  const ownerEntryPassesPath = buildInvitationOwnerPortalPath({
    invitationId: invitation.id,
    token: ownerPortalToken,
    section: 'entry-passes',
  });

  return (
    <EntryPassesClient
      invitationId={id}
      ownerOverviewPath={ownerOverviewPath}
      ownerEntryPassesPath={ownerEntryPassesPath}
    />
  );
}
