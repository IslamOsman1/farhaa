import { requirePermission } from '@/lib/admin-session';
import EntryPassesClient from './EntryPassesClient';

export const dynamic = 'force-dynamic';

export default async function InvitationEntryPassesPage({ params }) {
  await requirePermission('rsvps.manage');
  const { id } = await params;

  return <EntryPassesClient invitationId={id} />;
}
