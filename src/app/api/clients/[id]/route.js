import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';

export async function GET(_request, { params }) {
  try {
    await requirePermission('clients.manage');
    const { id } = await params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: { invitations: true },
    });
    if (!client) return apiError(new Error('Not found'), { status: 404 });
    return apiSuccess(client);
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    await requirePermission('clients.manage');
    const { id } = await params;
    const data = await request.json();
    const client = await prisma.client.update({
      where: { id },
      data,
    });
    return apiSuccess(client);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    await requirePermission('clients.manage');
    const { id } = await params;
    await prisma.client.delete({ where: { id } });
    return apiSuccess({ id });
  } catch (error) {
    return apiError(error);
  }
}
