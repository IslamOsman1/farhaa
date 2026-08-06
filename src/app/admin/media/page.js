import { requirePermission } from '@/lib/admin-session';
import MediaLibraryClient from './MediaLibraryClient';

export const dynamic = 'force-dynamic';

export default async function AdminMediaPage() {
  await requirePermission('media.view');
  return <MediaLibraryClient />;
}
