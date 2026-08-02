import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst();

    return NextResponse.json({
      whatsapp: settings?.whatsapp || '201001473345',
    });
  } catch (error) {
    console.error('Failed to fetch public site settings:', error);

    return NextResponse.json({
      whatsapp: '201001473345',
    });
  }
}
