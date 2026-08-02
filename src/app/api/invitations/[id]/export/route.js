import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { stringify } from 'csv-stringify/sync';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rsvps = await prisma.rSVP.findMany({
      where: { invitationId: params.id },
      orderBy: { createdAt: 'desc' }
    });

    const records = rsvps.map(rsvp => ({
      Name: rsvp.name,
      Email: rsvp.email || '',
      Phone: rsvp.phone || '',
      Status: rsvp.status,
      Guests: rsvp.guestsCount,
      Message: rsvp.message || '',
      Date: rsvp.createdAt.toISOString()
    }));

    const csv = stringify(records, { header: true });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="rsvps-${params.id}.csv"`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export RSVPs' }, { status: 500 });
  }
}
