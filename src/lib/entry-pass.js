import { randomBytes } from 'node:crypto';
import QRCode from 'qrcode';
import prisma from '@/lib/prisma';

function sanitizeFilePart(value) {
  return String(value || 'entry-pass')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'entry-pass';
}

function buildRandomToken(prefix = '') {
  return `${prefix}${randomBytes(18).toString('hex')}`;
}

function buildHumanCode() {
  return `FRH-${randomBytes(3).toString('hex').toUpperCase()}`;
}

export function normalizeAllowedEntries(value, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(50, Math.max(1, Math.round(parsed)));
}

export function getEntryPassRemaining(entryPass) {
  return Math.max(0, Number(entryPass?.allowedEntries || 0) - Number(entryPass?.usedEntries || 0));
}

export function getEntryPassDerivedStatus(entryPass) {
  if (!entryPass) return 'UNKNOWN';
  if (entryPass.status === 'CANCELLED') return 'CANCELLED';
  if (!entryPass.isEnabled || entryPass.status === 'DISABLED') return 'DISABLED';
  if (getEntryPassRemaining(entryPass) <= 0) return 'USED';
  if (Number(entryPass.usedEntries || 0) > 0) return 'PARTIAL';
  return 'ACTIVE';
}

export function normalizeCheckInCount(value, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(50, Math.max(1, Math.round(parsed)));
}

export function getEntryConfig(invitation) {
  const config = invitation?.entryConfig;
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return {};
  }

  return config;
}

export function isEntryPassExpired(entryPass, now = new Date()) {
  if (!entryPass?.expiresAt) {
    return false;
  }

  const expiresAt = new Date(entryPass.expiresAt);
  if (Number.isNaN(expiresAt.getTime())) {
    return false;
  }

  return expiresAt.getTime() < now.getTime();
}

export function isEntryCheckInEnabled(invitation) {
  const config = getEntryConfig(invitation);
  return config.enabled !== false;
}

export function isEntryCheckInPinValid(invitation, pin) {
  const config = getEntryConfig(invitation);
  const configuredPin = String(config.staffPin || '').trim();

  if (!configuredPin) {
    return true;
  }

  return String(pin || '').trim() === configuredPin;
}

export function parseEntryPassScanInput(input) {
  const raw = String(input || '').trim();
  if (!raw) {
    return {
      raw: '',
      passCode: '',
      qrToken: '',
      linkToken: '',
      invitationId: '',
      invitationSlug: '',
      payload: null,
    };
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        raw,
        passCode: String(parsed.passCode || '').trim().toUpperCase(),
        qrToken: String(parsed.qrToken || '').trim(),
        linkToken: String(parsed.linkToken || '').trim(),
        invitationId: String(parsed.invitationId || '').trim(),
        invitationSlug: String(parsed.invitationSlug || '').trim(),
        payload: parsed,
      };
    }
  } catch (error) {
    // Continue and try other formats.
  }

  try {
    const url = new URL(raw);
    return {
      raw,
      passCode: String(url.searchParams.get('code') || '').trim().toUpperCase(),
      qrToken: String(url.searchParams.get('qr') || '').trim(),
      linkToken: String(url.searchParams.get('entry') || '').trim(),
      invitationId: '',
      invitationSlug: '',
      payload: null,
    };
  } catch (error) {
    // Plain code/token fallback.
  }

  const normalized = raw.toUpperCase();
  return {
    raw,
    passCode: normalized.startsWith('FRH-') ? normalized : '',
    qrToken: raw.startsWith('qr_') ? raw : '',
    linkToken: raw.startsWith('lnk_') ? raw : '',
    invitationId: '',
    invitationSlug: '',
    payload: null,
  };
}

export function buildEntryPassPayload({ invitation, entryPass }) {
  return JSON.stringify({
    type: 'farha-entry-pass',
    invitationId: invitation.id,
    invitationSlug: invitation.slug,
    entryPassId: entryPass.id,
    passCode: entryPass.passCode,
    qrToken: entryPass.qrToken,
    guestName: entryPass.guestName || '',
    phone: entryPass.phone || '',
    allowedEntries: entryPass.allowedEntries || 1,
    usedEntries: entryPass.usedEntries || 0,
    remainingEntries: getEntryPassRemaining(entryPass),
    passType: entryPass.passType || 'NAMED',
    expiresAt: entryPass.expiresAt instanceof Date ? entryPass.expiresAt.toISOString() : entryPass.expiresAt || null,
  });
}

