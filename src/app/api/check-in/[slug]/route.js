import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import {
  consumeEntryPassCheckIn,
  findEntryPassByScan,
  getEntryConfig,
  getEntryPassDerivedStatus,
  getEntryPassRemaining,
  isEntryCheckInEnabled,
  isEntryCheckInPinValid,
  normalizeCheckInCount,
  parseEntryPassScanInput,
} from '@/lib/entry-pass';

const scanRequestSchema = z.object({
  pin: z.string().trim().optional().default(''),
  rawValue: z.string().trim().optional().default(''),
  passCode: z.string().trim().optional().default(''),
  checkedInCount: z.coerce.number().int().min(1).max(50).optional().default(1),
  gateLabel: z.string().trim().max(80).optional().default(''),
  deviceLabel: z.string().trim().max(120).optional().default(''),
  staffName: z.string().trim().max(120).optional().default(''),
  staffCode: z.string().trim().max(80).optional().default(''),
});

function getIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

function serializeInvitation(invitation) {
  const config = getEntryConfig(invitation);
  return {
    id: invitation.id,
    slug: invitation.slug,
    groomName: invitation.groomName || '',
    brideName: invitation.brideName || '',
    title: [invitation.groomName, invitation.brideName].filter(Boolean).join(' و '),
    entryConfig: {
      enabled: config.enabled !== false,
      pinRequired: Boolean(String(config.staffPin || '').trim()),
      gateLabelDefault: String(config.gateLabelDefault || ''),
      eventDate: invitation.weddingDate || null,
    },
  };
}

