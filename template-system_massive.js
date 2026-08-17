import { z } from 'zod';

const SHARED_TEMPLATE_DEFINITIONS = [
  {
    slug: 'jathuandthanu',
    name: 'Jathu & Thanu',
    nameAr: '╪¼╪º╪½┘ê ┘ê╪½╪º┘å┘ê',
    description: '╪»╪╣┘ê╪⌐ ╪▓┘ü╪º┘ü ┘ç┘å╪»┘è╪⌐/╪ó╪│┘è┘ê┘è╪⌐ ┘ü╪º╪«╪▒╪⌐',
    previewImage: '/jathuandthanu/preview.png',
    sourceType: 'tilda-static',
    engine: 'static-html',
  },
  {
    slug: 'royal',
    name: 'Royal',
    nameAr: '╪º┘ä┘à┘ä┘â┘è',
    description: '╪¬╪╡┘à┘è┘à ┘ü╪º╪«╪▒ ╪¿┘à╪╕╪▒┘ê┘ü ┘à╪¬╪¡╪▒┘â',
    previewImage: '/majestic/intro-poster-new.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'majestic',
    name: 'Majestic',
    nameAr: '┘à╪º╪¼╪│╪¬┘è┘â',
    description: '╪»╪╣┘ê╪⌐ ┘ü┘è╪»┘è┘ê ╪│┘è┘å┘à╪º╪ª┘è╪⌐ ╪¿┘à╪╕┘ç╪▒ ╪º┘ä┘à╪╕╪▒┘ê┘ü ╪º┘ä┘à╪¬╪¡╪▒┘â',
    previewImage: '/majestic/intro-poster-new.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'twilight',
    name: 'Twilight',
    nameAr: '╪¬┘ê┘è┘ä╪º┘è╪¬',
    description: '╪»╪╣┘ê╪⌐ ╪║╪º┘à╪╢╪⌐ ┘ê┘ü╪«┘à╪⌐ ┘à╪│╪¬┘ê╪¡╪º╪⌐ ┘à┘å ╪º┘ä╪ú┘ä┘ê╪º┘å ╪º┘ä╪»╪º┘â┘å╪⌐',
    previewImage: '/twilight/preview.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'imperial',
    name: 'Imperial',
    nameAr: '╪Ñ┘à╪¿╪▒┘è╪º┘ä',
    description: '╪»╪╣┘ê╪⌐ ╪▓┘ü╪º┘ü ╪Ñ┘à╪¿╪▒╪º╪╖┘ê╪▒┘è╪⌐ ┘ü╪º╪«╪▒╪⌐ ╪¿╪ú┘ä┘ê╪º┘å ╪╣┘à┘è┘é╪⌐',
    previewImage: '/imperial/preview.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'toscana',
    name: 'Toscana',
    nameAr: '╪¬┘ê╪│┘â╪º┘å╪º',
    description: '╪»╪╣┘ê╪⌐ ╪▓┘ü╪º┘ü ╪»╪º┘ü╪ª╪⌐ ╪¿╪ú┘ä┘ê╪º┘å ╪º┘ä╪╖╪¿┘è╪╣╪⌐',
    previewImage: '/toscana/preview.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'sacredgarden',
    name: 'The Sacred Garden',
    nameAr: '╪º┘ä╪¡╪»┘è┘é╪⌐ ╪º┘ä┘à┘é╪»╪│╪⌐',
    description: '╪»╪╣┘ê╪⌐ ╪▓┘ü╪º┘ü ╪¬╪¬╪▓┘è┘å ╪¿╪º┘ä┘ê╪▒┘ê╪» ┘ê╪º┘ä╪¡╪»╪º╪ª┘é',
    previewImage: '/sacredgarden/preview.png',
    sourceType: 'tilda-static',
    engine: 'static-html',
  },
  {
    slug: 'blossomoud',
    name: 'Blossom Oud',
    nameAr: '╪¿┘ä┘ê╪│┘ê┘à ╪╣┘ê╪»',
    description: '╪»╪╣┘ê╪⌐ ╪▓┘ü╪º┘ü ╪ú┘å┘è┘é╪⌐ ┘à╪│╪¬┘ê╪¡╪º╪⌐ ┘à┘å ╪º┘ä╪╣┘ê╪» ┘ê╪º┘ä╪ú╪▓┘ç╪º╪▒',
    previewImage: '/blossomoud/preview.png',
    sourceType: 'tilda-static',
    engine: 'static-html',
  },
  {
    slug: 'dolcevita',
    name: 'Dolce Vita',
    nameAr: '╪»┘ê┘ä╪¬╪┤┘è ┘ü┘è╪¬╪º',
    description: '╪»╪╣┘ê╪⌐ ╪▓┘ü╪º┘ü ╪Ñ┘è╪╖╪º┘ä┘è╪⌐ ╪º┘ä╪╖╪º╪¿╪╣',
    previewImage: '/dolcevita/preview.png',
    sourceType: 'tilda-static',
    engine: 'static-html',
  },
  {
    slug: 'destinationlove',
    name: 'Destination Love',
    nameAr: '╪¡╪¿ ╪º┘ä╪│┘ü╪▒',
    description: '╪»╪╣┘ê╪⌐ ╪▓┘ü╪º┘ü ┘à╪│╪¬┘ê╪¡╪º╪⌐ ┘à┘å ╪¬╪░┘â╪▒╪⌐ ╪º┘ä╪│┘ü╪▒',
    previewImage: '/destinationlove/preview.jpg',
    sourceType: 'tilda-static',
    engine: 'static-html',
  },
  {
    slug: 'classic',
    name: 'Classic',
    nameAr: '┘â┘ä╪º╪│┘è┘â',
    description: '╪¿╪º╪¿ ┘è┘ü╪¬╪¡ ┘à╪╣ ╪╣┘å╪º╪╡╪▒ ╪¿╪╡╪▒┘è╪⌐ ╪▒┘ê┘à╪º┘å╪│┘è╪⌐',
    previewImage: '/classic/assets/preloader-poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'bab',
    name: 'Bab',
    nameAr: '╪¿╪º╪¿ ╪º┘ä┘ü╪▒╪¡',
    description: '╪¿╪º╪¿ ┘è┘Å┘ü╪¬╪¡ ╪╣┘ä┘ë ┘à╪┤┘ç╪» ╪º┘ä╪»╪╣┘ê╪⌐',
    previewImage: '/bab/assets/door-poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'reverie',
    name: 'Reverie',
    nameAr: '╪¡┘Å┘ä┘à ┘ê╪▒╪»┘è',
    description: '┘à╪╕╪▒┘ê┘ü ┘ê╪▒╪»┘è ┘è┘ü╪¬╪¡ ╪╣┘ä┘ë ╪¿╪¡┘è╪▒╪⌐ ┘ç╪º╪»╪ª╪⌐',
    previewImage: '/reverie/assets/envelope-poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'ring',
    name: 'Ring',
    nameAr: '╪º┘ä╪«╪º╪¬┘à',
    description: '╪╡┘å╪»┘ê┘é ╪«╪º╪¬┘à ┘è┘ü╪¬╪¡ ╪╣┘ä┘ë ╪¬┘ü╪º╪╡┘è┘ä ╪º┘ä╪»╪╣┘ê╪⌐',
    previewImage: '/ring/assets/video-poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'letter',
    name: 'Letter',
    nameAr: '╪▒╪│╪º┘ä╪⌐',
    description: '┘à╪╕╪▒┘ê┘ü ┘â┘ä╪º╪│┘è┘â┘è ┘è┘ü╪¬╪¡ ╪╣┘ä┘ë ╪º┘ä╪»╪╣┘ê╪⌐',
    previewImage: '/letter/assets/letter-open.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'disney',
    name: 'Disney',
    nameAr: '╪»┘è╪▓┘å┘è',
    description: '┘é╪╡╪▒ ┘ê╪¿┘ê╪º╪¿╪⌐ ╪│╪¡╪▒┘è╪⌐ ╪¿╪╖╪º╪¿╪╣ ┘é╪╡╪╡┘è',
    previewImage: '/disney/assets/door-poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'rozana',
    name: 'Rozana',
    nameAr: '╪▒┘ê╪▓┘å╪⌐',
    description: '┘ê╪▒┘é╪⌐ ╪¬┘å╪┤┘é ╪╣┘å ┘à╪┤┘ç╪» ╪º┘ä╪¡┘ü┘ä',
    previewImage: '/rozana/assets/poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'hadeel',
    name: 'Hadeel',
    nameAr: '┘ç╪»┘è┘ä',
    description: '╪╖┘è┘ê╪▒ ┘ê┘à╪º╪í ┘ê╪¡╪▒┘â╪⌐ ╪▒┘ê┘à╪º┘å╪│┘è╪⌐',
    previewImage: '/hadeel/assets/poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'wisal',
    name: 'Wisal',
    nameAr: '┘ê┘É╪╡╪º┘ä',
    description: '┘è╪»╪º┘å ╪¬┘ä╪¬┘é┘è╪º┘å ┘ü┘è ┘à┘à╪▒ ╪º┘ä╪╢┘ê╪í',
    previewImage: '/wisal/assets/poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'vangogh',
    name: 'Vangogh',
    nameAr: '┘ä┘è┘ä╪⌐ ╪º┘ä┘å╪¼┘ê┘à',
    description: '╪»╪╣┘ê╪⌐ ┘à╪▒╪│┘ê┘à╪⌐ ╪╣┘ä┘ë ╪╖╪▒╪º╪▓ ┘ü╪º┘å ┘â┘ê╪«',
    previewImage: '/vangogh/assets/preloader-poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'blush',
    name: 'Blush',
    nameAr: '┘ê╪▒╪»╪⌐',
    description: '┘à╪╕╪▒┘ê┘ü ╪¿┘ü┘è┘ê┘â╪⌐ ┘è┘ü╪¬╪¡ ╪╣┘ä┘ë ╪¡╪»┘è┘é╪⌐',
    previewImage: '/blush/assets/share.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
];

const CORE_OPENING_LIBRARY = [
  {
    slug: 'native-template',
    name: 'Native Template Opening',
    nameAr: '╪º┘ä╪º┘ü╪¬╪¬╪º╪¡┘è╪⌐ ╪º┘ä╪ú╪╡┘ä┘è╪⌐ ┘ä┘ä┘é╪º┘ä╪¿',
    type: 'native-template',
    description: '╪º╪│╪¬╪«╪»╪º┘à ╪º┘ä╪º┘ü╪¬╪¬╪º╪¡┘è╪⌐ ╪º┘ä╪ú╪╡┘ä┘è╪⌐ ╪º┘ä┘à╪»┘à╪¼╪⌐ ╪»╪º╪«┘ä ╪º┘ä┘é╪º┘ä╪¿',
    descriptionAr: '╪º╪│╪¬╪«╪»╪º┘à ╪º┘ä╪º┘ü╪¬╪¬╪º╪¡┘è╪⌐ ╪º┘ä╪ú╪╡┘ä┘è╪⌐ ╪º┘ä┘à╪»┘à╪¼╪⌐ ╪»╪º╪«┘ä ╪º┘ä┘é╪º┘ä╪¿',
    thumbnail: '/images/hero-bg.jpg',
    isActive: true,
    sortOrder: 0,
    compatibilityRules: { mode: 'all-templates' },
    defaultConfig: { allowSkip: true, reducedMotion: true },
  },
  {
    slug: 'minimal-fade',
    name: 'Minimal Fade',
    nameAr: '╪¬┘ä╪º╪┤┘è ╪¿╪│┘è╪╖',
    type: 'shared-overlay',
    description: '╪º┘ü╪¬╪¬╪º╪¡┘è╪⌐ ╪«┘ü┘è┘ü╪⌐ ╪¿╪¬┘à┘ç┘è╪» ┘å╪╡┘è ╪¿╪│┘è╪╖',
    descriptionAr: '╪º┘ü╪¬╪¬╪º╪¡┘è╪⌐ ╪«┘ü┘è┘ü╪⌐ ╪¿╪¬┘à┘ç┘è╪» ┘å╪╡┘è ╪¿╪│┘è╪╖',
    thumbnail: '/images/hero-bg.jpg',
    isActive: true,
    sortOrder: 1,
    compatibilityRules: { mode: 'structured-only' },
    defaultConfig: { allowSkip: true, reducedMotion: true, overlayDurationMs: 1200 },
  },
  {
    slug: 'no-opening',
    name: 'No Opening',
    nameAr: '╪¿╪»┘ê┘å ╪º┘ü╪¬╪¬╪º╪¡┘è╪⌐',
    type: 'none',
    description: '╪º┘ä╪»╪«┘ê┘ä ┘à╪¿╪º╪┤╪▒╪⌐ ╪Ñ┘ä┘ë ┘à╪¡╪¬┘ê┘ë ╪º┘ä╪»╪╣┘ê╪⌐',
    descriptionAr: '╪º┘ä╪»╪«┘ê┘ä ┘à╪¿╪º╪┤╪▒╪⌐ ╪Ñ┘ä┘ë ┘à╪¡╪¬┘ê┘ë ╪º┘ä╪»╪╣┘ê╪⌐',
    thumbnail: '/images/hero-bg.jpg',
    isActive: true,
    sortOrder: 2,
    compatibilityRules: { mode: 'all-templates' },
    defaultConfig: { allowSkip: true },
  },
];

const TEMPLATE_OPENING_LIBRARY = SHARED_TEMPLATE_DEFINITIONS.filter((definition) => definition.sourceType === 'structured-static').map((definition, index) => ({
  slug: `template-opening:${definition.slug}`,
  name: `${definition.name} Opening`,
  nameAr: `╪º┘ü╪¬╪¬╪º╪¡┘è╪⌐ ${definition.nameAr}`,
  type: 'template-opening',
  description: `Use the native opening sequence from ${definition.name}`,
  descriptionAr: `╪º╪│╪¬╪«╪»╪º┘à ╪º┘ü╪¬╪¬╪º╪¡┘è╪⌐ ┘é╪º┘ä╪¿ ${definition.nameAr} ┘ü┘ê┘é ┘à╪¡╪¬┘ê┘ë ╪º┘ä┘é╪º┘ä╪¿ ╪º┘ä╪¡╪º┘ä┘è`,
  thumbnail: definition.previewImage,
  isActive: true,
  sortOrder: 100 + index,
  compatibilityRules: { mode: 'all-templates' },
  sourceTemplateSlug: definition.slug,
  defaultConfig: {
    allowSkip: true,
    reducedMotion: true,
    sourceTemplateSlug: definition.slug,
  },
}));

export const OPENING_LIBRARY = [
  ...CORE_OPENING_LIBRARY,
  ...TEMPLATE_OPENING_LIBRARY,
];

const sharedSections = [
  {
    key: 'hero',
    labelAr: '╪º┘ä┘à┘é╪»┘à╪⌐',
    labelEn: 'Hero',
    description: '╪º┘ä╪º╪│┘à┘è┘å ┘ê╪º┘ä╪▒╪│╪º┘ä╪⌐ ╪º┘ä╪▒╪ª┘è╪│┘è╪⌐',
    order: 0,
    supportsVisibility: true,
  },
  {
    key: 'details',
    labelAr: '╪º┘ä╪¬┘ü╪º╪╡┘è┘ä',
    labelEn: 'Details',
    description: '╪º┘ä╪▓┘à╪º┘å ┘ê╪º┘ä┘à┘â╪º┘å',
    order: 1,
    supportsVisibility: true,
  },
  {
    key: 'countdown',
    labelAr: '╪º┘ä╪╣╪» ╪º┘ä╪¬┘å╪º╪▓┘ä┘è',
    labelEn: 'Countdown',
    description: '╪╣╪▒╪╢ ╪º┘ä┘ê┘é╪¬ ╪º┘ä┘à╪¬╪¿┘é┘è',
    order: 2,
    supportsVisibility: true,
  },
  {
    key: 'timeline',
    labelAr: '╪º┘ä╪¿╪▒┘å╪º┘à╪¼',
    labelEn: 'Schedule',
    description: '╪¿╪▒┘å╪º┘à╪¼ ╪º┘ä╪¡┘ü┘ä',
    order: 3,
    supportsVisibility: true,
  },
  {
    key: 'gallery',
    labelAr: '╪º┘ä┘à╪╣╪▒╪╢',
    labelEn: 'Gallery',
    description: '╪╡┘ê╪▒ ╪º┘ä╪¡┘ü┘ä ┘ê╪º┘ä╪░┘â╪▒┘è╪º╪¬',
    order: 4,
    supportsVisibility: true,
  },
  {
    key: 'rsvp',
    labelAr: '╪¬╪ú┘â┘è╪» ╪º┘ä╪¡╪╢┘ê╪▒',
    labelEn: 'RSVP',
    description: '╪º╪│╪¬┘é╪¿╪º┘ä ╪▒╪»┘ê╪» ╪º┘ä╪╢┘è┘ê┘ü',
    order: 5,
    supportsVisibility: true,
  },
  {
    key: 'notes',
    labelAr: '╪º┘ä╪ú╪│╪ª┘ä╪⌐ ┘ê╪º┘ä┘à┘ä╪º╪¡╪╕╪º╪¬',
    labelEn: 'Questions & Notes',
    description: '┘à┘ä╪º╪¡╪╕╪º╪¬ ╪ú┘ê ╪¬╪╣┘ä┘è┘à╪º╪¬ ╪Ñ╪╢╪º┘ü┘è╪⌐',
    order: 6,
    supportsVisibility: true,
  },
  {
    key: 'calendar',
    labelAr: '╪º┘ä╪¬┘é┘ê┘è┘à',
    labelEn: 'Calendar',
    description: '╪Ñ╪╢╪º┘ü╪⌐ ╪º┘ä┘à┘ê╪╣╪» ╪Ñ┘ä┘ë ╪º┘ä╪¬┘é┘ê┘è┘à',
    order: 7,
    supportsVisibility: true,
  },
];

const sharedThemeFields = [
  {
    key: 'primaryColor',
    labelAr: '╪º┘ä┘ä┘ê┘å ╪º┘ä╪ú╪│╪º╪│┘è',
    labelEn: 'Primary Color',
    type: 'color',
    defaultValue: '#7f2a1f',
    section: 'theme',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'accentColor',
    labelAr: '┘ä┘ê┘å ╪º┘ä╪Ñ╪¿╪▒╪º╪▓',
    labelEn: 'Accent Color',
    type: 'color',
    defaultValue: '#c39a58',
    section: 'theme',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'surfaceColor',
    labelAr: '┘ä┘ê┘å ╪º┘ä╪│╪╖╪¡',
    labelEn: 'Surface Color',
    type: 'color',
    defaultValue: '#fffaf6',
    section: 'theme',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'fontHeading',
    labelAr: '╪«╪╖ ╪º┘ä╪╣┘å╪º┘ê┘è┘å',
    labelEn: 'Heading Font',
    type: 'font',
    defaultValue: 'Aref Ruqaa',
    section: 'theme',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'fontBody',
    labelAr: '╪«╪╖ ╪º┘ä┘å╪╡┘ê╪╡',
    labelEn: 'Body Font',
    type: 'font',
    defaultValue: 'Tajawal',
    section: 'theme',
    shareOnTemplateSwitch: true,
  },
];

const sharedFields = [
  {
    key: 'groomName',
    labelAr: '╪º╪│┘à ╪º┘ä╪╣╪▒┘è╪│',
    labelEn: 'Groom Name',
    type: 'text',
    required: true,
    defaultValue: '',
    section: 'basic',
    bindTo: 'groomName',
    bindingMethod: 'text',
    selector: '#groomName, #heroGroom',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'brideName',
    labelAr: '╪º╪│┘à ╪º┘ä╪╣╪▒┘ê╪│',
    labelEn: 'Bride Name',
    type: 'text',
    required: true,
    defaultValue: '',
    section: 'basic',
    bindTo: 'brideName',
    bindingMethod: 'text',
    selector: '#brideName, #heroBride',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'guestName',
    labelAr: '╪º╪│┘à ╪º┘ä╪╢┘è┘ü',
    labelEn: 'Guest Name',
    type: 'text',
    defaultValue: '',
    section: 'basic',
    bindTo: 'guestName',
    bindingMethod: 'text',
    selector: '#env-guest-name',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'openingKicker',
    labelAr: '╪╣┘å┘ê╪º┘å ╪º┘ä╪º┘ü╪¬╪¬╪º╪¡┘è╪⌐',
    labelEn: 'Opening Title',
    type: 'text',
    defaultValue: '',
    section: 'opening',
    bindTo: 'openingKicker',
    bindingMethod: 'text',
    selector: '#coverKicker, .cover__kick, .cover-kicker, .env__kicker, .preloader-cta__label',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'openingNames',
    labelAr: '╪ú╪│┘à╪º╪í ╪º┘ä╪║┘ä╪º┘ü',
    labelEn: 'Opening Names',
    type: 'text',
    defaultValue: '',
    section: 'opening',
    bindTo: 'openingNames',
    bindingMethod: 'text',
    selector: '#coverNames, .cover__names, .env__names, .cover-names',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'openingHint',
    labelAr: '╪¬┘ä┘à┘è╪¡ ╪º┘ä┘ü╪¬╪¡',
    labelEn: 'Opening Hint',
    type: 'text',
    defaultValue: '',
    section: 'opening',
    bindTo: 'openingHint',
    bindingMethod: 'text',
    selector: '#coverHint, #knockHint, .cover__hint, .env__hint, .preloader-text, .tap-hint',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'openingPoem',
    labelAr: '╪º┘ä┘å╪╡ ╪º┘ä╪¬┘à┘ç┘è╪»┘è',
    labelEn: 'Opening Intro Text',
    type: 'textarea',
    defaultValue: '',
    section: 'opening',
    bindTo: 'openingPoem',
    bindingMethod: 'text',
    selector: '.cover__poem',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'openingEyebrow',
    labelAr: '╪º┘ä╪│╪╖╪▒ ╪º┘ä╪╣┘ä┘ê┘è',
    labelEn: 'Opening Eyebrow',
    type: 'text',
    defaultValue: '',
    section: 'opening',
    bindTo: 'openingEyebrow',
    bindingMethod: 'text',
    selector: '.hero__eyebrow',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'occasion',
    labelAr: '┘å┘ê╪╣ ╪º┘ä┘à┘å╪º╪│╪¿╪⌐',
    labelEn: 'Occasion Type',
    type: 'text',
    defaultValue: 'wedding',
    section: 'basic',
    bindTo: 'occasion',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'weddingDate',
    labelAr: '╪º┘ä╪¬╪º╪▒┘è╪« ┘ê╪º┘ä┘ê┘é╪¬',
    labelEn: 'Wedding Date',
    type: 'datetime',
    required: true,
    defaultValue: '',
    section: 'details',
    bindTo: 'weddingDate',
    bindingMethod: 'computedDate',
    selector: '#heroDate, #weddingDate, #eventDate',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'dateText',
    labelAr: '┘å╪╡ ╪º┘ä╪¬╪º╪▒┘è╪« ╪º┘ä┘à╪«╪╡╪╡',
    labelEn: 'Custom Date Text',
    type: 'text',
    defaultValue: '',
    section: 'details',
    bindTo: 'dateText',
    bindingMethod: 'text',
    selector: '#heroDate, #weddingDate, #eventDate, #wipeDate',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'timeText',
    labelAr: '┘å╪╡ ╪º┘ä┘ê┘é╪¬ ╪º┘ä┘à╪«╪╡╪╡',
    labelEn: 'Custom Time Text',
    type: 'text',
    defaultValue: '',
    section: 'details',
    bindTo: 'timeText',
    bindingMethod: 'text',
    selector: '#weddingTime, #wipeTime',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'welcomeMessage',
    labelAr: '╪º┘ä╪¬╪▒╪¡┘è╪¿',
    labelEn: 'Welcome Message',
    type: 'textarea',
    defaultValue: '',
    section: 'wording',
    bindTo: 'welcomeMessage',
    bindingMethod: 'text',
    selector: '#heroInvite, #heroSubtitle',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'verseText',
    labelAr: '╪ó┘è╪⌐ ╪ú┘ê ╪»╪╣╪º╪í',
    labelEn: 'Verse Text',
    type: 'textarea',
    defaultValue: '',
    section: 'wording',
    bindTo: 'verseText',
    bindingMethod: 'text',
    selector: '#verseText',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'invitationText',
    labelAr: '┘å╪╡ ╪º┘ä╪»╪╣┘ê╪⌐',
    labelEn: 'Invitation Text',
    type: 'textarea',
    defaultValue: '',
    section: 'wording',
    bindTo: 'invitationText',
    bindingMethod: 'text',
    selector: '#invitationText',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'groomParentsLabel',
    labelAr: '╪╣┘å┘ê╪º┘å ╪╣╪º╪ª┘ä╪⌐ ╪º┘ä╪╣╪▒┘è╪│',
    labelEn: 'Groom Family Label',
    type: 'text',
    defaultValue: '',
    section: 'families',
    bindTo: 'groomParentsLabel',
    bindingMethod: 'text',
    selector: '#groomParentsLabel, .family__label:first-of-type',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'groomParents',
    labelAr: '╪╣╪º╪ª┘ä╪⌐ ╪º┘ä╪╣╪▒┘è╪│',
    labelEn: 'Groom Family',
    type: 'text',
    defaultValue: '',
    section: 'families',
    bindTo: 'groomParents',
    bindingMethod: 'text',
    selector: '#groomParents',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'brideParentsLabel',
    labelAr: '╪╣┘å┘ê╪º┘å ╪╣╪º╪ª┘ä╪⌐ ╪º┘ä╪╣╪▒┘ê╪│',
    labelEn: 'Bride Family Label',
    type: 'text',
    defaultValue: '',
    section: 'families',
    bindTo: 'brideParentsLabel',
    bindingMethod: 'text',
    selector: '#brideParentsLabel, .family__label:last-of-type',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'brideParents',
    labelAr: '╪╣╪º╪ª┘ä╪⌐ ╪º┘ä╪╣╪▒┘ê╪│',
    labelEn: 'Bride Family',
    type: 'text',
    defaultValue: '',
    section: 'families',
    bindTo: 'brideParents',
    bindingMethod: 'text',
    selector: '#brideParents',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'venueName',
    labelAr: '╪º╪│┘à ╪º┘ä┘é╪º╪╣╪⌐',
    labelEn: 'Venue Name',
    type: 'text',
    defaultValue: '',
    section: 'details',
    bindTo: 'venueName',
    bindingMethod: 'text',
    selector: '#venueName',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'venueAddress',
    labelAr: '╪º┘ä╪╣┘å┘ê╪º┘å',
    labelEn: 'Venue Address',
    type: 'text',
    defaultValue: '',
    section: 'details',
    bindTo: 'venueAddress',
    bindingMethod: 'text',
    selector: '#venueAddr',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'locationLink',
    labelAr: '╪▒╪º╪¿╪╖ ╪º┘ä╪«╪▒┘è╪╖╪⌐',
    labelEn: 'Map URL',
    type: 'url',
    defaultValue: '',
    section: 'details',
    bindTo: 'locationLink',
    bindingMethod: 'attribute',
    selector: '#mapBtn',
    attribute: 'href',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'contactLabel',
    labelAr: '╪╣┘å┘ê╪º┘å ╪º┘ä╪¬┘ê╪º╪╡┘ä',
    labelEn: 'Contact Label',
    type: 'text',
    defaultValue: '',
    section: 'contact',
    bindTo: 'contactLabel',
    bindingMethod: 'text',
    selector: '#contactLabel',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'contactName',
    labelAr: '╪º╪│┘à ╪¼┘ç╪⌐ ╪º┘ä╪¬┘ê╪º╪╡┘ä',
    labelEn: 'Contact Name',
    type: 'text',
    defaultValue: '',
    section: 'contact',
    bindTo: 'contactName',
    bindingMethod: 'text',
    selector: '#contactName',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'contactPhone',
    labelAr: '╪▒┘é┘à ╪º┘ä╪¬┘ê╪º╪╡┘ä',
    labelEn: 'Contact Phone',
    type: 'phone',
    defaultValue: '',
    section: 'contact',
    bindTo: 'contactPhone',
    bindingMethod: 'text',
    selector: '#contactPhone',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'titleInvitation',
    labelAr: '╪╣┘å┘ê╪º┘å ╪¿╪╖╪º┘é╪⌐ ╪º┘ä╪»╪╣┘ê╪⌐',
    labelEn: 'Invitation Section Title',
    type: 'text',
    defaultValue: '',
    section: 'sections',
    bindTo: 'titleInvitation',
    bindingMethod: 'text',
    selector: '.invitation .sec__title, .invitation .section__title, .sheet__kick, .card__kick, .sec-title span',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'titleCountdown',
    labelAr: '╪╣┘å┘ê╪º┘å ╪º┘ä╪╣╪» ╪º┘ä╪¬┘å╪º╪▓┘ä┘è',
    labelEn: 'Countdown Section Title',
    type: 'text',
    defaultValue: '',
    section: 'sections',
    bindTo: 'titleCountdown',
    bindingMethod: 'text',
    selector: '.count .sec__title, .when .section__title',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'titleProgram',
    labelAr: '╪╣┘å┘ê╪º┘å ╪º┘ä╪¿╪▒┘å╪º┘à╪¼',
    labelEn: 'Program Section Title',
    type: 'text',
    defaultValue: '',
    section: 'sections',
    bindTo: 'titleProgram',
    bindingMethod: 'text',
    selector: '.program .sec__title, .program .section__title, #program-section h2',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'titleVenue',
    labelAr: '╪╣┘å┘ê╪º┘å ╪º┘ä┘à┘â╪º┘å',
    labelEn: 'Venue Section Title',
    type: 'text',
    defaultValue: '',
    section: 'sections',
    bindTo: 'titleVenue',
    bindingMethod: 'text',
    selector: '.venue .sec__title, .venue .section__title',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'titleNotes',
    labelAr: '╪╣┘å┘ê╪º┘å ╪º┘ä┘à┘ä╪º╪¡╪╕╪º╪¬',
    labelEn: 'Notes Section Title',
    type: 'text',
    defaultValue: '',
    section: 'sections',
    bindTo: 'titleNotes',
    bindingMethod: 'text',
    selector: '.notes .sec__title, .notes .section__title',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'closingNote',
    labelAr: '┘â┘ä┘à╪⌐ ╪º┘ä╪«╪¬╪º┘à',
    labelEn: 'Closing Note',
    type: 'text',
    defaultValue: '',
    section: 'closing',
    bindTo: 'closingNote',
    bindingMethod: 'text',
    selector: '#closingNote',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'closingHashtag',
    labelAr: '┘ç╪º╪┤╪¬╪º╪║ ╪º┘ä┘à┘å╪º╪│╪¿╪⌐',
    labelEn: 'Hashtag',
    type: 'text',
    defaultValue: '',
    section: 'closing',
    bindTo: 'closingHashtag',
    bindingMethod: 'text',
    selector: '#closingHashtag',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'closingFamilies',
    labelAr: '╪¬┘ê┘é┘è╪╣ ╪º┘ä╪╣╪º╪ª┘ä╪¬┘è┘å',
    labelEn: 'Families Signature',
    type: 'text',
    defaultValue: '',
    section: 'closing',
    bindTo: 'closingFamilies',
    bindingMethod: 'text',
    selector: '#closingFamilies',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'showFamilies',
    labelAr: '╪Ñ╪╕┘ç╪º╪▒ ┘é╪│┘à ╪º┘ä╪╣╪º╪ª┘ä╪º╪¬',
    labelEn: 'Show Families',
    type: 'boolean',
    defaultValue: true,
    section: 'families',
    bindTo: 'showFamilies',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'brideFirst',
    labelAr: '╪¬┘é╪»┘è┘à ╪º┘ä╪╣╪▒┘ê╪│ ╪ú┘ê┘ä╪º┘ï',
    labelEn: 'Bride First',
    type: 'boolean',
    defaultValue: false,
    section: 'families',
    bindTo: 'brideFirst',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'coupleInviteLine',
    labelAr: '╪│╪╖╪▒ ╪¬╪╣╪▒┘è┘ü ╪º┘ä╪╣╪▒┘ê╪│┘è┘å',
    labelEn: 'Couple Invite Line',
    type: 'text',
    defaultValue: '',
    section: 'families',
    bindTo: 'coupleInviteLine',
    bindingMethod: 'text',
    selector: '#coupleInviteLine',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'groomRelationLabel',
    labelAr: '╪╣┘å┘ê╪º┘å ╪º┘ä╪╣╪▒┘è╪│ ╪º┘ä╪Ñ╪╢╪º┘ü┘è',
    labelEn: 'Groom Relation Label',
    type: 'text',
    defaultValue: '',
    section: 'families',
    bindTo: 'groomRelationLabel',
    bindingMethod: 'text',
    selector: '#groomRelationLabel',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'groomRelationName',
    labelAr: '╪º╪│┘à ╪º┘ä╪╣╪▒┘è╪│ ╪º┘ä╪Ñ╪╢╪º┘ü┘è',
    labelEn: 'Groom Relation Name',
    type: 'text',
    defaultValue: '',
    section: 'families',
    bindTo: 'groomRelationName',
    bindingMethod: 'text',
    selector: '#groomRelationName',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'brideRelationLabel',
    labelAr: '╪╣┘å┘ê╪º┘å ╪º┘ä╪╣╪▒┘ê╪│ ╪º┘ä╪Ñ╪╢╪º┘ü┘è',
    labelEn: 'Bride Relation Label',
    type: 'text',
    defaultValue: '',
    section: 'families',
    bindTo: 'brideRelationLabel',
    bindingMethod: 'text',
    selector: '#brideRelationLabel',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'brideRelationName',
    labelAr: '╪º╪│┘à ╪º┘ä╪╣╪▒┘ê╪│ ╪º┘ä╪Ñ╪╢╪º┘ü┘è',
    labelEn: 'Bride Relation Name',
    type: 'text',
    defaultValue: '',
    section: 'families',
    bindTo: 'brideRelationName',
    bindingMethod: 'text',
    selector: '#brideRelationName',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'musicUrl',
    labelAr: '╪º┘ä┘à┘ê╪│┘è┘é┘ë',
    labelEn: 'Music URL',
    type: 'audio',
    defaultValue: '',
    section: 'media',
    bindTo: 'musicUrl',
    bindingMethod: 'media',
    selector: '#bgMusic, #invitation-audio',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'venueImage',
    labelAr: '╪╡┘ê╪▒╪⌐ ╪º┘ä╪«┘ä┘ü┘è╪⌐ ╪ú┘ê ╪º┘ä┘é╪º╪╣╪⌐',
    labelEn: 'Venue Image',
    type: 'image',
    defaultValue: '',
    section: 'media',
    bindTo: 'venueImage',
    bindingMethod: 'backgroundImage',
    selector: '#venuePhoto, #venueImage',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'images.hero',
    labelAr: '╪╡┘ê╪▒╪⌐ ╪º┘ä╪¿╪╖┘ä ╪º┘ä╪»╪º╪«┘ä┘è╪⌐',
    labelEn: 'Hero Photo',
    type: 'image',
    defaultValue: '',
    section: 'media',
    bindTo: 'images.hero',
    bindingMethod: 'media',
    selector: '#heroPhotoImg, [data-farha-slot="hero-image"]',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'images.background',
    labelAr: '╪╡┘ê╪▒╪⌐ ╪«┘ä┘ü┘è╪⌐ ╪º┘ä┘à╪┤┘ç╪»',
    labelEn: 'Background Scene Image',
    type: 'image',
    defaultValue: '',
    section: 'media',
    bindTo: 'images.background',
    bindingMethod: 'media',
    selector: '#coverBg .bg-photo, #coverBg img.bg-photo, [data-farha-slot="background-image"]',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'images.venue',
    labelAr: '╪╡┘ê╪▒╪⌐ ╪º┘ä┘é╪º╪╣╪⌐ ╪º┘ä┘é╪»┘è┘à╪⌐',
    labelEn: 'Legacy Venue Image',
    type: 'image',
    defaultValue: '',
    section: 'media',
    bindTo: 'images.venue',
    bindingMethod: 'backgroundImage',
    selector: '#venuePhoto, #venueImage, [data-farha-slot="venue-image"]',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'galleryImages',
    labelAr: '┘à╪╣╪▒╪╢ ╪º┘ä╪╡┘ê╪▒',
    labelEn: 'Gallery Images',
    type: 'gallery',
    defaultValue: [],
    section: 'media',
    bindTo: 'galleryImages',
    bindingMethod: 'gallery',
    selector: '#galleryGrid, .mem-grid',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'program',
    labelAr: '╪º┘ä╪¿╪▒┘å╪º┘à╪¼',
    labelEn: 'Schedule',
    type: 'schedule',
    defaultValue: [],
    section: 'schedule',
    bindTo: 'program',
    bindingMethod: 'schedule',
    selector: '#timeline, .program',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'notes',
    labelAr: '┘à┘ä╪º╪¡╪╕╪º╪¬ ╪º┘ä╪╢┘è┘ê┘ü',
    labelEn: 'Notes',
    type: 'list',
    defaultValue: [],
    section: 'schedule',
    bindTo: 'notes',
    bindingMethod: 'list',
    selector: '#notesList',
    shareOnTemplateSwitch: true,
  },
];

export const templateFieldSchema = z.object({
  key: z.string().min(1),
  labelAr: z.string().min(1),
  labelEn: z.string().min(1),
  description: z.string().optional(),
  helpText: z.string().optional(),
  type: z.enum([
    'text',
    'textarea',
    'richText',
    'number',
    'date',
    'datetime',
    'time',
    'boolean',
    'select',
    'color',
    'font',
    'url',
    'phone',
    'image',
    'video',
    'audio',
    'location',
    'list',
    'repeater',
    'gallery',
    'schedule',
    'socialLink',
  ]),
  defaultValue: z.any().optional(),
  required: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  maxLength: z.number().optional(),
  acceptedFileTypes: z.array(z.string()).optional(),
  visibleWhen: z.record(z.any()).optional(),
  section: z.string().optional(),
  bindTo: z.string().optional(),
  bindingMethod: z.enum([
    'text',
    'attribute',
    'computedDate',
    'media',
    'backgroundImage',
    'gallery',
    'schedule',
    'list',
  ]).optional(),
  selector: z.string().optional(),
  attribute: z.string().optional(),
  shareOnTemplateSwitch: z.boolean().optional(),
});

export const templateManifestSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  nameAr: z.string().min(1),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  thumbnail: z.string().optional(),
  previewImage: z.string().optional(),
  previewVideo: z.string().optional(),
  engine: z.string().min(1),
  sourceType: z.string().min(1),
  version: z.string().min(1),
  supportedLanguages: z.array(z.string()),
  supportedEventTypes: z.array(z.string()),
  editableFields: z.array(templateFieldSchema),
  sections: z.array(z.object({
    key: z.string(),
    labelAr: z.string(),
    labelEn: z.string(),
    description: z.string().optional(),
    order: z.number().optional(),
    supportsVisibility: z.boolean().optional(),
  })),
  mediaSlots: z.array(z.object({
    key: z.string(),
    labelAr: z.string(),
    labelEn: z.string(),
    type: z.enum(['image', 'video', 'audio']),
  })),
  themeOptions: z.array(templateFieldSchema),
  openingCompatibility: z.array(z.string()),
  defaultValues: z.record(z.any()),
  validationRules: z.record(z.any()),
  runtimeBindings: z.record(z.any()),
  capabilities: z.record(z.any()),
  preserveFields: z.array(z.string()),
});