export function getEntryPassDownloadName({ invitation, entryPass, extension = 'png' }) {
  const invitationPart = sanitizeFilePart(invitation?.slug || invitation?.id || 'invitation');
  const passPart = sanitizeFilePart(entryPass?.passCode || entryPass?.guestName || entryPass?.id || 'entry');
  return `farha-entry-pass-${invitationPart}-${passPart}.${extension}`;
}

export function getEntryPassQrRoute(entryPassId, download = false) {
  return `/api/entry-passes/${entryPassId}/qr${download ? '?download=1' : ''}`;
}

export function getEntryPassPublicLink({ invitation, entryPass, origin = '' }) {
  const normalizedOrigin = origin ? String(origin).replace(/\/+$/g, '') : '';
  const path = `/invite/${invitation.slug}?entry=${encodeURIComponent(entryPass.linkToken)}`;
  return normalizedOrigin ? `${normalizedOrigin}${path}` : path;
}

export async function generateEntryPassQrDataUrl({ invitation, entryPass }) {
  return QRCode.toDataURL(buildEntryPassPayload({ invitation, entryPass }), {
    width: 360,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#2f3a2f',
      light: '#ffffff',
    },
  });
}

export async function generateEntryPassQrSvg({ invitation, entryPass }) {
  return QRCode.toString(buildEntryPassPayload({ invitation, entryPass }), {
    type: 'svg',
    width: 360,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#2f3a2f',
      light: '#ffffff',
    },
  });
}

