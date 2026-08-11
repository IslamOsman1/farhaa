import prisma from '@/lib/prisma';
import { buildPublicFontStylesheet } from '@/lib/font-library';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await prisma.siteSettings.findFirst();
  const css = buildPublicFontStylesheet(settings);

  return new Response(css, {
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