export const invitationRenderConfigSchema = z.object({
  version: z.literal('1.0.0'),
  invitationId: z.string().optional(),
  invitationSlug: z.string().optional(),
  templateSlug: z.string(),
  opening: z.object({
    slug: z.string(),
    type: z.string(),
    sourceTemplateSlug: z.string().optional(),
    config: z.record(z.any()).default({}),
  }),
  fields: z.record(z.any()),
  sections: z.record(z.boolean()),
  theme: z.record(z.any()),
  customElements: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'image', 'icon']),
    content: z.string(),
    x: z.number(),
    y: z.number(),
    name: z.string().optional(),
    fontSize: z.string().optional(),
    color: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    fontFamily: z.string().optional(),
    opacity: z.number().optional(),
    rotation: z.number().optional(),
    zIndex: z.number().optional(),
    cropX: z.number().optional(),
    cropY: z.number().optional(),
    hidden: z.boolean().optional(),
    locked: z.boolean().optional(),
    deviceOverrides: z.object({
      mobile: z.object({
        x: z.number().optional(),
        y: z.number().optional(),
        fontSize: z.string().optional(),
        width: z.string().optional(),
        height: z.string().optional(),
        opacity: z.number().optional(),
        rotation: z.number().optional(),
        cropX: z.number().optional(),
        cropY: z.number().optional(),
      }).optional(),
      tablet: z.object({
        x: z.number().optional(),
        y: z.number().optional(),
        fontSize: z.string().optional(),
        width: z.string().optional(),
        height: z.string().optional(),
        opacity: z.number().optional(),
        rotation: z.number().optional(),
        cropX: z.number().optional(),
        cropY: z.number().optional(),
      }).optional(),
      desktop: z.object({
        x: z.number().optional(),
        y: z.number().optional(),
        fontSize: z.string().optional(),
        width: z.string().optional(),
        height: z.string().optional(),
        opacity: z.number().optional(),
        rotation: z.number().optional(),
        cropX: z.number().optional(),
        cropY: z.number().optional(),
      }).optional(),
    }).optional(),
  })).default([]),
  nativeElementOverrides: z.record(z.object({
    label: z.string().optional(),
    selector: z.string().optional(),
    kind: z.string().optional(),
    textContent: z.string().optional(),
    mediaUrl: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    scale: z.number().optional(),
    rotation: z.number().optional(),
    opacity: z.number().optional(),
    zIndex: z.number().optional(),
    cropX: z.number().optional(),
    cropY: z.number().optional(),
    color: z.string().optional(),
    fontFamily: z.string().optional(),
    fontSize: z.string().optional(),
    fontWeight: z.string().optional(),
    fontStyle: z.string().optional(),
    lineHeight: z.string().optional(),
    letterSpacing: z.string().optional(),
    textAlign: z.string().optional(),
    textTransform: z.string().optional(),
    textDecoration: z.string().optional(),
    direction: z.string().optional(),
    textShadow: z.string().optional(),
    backgroundColor: z.string().optional(),
    borderRadius: z.string().optional(),
    borderWidth: z.string().optional(),
    borderColor: z.string().optional(),
    boxShadow: z.string().optional(),
    objectFit: z.string().optional(),
    hidden: z.boolean().optional(),
    locked: z.boolean().optional(),
  })).default({}),
  textOverrides: z.array(z.object({
    id: z.string(),
    path: z.string().optional(),
    text: z.string()
  })).default([]),
  preview: z.boolean().default(false),
  locale: z.string().default('ar'),
  ui: z.record(z.any()).default({}),
});

