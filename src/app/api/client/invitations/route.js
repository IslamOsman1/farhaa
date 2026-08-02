import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = session.user.id;

  const invitations = await prisma.invitation.findMany({
    where: { clientId },
    include: {
      rsvps: true,
      visits: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalInvitations = invitations.length;
  const totalRsvps = invitations.reduce((acc, inv) => acc + inv.rsvps.length, 0);
  const totalVisits = invitations.reduce((acc, inv) => acc + inv.visits.length, 0);

  return NextResponse.json({
    invitations,
    stats: {
      totalInvitations,
      totalRsvps,
      totalVisits
    }
  });
}
