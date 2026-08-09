import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  ensureEntryPassForRsvp,
  generateEntryPassQrDataUrl,
  getEntryPassDownloadName,
  getEntryPassPublicLink,
  getEntryPassQrRoute,
} from '@/lib/entry-pass';

const rsvpPayloadSchema = z.object({
  invitationId: z.string().trim().min(1).optional(),
  invitationSlug: z.string().trim().min(1).optional(),
  invitation_id: z.string().trim().min(1).optional(),
  invitation_slug: z.string().trim().min(1).optional(),
  guestName: z.string().trim().min(1),
  guest_name: z.string().trim().min(1).optional(),
  phone: z.string().trim().optional().nullable(),
  status: z.string().trim().optional().default('confirmed'),
  attending: z.string().trim().optional(),
  companions: z.coerce.number().int().min(0).max(20).optional().default(0),
  guests: z.coerce.number().int().min(0).max(20).optional(),
  message: z.string().trim().max(1000).optional().nullable(),
}).refine((payload) => (
  payload.invitationId
  || payload.invitationSlug
  || payload.invitation_id
  || payload.invitation_slug
), {
  message: 'Invitation reference is required.',
  path: ['invitationId'],
});

const rsvpAttempts = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 20;

function getIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

function canSubmit(ip) {
  const now = Date.now();
  const existing = rsvpAttempts.get(ip);
  if (!existing || now - existing.startedAt > WINDOW_MS) {
    rsvpAttempts.set(ip, { count: 1, startedAt: now });
    return true;
  }

  if (existing.count >= MAX_ATTEMPTS) {
    return false;
  }

  existing.count += 1;
  return true;
}

export async function POST(request) {
  try {
    const ip = getIp(request);
    if (!canSubmit(ip)) {
      return NextResponse.json({ error: 'Too many RSVP attempts. Please try again later.' }, { status: 429 });
    }

    const payload = rsvpPayloadSchema.parse(await request.json());
    const invitationId = payload.invitationId || payload.invitation_id || '';
    const invitationSlug = payload.invitationSlug || payload.invitation_slug || '';
    const guestName = payload.guestName || payload.guest_name || '';
    const companions = payload.guests != null
      ? Math.max(0, (payload.guests || 1) - 1)
      : (payload.companions || 0);
    const normalizedStatus = payload.status
      || (payload.attending === 'yes' ? 'confirmed' : payload.attending === 'no' ? 'declined' : payload.attending)
      || 'confirmed';

    const invitation = await prisma.invitation.findFirst({
      where: invitationId
        ? { id: invitationId }
        : { slug: invitationSlug },
      select: {
        id: true,
        slug: true,
        status: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    }

    if (!['PUBLISHED', 'ACTIVE'].includes(invitation.status)) {
      return NextResponse.json({ error: 'Invitation is not accepting RSVP responses right now.' }, { status: 403 });
    }

    const rsvp = await prisma.rSVP.create({
      data: {
        invitationId: invitation.id,
        guestName,
        phone: payload.phone || null,
        status: normalizedStatus,
        companions,
        message: payload.message || null,
      },
    });

    const shouldIssueEntryPass = normalizedStatus !== 'declined';
    const entryPass = shouldIssueEntryPass
      ? await ensureEntryPassForRsvp({
          invitation,
          rsvp,
          allowedEntries: companions + 1,
        })
      : null;
    const qrCodeDataUrl = entryPass
      ? await generateEntryPassQrDataUrl({ invitation, entryPass })
      : null;

    return NextResponse.json(
      {
        success: true,
        message: 'تم استلام تأكيد الحضور بنجاح.',
        rsvp,
        entryPass: entryPass
          ? {
              id: entryPass.id,
              passCode: entryPass.passCode,
              passType: entryPass.passType,
              guestName: entryPass.guestName,
              allowedEntries: entryPass.allowedEntries,
              usedEntries: entryPass.usedEntries,
              remainingEntries: Math.max(0, entryPass.allowedEntries - entryPass.usedEntries),
              publicLink: getEntryPassPublicLink({ invitation, entryPass }),
            }
          : null,
        qrCodeDataUrl,
        qrCodeViewUrl: entryPass ? getEntryPassQrRoute(entryPass.id) : null,
        qrCodeDownloadUrl: entryPass ? getEntryPassQrRoute(entryPass.id, true) : null,
        qrCodeDownloadName: entryPass ? getEntryPassDownloadName({ invitation, entryPass }) : null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('RSVP Error:', error);

    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      return NextResponse.json(
        {
          error: firstIssue?.message || 'Invalid RSVP payload.',
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: error.message || 'Failed to submit RSVP.' }, { status: 500 });
  }
}
