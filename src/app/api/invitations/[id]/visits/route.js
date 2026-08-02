import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    const visit = await prisma.visit.create({
      data: {
        invitationId: params.id,
        ipAddress: ip,
        userAgent: userAgent,
        device: body.device || 'Unknown',
        referer: request.headers.get('referer') || 'Unknown',
      }
    });
    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to track visit' }, { status: 500 });
  }
}
