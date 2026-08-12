export function normalizePackageAddons(settings) {
  const source = settings?.footerConfig?.packageAddons;
  if (!Array.isArray(source)) return [];

  return source
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;

      return {
        id:
          typeof item.id === 'string' && item.id.trim()
            ? item.id.trim()
            : `addon-${index + 1}`,
        nameAr:
          typeof item.nameAr === 'string' && item.nameAr.trim()
            ? item.nameAr.trim()
            : '',
        name:
          typeof item.name === 'string' && item.name.trim()
            ? item.name.trim()
            : '',
        price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
        currency:
          typeof item.currency === 'string' && item.currency.trim()
            ? item.currency.trim()
            : 'EGP',
        descriptionAr:
          typeof item.descriptionAr === 'string' ? item.descriptionAr : '',
        description:
          typeof item.description === 'string' ? item.description : '',
        isActive: item.isActive !== false,
        sortOrder: Number.isFinite(Number(item.sortOrder))
          ? Number(item.sortOrder)
          : index,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function mergePackageAddonsIntoFooterConfig(settings, addons) {
  const footerConfig =
    settings?.footerConfig && typeof settings.footerConfig === 'object'
      ? { ...settings.footerConfig }
      : {};

  footerConfig.packageAddons = addons.map((addon, index) => ({
    id: addon.id,
    nameAr: addon.nameAr,
    name: addon.name,
    price: Number(addon.price) || 0,
    currency: addon.currency || 'EGP',
    descriptionAr: addon.descriptionAr || '',
    description: addon.description || '',
    isActive: addon.isActive !== false,
    sortOrder: Number.isFinite(Number(addon.sortOrder))
      ? Number(addon.sortOrder)
      : index,
  }));

  return footerConfig;
}
