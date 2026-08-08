import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/admin-session';
import { generateRsvpQrSvg, getRsvpQrDownloadName, getRsvpQrRoute } from '@/lib/rsvp-qr';

function escapeCsv(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function GET(request, { params }) {
  try {
    await requirePermission('rsvps.manage');
    const { id } = await params;
    const format = request.nextUrl.searchParams.get('format') || 'csv';

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        groomName: true,
        brideName: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    }

    const rsvps = await prisma.rSVP.findMany({
      where: { invitationId: id },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'comments') {
      const headers = ['الاسم', 'رقم الهاتف', 'التعليق', 'تاريخ الرد'];
      const csvRows = [headers.join(',')];

      for (const rsvp of rsvps.filter((item) => item.message && String(item.message).trim())) {
        csvRows.push([
          escapeCsv(rsvp.guestName),
          escapeCsv(rsvp.phone || ''),
          escapeCsv(rsvp.message || ''),
          escapeCsv(rsvp.createdAt.toISOString()),
        ].join(','));
      }

      return new NextResponse(`\uFEFF${csvRows.join('\n')}`, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="comments-${invitation.slug}.csv"`,
        },
      });
    }

    if (format === 'qr-html') {
      const cards = await Promise.all(rsvps.map(async (rsvp) => {
        const svg = await generateRsvpQrSvg({ invitation, rsvp });
        return `
          <article class="card">
            <div class="meta">
              <h2>${escapeHtml(rsvp.guestName)}</h2>
              <p>الحالة: ${escapeHtml(rsvp.status || 'confirmed')}</p>
              <p>المرافقون: ${escapeHtml(rsvp.companions || 0)}</p>
              <p>الهاتف: ${escapeHtml(rsvp.phone || '-')}</p>
              <p>التعليق: ${escapeHtml(rsvp.message || 'لا يوجد')}</p>
              <p>التاريخ: ${escapeHtml(new Date(rsvp.createdAt).toLocaleString('ar-EG'))}</p>
              <p class="hint">تحميل منفرد:
                <a href="${escapeHtml(getRsvpQrRoute(rsvp.id, true))}" target="_blank">${escapeHtml(getRsvpQrDownloadName({ invitation, rsvp, extension: 'svg' }))}</a>
              </p>
            </div>
            <div class="qr">${svg}</div>
          </article>
        `;
      }));

      const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>QR Codes - ${escapeHtml(invitation.groomName)} و ${escapeHtml(invitation.brideName)}</title>
  <style>
    body { font-family: Tajawal, Arial, sans-serif; margin: 24px; background: #f8f6f1; color: #1f2937; }
    h1 { margin: 0 0 8px; color: #7f2a1f; }
    p.top { margin: 0 0 24px; color: #6b7280; }
    .actions { margin-bottom: 24px; display: flex; gap: 12px; flex-wrap: wrap; }
    .actions button, .actions a { border: none; background: #7f2a1f; color: #fff; padding: 10px 16px; border-radius: 999px; text-decoration: none; cursor: pointer; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; }
    .card { background: #fff; border-radius: 20px; padding: 18px; box-shadow: 0 18px 40px rgba(15,23,42,0.08); display: grid; grid-template-columns: 1fr 180px; gap: 16px; align-items: center; }
    .meta h2 { margin: 0 0 10px; color: #111827; font-size: 22px; }
    .meta p { margin: 4px 0; font-size: 14px; }
    .hint a { color: #7f2a1f; }
    .qr svg { width: 100%; height: auto; display: block; background: #fff; border-radius: 14px; }
    @media print { .actions { display: none; } body { background: #fff; } .card { box-shadow: none; border: 1px solid #ddd; } }
    @media (max-width: 720px) { .card { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <h1>أكواد QR للحضور</h1>
  <p class="top">الدعوة: ${escapeHtml(invitation.groomName)} و ${escapeHtml(invitation.brideName)} - إجمالي الردود: ${rsvps.length}</p>
  <div class="actions">
    <button onclick="window.print()">طباعة / حفظ PDF</button>
    <a href="/api/admin/invitations/${escapeHtml(invitation.id)}/rsvps">تنزيل CSV الكامل</a>
    <a href="/api/admin/invitations/${escapeHtml(invitation.id)}/rsvps?format=comments">تنزيل التعليقات</a>
  </div>
  <section class="grid">${cards.join('')}</section>
</body>
</html>`;

      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="qr-codes-${invitation.slug}.html"`,
        },
      });
    }

    const headers = ['الاسم', 'رقم الهاتف', 'الإيميل', 'الحالة', 'عدد المرافقين', 'التعليق', 'تاريخ الرد', 'رابط QR'];
    const csvRows = [headers.join(',')];

    for (const rsvp of rsvps) {
      csvRows.push([
        escapeCsv(rsvp.guestName),
        escapeCsv(rsvp.phone || ''),
        escapeCsv(rsvp.email || ''),
        escapeCsv(rsvp.status || 'confirmed'),
        escapeCsv(rsvp.companions || 0),
        escapeCsv(rsvp.message || ''),
        escapeCsv(rsvp.createdAt.toISOString()),
        escapeCsv(getRsvpQrRoute(rsvp.id, true)),
      ].join(','));
    }

    return new NextResponse(`\uFEFF${csvRows.join('\n')}`, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rsvps-${invitation.slug}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch RSVPs' }, { status: error.status || 500 });
  }
}
