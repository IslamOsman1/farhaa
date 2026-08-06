import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const rsvpPayloadSchema = z.object({
  invitationId: z.string().trim().min(1),
  guestName: z.string().trim().min(1),
  phone: z.string().trim().optional().nullable(),
  status: z.string().trim().optional().default('confirmed'),
  companions: z.coerce.number().int().min(0).max(20).optional().default(0),
  message: z.string().trim().max(1000).optional().nullable(),
});

const rsvpAttempts = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 20;

function getIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
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

    const invitation = await prisma.invitation.findUnique({
      where: { id: payload.invitationId },
      select: { id: true, status: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
    }

    if (!['PUBLISHED', 'ACTIVE'].includes(invitation.status)) {
      return NextResponse.json({ error: 'Invitation is not accepting RSVP responses right now.' }, { status: 403 });
    }

    const rsvp = await prisma.rSVP.create({
      data: {
        invitationId: payload.invitationId,
        guestName: payload.guestName,
        phone: payload.phone || null,
        status: payload.status || 'confirmed',
        companions: payload.companions || 0,
        message: payload.message || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'تم استلام ردكم بنجاح. نشكركم على التأكيد.',
        rsvp,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('RSVP Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit RSVP.' }, { status: 500 });
  }
}
