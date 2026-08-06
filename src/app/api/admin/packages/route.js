import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';

const packageSchema = z.object({
  name: z.string().trim().min(1),
  nameAr: z.string().trim().min(1),
  price: z.coerce.number().nonnegative(),
  currency: z.string().trim().default('EGP'),
  featuresAr: z.string().trim().default('[]'),
  isPopular: z.boolean().default(false),
});

export async function POST(request) {
  try {
    await requirePermission('packages.manage');
    const data = packageSchema.parse(await request.json());
    const pkg = await prisma.package.create({ data });
    return apiSuccess({ package: pkg }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
