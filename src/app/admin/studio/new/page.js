import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin-session';
import { scanTemplateStudioInventory } from '@/lib/studio-inventory';
import { getMergedOpenings } from '@/lib/template-records';
import { getStudioTemplateManifests } from '@/lib/template-diagnostics';
import StudioTemplateChooser from '../StudioTemplateChooser';

export const dynamic = 'force-dynamic';

export default async function NewStudioSessionPage() {
  try {
    await requirePermission('studio.create');
  } catch (error) {
    redirect('/admin/login');
  }

  const templates = getStudioTemplateManifests();
  const openings = await getMergedOpenings();
  const inventory = scanTemplateStudioInventory({ openings });

  return <StudioTemplateChooser templates={templates} inventory={inventory} />;
}
