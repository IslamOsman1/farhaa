import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const invitations = await prisma.invitation.findMany({
      include: {
        client: true,
        template: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(invitations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const invitation = await prisma.invitation.create({
      data: {
        title: data.title,
        slug: data.slug,
        clientId: data.clientId,
        templateId: data.templateId,
        packageId: data.packageId,
        language: data.language,
        status: data.status,
        eventDate: new Date(data.eventDate),
        eventVenue: data.eventVenue,
        eventLocation: data.eventLocation,
        groomName: data.groomName,
        brideName: data.brideName,
        welcomeText: data.welcomeText,
        story: data.story,
        themeConfig: data.themeConfig,
      }
    });
    return NextResponse.json(invitation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create invitation', details: error.message }, { status: 500 });
  }
}
