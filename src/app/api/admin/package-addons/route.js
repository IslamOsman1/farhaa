import { z } from 'zod';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { requirePermission } from '@/lib/admin-session';
import {
  mergePackageAddonsIntoFooterConfig,
  normalizePackageAddons,
} from '@/lib/package-addons';

export const dynamic = 'force-dynamic';

const addonSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1),
  nameAr: z.string().trim().min(1),
  price: z.coerce.number().nonnegative(),
  currency: z.string().trim().min(1).default('EGP'),
  description: z.string().optional().default(''),
  descriptionAr: z.string().optional().default(''),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
});

function ensureSettingsDefaults(data = {}) {
  return {
    contactPhone: '',
    contactEmail: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    ...data,
  };
}

export async function GET() {
  try {
    await requirePermission('packages.manage');
    const settings = await prisma.siteSettings.findFirst();
    return apiSuccess({ addons: normalizePackageAddons(settings) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request) {
  try {
    await requirePermission('packages.manage');
    const payload = addonSchema.parse(await request.json());
    const currentSettings = await prisma.siteSettings.findFirst();
    const addons = normalizePackageAddons(currentSettings);

    const nextAddon = {
      id: payload.id || `addon-${Date.now().toString(36)}`,
      name: payload.name,
      nameAr: payload.nameAr,
      price: payload.price,
      currency: payload.currency,
      description: payload.description,
      descriptionAr: payload.descriptionAr,
      isActive: payload.isActive,
      sortOrder:
        typeof payload.sortOrder === 'number' ? payload.sortOrder : addons.length,
    };

    const footerConfig = mergePackageAddonsIntoFooterConfig(currentSettings, [
      ...addons,
      nextAddon,
    ]);

    if (currentSettings) {
      await prisma.siteSettings.update({
        where: { id: currentSettings.id },
        data: { footerConfig },
      });
    } else {
      await prisma.siteSettings.create({
        data: ensureSettingsDefaults({ footerConfig }),
      });
    }

    const updatedSettings = await prisma.siteSettings.findFirst();
    return apiSuccess(
      { addon: nextAddon, addons: normalizePackageAddons(updatedSettings) },
      { status: 201, message: 'تمت إضافة الإضافة بنجاح.' },
    );
  } catch (error) {
    return apiError(error);
  }
}
