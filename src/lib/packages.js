export function parsePackageFeatures(rawValue) {
  if (Array.isArray(rawValue)) {
    return rawValue.map((item) => String(item || '').trim()).filter(Boolean);
  }

  if (typeof rawValue !== 'string' || !rawValue.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item || '').trim()).filter(Boolean);
    }
  } catch {
    return rawValue
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function getPackageDisplayFeatures(pkg, language = 'ar') {
  if (language === 'en') {
    const englishFeatures = parsePackageFeatures(pkg?.features);
    if (englishFeatures.length) {
      return englishFeatures;
    }
  }

  return parsePackageFeatures(pkg?.featuresAr);
}

export function parsePackageAddons(rawValue) {
  if (Array.isArray(rawValue)) {
    return rawValue
      .map((item, index) => normalizePackageAddon(item, index))
      .filter(Boolean);
  }

  if (typeof rawValue !== 'string' || !rawValue.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item, index) => normalizePackageAddon(item, index))
        .filter(Boolean);
    }
  } catch {}

  return [];
}

export function normalizePackageAddon(item, index = 0) {
  if (!item || typeof item !== 'object') return null;

  const addon = {
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
    descriptionAr: typeof item.descriptionAr === 'string' ? item.descriptionAr : '',
    description: typeof item.description === 'string' ? item.description : '',
    price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
    currency:
      typeof item.currency === 'string' && item.currency.trim()
        ? item.currency.trim()
        : 'EGP',
    isActive: item.isActive !== false,
    sortOrder: Number.isFinite(Number(item.sortOrder)) ? Number(item.sortOrder) : index,
  };

  if (!addon.nameAr && !addon.name) return null;
  return addon;
}

export function stringifyPackageAddons(addons = []) {
  return JSON.stringify(
    addons.map((addon, index) => ({
      id: addon.id || `addon-${index + 1}`,
      nameAr: String(addon.nameAr || '').trim(),
      name: String(addon.name || '').trim(),
      descriptionAr: String(addon.descriptionAr || ''),
      description: String(addon.description || ''),
      price: Number(addon.price) || 0,
      currency: String(addon.currency || 'EGP').trim() || 'EGP',
      isActive: addon.isActive !== false,
      sortOrder: Number.isFinite(Number(addon.sortOrder)) ? Number(addon.sortOrder) : index,
    })),
  );
}

export function getPackageDisplayAddons(pkg, language = 'ar') {
  return parsePackageAddons(pkg?.addons)
    .filter((addon) => addon.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((addon) => ({
      ...addon,
      label: language === 'en' ? addon.name || addon.nameAr : addon.nameAr || addon.name,
      descriptionLabel:
        language === 'en'
          ? addon.description || addon.descriptionAr
          : addon.descriptionAr || addon.description,
    }));
}
