import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rsvps = await prisma.rSVP.findMany({
      where: { invitationId: params.id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(rsvps);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch RSVPs' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const data = await request.json();
    const rsvp = await prisma.rSVP.create({
      data: {
        invitationId: params.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        guestsCount: parseInt(data.guestsCount) || 1,
        message: data.message
      }
    });
    return NextResponse.json(rsvp, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit RSVP', details: error.message }, { status: 500 });
  }
}
