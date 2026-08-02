import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rsvps = await prisma.rSVP.findMany({
      where: { invitationId: params.id },
      orderBy: { createdAt: 'desc' }
    });

    // Generate CSV string
    const headers = ['الاسم', 'رقم الهاتف', 'الإيميل', 'عدد المرافقين', 'الرسالة/التعليق', 'تاريخ الرد'];
    const csvRows = [headers.join(',')];

    for (const r of rsvps) {
      const row = [
        `"${r.guestName || ''}"`,
        `"${r.phone || ''}"`,
        `"${r.email || ''}"`,
        r.companions || 0,
        `"${(r.message || '').replace(/"/g, '""')}"`,
        `"${r.createdAt.toISOString().split('T')[0]}"`
      ];
      csvRows.push(row.join(','));
    }

    const csvData = csvRows.join('\n');
    const bom = '\uFEFF';

    return new NextResponse(bom + csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="rsvps.csv"'
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch RSVPs' }, { status: 500 });
  }
}
