import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    await requirePermission('invitations.view');
    const { slug } = await params;
    const invitation = await prisma.invitation.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!invitation) {
      return apiError(new Error('الدعوة غير موجودة.'), { status: 404 });
    }

    const revisions = await prisma.invitationRevision.findMany({
      where: { invitationId: invitation.id },
      orderBy: { revisionNumber: 'desc' },
      take: 50,
    });

    return apiSuccess(revisions);
  } catch (error) {
    return apiError(error);
  }
}
