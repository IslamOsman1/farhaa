import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import {
  createAnonymousEntryPasses,
  generateEntryPassQrSvg,
  getEntryPassDerivedStatus,
  getEntryPassDownloadName,
  getEntryPassPublicLink,
  getEntryPassQrRoute,
  getEntryPassRemaining,
} from '@/lib/entry-pass';

const createAnonymousSchema = z.object({
  count: z.coerce.number().int().min(1).max(500),
  allowedEntries: z.coerce.number().int().min(1).max(50).default(1),
  tableNumber: z.string().trim().max(80).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});

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

function serializePass(invitation, entryPass) {
  const remainingEntries = getEntryPassRemaining(entryPass);
  return {
    id: entryPass.id,
    passCode: entryPass.passCode,
    passType: entryPass.passType,
    guestName: entryPass.guestName || '',
    phone: entryPass.phone || '',
    tableNumber: entryPass.tableNumber || '',
    notes: entryPass.notes || '',
    allowedEntries: entryPass.allowedEntries || 0,
    usedEntries: entryPass.usedEntries || 0,
    remainingEntries,
    status: getEntryPassDerivedStatus(entryPass),
    isEnabled: entryPass.isEnabled !== false,
    publicLink: getEntryPassPublicLink({ invitation, entryPass }),
    qrCodeViewUrl: getEntryPassQrRoute(entryPass.id),
    qrCodeDownloadUrl: getEntryPassQrRoute(entryPass.id, true),
    createdAt: entryPass.createdAt,
    rsvpId: entryPass.rsvpId || null,
  };
}

function serializeCheckInLog(log) {
  return {
    id: log.id,
    checkedInCount: log.checkedInCount || 0,
    remainingAfter: log.remainingAfter || 0,
    gateLabel: log.gateLabel || '',
    deviceLabel: log.deviceLabel || '',
    staffName: log.staffName || '',
    staffCode: log.staffCode || '',
    sourceIp: log.sourceIp || '',
    userAgent: log.userAgent || '',
    createdAt: log.createdAt,
    entryPass: log.entryPass
      ? {
          id: log.entryPass.id,
          passCode: log.entryPass.passCode,
          guestName: log.entryPass.guestName || '',
          allowedEntries: log.entryPass.allowedEntries || 0,
          usedEntries: log.entryPass.usedEntries || 0,
          remainingEntries: getEntryPassRemaining(log.entryPass),
          status: getEntryPassDerivedStatus(log.entryPass),
        }
      : null,
  };
}

