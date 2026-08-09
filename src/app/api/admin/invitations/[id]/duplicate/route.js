import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { writeAuditLog } from '@/lib/admin-security';
import { duplicateInvitationById } from '@/lib/invitation-admin';

export async function POST(_request, { params }) {
  try {
    const actor = await requirePermission('invitations.create');
    const { id } = await params;

    const duplicatedInvitation = await duplicateInvitationById(id, actor.id);
    if (!duplicatedInvitation) {
      return apiError(new Error('الدعوة غير موجودة.'), { status: 404 });
    }

    await writeAuditLog({
      action: 'invitation.duplicate',
      entityType: 'invitation',
      entityId: duplicatedInvitation.id,
      actorId: actor.id,
      summary: `Duplicated invitation ${duplicatedInvitation.slug}`,
      details: {
        sourceInvitationId: id,
        duplicatedInvitationId: duplicatedInvitation.id,
        duplicatedSlug: duplicatedInvitation.slug,
      },
    });

    return apiSuccess(
      {
        invitation: duplicatedInvitation,
        editUrl: `/edit/${duplicatedInvitation.slug}`,
        publicUrl: `/invite/${duplicatedInvitation.slug}`,
      },
      {
        status: 201,
        message: 'تم إنشاء نسخة مستقلة من الدعوة بنجاح.',
      },
    );
  } catch (error) {
    return apiError(error);
  }
}
