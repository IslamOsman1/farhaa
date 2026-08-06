import prisma from '@/lib/prisma';
import { getOpeningBySlug, getTemplateManifest } from '@/lib/template-system';

export async function ensureTemplateBySlug(slug) {
  const manifest = getTemplateManifest(slug);
  if (!manifest) {
    throw new Error(`Unknown template slug: ${slug}`);
  }

  const template = await prisma.template.upsert({
    where: { slug },
    update: {
      name: manifest.name,
      nameAr: manifest.nameAr,
      description: manifest.description,
      descriptionAr: manifest.descriptionAr,
      previewImage: manifest.previewImage,
      thumbnail: manifest.thumbnail,
      manifest,
      capabilities: manifest.capabilities,
      defaultConfig: manifest.defaultValues,
      defaultThemeConfig: manifest.defaultValues.theme,
      defaultSectionConfig: manifest.defaultValues.sections,
      compatibleOpenings: manifest.openingCompatibility,
      validationStatus: manifest.capabilities.requiresNativeAdapter ? 'NEEDS_NATIVE_ADAPTER' : 'VALIDATED',
    },
    create: {
      name: manifest.name,
      nameAr: manifest.nameAr,
      slug: manifest.slug,
      description: manifest.description,
      descriptionAr: manifest.descriptionAr,
      previewImage: manifest.previewImage,
      thumbnail: manifest.thumbnail,
      manifest,
      capabilities: manifest.capabilities,
      defaultConfig: manifest.defaultValues,
      defaultThemeConfig: manifest.defaultValues.theme,
      defaultSectionConfig: manifest.defaultValues.sections,
      compatibleOpenings: manifest.openingCompatibility,
      validationStatus: manifest.capabilities.requiresNativeAdapter ? 'NEEDS_NATIVE_ADAPTER' : 'VALIDATED',
    },
  });

  return { template, manifest };
}

export async function ensureOpeningBySlug(slug) {
  const opening = getOpeningBySlug(slug);

  return prisma.opening.upsert({
    where: { slug: opening.slug },
    update: {
      name: opening.name,
      nameAr: opening.nameAr,
      description: opening.description,
      descriptionAr: opening.descriptionAr,
      type: opening.type,
      thumbnail: opening.thumbnail,
      defaultConfig: opening.defaultConfig,
      compatibilityRules: opening.compatibilityRules,
      isActive: opening.isActive,
      sortOrder: opening.sortOrder,
      status: 'ACTIVE',
    },
    create: {
      slug: opening.slug,
      name: opening.name,
      nameAr: opening.nameAr,
      description: opening.description,
      descriptionAr: opening.descriptionAr,
      type: opening.type,
      thumbnail: opening.thumbnail,
      defaultConfig: opening.defaultConfig,
      compatibilityRules: opening.compatibilityRules,
      isActive: opening.isActive,
      sortOrder: opening.sortOrder,
      status: 'ACTIVE',
    },
  });
}
