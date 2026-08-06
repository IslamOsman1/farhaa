import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';

export async function GET() {
  try {
    await requirePermission('invitations.view');
    const invitations = await prisma.invitation.findMany({
      include: {
        client: true,
        template: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return apiSuccess(invitations);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request) {
  try {
    await requirePermission('invitations.create');
    const data = await request.json();
    const invitation = await prisma.invitation.create({
      data: {
        title: data.title,
        slug: data.slug,
        clientId: data.clientId,
        templateId: data.templateId,
        status: data.status || 'DRAFT',
        groomName: data.groomName || '',
        brideName: data.brideName || '',
        themeConfig: data.themeConfig || {},
        contentConfig: data.contentConfig || {},
      },
    });
    return apiSuccess(invitation, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
