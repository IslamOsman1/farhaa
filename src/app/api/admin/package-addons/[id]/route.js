import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import {
  mergePackageAddonsIntoFooterConfig,
  normalizePackageAddons,
} from '@/lib/package-addons';

export const dynamic = 'force-dynamic';

const addonUpdateSchema = z.object({
  name: z.string().trim().min(1),
  nameAr: z.string().trim().min(1),
  price: z.coerce.number().nonnegative(),
  currency: z.string().trim().min(1).default('EGP'),
  description: z.string().optional().default(''),
  descriptionAr: z.string().optional().default(''),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
});

export async function PUT(request, { params }) {
  try {
    await requirePermission('packages.manage');
    const { id } = await params;
    const payload = addonUpdateSchema.parse(await request.json());
    const currentSettings = await prisma.siteSettings.findFirst();
    const addons = normalizePackageAddons(currentSettings);
    const index = addons.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error('الإضافة المطلوبة غير موجودة.');
    }

    const updatedAddon = {
      ...addons[index],
      ...payload,
      id,
      sortOrder:
        typeof payload.sortOrder === 'number'
          ? payload.sortOrder
          : addons[index].sortOrder,
    };

    addons[index] = updatedAddon;

    await prisma.siteSettings.update({
      where: { id: currentSettings.id },
      data: {
        footerConfig: mergePackageAddonsIntoFooterConfig(currentSettings, addons),
      },
    });

    return apiSuccess(
      { addon: updatedAddon },
      { message: 'تم تحديث الإضافة بنجاح.' },
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    await requirePermission('packages.manage');
    const { id } = await params;
    const currentSettings = await prisma.siteSettings.findFirst();

    if (!currentSettings) {
      throw new Error('لا توجد إضافات محفوظة.');
    }

    const addons = normalizePackageAddons(currentSettings);
    const nextAddons = addons.filter((item) => item.id !== id);

    await prisma.siteSettings.update({
      where: { id: currentSettings.id },
      data: {
        footerConfig: mergePackageAddonsIntoFooterConfig(currentSettings, nextAddons),
      },
    });

    return apiSuccess({ id }, { message: 'تم حذف الإضافة.' });
  } catch (error) {
    return apiError(error);
  }
}
