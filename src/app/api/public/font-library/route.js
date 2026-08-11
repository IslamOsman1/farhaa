import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { buildPublicFontLibraryPayload } from '@/lib/font-library';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    return apiSuccess(buildPublicFontLibraryPayload(settings));
  } catch (error) {
    return apiError(error);
  }
}
