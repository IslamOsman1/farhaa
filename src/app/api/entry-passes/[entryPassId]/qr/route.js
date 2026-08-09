import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  generateEntryPassQrSvg,
  getEntryPassDownloadName,
} from '@/lib/entry-pass';

export async function GET(request, { params }) {
  try {
    const { entryPassId } = await params;
    const entryPass = await prisma.entryPass.findUnique({
      where: { id: entryPassId },
      include: {
        invitation: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

    if (!entryPass?.invitation) {
      return NextResponse.json({ error: 'Entry pass not found.' }, { status: 404 });
    }

    const svg = await generateEntryPassQrSvg({
      invitation: entryPass.invitation,
      entryPass,
    });
    const download = request.nextUrl.searchParams.get('download') === '1';

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        ...(download
          ? {
              'Content-Disposition': `attachment; filename="${getEntryPassDownloadName({
                invitation: entryPass.invitation,
                entryPass,
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
