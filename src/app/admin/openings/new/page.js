import { requirePermission } from '@/lib/admin-session';
import { getAllTemplateManifests } from '@/lib/template-system';
import OpeningForm from '../OpeningForm';

export default async function NewOpeningPage() {
  await requirePermission('openings.create');

  return <OpeningForm mode="create" templateOptions={getAllTemplateManifests()} />;
}
