import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        template: { select: { name: true } },
        _count: {
          select: { rsvps: true, visits: true }
        }
      }
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }
}
