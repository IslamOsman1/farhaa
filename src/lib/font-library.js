const BUILTIN_FONT_DEFINITIONS = [
  { id: 'tajawal', family: 'Tajawal', nameAr: 'تجوال', nameEn: 'Tajawal', category: 'arabic', specimenSlug: 'Tajawal' },
  { id: 'cairo', family: 'Cairo', nameAr: 'القاهرة', nameEn: 'Cairo', category: 'arabic', specimenSlug: 'Cairo' },
  { id: 'noto-kufi-arabic', family: 'Noto Kufi Arabic', nameAr: 'نوتو كوفي', nameEn: 'Noto Kufi Arabic', category: 'arabic', specimenSlug: 'Noto+Kufi+Arabic' },
  { id: 'noto-naskh-arabic', family: 'Noto Naskh Arabic', nameAr: 'نوتو نسخ', nameEn: 'Noto Naskh Arabic', category: 'arabic', specimenSlug: 'Noto+Naskh+Arabic' },
  { id: 'amiri', family: 'Amiri', nameAr: 'أميري', nameEn: 'Amiri', category: 'arabic', specimenSlug: 'Amiri' },
  { id: 'aref-ruqaa', family: 'Aref Ruqaa', nameAr: 'عرف رقعة', nameEn: 'Aref Ruqaa', category: 'arabic', specimenSlug: 'Aref+Ruqaa' },
  { id: 'reem-kufi', family: 'Reem Kufi', nameAr: 'ريم كوفي', nameEn: 'Reem Kufi', category: 'arabic', specimenSlug: 'Reem+Kufi' },
  { id: 'el-messiri', family: 'El Messiri', nameAr: 'المسيري', nameEn: 'El Messiri', category: 'arabic', specimenSlug: 'El+Messiri' },
  { id: 'changa', family: 'Changa', nameAr: 'تشانغا', nameEn: 'Changa', category: 'arabic', specimenSlug: 'Changa' },
  { id: 'marhey', family: 'Marhey', nameAr: 'مرحي', nameEn: 'Marhey', category: 'arabic', specimenSlug: 'Marhey' },
  { id: 'playfair-display', family: 'Playfair Display', nameAr: 'بلايفير', nameEn: 'Playfair Display', category: 'latin', specimenSlug: 'Playfair+Display' },
  { id: 'cormorant-garamond', family: 'Cormorant Garamond', nameAr: 'كورمورانت جاراموند', nameEn: 'Cormorant Garamond', category: 'latin', specimenSlug: 'Cormorant+Garamond' },
  { id: 'cinzel-decorative', family: 'Cinzel Decorative', nameAr: 'سينزل ديكوراتيف', nameEn: 'Cinzel Decorative', category: 'latin', specimenSlug: 'Cinzel+Decorative' },
  { id: 'great-vibes', family: 'Great Vibes', nameAr: 'جريت فايبز', nameEn: 'Great Vibes', category: 'latin', specimenSlug: 'Great+Vibes' },
  { id: 'dm-serif-display', family: 'DM Serif Display', nameAr: 'دي إم سيريف', nameEn: 'DM Serif Display', category: 'latin', specimenSlug: 'DM+Serif+Display' },
  { id: 'abril-fatface', family: 'Abril Fatface', nameAr: 'أبريل فاتفايس', nameEn: 'Abril Fatface', category: 'latin', specimenSlug: 'Abril+Fatface' },
  { id: 'bodoni-moda', family: 'Bodoni Moda', nameAr: 'بودوني مودا', nameEn: 'Bodoni Moda', category: 'latin', specimenSlug: 'Bodoni+Moda' },
  { id: 'prata', family: 'Prata', nameAr: 'براتا', nameEn: 'Prata', category: 'latin', specimenSlug: 'Prata' },
  { id: 'bellefair', family: 'Bellefair', nameAr: 'بيليفير', nameEn: 'Bellefair', category: 'latin', specimenSlug: 'Bellefair' },
  { id: 'libre-baskerville', family: 'Libre Baskerville', nameAr: 'ليبر باسكرفيل', nameEn: 'Libre Baskerville', category: 'latin', specimenSlug: 'Libre+Baskerville' },
];

export const PUBLIC_FONT_LIBRARY_STYLESHEET_PATH = '/api/public/font-library/styles';
export const FONT_UPLOAD_ACCEPT = '.ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2,application/font-sfnt,application/x-font-ttf,application/x-font-otf,application/font-woff,application/font-woff2';

const ARABIC_SAMPLE = 'دعوة فرحة الرقمية';
const ENGLISH_SAMPLE = 'Farha Digital Invitation';

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function slugify(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[^\w\s-]+/g, '')
    .trim()
    .replace(/[-\s]+/g, '-')
    .toLowerCase();
}

