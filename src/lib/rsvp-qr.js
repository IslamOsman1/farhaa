import QRCode from 'qrcode';

function sanitizeFilePart(value) {
  return String(value || 'guest')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'guest';
}

export function buildRsvpQrPayload({ invitation, rsvp }) {
  return JSON.stringify({
    type: 'farha-rsvp-ticket',
    invitationId: invitation.id,
    invitationSlug: invitation.slug,
    rsvpId: rsvp.id,
    guestName: rsvp.guestName,
    phone: rsvp.phone || '',
    companions: rsvp.companions || 0,
    status: rsvp.status || 'confirmed',
    createdAt: rsvp.createdAt instanceof Date ? rsvp.createdAt.toISOString() : rsvp.createdAt,
  });
}

export function getRsvpQrDownloadName({ invitation, rsvp, extension = 'png' }) {
  const invitationPart = sanitizeFilePart(invitation?.slug || invitation?.id || 'invitation');
  const guestPart = sanitizeFilePart(rsvp?.guestName || rsvp?.id || 'guest');
  return `farha-rsvp-${invitationPart}-${guestPart}.${extension}`;
}

export function getRsvpQrRoute(rsvpId, download = false) {
  return `/api/rsvp/${rsvpId}/qr${download ? '?download=1' : ''}`;
}

export async function generateRsvpQrDataUrl({ invitation, rsvp }) {
  return QRCode.toDataURL(buildRsvpQrPayload({ invitation, rsvp }), {
    width: 360,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#2f3a2f',
      light: '#ffffff',
    },
  });
}

export async function generateRsvpQrSvg({ invitation, rsvp }) {
  return QRCode.toString(buildRsvpQrPayload({ invitation, rsvp }), {
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
