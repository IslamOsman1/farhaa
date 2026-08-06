import { z } from 'zod';

const SHARED_TEMPLATE_DEFINITIONS = [
  {
    slug: 'jathuandthanu',
    name: 'Jathu & Thanu',
    nameAr: 'جاثو وثانو',
    description: 'دعوة زفاف هندية/آسيوية فاخرة',
    previewImage: '/jathuandthanu/preview.png',
    sourceType: 'tilda-static',
    engine: 'static-html',
  },
  {
    slug: 'royal',
    name: 'Royal',
    nameAr: 'الملكي',
    description: 'تصميم فاخر بمظروف متحرك',
    previewImage: '/majestic/intro-poster-new.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'majestic',
    name: 'Majestic',
    nameAr: 'ماجستيك',
    description: 'دعوة فيديو سينمائية بمظهر المظروف المتحرك',
    previewImage: '/majestic/intro-poster-new.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'twilight',
    name: 'Twilight',
    nameAr: 'تويلايت',
    description: 'دعوة غامضة وفخمة مستوحاة من الألوان الداكنة',
    previewImage: '/twilight/preview.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'imperial',
    name: 'Imperial',
    nameAr: 'إمبريال',
    description: 'دعوة زفاف إمبراطورية فاخرة بألوان عميقة',
    previewImage: '/imperial/preview.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'toscana',
    name: 'Toscana',
    nameAr: 'توسكانا',
    description: 'دعوة زفاف دافئة بألوان الطبيعة',
    previewImage: '/toscana/preview.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'sacredgarden',
    name: 'The Sacred Garden',
    nameAr: 'الحديقة المقدسة',
    description: 'دعوة زفاف تتزين بالورود والحدائق',
    previewImage: '/sacredgarden/preview.png',
    sourceType: 'tilda-static',
    engine: 'static-html',
  },
  {
    slug: 'blossomoud',
    name: 'Blossom Oud',
    nameAr: 'بلوسوم عود',
    description: 'دعوة زفاف أنيقة مستوحاة من العود والأزهار',
    previewImage: '/blossomoud/preview.png',
    sourceType: 'tilda-static',
    engine: 'static-html',
  },
  {
    slug: 'dolcevita',
    name: 'Dolce Vita',
    nameAr: 'دولتشي فيتا',
    description: 'دعوة زفاف إيطالية الطابع',
    previewImage: '/dolcevita/preview.png',
    sourceType: 'tilda-static',
    engine: 'static-html',
  },
  {
    slug: 'destinationlove',
    name: 'Destination Love',
    nameAr: 'حب السفر',
    description: 'دعوة زفاف مستوحاة من تذكرة السفر',
    previewImage: '/destinationlove/preview.jpg',
    sourceType: 'tilda-static',
    engine: 'static-html',
  },
  {
    slug: 'classic',
    name: 'Classic',
    nameAr: 'كلاسيك',
    description: 'باب يفتح مع عناصر بصرية رومانسية',
    previewImage: '/classic/assets/preloader-poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'bab',
    name: 'Bab',
    nameAr: 'باب الفرح',
    description: 'باب يُفتح على مشهد الدعوة',
    previewImage: '/bab/assets/door-poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'reverie',
    name: 'Reverie',
    nameAr: 'حُلم وردي',
    description: 'مظروف وردي يفتح على بحيرة هادئة',
    previewImage: '/reverie/assets/envelope-poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'ring',
    name: 'Ring',
    nameAr: 'الخاتم',
    description: 'صندوق خاتم يفتح على تفاصيل الدعوة',
    previewImage: '/ring/assets/video-poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'letter',
    name: 'Letter',
    nameAr: 'رسالة',
    description: 'مظروف كلاسيكي يفتح على الدعوة',
    previewImage: '/letter/assets/letter-open.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'disney',
    name: 'Disney',
    nameAr: 'ديزني',
    description: 'قصر وبوابة سحرية بطابع قصصي',
    previewImage: '/disney/assets/door-poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'rozana',
    name: 'Rozana',
    nameAr: 'روزنة',
    description: 'ورقة تنشق عن مشهد الحفل',
    previewImage: '/rozana/assets/poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'hadeel',
    name: 'Hadeel',
    nameAr: 'هديل',
    description: 'طيور وماء وحركة رومانسية',
    previewImage: '/hadeel/assets/poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'wisal',
    name: 'Wisal',
    nameAr: 'وِصال',
    description: 'يدان تلتقيان في ممر الضوء',
    previewImage: '/wisal/assets/poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'vangogh',
    name: 'Vangogh',
    nameAr: 'ليلة النجوم',
    description: 'دعوة مرسومة على طراز فان كوخ',
    previewImage: '/vangogh/assets/preloader-poster.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
  {
    slug: 'blush',
    name: 'Blush',
    nameAr: 'وردة',
    description: 'مظروف بفيوكة يفتح على حديقة',
    previewImage: '/blush/assets/share.jpg',
    sourceType: 'structured-static',
    engine: 'static-html',
  },
];

const CORE_OPENING_LIBRARY = [
  {
    slug: 'native-template',
    name: 'Native Template Opening',
    nameAr: 'الافتتاحية الأصلية للقالب',
    type: 'native-template',
    description: 'استخدام الافتتاحية الأصلية المدمجة داخل القالب',
    descriptionAr: 'استخدام الافتتاحية الأصلية المدمجة داخل القالب',
    thumbnail: '/images/hero-bg.jpg',
    isActive: true,
    sortOrder: 0,
    compatibilityRules: { mode: 'all-templates' },
    defaultConfig: { allowSkip: true, reducedMotion: true },
  },
  {
    slug: 'minimal-fade',
    name: 'Minimal Fade',
    nameAr: 'تلاشي بسيط',
    type: 'shared-overlay',
    description: 'افتتاحية خفيفة بتمهيد نصي بسيط',
    descriptionAr: 'افتتاحية خفيفة بتمهيد نصي بسيط',
    thumbnail: '/images/hero-bg.jpg',
    isActive: true,
    sortOrder: 1,
    compatibilityRules: { mode: 'structured-only' },
    defaultConfig: { allowSkip: true, reducedMotion: true, overlayDurationMs: 1200 },
  },
  {
    slug: 'no-opening',
    name: 'No Opening',
    nameAr: 'بدون افتتاحية',
    type: 'none',
    description: 'الدخول مباشرة إلى محتوى الدعوة',
    descriptionAr: 'الدخول مباشرة إلى محتوى الدعوة',
    thumbnail: '/images/hero-bg.jpg',
    isActive: true,
    sortOrder: 2,
    compatibilityRules: { mode: 'all-templates' },
    defaultConfig: { allowSkip: true },
  },
];

const TEMPLATE_OPENING_LIBRARY = SHARED_TEMPLATE_DEFINITIONS.map((definition, index) => ({
  slug: `template-opening:${definition.slug}`,
  name: `${definition.name} Opening`,
  nameAr: `افتتاحية ${definition.nameAr}`,
  type: 'template-opening',
  description: `Use the native opening sequence from ${definition.name}`,
  descriptionAr: `استخدام افتتاحية قالب ${definition.nameAr} فوق محتوى القالب الحالي`,
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
    labelAr: 'المقدمة',
    labelEn: 'Hero',
    description: 'الاسمين والرسالة الرئيسية',
    order: 0,
    supportsVisibility: true,
  },
  {
    key: 'details',
    labelAr: 'التفاصيل',
    labelEn: 'Details',
    description: 'الزمان والمكان',
    order: 1,
    supportsVisibility: true,
  },
  {
    key: 'timeline',
    labelAr: 'البرنامج',
    labelEn: 'Schedule',
    description: 'برنامج الحفل',
    order: 2,
    supportsVisibility: true,
  },
  {
    key: 'gallery',
    labelAr: 'المعرض',
    labelEn: 'Gallery',
    description: 'صور الحفل والذكريات',
    order: 3,
    supportsVisibility: true,
  },
  {
    key: 'rsvp',
    labelAr: 'تأكيد الحضور',
    labelEn: 'RSVP',
    description: 'استقبال ردود الضيوف',
    order: 4,
    supportsVisibility: true,
  },
  {
    key: 'calendar',
    labelAr: 'التقويم',
    labelEn: 'Calendar',
    description: 'إضافة الموعد إلى التقويم',
    order: 5,
    supportsVisibility: true,
  },
];

const sharedThemeFields = [
  {
    key: 'primaryColor',
    labelAr: 'اللون الأساسي',
    labelEn: 'Primary Color',
    type: 'color',
    defaultValue: '#7f2a1f',
    section: 'theme',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'accentColor',
    labelAr: 'لون الإبراز',
    labelEn: 'Accent Color',
    type: 'color',
    defaultValue: '#c39a58',
    section: 'theme',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'surfaceColor',
    labelAr: 'لون السطح',
    labelEn: 'Surface Color',
    type: 'color',
    defaultValue: '#fffaf6',
    section: 'theme',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'fontHeading',
    labelAr: 'خط العناوين',
    labelEn: 'Heading Font',
    type: 'font',
    defaultValue: 'Aref Ruqaa',
    section: 'theme',
    shareOnTemplateSwitch: true,
  },
  {
    key: 'fontBody',
    labelAr: 'خط النصوص',
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
    labelAr: 'اسم العريس',
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
    labelAr: 'اسم العروس',
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
    key: 'weddingDate',
    labelAr: 'التاريخ والوقت',
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
    key: 'welcomeMessage',
    labelAr: 'الترحيب',
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
    labelAr: 'آية أو دعاء',
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
    labelAr: 'نص الدعوة',
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
    labelAr: 'عنوان عائلة العريس',
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
    labelAr: 'عائلة العريس',
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
    labelAr: 'عنوان عائلة العروس',
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
    labelAr: 'عائلة العروس',
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
    labelAr: 'اسم القاعة',
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
    labelAr: 'العنوان',
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
    labelAr: 'رابط الخريطة',
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
    labelAr: 'عنوان التواصل',
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
    labelAr: 'اسم جهة التواصل',
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
    labelAr: 'رقم التواصل',
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
    key: 'closingNote',
    labelAr: 'كلمة الختام',
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
    labelAr: 'هاشتاغ المناسبة',
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
    labelAr: 'توقيع العائلتين',
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
    key: 'musicUrl',
    labelAr: 'الموسيقى',
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
    labelAr: 'صورة الخلفية أو القاعة',
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
    key: 'galleryImages',
    labelAr: 'معرض الصور',
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
    labelAr: 'البرنامج',
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
    labelAr: 'ملاحظات الضيوف',
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
  preview: z.boolean().default(false),
  locale: z.string().default('ar'),
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
      { key: 'venueImage', labelAr: 'صورة الخلفية', labelEn: 'Venue Image', type: 'image' },
      { key: 'musicUrl', labelAr: 'الموسيقى', labelEn: 'Music', type: 'audio' },
      { key: 'galleryImages', labelAr: 'المعرض', labelEn: 'Gallery', type: 'image' },
    ],
    themeOptions: sharedThemeFields,
    openingCompatibility: OPENING_LIBRARY.map((opening) => opening.slug),
    defaultValues: {
      welcomeMessage: 'يتشرّفان بدعوتكم لمشاركتهما فرحة العمر',
      verseText: 'اللّهُمَّ بارِكْ لهُما وبارِكْ عليهِما واجمَعْ بينهُما في خير',
      invitationText: 'نتشرف بحضوركم ومشاركتكم أجمل لحظات عمرنا.',
      groomParentsLabel: 'عائلة العريس',
      brideParentsLabel: 'عائلة العروس',
      contactLabel: 'للاستفسار والتأكيد',
      sections: {
        hero: true,
        details: true,
        timeline: true,
        gallery: true,
        rsvp: true,
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
        timeline: ['#program-section', '#timeline', '.program'],
        rsvp: ['#rsvp-section', '#da3wa-rsvp'],
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
    welcomeMessage: sanitizeText(invitation?.welcomeMessage || legacyStory.heroSub),
    verseText: sanitizeText(legacyStory.verseText || legacyStory.verse || ''),
    invitationText: sanitizeText(legacyStory.invitationText || ''),
    groomParentsLabel: sanitizeText(legacyStory.groomParentsLabel || 'عائلة العريس'),
    groomParents: sanitizeText(legacyStory.groomParents || ''),
    brideParentsLabel: sanitizeText(legacyStory.brideParentsLabel || 'عائلة العروس'),
    brideParents: sanitizeText(legacyStory.brideParents || ''),
    venueName: sanitizeText(invitation?.venueName),
    venueAddress: sanitizeText(invitation?.venueAddress),
    locationLink: sanitizeUrl(legacyStory.locationLink || legacyStory.mapUrl || ''),
    contactLabel: sanitizeText(legacyStory.contactLabel || 'للاستفسار والتأكيد'),
    contactName: sanitizeText(legacyStory.contactName || ''),
    contactPhone: sanitizeText(legacyStory.contactPhone || ''),
    closingNote: sanitizeText(legacyStory.closingNote || ''),
    closingHashtag: sanitizeText(legacyStory.closingHashtag || legacyStory.hashtag || ''),
    closingFamilies: sanitizeText(legacyStory.closingFamilies || ''),
    musicUrl: sanitizeUrl(invitation?.musicUrl || ''),
    venueImage: sanitizeUrl(legacyStory.venueImage || invitation?.coverImage || ''),
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
      timeline: true,
      gallery: true,
      rsvp: true,
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

export function buildInvitationRenderConfig({ invitation, manifest, opening, preview = false }) {
  const normalized = normalizeInvitationData(invitation);
  const selectedOpening = opening || getOpeningBySlug(invitation?.opening?.slug || invitation?.openingId || 'native-template');
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
      weddingDate: dateValue,
    },
    sections: normalized.sectionConfig,
    theme: {
      ...manifest.defaultValues.theme,
      ...normalized.themeConfig,
    },
    preview,
    locale: invitation?.locale || 'ar',
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