export async function GET(request, { params }) {
  try {
    await requirePermission('rsvps.manage');
    const { id } = await params;
    const format = request.nextUrl.searchParams.get('format') || 'json';

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        groomName: true,
        brideName: true,
        entryPasses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!invitation) {
      return apiError(new Error('Invitation not found.'), { status: 404 });
    }

    const recentLogs = await prisma.entryCheckInLog.findMany({
      where: { invitationId: invitation.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        entryPass: {
          select: {
            id: true,
            passCode: true,
            guestName: true,
            allowedEntries: true,
            usedEntries: true,
            isEnabled: true,
            status: true,
          },
        },
      },
    });

    const passes = invitation.entryPasses.map((entryPass) => serializePass(invitation, entryPass));
    const summary = {
      totalPasses: passes.length,
      namedPasses: passes.filter((item) => item.passType === 'NAMED').length,
      anonymousPasses: passes.filter((item) => item.passType === 'ANONYMOUS').length,
      totalAllowedEntries: passes.reduce((sum, item) => sum + item.allowedEntries, 0),
      totalUsedEntries: passes.reduce((sum, item) => sum + item.usedEntries, 0),
      remainingEntries: passes.reduce((sum, item) => sum + item.remainingEntries, 0),
      disabledPasses: passes.filter((item) => item.status === 'DISABLED' || item.status === 'CANCELLED').length,
      fullyUsedPasses: passes.filter((item) => item.status === 'USED').length,
      partiallyUsedPasses: passes.filter((item) => item.status === 'PARTIAL').length,
      totalCheckInEvents: recentLogs.length,
      totalCheckedInGuests: recentLogs.reduce((sum, item) => sum + Number(item.checkedInCount || 0), 0),
    };

    if (format === 'logs-csv') {
      const headers = [
        'Timestamp',
        'Pass Code',
        'Guest Name',
        'Checked In Count',
        'Remaining After',
        'Gate Label',
        'Device Label',
        'Staff Name',
        'Staff Code',
        'Source IP',
      ];
      const csvRows = [headers.join(',')];

      for (const log of recentLogs) {
        csvRows.push([
          escapeCsv(log.createdAt?.toISOString?.() || ''),
          escapeCsv(log.entryPass?.passCode || ''),
          escapeCsv(log.entryPass?.guestName || ''),
          escapeCsv(log.checkedInCount || 0),
          escapeCsv(log.remainingAfter || 0),
          escapeCsv(log.gateLabel || ''),
          escapeCsv(log.deviceLabel || ''),
          escapeCsv(log.staffName || ''),
          escapeCsv(log.staffCode || ''),
          escapeCsv(log.sourceIp || ''),
        ].join(','));
      }

      return new NextResponse(`\uFEFF${csvRows.join('\n')}`, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="entry-checkins-${invitation.slug}.csv"`,
        },
      });
    }

    if (format === 'csv') {
      const headers = [
        'Pass Code',
        'Type',
        'Guest Name',
        'Phone',
        'Allowed Entries',
        'Used Entries',
        'Remaining Entries',
        'Status',
        'Table Number',
        'Notes',
        'Public Link',
        'QR Link',
      ];
      const csvRows = [headers.join(',')];

      for (const pass of passes) {
        csvRows.push([
          escapeCsv(pass.passCode),
          escapeCsv(pass.passType),
          escapeCsv(pass.guestName),
          escapeCsv(pass.phone),
          escapeCsv(pass.allowedEntries),
          escapeCsv(pass.usedEntries),
          escapeCsv(pass.remainingEntries),
          escapeCsv(pass.status),
          escapeCsv(pass.tableNumber),
          escapeCsv(pass.notes),
          escapeCsv(pass.publicLink),
          escapeCsv(pass.qrCodeDownloadUrl),
        ].join(','));
      }

      return new NextResponse(`\uFEFF${csvRows.join('\n')}`, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="entry-passes-${invitation.slug}.csv"`,
        },
      });
    }

    if (format === 'qr-html') {
      const cards = await Promise.all(invitation.entryPasses.map(async (entryPass) => {
        const serialized = serializePass(invitation, entryPass);
        const svg = await generateEntryPassQrSvg({ invitation, entryPass });

        return `
          <article class="card">
            <div class="meta">
              <h2>${escapeHtml(serialized.guestName || serialized.passCode)}</h2>
              <p>الرمز: ${escapeHtml(serialized.passCode)}</p>
              <p>النوع: ${escapeHtml(serialized.passType)}</p>
              <p>الحالة: ${escapeHtml(serialized.status)}</p>
              <p>الدخول المسموح: ${escapeHtml(serialized.allowedEntries)}</p>
              <p>المستخدم: ${escapeHtml(serialized.usedEntries)}</p>
              <p>المتبقي: ${escapeHtml(serialized.remainingEntries)}</p>
              <p>الطاولة: ${escapeHtml(serialized.tableNumber || '-')}</p>
              <p class="hint">رابط الدعوة الفردي:
                <a href="${escapeHtml(serialized.publicLink)}" target="_blank">${escapeHtml(serialized.publicLink)}</a>
              </p>
              <p class="hint">تحميل منفرد:
                <a href="${escapeHtml(serialized.qrCodeDownloadUrl)}" target="_blank">${escapeHtml(getEntryPassDownloadName({ invitation, entryPass, extension: 'svg' }))}</a>
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
  <title>تصاريح الدخول - ${escapeHtml(invitation.groomName)} و ${escapeHtml(invitation.brideName)}</title>
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
    .hint a { color: #7f2a1f; word-break: break-all; }
    .qr svg { width: 100%; height: auto; display: block; background: #fff; border-radius: 14px; }
    @media print { .actions { display: none; } body { background: #fff; } .card { box-shadow: none; border: 1px solid #ddd; } }
    @media (max-width: 720px) { .card { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <h1>تصاريح الدخول و أكواد QR</h1>
  <p class="top">الدعوة: ${escapeHtml(invitation.groomName)} و ${escapeHtml(invitation.brideName)} - إجمالي التصاريح: ${passes.length}</p>
  <div class="actions">
    <button onclick="window.print()">طباعة / حفظ PDF</button>
    <a href="/api/admin/invitations/${escapeHtml(invitation.id)}/entry-passes?format=csv">تنزيل CSV</a>
  </div>
  <section class="grid">${cards.join('')}</section>
</body>
</html>`;

      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="entry-passes-${invitation.slug}.html"`,
        },
      });
    }

    return apiSuccess({
      invitation: {
        id: invitation.id,
        slug: invitation.slug,
        groomName: invitation.groomName,
        brideName: invitation.brideName,
      },
      checkInUrl: `/check-in/${invitation.slug}`,
      summary,
      entryPasses: passes,
      recentLogs: recentLogs.map(serializeCheckInLog),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request, { params }) {
  try {
    await requirePermission('rsvps.manage');
    const { id } = await params;
    const payload = createAnonymousSchema.parse(await request.json());

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
      },
    });

    if (!invitation) {
      return apiError(new Error('Invitation not found.'), { status: 404 });
    }

    const created = await createAnonymousEntryPasses({
      invitationId: invitation.id,
      count: payload.count,
      allowedEntries: payload.allowedEntries,
      tableNumber: payload.tableNumber,
      notes: payload.notes,
    });

    return apiSuccess({
      createdCount: created.length,
      entryPasses: created.map((entryPass) => serializePass(invitation, entryPass)),
    }, {
      status: 201,
      message: 'تم إنشاء تصاريح الدخول بنجاح.',
    });
  } catch (error) {
    return apiError(error);
  }
}
