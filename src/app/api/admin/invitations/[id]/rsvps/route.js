import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/admin-session';

export async function GET(_request, { params }) {
  try {
    await requirePermission('rsvps.manage');
    const { id } = await params;
    const rsvps = await prisma.rSVP.findMany({
      where: { invitationId: id },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['الاسم', 'رقم الهاتف', 'الإيميل', 'عدد المرافقين', 'الرسالة/التعليق', 'تاريخ الرد'];
    const csvRows = [headers.join(',')];

    for (const r of rsvps) {
      const row = [
        `"${r.guestName || ''}"`,
        `"${r.phone || ''}"`,
        `"${r.email || ''}"`,
        r.companions || 0,
        `"${(r.message || '').replace(/"/g, '""')}"`,
        `"${r.createdAt.toISOString().split('T')[0]}"`,
      ];
      csvRows.push(row.join(','));
    }

    return new NextResponse(`\uFEFF${csvRows.join('\n')}`, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="rsvps.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch RSVPs' }, { status: error.status || 500 });
  }
}