export function parseJsonSafely(value, fallback) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

export function sanitizeText(value) {
  if (value == null) return '';
  return String(value).replace(/[<>]/g, '').trim();
}

export function sanitizeUrl(value) {
  if (!value) return '';

  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch (error) {
    return '';
  }
}

export function sanitizeRichText(value) {
  if (!value) return '';

  return String(value)
    .replace(/<(?!\/?(b|strong|i|em|br|p|ul|ol|li)\b)[^>]*>/gi, '')
    .replace(/javascript:/gi, '');
}

export function buildLegacyStoryFromContentConfig(contentConfig = {}) {
  const legacyStory = {
    ...contentConfig,
    groom: contentConfig.groom || contentConfig.groomName || '',
    bride: contentConfig.bride || contentConfig.brideName || '',
    heroSub: contentConfig.heroSub || contentConfig.welcomeMessage || '',
    verse: contentConfig.verse || contentConfig.verseText || '',
    hashtag: contentConfig.hashtag || contentConfig.closingHashtag || '',
    mapUrl: contentConfig.mapUrl || contentConfig.locationLink || '',
    venueAddr: contentConfig.venueAddr || contentConfig.venueAddress || '',
    date: contentConfig.date || contentConfig.weddingDate || '',
    guestName: contentConfig.guestName || '',
    occasion: contentConfig.occasion || 'wedding',
    verseText: contentConfig.verseText || '',
    invitationText: contentConfig.invitationText || '',
    groomParentsLabel: contentConfig.groomParentsLabel || '',
    groomParents: contentConfig.groomParents || '',
    brideParentsLabel: contentConfig.brideParentsLabel || '',
    brideParents: contentConfig.brideParents || '',
    showFamilies: contentConfig.showFamilies !== false,
    brideFirst: contentConfig.brideFirst === true,
    coupleInviteLine: contentConfig.coupleInviteLine || '',
    groomRelationLabel: contentConfig.groomRelationLabel || '',
    groomRelationName: contentConfig.groomRelationName || '',
    brideRelationLabel: contentConfig.brideRelationLabel || '',
    brideRelationName: contentConfig.brideRelationName || '',
    closingNote: contentConfig.closingNote || '',
    closingHashtag: contentConfig.closingHashtag || '',
    closingFamilies: contentConfig.closingFamilies || '',
    locationLink: contentConfig.locationLink || '',
    program: Array.isArray(contentConfig.program) ? contentConfig.program : [],
    notes: Array.isArray(contentConfig.notes) ? contentConfig.notes : [],
    contactLabel: contentConfig.contactLabel || '',
    contactName: contentConfig.contactName || '',
    contactPhone: contentConfig.contactPhone || '',
    venueImage: contentConfig.venueImage || '',
    images: {
      venue: contentConfig['images.venue'] || contentConfig.venueImage || '',
      hero: contentConfig['images.hero'] || '',
      background: contentConfig['images.background'] || '',
    },
    galleryImages: Array.isArray(contentConfig.galleryImages) ? contentConfig.galleryImages : [],
  };

  if (legacyStory.date && (!legacyStory.dateText || !legacyStory.timeText)) {
    const parsedDate = new Date(legacyStory.date);
    if (!Number.isNaN(parsedDate.getTime())) {
      if (!legacyStory.dateText) {
        legacyStory.dateText = parsedDate.toLocaleDateString('ar-EG', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      if (!legacyStory.timeText) {
        legacyStory.timeText = parsedDate.toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }
  }

  return legacyStory;
}

function createBaseManifest(definition) {
  return {
    id: definition.slug,
    slug: definition.slug,
    name: definition.name,
    nameAr: definition.nameAr,
    description: definition.description,
    descriptionAr: definition.description,
    thumbnail: definition.previewImage,
    previewImage: definition.previewImage,
    previewVideo: definition.previewVideo,
    engine: definition.engine,
    sourceType: definition.sourceType,
    version: '1.0.0',
    supportedLanguages: ['ar', 'en'],
    supportedEventTypes: ['wedding', 'engagement', 'katb-kitab', 'henna'],
    editableFields: sharedFields,
    sections: sharedSections,
    mediaSlots: [
      { key: 'venueImage', labelAr: '╪╡┘ê╪▒╪⌐ ╪º┘ä╪«┘ä┘ü┘è╪⌐', labelEn: 'Venue Image', type: 'image' },
      { key: 'musicUrl', labelAr: '╪º┘ä┘à┘ê╪│┘è┘é┘ë', labelEn: 'Music', type: 'audio' },
      { key: 'galleryImages', labelAr: '╪º┘ä┘à╪╣╪▒╪╢', labelEn: 'Gallery', type: 'image' },
    ],
    themeOptions: sharedThemeFields,
    openingCompatibility: OPENING_LIBRARY.map((opening) => opening.slug),
    defaultValues: {
      welcomeMessage: '┘è╪¬╪┤╪▒┘æ┘ü╪º┘å ╪¿╪»╪╣┘ê╪¬┘â┘à ┘ä┘à╪┤╪º╪▒┘â╪¬┘ç┘à╪º ┘ü╪▒╪¡╪⌐ ╪º┘ä╪╣┘à╪▒',
      verseText: '╪º┘ä┘ä┘æ┘ç┘Å┘à┘Ä┘æ ╪¿╪º╪▒┘É┘â┘Æ ┘ä┘ç┘Å┘à╪º ┘ê╪¿╪º╪▒┘É┘â┘Æ ╪╣┘ä┘è┘ç┘É┘à╪º ┘ê╪º╪¼┘à┘Ä╪╣┘Æ ╪¿┘è┘å┘ç┘Å┘à╪º ┘ü┘è ╪«┘è╪▒',
      invitationText: '┘å╪¬╪┤╪▒┘ü ╪¿╪¡╪╢┘ê╪▒┘â┘à ┘ê┘à╪┤╪º╪▒┘â╪¬┘â┘à ╪ú╪¼┘à┘ä ┘ä╪¡╪╕╪º╪¬ ╪╣┘à╪▒┘å╪º.',
      guestName: '',
      occasion: 'wedding',
      groomParentsLabel: '╪╣╪º╪ª┘ä╪⌐ ╪º┘ä╪╣╪▒┘è╪│',
      brideParentsLabel: '╪╣╪º╪ª┘ä╪⌐ ╪º┘ä╪╣╪▒┘ê╪│',
      showFamilies: true,
      brideFirst: false,
      coupleInviteLine: '',
      groomRelationLabel: '',
      groomRelationName: '',
      brideRelationLabel: '',
      brideRelationName: '',
      contactLabel: '┘ä┘ä╪º╪│╪¬┘ü╪│╪º╪▒ ┘ê╪º┘ä╪¬╪ú┘â┘è╪»',
      'images.hero': '',
      'images.background': '',
      'images.venue': '',
      sections: {
        hero: true,
        details: true,
        countdown: true,
        timeline: true,
        gallery: true,
        rsvp: true,
        notes: true,
        calendar: true,
      },
      theme: {
        primaryColor: '#7f2a1f',
        accentColor: '#c39a58',
        surfaceColor: '#fffaf6',
        fontHeading: 'Aref Ruqaa',
        fontBody: 'Tajawal',
      },
    },
    validationRules: {
      requiredFields: ['groomName', 'brideName', 'weddingDate'],
      urlFields: ['locationLink', 'musicUrl'],
    },
    runtimeBindings: {
      fieldBindings: Object.fromEntries(
        sharedFields.map((field) => [
          field.key,
          {
            method: field.bindingMethod,
            selector: field.selector,
            attribute: field.attribute || null,
          },
        ]),
      ),
      sectionSelectors: {
        gallery: ['#gallery-section', '#da3wa-mem'],
        countdown: ['#countdown-section', '#countdown', '.count', '.when'],
        timeline: ['#program-section', '#timeline', '.program'],
        rsvp: ['#rsvp-section', '#da3wa-rsvp'],
        notes: ['#notes-section', '#notesList', '.notes'],
        calendar: ['#calendar-section', '#da3wa-cal'],
      },
    },
    capabilities: {
      supportsSchemaDrivenPreview: definition.sourceType === 'structured-static',
      supportsTemplateSwitching: true,
      supportsOpenings: true,
      supportsGallery: true,
      supportsSchedule: true,
      supportsRsvp: true,
      supportsThemeOptions: definition.sourceType === 'structured-static',
      requiresNativeAdapter: definition.sourceType !== 'structured-static',
    },
    preserveFields: sharedFields.filter((field) => field.shareOnTemplateSwitch).map((field) => field.key),
  };
}

export function getAllTemplateManifests() {
  return SHARED_TEMPLATE_DEFINITIONS.map((definition) => createBaseManifest(definition));
}

export function getTemplateManifest(slug) {
  return getAllTemplateManifests().find((manifest) => manifest.slug === slug) || null;
}

export function getOpeningBySlug(slug) {
  return OPENING_LIBRARY.find((opening) => opening.slug === slug) || OPENING_LIBRARY[0];
}

export function validateTemplateManifest(manifest) {
  return templateManifestSchema.safeParse(manifest);
}

export function normalizeInvitationData(invitation) {
  const legacyStory = parseJsonSafely(invitation?.coupleStory, {});
  const legacySections = parseJsonSafely(invitation?.sections, {});
  const legacyTheme = {
    ...parseJsonSafely(invitation?.customColors, {}),
    ...parseJsonSafely(invitation?.customFonts, {}),
  };

  const contentConfig = {
    groomName: sanitizeText(invitation?.groomName),
    brideName: sanitizeText(invitation?.brideName),
    guestName: sanitizeText(legacyStory.guestName || ''),
    occasion: sanitizeText(legacyStory.occasion || invitation?.eventType || 'wedding'),
    welcomeMessage: sanitizeText(invitation?.welcomeMessage || legacyStory.heroSub),
    verseText: sanitizeText(legacyStory.verseText || legacyStory.verse || ''),
    invitationText: sanitizeText(legacyStory.invitationText || ''),
    groomParentsLabel: sanitizeText(legacyStory.groomParentsLabel || '╪╣╪º╪ª┘ä╪⌐ ╪º┘ä╪╣╪▒┘è╪│'),
    groomParents: sanitizeText(legacyStory.groomParents || ''),
    brideParentsLabel: sanitizeText(legacyStory.brideParentsLabel || '╪╣╪º╪ª┘ä╪⌐ ╪º┘ä╪╣╪▒┘ê╪│'),
    brideParents: sanitizeText(legacyStory.brideParents || ''),
    showFamilies: legacyStory.showFamilies !== false,
    brideFirst: legacyStory.brideFirst === true,
    coupleInviteLine: sanitizeText(legacyStory.coupleInviteLine || ''),
    groomRelationLabel: sanitizeText(legacyStory.groomRelationLabel || ''),
    groomRelationName: sanitizeText(legacyStory.groomRelationName || ''),
    brideRelationLabel: sanitizeText(legacyStory.brideRelationLabel || ''),
    brideRelationName: sanitizeText(legacyStory.brideRelationName || ''),
    venueName: sanitizeText(invitation?.venueName),
    venueAddress: sanitizeText(invitation?.venueAddress),
    locationLink: sanitizeUrl(legacyStory.locationLink || legacyStory.mapUrl || ''),
    contactLabel: sanitizeText(legacyStory.contactLabel || '┘ä┘ä╪º╪│╪¬┘ü╪│╪º╪▒ ┘ê╪º┘ä╪¬╪ú┘â┘è╪»'),
    contactName: sanitizeText(legacyStory.contactName || ''),
    contactPhone: sanitizeText(legacyStory.contactPhone || ''),
    closingNote: sanitizeText(legacyStory.closingNote || ''),
    closingHashtag: sanitizeText(legacyStory.closingHashtag || legacyStory.hashtag || ''),
    closingFamilies: sanitizeText(legacyStory.closingFamilies || ''),
    musicUrl: sanitizeUrl(invitation?.musicUrl || ''),
    venueImage: sanitizeUrl(legacyStory.venueImage || invitation?.coverImage || ''),
    'images.hero': sanitizeUrl(legacyStory.images?.hero || ''),
    'images.background': sanitizeUrl(legacyStory.images?.background || ''),
    'images.venue': sanitizeUrl(legacyStory.images?.venue || legacyStory.venueImage || invitation?.coverImage || ''),
    galleryImages: Array.isArray(legacyStory.galleryImages) ? legacyStory.galleryImages.filter(Boolean) : [],
    program: Array.isArray(legacyStory.program) ? legacyStory.program : [],
    notes: Array.isArray(legacyStory.notes) ? legacyStory.notes : [],
  };

  return {
    contentConfig: {
      ...contentConfig,
      ...parseJsonSafely(invitation?.contentConfig, {}),
    },
    themeConfig: {
      ...legacyTheme,
      ...parseJsonSafely(invitation?.themeConfig, {}),
    },
    sectionConfig: {
      hero: true,
      details: true,
      countdown: true,
      timeline: true,
      gallery: true,
      rsvp: true,
      notes: true,
      calendar: true,
      ...legacySections,
      ...parseJsonSafely(invitation?.sectionConfig, {}),
    },
    openingConfig: {
      allowSkip: true,
      ...parseJsonSafely(invitation?.openingConfig, {}),
    },
    legacyConfig: legacyStory,
  };
}

function firstFilledString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function buildOpeningFieldOverrides(opening) {
  const textConfig =
    opening?.textConfig && typeof opening.textConfig === 'object' && !Array.isArray(opening.textConfig)
      ? opening.textConfig
      : {};
  const mediaConfig =
    opening?.mediaConfig && typeof opening.mediaConfig === 'object' && !Array.isArray(opening.mediaConfig)
      ? opening.mediaConfig
      : {};

  const openingVideo = firstFilledString(
    mediaConfig.openingVideo,
    mediaConfig.previewVideo,
    mediaConfig.videoUrl,
    mediaConfig.backgroundVideo,
    opening?.previewVideo,
  );
  const openingPoster = firstFilledString(
    mediaConfig.openingPoster,
    mediaConfig.backgroundImage,
    mediaConfig.coverImage,
    mediaConfig.previewImage,
    opening?.previewImage,
    opening?.thumbnail,
  );

  return {
    ...textConfig,
    ...(openingVideo ? { openingVideo } : {}),
    ...(openingPoster
      ? {
          openingPoster,
          openingBackgroundImage: openingPoster,
        }
      : {}),
  };
}

export function buildInvitationRenderConfig({ invitation, manifest, opening, preview = false }) {
  const normalized = normalizeInvitationData(invitation);
  const selectedOpening = opening || getOpeningBySlug(invitation?.opening?.slug || invitation?.openingId || 'native-template');
  const openingFieldOverrides = buildOpeningFieldOverrides(selectedOpening);
  const sourceTemplateSlug =
    selectedOpening.sourceTemplateSlug
    || selectedOpening.defaultConfig?.sourceTemplateSlug
    || normalized.openingConfig?.sourceTemplateSlug
    || undefined;

  const dateValue = invitation?.weddingDate
    ? new Date(invitation.weddingDate).toISOString()
    : '';

  return invitationRenderConfigSchema.parse({
    version: '1.0.0',
    invitationId: invitation?.id,
    invitationSlug: invitation?.slug,
    templateSlug: manifest.slug,
    opening: {
      slug: selectedOpening.slug,
      type: selectedOpening.type,
      sourceTemplateSlug,
      config: {
        ...normalized.openingConfig,
        ...(sourceTemplateSlug
          ? { sourceTemplateSlug }
          : {}),
      },
    },
    fields: {
      ...manifest.defaultValues,
      ...normalized.contentConfig,
      ...openingFieldOverrides,
      weddingDate: dateValue,
    },
    sections: normalized.sectionConfig,
    theme: {
      ...manifest.defaultValues.theme,
      ...normalized.themeConfig,
    },
    customElements: Array.isArray(invitation?.customElements)
      ? invitation.customElements
      : Array.isArray(invitation?.contentConfig?.__customElements)
        ? invitation.contentConfig.__customElements
        : [],
    nativeElementOverrides:
      invitation?.nativeElementOverrides
      && typeof invitation.nativeElementOverrides === 'object'
      && !Array.isArray(invitation.nativeElementOverrides)
        ? invitation.nativeElementOverrides
        : invitation?.contentConfig?.__nativeElementOverrides
          && typeof invitation.contentConfig.__nativeElementOverrides === 'object'
          && !Array.isArray(invitation.contentConfig.__nativeElementOverrides)
          ? invitation.contentConfig.__nativeElementOverrides
          : {},
    textOverrides: invitation?.textOverrides && typeof invitation.textOverrides === 'object' && !Array.isArray(invitation.textOverrides)
      ? Object.entries(invitation.textOverrides).map(([path, text]) => ({
          id: path,
          path,
          text: String(text ?? ''),
        }))
      : Array.isArray(invitation?.textOverrides)
        ? invitation.textOverrides
        : invitation?.contentConfig?.__textOverrides && typeof invitation.contentConfig.__textOverrides === 'object'
          ? Object.entries(invitation.contentConfig.__textOverrides).map(([path, text]) => ({
              id: path,
              path,
              text: String(text ?? ''),
            }))
          : [],
    preview,
    locale: invitation?.locale || 'ar',
    ui: {
      bilingualEnabled: Boolean(
        invitation?.uiConfig?.bilingualEnabled
        || invitation?.contentConfig?.__uiConfig?.bilingualEnabled,
      ),
      deviceMode:
        invitation?.uiConfig?.deviceMode
        || invitation?.contentConfig?.__uiConfig?.deviceMode
        || undefined,
      textLocks:
        invitation?.uiConfig?.textLocks && typeof invitation.uiConfig.textLocks === 'object' && !Array.isArray(invitation.uiConfig.textLocks)
          ? invitation.uiConfig.textLocks
          : invitation?.contentConfig?.__uiConfig?.textLocks && typeof invitation.contentConfig.__uiConfig.textLocks === 'object' && !Array.isArray(invitation.contentConfig.__uiConfig.textLocks)
            ? invitation.contentConfig.__uiConfig.textLocks
            : {},
      defaultLocale:
        invitation?.uiConfig?.defaultLocale
        || invitation?.contentConfig?.__uiConfig?.defaultLocale
        || invitation?.locale
        || 'ar',
      textStyleOverrides:
        invitation?.uiConfig?.textStyleOverrides && typeof invitation.uiConfig.textStyleOverrides === 'object' && !Array.isArray(invitation.uiConfig.textStyleOverrides)
          ? invitation.uiConfig.textStyleOverrides
          : invitation?.contentConfig?.__textStyleOverrides && typeof invitation.contentConfig.__textStyleOverrides === 'object' && !Array.isArray(invitation.contentConfig.__textStyleOverrides)
            ? invitation.contentConfig.__textStyleOverrides
            : {},
    },
  });
}

export function migrateTemplateConfigBetweenManifests(currentConfig, currentManifest, nextManifest) {
  const safeConfig = currentConfig || {};
  const transferableKeys = new Set(nextManifest.preserveFields || []);
  const preserved = {};
  const hidden = {};

  Object.entries(safeConfig).forEach(([key, value]) => {
    if (transferableKeys.has(key)) {
      preserved[key] = value;
    } else {
      hidden[key] = value;
    }
  });

  return {
    preserved,
    hidden,
    lostKeys: Object.keys(hidden),
    targetTemplateSlug: nextManifest.slug,
    sourceTemplateSlug: currentManifest.slug,
  };
}
