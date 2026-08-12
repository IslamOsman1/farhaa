import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import { z } from 'zod';

const updatePackageSchema = z.object({
  name: z.string().trim().min(1),
  nameAr: z.string().trim().min(1),
  price: z.coerce.number().nonnegative(),
  currency: z.string().trim().min(1).default('EGP'),
  features: z.string().trim().default('[]'),
  featuresAr: z.string().trim().default('[]'),
  addons: z.string().trim().default('[]'),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().nonnegative().default(0),
});

export async function PUT(request, { params }) {
  try {
    await requirePermission('packages.manage');
    const { id } = await params;
    const data = updatePackageSchema.parse(await request.json());
    const pkg = await prisma.package.update({
      where: { id },
      data,
    });
    return apiSuccess({ package: pkg }, { message: 'تم تحديث الباقة بنجاح.' });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    await requirePermission('packages.manage');
    const { id } = await params;
    await prisma.package.delete({ where: { id } });
    return apiSuccess({ id }, { message: 'تم حذف الباقة.' });
  } catch (error) {
    return apiError(error);
  }
}
