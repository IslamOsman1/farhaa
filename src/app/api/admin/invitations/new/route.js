import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    const invitation = await prisma.invitation.create({
      data: {
        title: data.title || `${data.groomName} & ${data.brideName}`,
        slug: data.slug,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        templateId: data.templateId,
        groomName: data.groomName,
        brideName: data.brideName,
        status: 'DRAFT',
      }
    });

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create invitation. Make sure slug is unique.' }, { status: 500 });
  }
}
