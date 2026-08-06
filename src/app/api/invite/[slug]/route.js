import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { slug: params.slug },
      include: {
        template: true,
        gallery: {
          orderBy: { sortOrder: 'asc' }
        },
        schedule: {
          orderBy: { time: 'asc' }
        },
        _count: {
          select: { rsvps: true, visits: true }
        }
      }
    });

    if (!invitation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    if (!['ACTIVE', 'PUBLISHED'].includes(invitation.status)) {
      return NextResponse.json({ error: 'Invitation not active' }, { status: 403 });
    }

    return NextResponse.json(invitation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invitation' }, { status: 500 });
  }
}
