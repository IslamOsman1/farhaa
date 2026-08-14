import prisma from '@/lib/prisma';
import { getOpeningBySlug, getTemplateManifest, OPENING_LIBRARY } from '@/lib/template-system';

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
  const libraryOpening = OPENING_LIBRARY.find((item) => item.slug === slug);

  if (!libraryOpening) {
    const storedOpening = await prisma.opening.findUnique({
      where: { slug },
    });

    if (!storedOpening) {
      throw new Error(`Unknown opening slug: ${slug}`);
    }

    return storedOpening;
  }

  return prisma.opening.upsert({
    where: { slug: libraryOpening.slug },
    update: {
      name: libraryOpening.name,
      nameAr: libraryOpening.nameAr,
      description: libraryOpening.description,
      descriptionAr: libraryOpening.descriptionAr,
      type: libraryOpening.type,
      thumbnail: libraryOpening.thumbnail,
      defaultConfig: libraryOpening.defaultConfig,
      compatibilityRules: libraryOpening.compatibilityRules,
      isActive: libraryOpening.isActive,
      sortOrder: libraryOpening.sortOrder,
      status: 'ACTIVE',
    },
    create: {
      slug: libraryOpening.slug,
      name: libraryOpening.name,
      nameAr: libraryOpening.nameAr,
      description: libraryOpening.description,
      descriptionAr: libraryOpening.descriptionAr,
      type: libraryOpening.type,
      thumbnail: libraryOpening.thumbnail,
      defaultConfig: libraryOpening.defaultConfig,
      compatibilityRules: libraryOpening.compatibilityRules,
      isActive: libraryOpening.isActive,
      sortOrder: libraryOpening.sortOrder,
      status: 'ACTIVE',
    },
  });
}

function normalizeMergedOpening(opening) {
  return {
    ...opening,
    isActive: opening.isActive ?? true,
    isDefault: opening.isDefault ?? false,
    sortOrder: opening.sortOrder ?? 0,
    compatibleTemplates:
      opening.compatibleTemplates
      || opening.compatibilityRules?.allowedTemplateSlugs
      || [],
    compatibilityRules: opening.compatibilityRules || {},
    defaultConfig: opening.defaultConfig || {},
    textConfig: opening.textConfig || {},
    mediaConfig: opening.mediaConfig || {},
    themeConfig: opening.themeConfig || {},
  };
}

export async function getMergedOpenings() {
  const storedOpenings = await prisma.opening.findMany({
    orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  const storedMap = new Map(storedOpenings.map((opening) => [opening.slug, opening]));

  const merged = [
    ...OPENING_LIBRARY.map((opening) => {
      const stored = storedMap.get(opening.slug);
      return normalizeMergedOpening(
        stored || {
          ...opening,
          compatibleTemplates: opening.compatibilityRules?.allowedTemplateSlugs || [],
        },
      );
    }),
    ...storedOpenings
      .filter((opening) => !OPENING_LIBRARY.some((libraryOpening) => libraryOpening.slug === opening.slug))
      .map((opening) => normalizeMergedOpening(opening)),
  ];

  return merged;
}