function serializeEntryPass(entryPass) {
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
    remainingEntries: getEntryPassRemaining(entryPass),
    status: getEntryPassDerivedStatus(entryPass),
    isEnabled: entryPass.isEnabled !== false,
    expiresAt: entryPass.expiresAt || null,
    lastCheckedInAt: entryPass.lastCheckedInAt || null,
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

function assertCheckInAccess(invitation, pin) {
  if (!invitation) {
    const error = new Error('Invitation not found.');
    error.status = 404;
    throw error;
  }

  if (!isEntryCheckInEnabled(invitation)) {
    const error = new Error('Check-in is disabled for this invitation.');
    error.status = 403;
    throw error;
  }

  if (!isEntryCheckInPinValid(invitation, pin)) {
    const error = new Error('Invalid entry PIN.');
    error.status = 401;
    throw error;
  }
}

function buildSummary(entryPasses = [], logs = []) {
  return {
    totalPasses: entryPasses.length,
    activePasses: entryPasses.filter((item) => getEntryPassDerivedStatus(item) === 'ACTIVE').length,
    partialPasses: entryPasses.filter((item) => getEntryPassDerivedStatus(item) === 'PARTIAL').length,
    usedPasses: entryPasses.filter((item) => getEntryPassDerivedStatus(item) === 'USED').length,
    disabledPasses: entryPasses.filter((item) => ['DISABLED', 'CANCELLED'].includes(getEntryPassDerivedStatus(item))).length,
    totalAllowedEntries: entryPasses.reduce((sum, item) => sum + Number(item.allowedEntries || 0), 0),
    totalUsedEntries: entryPasses.reduce((sum, item) => sum + Number(item.usedEntries || 0), 0),
    remainingEntries: entryPasses.reduce((sum, item) => sum + getEntryPassRemaining(item), 0),
    totalCheckInEvents: logs.length,
    totalCheckedInGuests: logs.reduce((sum, item) => sum + Number(item.checkedInCount || 0), 0),
  };
}

function filterSearchResults(entryPasses, query) {
  const normalized = String(query || '').trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return entryPasses.filter((entryPass) => {
    const fields = [
      entryPass.passCode,
      entryPass.guestName,
      entryPass.phone,
      entryPass.tableNumber,
      entryPass.notes,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    return fields.some((value) => value.includes(normalized));
  });
}

async function loadInvitation(slug) {
  return prisma.invitation.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      groomName: true,
      brideName: true,
      weddingDate: true,
      entryConfig: true,
    },
  });
}

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const pin = request.nextUrl.searchParams.get('pin') || '';
    const query = request.nextUrl.searchParams.get('q') || '';
    const limit = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get('limit') || 20)));
    const invitation = await loadInvitation(slug);

    assertCheckInAccess(invitation, pin);

    const entryPasses = await prisma.entryPass.findMany({
      where: { invitationId: invitation.id },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const recentLogs = await prisma.entryCheckInLog.findMany({
      where: { invitationId: invitation.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
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

    const parsed = parseEntryPassScanInput(query);
    let matches = [];

    if (query.trim()) {
      const scannedMatch = await findEntryPassByScan({
        invitationId: invitation.id,
        input: parsed.raw ? parsed : query,
      });

      if (scannedMatch) {
        matches = [scannedMatch];
      } else {
        matches = filterSearchResults(entryPasses, query).slice(0, limit);
      }
    }

    return apiSuccess({
      invitation: serializeInvitation(invitation),
      summary: buildSummary(entryPasses, recentLogs),
      matches: matches.map(serializeEntryPass),
      recentLogs: recentLogs.map(serializeCheckInLog),
    });
  } catch (error) {
    return apiError(error, { status: error.status || 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const invitation = await loadInvitation(slug);
    const payload = scanRequestSchema.parse(await request.json());

    assertCheckInAccess(invitation, payload.pin);

    const lookupInput = payload.rawValue || payload.passCode;
    if (!String(lookupInput || '').trim()) {
      return apiError(new Error('Entry code is required.'), {
        status: 400,
        message: 'يجب إدخال أو مسح رمز الدخول أولاً.',
      });
    }

    const entryPass = await findEntryPassByScan({
      invitationId: invitation.id,
      input: lookupInput,
    });

    if (!entryPass) {
      return apiError(new Error('Entry pass not found.'), {
        status: 404,
        message: 'لم يتم العثور على بطاقة دخول مطابقة.',
      });
    }

    const checkInResult = await consumeEntryPassCheckIn({
      entryPassId: entryPass.id,
      checkedInCount: normalizeCheckInCount(payload.checkedInCount),
      gateLabel: payload.gateLabel,
      deviceLabel: payload.deviceLabel,
      staffName: payload.staffName,
      staffCode: payload.staffCode,
      sourceIp: getIp(request),
      userAgent: request.headers.get('user-agent') || '',
    });

    return apiSuccess({
      invitation: serializeInvitation(invitation),
      entryPass: serializeEntryPass(checkInResult.entryPass),
      checkInLog: serializeCheckInLog({
        ...checkInResult.checkInLog,
        entryPass: checkInResult.entryPass,
      }),
      checkedInCount: checkInResult.checkedInCount,
      remainingBefore: checkInResult.remainingBefore,
      remainingAfter: checkInResult.remainingAfter,
    }, {
      status: 200,
      message: 'تم تسجيل الدخول بنجاح.',
    });
  } catch (error) {
    const knownStatus = error.status
      || (
        error.code === 'CANCELLED' ? 410
          : error.code === 'DISABLED' ? 403
            : error.code === 'EXPIRED' ? 410
              : error.code === 'USED' ? 409
                : error.code === 'LIMIT_EXCEEDED' ? 409
                  : error.code === 'STALE_STATE' ? 409
                    : 500
      );

    return apiError(error, {
      status: knownStatus,
      message:
        error.code === 'CANCELLED' ? 'تم إلغاء هذه البطاقة بالفعل.'
          : error.code === 'DISABLED' ? 'هذه البطاقة معطلة.'
            : error.code === 'EXPIRED' ? 'انتهت صلاحية هذه البطاقة.'
              : error.code === 'USED' ? 'تم استخدام هذه البطاقة بالكامل من قبل.'
                : error.code === 'LIMIT_EXCEEDED' ? `العدد المطلوب أكبر من المتبقي في البطاقة. المتبقي الحالي: ${error.remainingEntries ?? 0}.`
                  : error.code === 'STALE_STATE' ? 'تغيرت حالة البطاقة قبل تأكيد العملية. أعد المحاولة.'
                    : error.message,
    });
  }
}
