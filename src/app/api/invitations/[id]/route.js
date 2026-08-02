import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const invitation = await prisma.invitation.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        template: true,
        package: true,
        gallery: true,
        schedule: true,
        rsvps: true,
        visits: true,
      }
    });

    if (!invitation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(invitation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invitation' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const updateData = { ...data };
    if (updateData.eventDate) {
      updateData.eventDate = new Date(updateData.eventDate);
    }

    const invitation = await prisma.invitation.update({
      where: { id: params.id },
      data: updateData
    });
    return NextResponse.json(invitation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update invitation', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.invitation.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete invitation' }, { status: 500 });
  }
}