async function createUniquePassCode() {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = buildHumanCode();
    const existing = await prisma.entryPass.findUnique({
      where: { passCode: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  return `FRH-${randomBytes(4).toString('hex').toUpperCase()}`;
}

async function createUniqueToken(fieldName, prefix = '') {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = buildRandomToken(prefix);
    const existing = await prisma.entryPass.findFirst({
      where: { [fieldName]: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  return buildRandomToken(prefix);
}

export async function findEntryPassByScan({
  invitationId,
  input,
}) {
  const parsed = typeof input === 'string' ? parseEntryPassScanInput(input) : {
    raw: '',
    passCode: String(input?.passCode || '').trim().toUpperCase(),
    qrToken: String(input?.qrToken || '').trim(),
    linkToken: String(input?.linkToken || '').trim(),
    invitationId: String(input?.invitationId || '').trim(),
    invitationSlug: String(input?.invitationSlug || '').trim(),
    payload: input?.payload || null,
  };

  const orConditions = [];
  if (parsed.passCode) {
    orConditions.push({ passCode: parsed.passCode });
  }
  if (parsed.qrToken) {
    orConditions.push({ qrToken: parsed.qrToken });
  }
  if (parsed.linkToken) {
    orConditions.push({ linkToken: parsed.linkToken });
  }

  if (orConditions.length === 0 || !invitationId) {
    return null;
  }

  return prisma.entryPass.findFirst({
    where: {
      invitationId,
      OR: orConditions,
    },
    include: {
      invitation: {
        select: {
          id: true,
          slug: true,
          groomName: true,
          brideName: true,
          entryConfig: true,
        },
      },
      rsvp: {
        select: {
          id: true,
          guestName: true,
          phone: true,
          status: true,
          companions: true,
        },
      },
    },
  });
}

export async function consumeEntryPassCheckIn({
  entryPassId,
  checkedInCount = 1,
  gateLabel = '',
  deviceLabel = '',
  staffName = '',
  staffCode = '',
  sourceIp = '',
  userAgent = '',
}) {
  const pass = await prisma.entryPass.findUnique({
    where: { id: entryPassId },
    include: {
      invitation: {
        select: {
          id: true,
          slug: true,
          groomName: true,
          brideName: true,
          entryConfig: true,
        },
      },
      rsvp: {
        select: {
          id: true,
          guestName: true,
          phone: true,
          status: true,
          companions: true,
        },
      },
    },
  });

  if (!pass) {
    throw new Error('Entry pass not found.');
  }

  const safeCount = normalizeCheckInCount(checkedInCount);
  const currentStatus = getEntryPassDerivedStatus(pass);

  if (pass.status === 'CANCELLED') {
    const error = new Error('This entry pass has been cancelled.');
    error.code = 'CANCELLED';
    throw error;
  }

  if (!pass.isEnabled || pass.status === 'DISABLED') {
    const error = new Error('This entry pass is disabled.');
    error.code = 'DISABLED';
    throw error;
  }

  if (isEntryPassExpired(pass)) {
    const error = new Error('This entry pass has expired.');
    error.code = 'EXPIRED';
    throw error;
  }

  if (currentStatus === 'USED') {
    const error = new Error('This entry pass has already been fully used.');
    error.code = 'USED';
    throw error;
  }

  const remainingBefore = getEntryPassRemaining(pass);
  if (safeCount > remainingBefore) {
    const error = new Error('Requested entry count exceeds the remaining allowed entries.');
    error.code = 'LIMIT_EXCEEDED';
    error.remainingEntries = remainingBefore;
    throw error;
  }

  const nextUsedEntries = Number(pass.usedEntries || 0) + safeCount;
  const now = new Date();
  const updateResult = await prisma.entryPass.updateMany({
    where: {
      id: pass.id,
      usedEntries: Number(pass.usedEntries || 0),
      isEnabled: true,
      status: pass.status,
    },
    data: {
      usedEntries: nextUsedEntries,
      lastCheckedInAt: now,
    },
  });

  if (!updateResult.count) {
    const error = new Error('Entry pass state changed before confirming this scan. Please try again.');
    error.code = 'STALE_STATE';
    throw error;
  }

  const updatedPass = await prisma.entryPass.findUnique({
    where: { id: pass.id },
    include: {
      invitation: {
        select: {
          id: true,
          slug: true,
          groomName: true,
          brideName: true,
          entryConfig: true,
        },
      },
      rsvp: {
        select: {
          id: true,
          guestName: true,
          phone: true,
          status: true,
          companions: true,
        },
      },
    },
  });

  const remainingAfter = getEntryPassRemaining(updatedPass);
  const checkInLog = await prisma.entryCheckInLog.create({
    data: {
      invitationId: pass.invitationId,
      entryPassId: pass.id,
      checkedInCount: safeCount,
      remainingAfter,
      gateLabel: gateLabel || null,
      deviceLabel: deviceLabel || null,
      staffName: staffName || null,
      staffCode: staffCode || null,
      sourceIp: sourceIp || null,
      userAgent: userAgent || null,
      createdAt: now,
    },
  });

  return {
    entryPass: updatedPass,
    checkInLog,
    checkedInCount: safeCount,
    remainingBefore,
    remainingAfter,
  };
}

export async function ensureEntryPassForRsvp({ invitation, rsvp, allowedEntries = null }) {
  if (!invitation?.id || !rsvp?.id) {
    throw new Error('Invitation and RSVP references are required to create an entry pass.');
  }

  const nextAllowedEntries = normalizeAllowedEntries(
    allowedEntries == null ? Number(rsvp.companions || 0) + 1 : allowedEntries,
  );

  const existing = await prisma.entryPass.findUnique({
    where: { rsvpId: rsvp.id },
  });

  if (existing) {
    return prisma.entryPass.update({
      where: { id: existing.id },
      data: {
        guestName: rsvp.guestName || existing.guestName,
        phone: rsvp.phone || existing.phone,
        allowedEntries: nextAllowedEntries,
        status: rsvp.status === 'declined' ? 'DISABLED' : (existing.status === 'CANCELLED' ? 'CANCELLED' : 'ACTIVE'),
        isEnabled: rsvp.status !== 'declined',
      },
    });
  }

  return prisma.entryPass.create({
    data: {
      invitationId: invitation.id,
      rsvpId: rsvp.id,
      passType: 'NAMED',
      passCode: await createUniquePassCode(),
      linkToken: await createUniqueToken('linkToken', 'lnk_'),
      qrToken: await createUniqueToken('qrToken', 'qr_'),
      guestName: rsvp.guestName,
      phone: rsvp.phone || null,
      allowedEntries: nextAllowedEntries,
      status: rsvp.status === 'declined' ? 'DISABLED' : 'ACTIVE',
      isEnabled: rsvp.status !== 'declined',
      metadata: {
        source: 'rsvp',
        companions: rsvp.companions || 0,
      },
    },
  });
}

export async function createAnonymousEntryPasses({
  invitationId,
  count,
  allowedEntries = 1,
  tableNumber = '',
  notes = '',
}) {
  const safeCount = Math.min(500, Math.max(1, Number(count || 1)));
  const normalizedEntries = normalizeAllowedEntries(allowedEntries);
  const created = [];

  for (let index = 0; index < safeCount; index += 1) {
    const entryPass = await prisma.entryPass.create({
      data: {
        invitationId,
        passType: 'ANONYMOUS',
        passCode: await createUniquePassCode(),
        linkToken: await createUniqueToken('linkToken', 'lnk_'),
        qrToken: await createUniqueToken('qrToken', 'qr_'),
        allowedEntries: normalizedEntries,
        tableNumber: tableNumber || null,
        notes: notes || null,
        status: 'ACTIVE',
        isEnabled: true,
        metadata: {
          source: 'bulk-admin',
        },
      },
    });

    created.push(entryPass);
  }

  return created;
}
