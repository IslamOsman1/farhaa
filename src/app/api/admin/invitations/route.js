import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';

export async function GET() {
  try {
    await requirePermission('invitations.view');

    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        template: { select: { name: true, nameAr: true } },
        _count: {
          select: { rsvps: true, visits: true },
        },
      },
    });

    return apiSuccess({ invitations });
  } catch (error) {
    return apiError(error);
  }
}
