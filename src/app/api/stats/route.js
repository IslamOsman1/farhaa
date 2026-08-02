import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [
      totalInvitations,
      activeInvitations,
      totalRSVPs,
      confirmedRSVPs,
      totalVisits,
      totalClients
    ] = await Promise.all([
      prisma.invitation.count(),
      prisma.invitation.count({ where: { status: 'ACTIVE' } }),
      prisma.rSVP.count(),
      prisma.rSVP.count({ where: { status: 'CONFIRMED' } }),
      prisma.visit.count(),
      prisma.client.count()
    ]);

    return NextResponse.json({
      invitations: { total: totalInvitations, active: activeInvitations },
      rsvps: { total: totalRSVPs, confirmed: confirmedRSVPs },
      visits: { total: totalVisits },
      clients: { total: totalClients }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
