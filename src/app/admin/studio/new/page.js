import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin-session';
import { getAllTemplateManifests } from '@/lib/template-system';
import { scanTemplateStudioInventory } from '@/lib/studio-inventory';
import StudioTemplateChooser from '../StudioTemplateChooser';

export const dynamic = 'force-dynamic';

export default async function NewStudioSessionPage() {
  try {
    await requirePermission('studio.create');
  } catch (error) {
    redirect('/admin/login');
  }

  const templates = getAllTemplateManifests();
  const inventory = scanTemplateStudioInventory();

  return <StudioTemplateChooser templates={templates} inventory={inventory} />;
}
