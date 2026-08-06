import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';

export async function GET() {
  try {
    await requirePermission('analytics.view');

    const [totalInvitations, activeInvitations, totalRSVPs, confirmedRSVPs, totalVisits, totalClients] = await Promise.all([
      prisma.invitation.count(),
      prisma.invitation.count({ where: { status: 'PUBLISHED' } }),
      prisma.rSVP.count(),
      prisma.rSVP.count({ where: { status: 'CONFIRMED' } }),
      prisma.visit.count(),
      prisma.client.count(),
    ]);

    return apiSuccess({
      invitations: { total: totalInvitations, active: activeInvitations },
      rsvps: { total: totalRSVPs, confirmed: confirmedRSVPs },
      visits: { total: totalVisits },
      clients: { total: totalClients },
    });
  } catch (error) {
    return apiError(error);
  }
}
