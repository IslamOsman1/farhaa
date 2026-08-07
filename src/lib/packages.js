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
