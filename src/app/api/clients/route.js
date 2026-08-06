import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';

const clientSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  status: z.string().trim().default('ACTIVE'),
});

export async function GET() {
  try {
    await requirePermission('clients.manage');
    const clients = await prisma.client.findMany({
      include: { _count: { select: { invitations: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return apiSuccess(clients);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request) {
  try {
    await requirePermission('clients.manage');
    const data = clientSchema.parse(await request.json());
    const client = await prisma.client.create({ data });
    return apiSuccess(client, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
