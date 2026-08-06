import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';

export async function DELETE(_request, { params }) {
  try {
    await requirePermission('packages.manage');
    const { id } = await params;
    await prisma.package.delete({ where: { id } });
    return apiSuccess({ id }, { message: 'تم حذف الباقة.' });
  } catch (error) {
    return apiError(error);
  }
}
