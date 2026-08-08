import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateRsvpQrSvg, getRsvpQrDownloadName } from '@/lib/rsvp-qr';

export async function GET(request, { params }) {
  try {
    const { rsvpId } = await params;
    const rsvp = await prisma.rSVP.findUnique({
      where: { id: rsvpId },
      include: {
        invitation: {
          select: {
            id: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!rsvp?.invitation) {
      return NextResponse.json({ error: 'RSVP not found.' }, { status: 404 });
    }

    const svg = await generateRsvpQrSvg({
      invitation: rsvp.invitation,
      rsvp,
    });

    const download = request.nextUrl.searchParams.get('download') === '1';

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        ...(download
          ? {
              'Content-Disposition': `attachment; filename="${getRsvpQrDownloadName({
                invitation: rsvp.invitation,
                rsvp,
                extension: 'svg',
              })}"`,
            }
          : {}),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to generate QR code.' }, { status: 500 });
  }
}
