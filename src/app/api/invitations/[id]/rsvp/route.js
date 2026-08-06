import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';

export async function GET(_request, { params }) {
  try {
    await requirePermission('rsvps.manage');
    const { id } = await params;
    const rsvps = await prisma.rSVP.findMany({
      where: { invitationId: id },
      orderBy: { createdAt: 'desc' },
    });
    return apiSuccess(rsvps);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request, { params }) {
  try {
    await requirePermission('rsvps.manage');
    const { id } = await params;
    const data = await request.json();
    const rsvp = await prisma.rSVP.create({
      data: {
        invitationId: id,
        guestName: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        companions: parseInt(data.guestsCount, 10) || 1,
        message: data.message,
      },
    });
    return apiSuccess(rsvp, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
