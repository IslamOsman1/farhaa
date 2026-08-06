import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { scanTemplateStudioInventory } from '@/lib/studio-inventory';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requirePermission('studio.view');
    return apiSuccess(scanTemplateStudioInventory());
  } catch (error) {
    return apiError(error);
  }
}
