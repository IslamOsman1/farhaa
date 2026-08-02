import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const updateData = { status: data.status };
    if (data.status === 'PUBLISHED') {
      if (data.publishStartDate) updateData.publishStartDate = new Date(data.publishStartDate);
      if (data.publishEndDate) updateData.publishEndDate = new Date(data.publishEndDate);
    }

    const inv = await prisma.invitation.update({
      where: { id: params.id },
      data: updateData
    });
    return NextResponse.json({ success: true, invitation: inv });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
