import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { scanTemplateStudioInventory } from '@/lib/studio-inventory';
import { getMergedOpenings } from '@/lib/template-records';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requirePermission('studio.view');
    const openings = await getMergedOpenings();
    return apiSuccess(scanTemplateStudioInventory({ openings }));
  } catch (error) {
    return apiError(error);
  }
}
