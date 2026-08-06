import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';

export async function GET(_request, { params }) {
  try {
    await requirePermission('invitations.view');
    const { id } = await params;
    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        client: true,
        template: true,
        gallery: true,
        schedule: true,
        rsvps: true,
        visits: true,
      },
    });

    if (!invitation) return apiError(new Error('Not found'), { status: 404 });
    return apiSuccess(invitation);
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    await requirePermission('invitations.edit');
    const { id } = await params;
    const data = await request.json();
    const invitation = await prisma.invitation.update({
      where: { id },
      data,
    });
    return apiSuccess(invitation);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    await requirePermission('invitations.delete');
    const { id } = await params;
    await prisma.invitation.delete({ where: { id } });
    return apiSuccess({ id });
  } catch (error) {
    return apiError(error);
  }
}
