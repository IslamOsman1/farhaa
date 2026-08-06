import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { summarizeRevisionDiff } from '@/lib/revision-utils';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    await requirePermission('invitations.view');
    const { slug } = await params;
    const searchParams = new URL(request.url).searchParams;
    const fromId = searchParams.get('from');
    const toId = searchParams.get('to');

    if (!fromId || !toId) {
      return apiError(new Error('يجب تحديد نسختين للمقارنة.'), { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!invitation) {
      return apiError(new Error('الدعوة غير موجودة.'), { status: 404 });
    }

    const [fromRevision, toRevision] = await Promise.all([
      prisma.invitationRevision.findUnique({ where: { id: fromId } }),
      prisma.invitationRevision.findUnique({ where: { id: toId } }),
    ]);

    if (!fromRevision || !toRevision) {
      return apiError(new Error('إحدى النسختين غير موجودة.'), { status: 404 });
    }

    return apiSuccess({
      fromRevision,
      toRevision,
      diff: summarizeRevisionDiff(fromRevision.snapshot, toRevision.snapshot),
    });
  } catch (error) {
    return apiError(error);
  }
}
