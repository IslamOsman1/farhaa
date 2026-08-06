import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { writeAuditLog } from '@/lib/admin-security';

export async function DELETE(_request, { params }) {
  try {
    const actor = await requirePermission('invitations.delete');
    const { id } = await params;
    const existing = await prisma.invitation.findUnique({ where: { id } });

    if (!existing) {
      return apiError(new Error('الدعوة غير موجودة.'), { status: 404 });
    }

    await prisma.invitation.delete({ where: { id } });

    await writeAuditLog({
      action: 'invitation.delete',
      entityType: 'invitation',
      entityId: id,
      actorId: actor.id,
      summary: `Deleted invitation ${existing.slug}`,
      details: existing,
    });

    return apiSuccess({ id }, { message: 'تم حذف الدعوة.' });
  } catch (error) {
    return apiError(error);
  }
}
