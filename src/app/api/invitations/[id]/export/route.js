import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stringify } from 'csv-stringify/sync';
import { requirePermission } from '@/lib/admin-session';

export async function GET(_request, { params }) {
  try {
    await requirePermission('rsvps.manage');
    const { id } = await params;

    const rsvps = await prisma.rSVP.findMany({
      where: { invitationId: id },
      orderBy: { createdAt: 'desc' },
    });

    const records = rsvps.map((rsvp) => ({
      Name: rsvp.guestName,
      Email: rsvp.email || '',
      Phone: rsvp.phone || '',
      Status: rsvp.status,
      Guests: rsvp.companions,
      Message: rsvp.message || '',
      Date: rsvp.createdAt.toISOString(),
    }));

    const csv = stringify(records, { header: true });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="rsvps-${id}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to export RSVPs' }, { status: error.status || 500 });
  }
}