function cssString(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
}

function normalizeFamily(value) {
  const sanitized = sanitizeText(value);
  return sanitized || 'Custom Font';
}

function guessFontFormat(value = '') {
  const lower = String(value).toLowerCase();
  if (lower.endsWith('.woff2')) return 'woff2';
  if (lower.endsWith('.woff')) return 'woff';
  if (lower.endsWith('.otf')) return 'opentype';
  if (lower.endsWith('.ttf')) return 'truetype';
  return 'woff2';
}

function normalizeUploadedFontEntry(entry) {
  const family = normalizeFamily(entry?.family || entry?.nameEn || entry?.nameAr);
  const id = sanitizeText(entry?.id) || `font-${slugify(family) || 'custom'}`;
  const url = sanitizeText(entry?.url);

  if (!url) {
    return null;
  }

  const nameAr = sanitizeText(entry?.nameAr) || family;
  const nameEn = sanitizeText(entry?.nameEn) || family;

  return {
    id,
    family,
    cssFamily: `'${cssString(family)}', sans-serif`,
    nameAr,
    nameEn,
    category: sanitizeText(entry?.category) || 'custom',
    source: sanitizeText(entry?.source) || 'upload',
    provider: sanitizeText(entry?.provider) || 'custom',
    providerLabel: sanitizeText(entry?.providerLabel) || 'Custom Upload',
    sampleAr: sanitizeText(entry?.sampleAr) || ARABIC_SAMPLE,
    sampleEn: sanitizeText(entry?.sampleEn) || ENGLISH_SAMPLE,
    url,
    format: sanitizeText(entry?.format) || guessFontFormat(url),
    storageKey: sanitizeText(entry?.storageKey),
    isActive: entry?.isActive !== false,
    createdAt: sanitizeText(entry?.createdAt) || new Date().toISOString(),
    originalName: sanitizeText(entry?.originalName),
    downloadUrl: url,
  };
}

export const BUILTIN_FONT_LIBRARY = BUILTIN_FONT_DEFINITIONS.map((font) => ({
  ...font,
  cssFamily: `'${cssString(font.family)}', ${font.category === 'arabic' ? 'sans-serif' : 'serif'}`,
  sampleAr: ARABIC_SAMPLE,
  sampleEn: ENGLISH_SAMPLE,
  source: 'builtin',
  provider: 'google',
  providerLabel: 'Google Fonts',
  specimenUrl: `https://fonts.google.com/specimen/${font.specimenSlug}`,
  downloadUrl: `https://fonts.google.com/specimen/${font.specimenSlug}`,
}));

const GOOGLE_FONT_IMPORT_URL = `https://fonts.googleapis.com/css2?${BUILTIN_FONT_LIBRARY.map((font) => `family=${font.specimenSlug}`).join('&')}&display=swap`;

export function extractUploadedFontLibrary(settings) {
  const rawFonts = settings?.footerConfig?.fontLibrary;
  if (!Array.isArray(rawFonts)) {
    return [];
  }

  return rawFonts
    .map((entry) => normalizeUploadedFontEntry(entry))
    .filter(Boolean);
}

export function mergeFontLibraryIntoFooterConfig(settings, nextFontLibrary) {
  const currentFooterConfig =
    settings?.footerConfig && typeof settings.footerConfig === 'object' && !Array.isArray(settings.footerConfig)
      ? settings.footerConfig
      : {};

  return {
    ...currentFooterConfig,
    fontLibrary: nextFontLibrary
      .map((entry) => normalizeUploadedFontEntry(entry))
      .filter(Boolean),
  };
}

export function buildPublicFontLibraryPayload(settings) {
  const uploaded = extractUploadedFontLibrary(settings).filter((entry) => entry.isActive !== false);

  return {
    generatedAt: new Date().toISOString(),
    stylesheetHref: PUBLIC_FONT_LIBRARY_STYLESHEET_PATH,
    builtins: BUILTIN_FONT_LIBRARY,
    uploaded,
    all: [...BUILTIN_FONT_LIBRARY, ...uploaded],
  };
}

export function buildPublicFontStylesheet(settings) {
  const uploaded = extractUploadedFontLibrary(settings).filter((entry) => entry.isActive !== false);

  const uploadedCss = uploaded
    .map((entry) => {
      const family = cssString(entry.family);
      const url = String(entry.url).replace(/"/g, '%22');
      const format = cssString(entry.format || guessFontFormat(entry.url));
      return `@font-face {
  font-family: '${family}';
  src: url("${url}") format('${format}');
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}`;
    })
    .join('\n\n');

  return `@import url('${GOOGLE_FONT_IMPORT_URL}');

${uploadedCss}
`;
}
