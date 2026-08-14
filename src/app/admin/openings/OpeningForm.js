'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import MediaPicker from '@/components/admin/MediaPicker';
import RenderFrame from '@/components/invitation/RenderFrame';
import { buildInvitationRenderConfig } from '@/lib/template-system';

function toJsonString(value) {
  return JSON.stringify(value || {}, null, 2);
}

function parseJson(text, fallback = {}) {
  if (!text?.trim()) return fallback;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('أحد حقول JSON غير صالح.');
  }
}

function tryParseJson(text, fallback = {}) {
  try {
    return parseJson(text, fallback);
  } catch {
    return fallback;
  }
}

function updateJsonConfigField(text, key, value) {
  const parsed = tryParseJson(text, {});
  const next = { ...parsed };

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) {
      next[key] = value;
    } else {
      delete next[key];
    }
  } else if (value == null) {
    delete next[key];
  } else {
    next[key] = value;
  }

  return toJsonString(next);
}

function stripTemplateOpeningKeys(config = {}) {
  const next = { ...config };
  delete next.sourceTemplateSlug;
  return next;
}

function resolveBehaviorPreset(opening) {
  const slug = String(
    opening?.sourceTemplateSlug
    || opening?.defaultConfig?.sourceTemplateSlug
    || opening?.slug
    || ''
  ).toLowerCase();

  if (slug.includes('bab')) {
    return {
      interactionMode: 'knock',
      requiredKnocks: 3,
      interactionHint: 'دقوا على الافتتاحية ثلاث دقات ليفتح المحتوى',
    };
  }

  if (slug.includes('disney') || slug.includes('classic')) {
    return {
      interactionMode: 'tap-button',
      interactionHint: 'اضغط لفتح الافتتاحية',
    };
  }

  return {
    interactionMode: 'tap-button',
    interactionHint: 'اضغط لفتح الافتتاحية',
  };
}

const BEHAVIOR_LIBRARY = [
  {
    id: 'knock-3',
    label: 'ثلاث خبطات',
    description: 'يفتح المحتوى بعد ثلاث دقات متتالية على الافتتاحية.',
    type: 'shared-overlay',
    transition: 'fade',
    durationMs: 2000,
    autoplay: false,
    requiresUserInteraction: true,
    defaultConfig: {
      allowSkip: true,
      interactionMode: 'knock',
      requiredKnocks: 3,
      interactionHint: 'دقوا على الافتتاحية ثلاث دقات ليفتح المحتوى',
    },
  },
  {
    id: 'tap-button',
    label: 'اضغط للفتح',
    description: 'يظهر زر واضح لفتح الافتتاحية ثم الدخول إلى الدعوة.',
    type: 'shared-overlay',
    transition: 'fade',
    durationMs: 2000,
    autoplay: false,
    requiresUserInteraction: true,
    defaultConfig: {
      allowSkip: true,
      interactionMode: 'tap-button',
      interactionHint: 'اضغط لفتح الافتتاحية',
    },
  },
  {
    id: 'tap-anywhere',
    label: 'اضغط في أي مكان',
    description: 'يفتح المحتوى عند الضغط في أي مكان على الشاشة.',
    type: 'shared-overlay',
    transition: 'fade',
    durationMs: 1800,
    autoplay: false,
    requiresUserInteraction: true,
    defaultConfig: {
      allowSkip: true,
      interactionMode: 'tap-anywhere',
      interactionHint: 'اضغط في أي مكان لفتح الافتتاحية',
    },
  },
  {
    id: 'auto-open',
    label: 'فتح تلقائي',
    description: 'تظهر الافتتاحية لفترة قصيرة ثم تنتقل تلقائيًا إلى الدعوة.',
    type: 'shared-overlay',
    transition: 'fade',
    durationMs: 2200,
    autoplay: true,
    requiresUserInteraction: false,
    defaultConfig: {
      allowSkip: true,
      interactionMode: 'auto',
      overlayDurationMs: 2200,
      interactionHint: 'جاري فتح الافتتاحية...',
    },
  },
];

function getBehaviorOptionMeta(behavior, examples = []) {
  return {
    label: behavior.label,
    description: behavior.description,
    examplesLabel: examples.length ? examples.slice(0, 2).join('، ') : '',
  };
}

function buildInitialForm(opening) {
  return {
    name: opening?.name || '',
    nameAr: opening?.nameAr || '',
    slug: opening?.slug || '',
    description: opening?.description || '',
    descriptionAr: opening?.descriptionAr || '',
    type: opening?.type || 'minimal-fade',
    thumbnail: opening?.thumbnail || '',
    previewImage: opening?.previewImage || '',
    previewVideo: opening?.previewVideo || '',
    previewMediaUrl: opening?.previewMediaUrl || '',
    isActive: opening?.isActive ?? true,
    isDefault: opening?.isDefault ?? false,
    sortOrder: opening?.sortOrder || 0,
    compatibleTemplates: opening?.compatibleTemplates || opening?.compatibilityRules?.allowedTemplateSlugs || [],
    defaultConfig: toJsonString(opening?.defaultConfig),
    textConfig: toJsonString(opening?.textConfig),
    mediaConfig: toJsonString(opening?.mediaConfig),
    themeConfig: toJsonString(opening?.themeConfig),
    durationMs: opening?.durationMs || 2000,
    transition: opening?.transition || 'fade',
    autoplay: opening?.autoplay ?? false,
    requiresUserInteraction: opening?.requiresUserInteraction ?? false,
  };
}

function summarizeConfig(text) {
  const parsed = tryParseJson(text);
  const keys = Object.keys(parsed);

  if (!keys.length) {
    return 'لا توجد إعدادات مخصصة بعد';
  }

  return `${keys.length} حقل${keys.length > 1 ? 'ًا' : ''} مخصص`;
}

function summarizeCompatibility(selectedCount, totalCount) {
  if (!selectedCount) {
    return 'غير مربوط بأي قالب';
  }

  if (selectedCount >= totalCount) {
    return 'متوافق مع جميع القوالب';
  }

  return `متوافق مع ${selectedCount} قالب`;
}

function pickFirstFilled(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function findFirstStringDeep(value) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFirstStringDeep(item);
      if (found) {
        return found;
      }
    }
    return '';
  }

  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) {
      const found = findFirstStringDeep(item);
      if (found) {
        return found;
      }
    }
  }

  return '';
}

function buildOpeningPreview(form) {
  const textConfig = tryParseJson(form.textConfig);
  const themeConfig = tryParseJson(form.themeConfig);
  const mediaConfig = tryParseJson(form.mediaConfig);
  const defaultConfig = tryParseJson(form.defaultConfig);
  const fallbackText = findFirstStringDeep(textConfig);

  return {
    eyebrow: pickFirstFilled(
      textConfig.openingEyebrow,
      textConfig.eyebrow,
      textConfig.openingKicker,
      form.nameAr,
      form.name,
    ),
    title: pickFirstFilled(
      textConfig.openingNames,
      textConfig.title,
      textConfig.heading,
      textConfig.name,
      form.nameAr,
      form.name,
      fallbackText,
      'اسم الافتتاحية',
    ),
    description: pickFirstFilled(
      textConfig.openingHint,
      textConfig.subtitle,
      textConfig.description,
      textConfig.message,
      form.descriptionAr,
      form.description,
      'اكتب النص هنا لتشاهد شكل الافتتاحية بشكل تقريبي.',
    ),
    poem: pickFirstFilled(
      textConfig.openingPoem,
      textConfig.note,
      textConfig.caption,
    ),
    buttonLabel: pickFirstFilled(
      textConfig.openButtonLabel,
      textConfig.buttonLabel,
      'افتح الدعوة',
    ),
    primaryColor: pickFirstFilled(themeConfig.primaryColor, '#7f2a1f'),
    accentColor: pickFirstFilled(themeConfig.accentColor, '#d9b26f'),
    surfaceColor: pickFirstFilled(themeConfig.surfaceColor, '#fffaf6'),
    headingFont: pickFirstFilled(themeConfig.fontHeading, 'inherit'),
    bodyFont: pickFirstFilled(themeConfig.fontBody, 'inherit'),
    backgroundImage: pickFirstFilled(
      mediaConfig.backgroundImage,
      mediaConfig.coverImage,
      mediaConfig.heroImage,
      form.previewImage,
      form.thumbnail,
    ),
    posterImage: pickFirstFilled(
      mediaConfig.posterImage,
      mediaConfig.thumbnailImage,
      form.thumbnail,
    ),
    previewVideo: pickFirstFilled(
      mediaConfig.previewVideo,
      mediaConfig.videoUrl,
      mediaConfig.backgroundVideo,
      form.previewVideo,
    ),
    previewImage: pickFirstFilled(
      mediaConfig.previewImage,
      mediaConfig.backgroundImage,
      mediaConfig.coverImage,
      form.previewImage,
      form.thumbnail,
    ),
    transition: form.transition || 'fade',
    durationMs: Number(form.durationMs) || Number(defaultConfig.overlayDurationMs) || 2000,
    autoplay: form.autoplay,
    requiresUserInteraction: form.requiresUserInteraction,
    allowSkip: defaultConfig.allowSkip !== false,
    interactionMode: pickFirstFilled(defaultConfig.interactionMode, form.requiresUserInteraction ? 'tap-button' : 'auto'),
    requiredKnocks: Number(defaultConfig.requiredKnocks) || 3,
    interactionHint: pickFirstFilled(defaultConfig.interactionHint, textConfig.openingHint),
    debugSource: {
      title: pickFirstFilled(textConfig.openingNames, textConfig.title, textConfig.heading, textConfig.name, fallbackText),
      description: pickFirstFilled(textConfig.openingHint, textConfig.subtitle, textConfig.description, textConfig.message),
      image: pickFirstFilled(mediaConfig.previewImage, mediaConfig.backgroundImage, mediaConfig.coverImage, form.previewImage, form.thumbnail),
      video: pickFirstFilled(mediaConfig.previewVideo, mediaConfig.videoUrl, mediaConfig.backgroundVideo, form.previewVideo),
    },
  };
}

function buildLivePreviewInvitation(manifest, form, openingPreview) {
  const defaultValues = manifest?.defaultValues || {};
  const defaultTheme = defaultValues.theme || {};
  const defaultSections = defaultValues.sections || {};
  const textConfig = tryParseJson(form.textConfig);
  const themeConfig = tryParseJson(form.themeConfig);
  const mediaConfig = tryParseJson(form.mediaConfig);
  const defaultConfig = tryParseJson(form.defaultConfig);

  const groomName = pickFirstFilled(textConfig.groomName, 'أحمد');
  const brideName = pickFirstFilled(textConfig.brideName, 'سارة');
  const venueName = pickFirstFilled(textConfig.venueName, 'قاعة FARHA');
  const venueAddress = pickFirstFilled(textConfig.venueAddress, 'الرياض - طريق الملك');
  const heroImage = pickFirstFilled(
    mediaConfig.heroImage,
    mediaConfig.backgroundImage,
    form.previewImage,
    form.thumbnail,
  );
  const venueImage = pickFirstFilled(
    mediaConfig.venueImage,
    mediaConfig.posterImage,
    form.thumbnail,
    form.previewImage,
  );
  const musicUrl = pickFirstFilled(mediaConfig.musicUrl, form.previewMediaUrl);
  const sampleDate = '2027-02-14T20:00:00.000Z';

  return {
    id: 'opening-live-preview',
    slug: `opening-live-preview-${manifest.slug}`,
    locale: 'ar',
    groomName,
    brideName,
    weddingDate: sampleDate,
    venueName,
    venueAddress,
    welcomeMessage: openingPreview.description,
    musicUrl,
    contentConfig: {
      ...defaultValues,
      groomName,
      brideName,
      welcomeMessage: openingPreview.description,
      verseText: openingPreview.poem || defaultValues.verseText || '',
      invitationText: pickFirstFilled(
        textConfig.invitationText,
        form.descriptionAr,
        form.description,
        defaultValues.invitationText || '',
      ),
      openingKicker: pickFirstFilled(
        textConfig.openingKicker,
        textConfig.eyebrow,
        textConfig.openingEyebrow,
      ),
      openingNames: openingPreview.title,
      openingHint: openingPreview.description,
      openButtonLabel: openingPreview.buttonLabel,
      openingVideo: pickFirstFilled(
        mediaConfig.openingVideo,
        mediaConfig.previewVideo,
        mediaConfig.videoUrl,
        mediaConfig.backgroundVideo,
        form.previewVideo,
      ),
      openingPoster: pickFirstFilled(
        mediaConfig.openingPoster,
        mediaConfig.backgroundImage,
        mediaConfig.coverImage,
        mediaConfig.previewImage,
        form.previewImage,
        form.thumbnail,
      ),
      openingBackgroundImage: pickFirstFilled(
        mediaConfig.openingPoster,
        mediaConfig.backgroundImage,
        mediaConfig.coverImage,
        mediaConfig.previewImage,
        form.previewImage,
        form.thumbnail,
      ),
      venueName,
      venueAddress,
      weddingDate: sampleDate,
      venueImage,
      musicUrl,
      'images.hero': heroImage,
      'images.background': pickFirstFilled(
        mediaConfig.backgroundImage,
        form.previewImage,
        form.thumbnail,
      ),
      'images.venue': venueImage,
      galleryImages: Array.isArray(defaultValues.galleryImages) ? defaultValues.galleryImages : [],
      program: Array.isArray(defaultValues.program) ? defaultValues.program : [],
      notes: Array.isArray(defaultValues.notes) ? defaultValues.notes : [],
    },
    themeConfig: {
      ...defaultTheme,
      ...themeConfig,
    },
    sectionConfig: {
      hero: true,
      details: true,
      timeline: true,
      gallery: true,
      rsvp: true,
      calendar: true,
      ...defaultSections,
    },
    openingConfig: {
      allowSkip: defaultConfig.allowSkip !== false,
      ...(defaultConfig.sourceTemplateSlug ? { sourceTemplateSlug: defaultConfig.sourceTemplateSlug } : {}),
    },
    customElements: [],
    nativeElementOverrides: {},
    textOverrides: {},
  };
}

function buildPreviewOpeningDefinition(form) {
  const defaultConfig = tryParseJson(form.defaultConfig, {});
  const sourceTemplateSlug =
    pickFirstFilled(
      defaultConfig.sourceTemplateSlug,
      String(form.slug || '').startsWith('template-opening:') ? String(form.slug).split(':')[1] : '',
    ) || undefined;

  return {
    slug: String(form.slug || 'opening-live-preview'),
    type: String(form.type || 'minimal-fade'),
    name: String(form.name || ''),
    nameAr: String(form.nameAr || ''),
    description: String(form.description || ''),
    descriptionAr: String(form.descriptionAr || ''),
    thumbnail: String(form.thumbnail || ''),
    previewImage: String(form.previewImage || ''),
    previewVideo: String(form.previewVideo || ''),
    defaultConfig,
    sourceTemplateSlug,
  };
}

function validateOpeningForm(form) {
  const issues = [];

  if (!String(form.name || '').trim()) {
    issues.push('أدخل اسم الافتتاحية.');
  }

  if (!String(form.nameAr || '').trim()) {
    issues.push('أدخل الاسم العربي للافتتاحية.');
  }

  const slug = String(form.slug || '').trim();
  if (!slug) {
    issues.push('أدخل قيمة الـ slug.');
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    issues.push('الـ slug يجب أن يحتوي على حروف إنجليزية صغيرة وأرقام وشرطة فقط.');
  }

  return issues;
}

function buildApiValidationMessage(result) {
  const fieldErrors = result?.validationErrors?.fieldErrors;
  if (!fieldErrors || typeof fieldErrors !== 'object') {
    return result?.message || 'تعذر حفظ الافتتاحية.';
  }

  const messages = Object.values(fieldErrors)
    .flat()
    .filter(Boolean);

  if (!messages.length) {
    return result?.message || 'تعذر حفظ الافتتاحية.';
  }

  return messages.join(' ');
}

const FORM_TABS = [
  { key: 'basic', label: 'البيانات الأساسية' },
  { key: 'media', label: 'الوسائط والمعاينة' },
  { key: 'behavior', label: 'التوافق والسلوك' },
];

export default function OpeningForm({ mode = 'create', opening = null, templateOptions = [] }) {
  const router = useRouter();
  const [form, setForm] = useState(() => buildInitialForm(opening));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copySource, setCopySource] = useState('');
  const [availableOpenings, setAvailableOpenings] = useState([]);
  const [loadingOpenings, setLoadingOpenings] = useState(true);
  const [copyMessage, setCopyMessage] = useState('');
  const [previewOpened, setPreviewOpened] = useState(false);
  const [showAdvancedConfigs, setShowAdvancedConfigs] = useState(mode === 'edit');
  const [activeFormTab, setActiveFormTab] = useState('basic');
  const [previewTemplateSlug, setPreviewTemplateSlug] = useState(
    templateOptions[0]?.slug || '',
  );
  const [previewDevice, setPreviewDevice] = useState('mobile');
  const [previewReplayToken, setPreviewReplayToken] = useState(0);
  const [previewKnockCount, setPreviewKnockCount] = useState(0);
  const [previewVideoStarted, setPreviewVideoStarted] = useState(false);
  const [previewVideoToken, setPreviewVideoToken] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadOpenings() {
      setLoadingOpenings(true);

      try {
        const response = await fetch('/api/openings');
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'تعذر تحميل الافتتاحيات الموجودة.');
        }

        if (!ignore) {
          setAvailableOpenings(result.data || []);
        }
      } catch (loadError) {
        if (!ignore) {
          setError((current) => current || loadError.message || 'تعذر تحميل الافتتاحيات الموجودة.');
        }
      } finally {
        if (!ignore) {
          setLoadingOpenings(false);
        }
      }
    }

    void loadOpenings();

    return () => {
      ignore = true;
    };
  }, []);

  const currentOpeningId = opening?.id || '';
  const behaviorExamplesById = useMemo(
    () => availableOpenings.reduce((accumulator, item) => {
      if (item.id === currentOpeningId || item.slug === form.slug) {
        return accumulator;
      }

      const preset = resolveBehaviorPreset(item);
      let behaviorId = 'tap-button';
      if (preset.interactionMode === 'knock' && Number(preset.requiredKnocks || 0) === 3) {
        behaviorId = 'knock-3';
      } else if (preset.interactionMode === 'tap-anywhere') {
        behaviorId = 'tap-anywhere';
      } else if (preset.interactionMode === 'auto') {
        behaviorId = 'auto-open';
      }

      if (!accumulator[behaviorId]) {
        accumulator[behaviorId] = [];
      }

      const sourceName = item.nameAr || item.name || item.slug;
      if (sourceName && !accumulator[behaviorId].includes(sourceName)) {
        accumulator[behaviorId].push(sourceName);
      }

      return accumulator;
    }, {}),
    [availableOpenings, currentOpeningId, form.slug],
  );
  const behaviorOptions = useMemo(
    () => BEHAVIOR_LIBRARY.map((behavior) => ({
      ...behavior,
      examples: behaviorExamplesById[behavior.id] || [],
    })),
    [behaviorExamplesById],
  );
  const selectedBehaviorOption = useMemo(
    () => behaviorOptions.find((item) => item.id === copySource) || null,
    [behaviorOptions, copySource],
  );
  const openingPreview = useMemo(() => buildOpeningPreview(form), [form]);
  const parsedTextConfig = useMemo(() => tryParseJson(form.textConfig, {}), [form.textConfig]);
  const parsedMediaConfig = useMemo(() => tryParseJson(form.mediaConfig, {}), [form.mediaConfig]);
  const parsedDefaultConfig = useMemo(() => tryParseJson(form.defaultConfig, {}), [form.defaultConfig]);
  const previewOpeningDefinition = useMemo(() => buildPreviewOpeningDefinition(form), [form]);
  const compatiblePreviewTemplates = useMemo(() => {
    if (!form.compatibleTemplates.length) {
      return templateOptions;
    }

    return templateOptions.filter((template) => form.compatibleTemplates.includes(template.slug));
  }, [form.compatibleTemplates, templateOptions]);
  const resolvedPreviewTemplateSlug = useMemo(() => {
    if (compatiblePreviewTemplates.some((template) => template.slug === previewTemplateSlug)) {
      return previewTemplateSlug;
    }

    return compatiblePreviewTemplates[0]?.slug || templateOptions[0]?.slug || '';
  }, [compatiblePreviewTemplates, previewTemplateSlug, templateOptions]);
  const previewTemplate = useMemo(
    () => templateOptions.find((template) => template.slug === resolvedPreviewTemplateSlug) || templateOptions[0] || null,
    [resolvedPreviewTemplateSlug, templateOptions],
  );
  const livePreviewInvitation = useMemo(
    () => (previewTemplate ? buildLivePreviewInvitation(previewTemplate, form, openingPreview) : null),
    [form, openingPreview, previewTemplate],
  );
  const hasCustomOpeningVisuals = useMemo(
    () =>
      Boolean(
        pickFirstFilled(
          parsedMediaConfig.openingVideo,
          parsedMediaConfig.previewVideo,
          parsedMediaConfig.videoUrl,
          parsedMediaConfig.backgroundVideo,
          parsedMediaConfig.openingPoster,
          parsedMediaConfig.backgroundImage,
          parsedMediaConfig.coverImage,
          parsedMediaConfig.previewImage,
          form.previewVideo,
          form.previewImage,
          form.thumbnail,
        ),
      ),
    [form.previewImage, form.previewVideo, form.thumbnail, parsedMediaConfig],
  );
  const hasCustomBehaviorOverlay = useMemo(
    () =>
      Boolean(
        pickFirstFilled(
          parsedDefaultConfig.interactionMode,
          parsedDefaultConfig.interactionHint,
        ),
      ) || Number(parsedDefaultConfig.requiredKnocks || 0) > 0,
    [parsedDefaultConfig],
  );
  const usesExactTemplateOpeningPreview = useMemo(
    () =>
      previewOpeningDefinition.type === 'template-opening'
      && Boolean(previewOpeningDefinition.sourceTemplateSlug)
      && !hasCustomOpeningVisuals
      && !hasCustomBehaviorOverlay,
    [hasCustomBehaviorOverlay, hasCustomOpeningVisuals, previewOpeningDefinition],
  );
  const livePreviewRenderConfig = useMemo(() => {
    if (!previewTemplate || !livePreviewInvitation) {
      return null;
    }

    return buildInvitationRenderConfig({
      invitation: livePreviewInvitation,
      manifest: previewTemplate,
      opening: usesExactTemplateOpeningPreview
        ? previewOpeningDefinition
        : {
            slug: 'no-opening',
            type: 'none',
            defaultConfig: { allowSkip: true },
          },
      preview: true,
    });
  }, [livePreviewInvitation, previewOpeningDefinition, previewTemplate, usesExactTemplateOpeningPreview]);

  useEffect(() => {
    setPreviewOpened(false);
    setPreviewReplayToken(0);
    setPreviewKnockCount(0);
    setPreviewVideoStarted(false);
    setPreviewVideoToken(0);
  }, [
    form.name,
    form.nameAr,
    form.description,
    form.descriptionAr,
    form.previewImage,
    form.previewVideo,
    form.thumbnail,
    form.transition,
    form.durationMs,
    form.textConfig,
    form.themeConfig,
    form.mediaConfig,
    form.defaultConfig,
    resolvedPreviewTemplateSlug,
  ]);

  useEffect(() => {
    if (!previewVideoStarted || previewOpened || !openingPreview.previewVideo) {
      return undefined;
    }

    const fallbackTimeout = window.setTimeout(
      () => setPreviewOpened(true),
      Math.max(Number(openingPreview.durationMs || 0), 3200),
    );

    return () => window.clearTimeout(fallbackTimeout);
  }, [openingPreview.durationMs, openingPreview.previewVideo, previewOpened, previewVideoStarted]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetCustomPreview() {
    setPreviewOpened(false);
    setPreviewKnockCount(0);
    setPreviewVideoStarted(false);
    setPreviewVideoToken((current) => current + 1);
  }

  function completeCustomPreviewOpening() {
    if (openingPreview.previewVideo) {
      setPreviewVideoStarted(true);
      setPreviewVideoToken((current) => current + 1);
      return;
    }

    setPreviewOpened(true);
  }

  function handleCustomPreviewInteraction() {
    if (previewOpened || previewVideoStarted) {
      return;
    }

    if (openingPreview.interactionMode === 'knock') {
      setPreviewKnockCount((current) => {
        const next = Math.min(current + 1, openingPreview.requiredKnocks);
        if (next >= openingPreview.requiredKnocks) {
          window.setTimeout(() => {
            completeCustomPreviewOpening();
          }, 120);
        }
        return next;
      });
      return;
    }

    if (openingPreview.interactionMode === 'tap-anywhere' || openingPreview.interactionMode === 'tap-button') {
      completeCustomPreviewOpening();
      return;
    }

    completeCustomPreviewOpening();
  }

  function updateConfigField(configKey, fieldKey, value) {
    setForm((current) => ({
      ...current,
      [configKey]: updateJsonConfigField(current[configKey], fieldKey, value),
    }));
  }

  function applyOpeningEffects() {
    if (!selectedBehaviorOption) {
      setCopyMessage('اختر سلوك فتح أولًا حتى يمكن تطبيقه.');
      return;
    }

    const updates = {};
    const currentDefaultConfig = tryParseJson(form.defaultConfig, {});
    updates.defaultConfig = toJsonString({
      ...stripTemplateOpeningKeys(currentDefaultConfig),
      ...stripTemplateOpeningKeys(selectedBehaviorOption.defaultConfig || {}),
    });
    updates.durationMs = selectedBehaviorOption.durationMs || 2000;
    updates.transition = selectedBehaviorOption.transition || 'fade';
    updates.autoplay = selectedBehaviorOption.autoplay ?? false;
    updates.requiresUserInteraction = selectedBehaviorOption.requiresUserInteraction ?? false;
    updates.type = selectedBehaviorOption.type || 'shared-overlay';

    setForm((current) => ({ ...current, ...updates }));
    setCopyMessage(`تم تطبيق سلوك "${selectedBehaviorOption.label}" مع الحفاظ على فيديوك وصورتك الحالية.`);
  }

  async function submitForm(event) {
    event.preventDefault();
    setError('');

    const validationIssues = validateOpeningForm(form);
    if (validationIssues.length) {
      setError(validationIssues.join(' '));
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        name: String(form.name || '').trim(),
        nameAr: String(form.nameAr || '').trim(),
        slug: String(form.slug || '').trim().toLowerCase(),
        description: String(form.description || '').trim(),
        descriptionAr: String(form.descriptionAr || '').trim(),
        type: String(form.type || '').trim(),
        thumbnail: String(form.thumbnail || '').trim(),
        previewImage: String(form.previewImage || '').trim(),
        previewVideo: String(form.previewVideo || '').trim(),
        previewMediaUrl: String(form.previewMediaUrl || '').trim(),
        transition: String(form.transition || '').trim(),
        sortOrder: Number(form.sortOrder || 0),
        durationMs: form.durationMs ? Number(form.durationMs) : null,
        defaultConfig: parseJson(form.defaultConfig),
        textConfig: parseJson(form.textConfig),
        mediaConfig: parseJson(form.mediaConfig),
        themeConfig: parseJson(form.themeConfig),
      };

      const url = mode === 'edit' ? `/api/openings/${opening.id}` : '/api/openings';
      const method = mode === 'edit' ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(buildApiValidationMessage(result));
      }

      router.push('/admin/openings');
      router.refresh();
    } catch (requestError) {
      setError(requestError.message || 'تعذر حفظ الافتتاحية.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="opening-form-shell" onSubmit={submitForm}>
      <section className="opening-hero">
        <div className="opening-hero__copy">
          <span className="opening-hero__eyebrow">إدارة الافتتاحيات</span>
          <h2>{mode === 'edit' ? 'تعديل الافتتاحية' : 'إضافة افتتاحية جديدة'}</h2>
          <p>
            واجهة مرتبة لتجهيز الاسم والمظهر والحركة، مع إمكانية نسخ تأثيرات جاهزة من افتتاحيات موجودة مثل النصوص،
            شكل النصوص، الثيم، أو إعدادات الحركة.
          </p>
        </div>

        <div className="opening-hero__actions">
          <div className="opening-hero__metrics">
            <div className="opening-metric-card">
              <span>الحالة</span>
              <strong>{form.isActive ? 'نشطة' : 'معطلة'}</strong>
            </div>
            <div className="opening-metric-card">
              <span>التوافق</span>
              <strong>{summarizeCompatibility(form.compatibleTemplates.length, templateOptions.length)}</strong>
            </div>
            <div className="opening-metric-card">
              <span>التأثير</span>
              <strong>{form.transition || 'fade'}</strong>
            </div>
          </div>

          <button type="submit" className="btn-primary opening-submit-btn" disabled={saving}>
            {saving ? 'جارٍ الحفظ...' : mode === 'edit' ? 'حفظ التعديلات' : 'إنشاء الافتتاحية'}
          </button>
        </div>
      </section>

      <section className="admin-card card-pad opening-preview-panel">
        <div className="opening-section-head">
          <div>
            <h3 className="admin-section-title admin-section-title--sm">محاكي الافتتاحية</h3>
            <p className="admin-section-subtitle">
              معاينة مباشرة على قالب حقيقي، حتى ترى شكل الافتتاحية فوق الدعوة نفسها قبل حفظها وربطها بالقوالب.
            </p>
          </div>
          <div className="opening-preview-actions">
            <span className="opening-chip">
              {usesExactTemplateOpeningPreview ? 'معاينة مطابقة للقالب' : openingPreview.transition}
            </span>
            <button
              type="button"
              className="mini-btn"
              onClick={() => {
                if (usesExactTemplateOpeningPreview) {
                  setPreviewReplayToken((current) => current + 1);
                  return;
                }

                resetCustomPreview();
              }}
            >
              {usesExactTemplateOpeningPreview
                ? 'إعادة تشغيل الافتتاحية'
                : previewOpened
                  ? 'إعادة الافتتاحية'
                  : 'فتح الافتتاحية'}
            </button>
          </div>
        </div>

        <div className="opening-preview-layout">
          <div className="opening-preview-notes">
            <div className="opening-preview-note-card">
              <strong>خيارات المعاينة المباشرة</strong>
              <label className="field-block">
                <span>القالب الذي ستشاهد عليه الافتتاحية</span>
                <select
                  value={resolvedPreviewTemplateSlug}
                  onChange={(event) => {
                    setPreviewTemplateSlug(event.target.value);
                    setPreviewOpened(false);
                  }}
                >
                  {compatiblePreviewTemplates.map((template) => (
                    <option key={template.slug} value={template.slug}>
                      {template.nameAr}
                    </option>
                  ))}
                </select>
              </label>

              <div className="opening-preview-device-switches">
                {[
                  { key: 'mobile', label: 'هاتف' },
                  { key: 'tablet', label: 'تابلت' },
                  { key: 'desktop', label: 'سطح مكتب' },
                ].map((device) => (
                  <button
                    key={device.key}
                    type="button"
                    className={`mini-btn ${previewDevice === device.key ? 'active' : ''}`}
                    onClick={() => setPreviewDevice(device.key)}
                  >
                    {device.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="opening-preview-note-card">
              <strong>ملخص مباشر</strong>
              <span>القالب الحالي: {previewTemplate?.nameAr || 'غير محدد'}</span>
              <span>نوع المعاينة: {usesExactTemplateOpeningPreview ? 'افتتاحية القالب الحقيقية' : 'معاينة تقريبية مخصصة'}</span>
              <span>المدة المتوقعة: {openingPreview.durationMs} ms</span>
              <span>الانتقال: {openingPreview.transition}</span>
              <span>الخلفية: {openingPreview.backgroundImage ? 'موجودة' : 'لون فقط'}</span>
              <span>المعاينة بالفيديو: {openingPreview.previewVideo ? 'موجودة' : 'غير مضافة'}</span>
            </div>

            <div className="opening-preview-note-card">
              <strong>ما الذي يقرأه المحاكي الآن؟</strong>
              <span>العنوان المعروض: {openingPreview.title || 'غير موجود بعد'}</span>
              <span>النص المعروض: {openingPreview.description || 'غير موجود بعد'}</span>
              <span>مصدر الصورة: {openingPreview.debugSource.image ? 'تم العثور على صورة' : 'لا توجد صورة مستخدمة'}</span>
              <span>مصدر الفيديو: {openingPreview.debugSource.video ? 'تم العثور على فيديو' : 'لا يوجد فيديو مستخدم'}</span>
              {usesExactTemplateOpeningPreview ? (
                <span>مصدر تأثير الفتح: {previewOpeningDefinition.sourceTemplateSlug}</span>
              ) : null}
            </div>

            <div className="opening-preview-note-card">
              <strong>طريقة العرض</strong>
              {usesExactTemplateOpeningPreview ? (
                <>
                  <span>المحاكي يستخدم نفس طريقة الفتح الأصلية من القالب المصدر مثل الخبطات أو الضغط أو المشهد الأصلي.</span>
                  <span>إذا اخترت تأثيرًا من قالب مثل `باب` فستشاهد افتتاحية `باب` الحقيقية فوق القالب الحالي.</span>
                </>
              ) : (
                <>
                  <span>المشهد الظاهر هو القالب الحقيقي في الخلفية، والافتتاحية فوقه بشكل مباشر.</span>
                  <span>أي تعديل في النص أو الصورة أو الفيديو يعيد الافتتاحية للظهور تلقائيًا.</span>
                  <span>اضغط زر الفتح لتشاهد الانتقال إلى محتوى الدعوة داخل نفس القالب.</span>
                </>
              )}
            </div>
          </div>

          <div className="opening-preview-phone">
            <div className={`opening-preview-device opening-preview-device--${previewDevice}`}>
              <div className="opening-preview-screen">
                {livePreviewRenderConfig && previewTemplate ? (
                  <div className="opening-live-preview-stage">
                    <RenderFrame
                      key={`${previewTemplate.slug}-${previewDevice}-${previewReplayToken}-${usesExactTemplateOpeningPreview ? previewOpeningDefinition.sourceTemplateSlug || 'native' : 'overlay'}`}
                      templateSlug={previewTemplate.slug}
                      renderConfig={livePreviewRenderConfig}
                      manifest={previewTemplate}
                      className="opening-live-preview-frame-wrap"
                      frameClassName="opening-live-preview-frame"
                    />

                    {!usesExactTemplateOpeningPreview ? (
                      <div
                        className={`opening-preview-overlay opening-preview-overlay--live transition-${String(openingPreview.transition).toLowerCase().replace(/\s+/g, '-')}${previewOpened ? ' is-opened' : ''}`}
                        style={{
                          '--opening-preview-primary': openingPreview.primaryColor,
                          '--opening-preview-accent': openingPreview.accentColor,
                          '--opening-preview-surface': openingPreview.surfaceColor,
                          '--opening-preview-duration': `${openingPreview.durationMs}ms`,
                          backgroundImage: openingPreview.backgroundImage
                            ? `linear-gradient(180deg, rgba(15, 23, 42, 0.38), rgba(15, 23, 42, 0.76)), url(${openingPreview.backgroundImage})`
                            : `linear-gradient(160deg, ${openingPreview.surfaceColor} 0%, #e7d1bb 100%)`,
                        }}
                      >
                        {openingPreview.previewVideo ? (
                          <video
                            key={`preview-video-${previewVideoToken}-${previewVideoStarted ? 'started' : 'idle'}`}
                            className={`opening-preview-video${previewVideoStarted ? ' is-active' : ''}`}
                            src={openingPreview.previewVideo}
                            poster={openingPreview.previewImage || openingPreview.posterImage || ''}
                            autoPlay={previewVideoStarted}
                            muted
                            playsInline
                            onEnded={() => setPreviewOpened(true)}
                          />
                        ) : null}
                        <div className="opening-preview-overlay__scrim" />
                        {(openingPreview.interactionMode === 'knock' || openingPreview.interactionMode === 'tap-anywhere') && !previewVideoStarted ? (
                          <button
                            type="button"
                            className="opening-preview-hit-area"
                            onClick={handleCustomPreviewInteraction}
                            aria-label={openingPreview.interactionMode === 'knock' ? 'انقر على الشاشة لإضافة دقة' : 'انقر على الشاشة لفتح الافتتاحية'}
                          />
                        ) : null}
                        <div className="opening-preview-overlay__content">
                          <span
                            className="opening-preview-eyebrow"
                            style={{ fontFamily: openingPreview.bodyFont }}
                          >
                            {openingPreview.eyebrow}
                          </span>
                          <h4
                            className="opening-preview-title"
                            style={{ fontFamily: openingPreview.headingFont }}
                          >
                            {openingPreview.title}
                          </h4>
                          <p
                            className="opening-preview-description"
                            style={{ fontFamily: openingPreview.bodyFont }}
                          >
                            {openingPreview.interactionMode === 'knock'
                              ? openingPreview.interactionHint || openingPreview.description
                              : openingPreview.description}
                          </p>
                          {openingPreview.interactionMode === 'knock' ? (
                            <div className="opening-preview-knocks" aria-hidden="true">
                              {Array.from({ length: openingPreview.requiredKnocks }).map((_, index) => (
                                <span
                                  key={`knock-${index}`}
                                  className={`opening-preview-knock-dot${index < previewKnockCount ? ' is-hit' : ''}`}
                                />
                              ))}
                            </div>
                          ) : null}
                          {openingPreview.poem ? (
                            <p
                              className="opening-preview-poem"
                              style={{ fontFamily: openingPreview.bodyFont }}
                            >
                              {openingPreview.poem}
                            </p>
                          ) : null}
                          {openingPreview.interactionMode === 'tap-button' ? (
                            <button
                              type="button"
                              className="opening-preview-button"
                              onClick={handleCustomPreviewInteraction}
                            >
                              {openingPreview.buttonLabel}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="opening-preview-empty">لا توجد معاينة متاحة الآن.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-card card-pad opening-section-card">
        <div className="opening-section-head">
          <div>
            <h3 className="admin-section-title admin-section-title--sm">الحقول المباشرة</h3>
            <p className="admin-section-subtitle">
              عدّل عنوان الافتتاحية والنص وزر الفتح والصورة والفيديو بشكل مباشر، وسيظهر التغيير فورًا داخل المحاكي.
            </p>
          </div>
        </div>

        <div className="opening-direct-fields-grid">
          <label className="field-block">
            <span>عنوان الافتتاحية</span>
            <input
              value={parsedTextConfig.openingNames || parsedTextConfig.title || ''}
              onChange={(event) => updateConfigField('textConfig', 'openingNames', event.target.value)}
              placeholder="مثال: باب الفرحة"
            />
          </label>
          <label className="field-block opening-field-full">
            <span>النص الفرعي</span>
            <textarea
              rows={3}
              value={parsedTextConfig.openingHint || parsedTextConfig.subtitle || ''}
              onChange={(event) => updateConfigField('textConfig', 'openingHint', event.target.value)}
              placeholder="اكتب النص الذي يظهر داخل الافتتاحية"
            />
          </label>
          <label className="field-block">
            <span>زر الفتح</span>
            <input
              value={parsedTextConfig.openButtonLabel || parsedTextConfig.buttonLabel || ''}
              onChange={(event) => updateConfigField('textConfig', 'openButtonLabel', event.target.value)}
              placeholder="مثال: افتح الدعوة"
            />
          </label>
          <label className="field-block">
            <span>فيديو الافتتاحية</span>
            <MediaPicker
              value={parsedMediaConfig.previewVideo || parsedMediaConfig.videoUrl || parsedMediaConfig.backgroundVideo || ''}
              accept="video"
              folder="openings"
              onChange={(value) => {
                updateConfigField('mediaConfig', 'previewVideo', value);
                updateField('previewVideo', value);
              }}
            />
          </label>
          <label className="field-block opening-field-full">
            <span>صورة الخلفية</span>
            <MediaPicker
              value={parsedMediaConfig.backgroundImage || parsedMediaConfig.coverImage || parsedMediaConfig.previewImage || ''}
              accept="image"
              folder="openings"
              onChange={(value) => {
                updateConfigField('mediaConfig', 'backgroundImage', value);
                updateField('previewImage', value);
              }}
            />
          </label>
        </div>
      </section>

      {error ? <div className="admin-alert error">{error}</div> : null}

      <section className="opening-copy-panel admin-card card-pad">
        <div className="opening-section-head">
          <div>
            <h3 className="admin-section-title admin-section-title--sm">اختيار سلوك الفتح</h3>
            <p className="admin-section-subtitle">
              اختر طريقة الفتح فقط مثل ثلاث خبطات أو اضغط للفتح، بينما تبقى الصورة والفيديو والنصوص الخاصة بك كما هي.
            </p>
          </div>
          {copyMessage ? <span className="opening-copy-badge">{copyMessage}</span> : null}
        </div>

        <div className="opening-copy-grid">
          <label className="field-block">
            <span>سلوك الفتح</span>
            <select value={copySource} onChange={(event) => setCopySource(event.target.value)}>
              <option value="">{loadingOpenings ? 'جارٍ تحميل سلوكيات الفتح...' : 'اختر سلوك فتح'}</option>
              {behaviorOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {getBehaviorOptionMeta(item, item.examples).label}
                  {getBehaviorOptionMeta(item, item.examples).examplesLabel ? ` - ${getBehaviorOptionMeta(item, item.examples).examplesLabel}` : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="opening-copy-preview">
            {selectedBehaviorOption ? (
              <>
                <strong>{getBehaviorOptionMeta(selectedBehaviorOption, selectedBehaviorOption.examples).label}</strong>
                <span>الوصف: {getBehaviorOptionMeta(selectedBehaviorOption, selectedBehaviorOption.examples).description}</span>
                <span>أمثلة مشابهة: {getBehaviorOptionMeta(selectedBehaviorOption, selectedBehaviorOption.examples).examplesLabel || 'مكتبة مستقلة بدون تكرار'}</span>
                <span>الانتقال: {selectedBehaviorOption.transition || 'fade'}</span>
                <span>المدة: {selectedBehaviorOption.durationMs || 2000} ms</span>
              </>
            ) : (
              <span>اختر سلوك فتح لعرض ملخص سريع قبل تطبيقه.</span>
            )}
          </div>

          <button type="button" className="mini-btn opening-copy-btn" onClick={applyOpeningEffects}>
            تطبيق سلوك الفتح
          </button>
        </div>
      </section>

      <section className="admin-card card-pad opening-tabs-panel">
        <div className="opening-section-head">
          <div>
            <h3 className="admin-section-title admin-section-title--sm">بيانات الافتتاحية</h3>
            <p className="admin-section-subtitle">تنقل سريع بين الأقسام الأساسية بدل التمرير داخل بطاقات طويلة.</p>
          </div>
        </div>

        <div className="opening-form-tabs">
          {FORM_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`opening-form-tab${activeFormTab === tab.key ? ' is-active' : ''}`}
              onClick={() => setActiveFormTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeFormTab === 'basic' ? (
          <div className="opening-fields-grid">
            <label className="field-block">
              <span>الاسم</span>
              <input value={form.name} onChange={(event) => updateField('name', event.target.value)} />
            </label>
            <label className="field-block">
              <span>الاسم العربي</span>
              <input value={form.nameAr} onChange={(event) => updateField('nameAr', event.target.value)} />
            </label>
            <label className="field-block">
              <span>Slug</span>
              <input dir="ltr" value={form.slug} onChange={(event) => updateField('slug', event.target.value)} />
            </label>
            <label className="field-block">
              <span>النوع</span>
              <select value={form.type} onChange={(event) => updateField('type', event.target.value)}>
                <option value="native-template">Native Template</option>
                <option value="minimal-fade">Minimal Fade</option>
                <option value="floral-reveal">Floral Reveal</option>
                <option value="photo-reveal">Photo Reveal</option>
                <option value="no-opening">No Opening</option>
                <option value="template-opening">Template Opening</option>
                <option value="shared-overlay">Shared Overlay</option>
                <option value="none">None</option>
              </select>
            </label>
            <label className="field-block opening-field-full">
              <span>الوصف</span>
              <textarea rows={3} value={form.description} onChange={(event) => updateField('description', event.target.value)} />
            </label>
            <label className="field-block opening-field-full">
              <span>الوصف العربي</span>
              <textarea rows={3} value={form.descriptionAr} onChange={(event) => updateField('descriptionAr', event.target.value)} />
            </label>
          </div>
        ) : null}

        {activeFormTab === 'media' ? (
          <div className="opening-fields-grid">
            <label className="field-block">
              <span>الصورة المصغرة</span>
              <MediaPicker value={form.thumbnail} accept="image" folder="openings" onChange={(value) => updateField('thumbnail', value)} />
            </label>
            <label className="field-block">
              <span>صورة المعاينة</span>
              <MediaPicker value={form.previewImage} accept="image" folder="openings" onChange={(value) => updateField('previewImage', value)} />
            </label>
            <label className="field-block">
              <span>فيديو المعاينة</span>
              <MediaPicker value={form.previewVideo} accept="video" folder="openings" onChange={(value) => updateField('previewVideo', value)} />
            </label>
            <label className="field-block">
              <span>رابط وسائط إضافي</span>
              <input dir="ltr" value={form.previewMediaUrl} onChange={(event) => updateField('previewMediaUrl', event.target.value)} />
            </label>
          </div>
        ) : null}

        {activeFormTab === 'behavior' ? (
          <div className="opening-fields-grid">
            <label className="field-block">
              <span>المدة بالمللي ثانية</span>
              <input type="number" value={form.durationMs} onChange={(event) => updateField('durationMs', event.target.value)} />
            </label>
            <label className="field-block">
              <span>نوع الانتقال</span>
              <input value={form.transition} onChange={(event) => updateField('transition', event.target.value)} />
            </label>
            <label className="opening-toggle-card">
              <div>
                <strong>الافتتاحية نشطة</strong>
                <span>تظهر للاستخدام عند إنشاء أو تعديل الدعوات.</span>
              </div>
              <input type="checkbox" checked={form.isActive} onChange={(event) => updateField('isActive', event.target.checked)} />
            </label>
            <label className="opening-toggle-card">
              <div>
                <strong>افتتاحية افتراضية</strong>
                <span>تُستخدم تلقائيًا إن لم يتم اختيار افتتاحية أخرى.</span>
              </div>
              <input type="checkbox" checked={form.isDefault} onChange={(event) => updateField('isDefault', event.target.checked)} />
            </label>
            <label className="opening-toggle-card">
              <div>
                <strong>تشغيل تلقائي</strong>
                <span>تشغيل التأثير مباشرة بدون خطوة تشغيل إضافية.</span>
              </div>
              <input type="checkbox" checked={form.autoplay} onChange={(event) => updateField('autoplay', event.target.checked)} />
            </label>
            <label className="opening-toggle-card">
              <div>
                <strong>يتطلب تفاعل المستخدم</strong>
                <span>مفيد عندما تحتاج الافتتاحية إلى ضغطة أو بدء يدوي.</span>
              </div>
              <input
                type="checkbox"
                checked={form.requiresUserInteraction}
                onChange={(event) => updateField('requiresUserInteraction', event.target.checked)}
              />
            </label>
            <label className="field-block">
              <span>الترتيب</span>
              <input type="number" value={form.sortOrder} onChange={(event) => updateField('sortOrder', event.target.value)} />
            </label>

            <div className="opening-field-full">
              <div className="opening-section-head opening-section-head--compact">
                <div>
                  <h4 className="admin-section-title admin-section-title--sm">توافق القوالب</h4>
                  <p className="admin-section-subtitle">حدد القوالب التي يمكنها استخدام هذه الافتتاحية.</p>
                </div>
                <span className="opening-chip">{form.compatibleTemplates.length || 0} محدد</span>
              </div>

              <div className="opening-template-grid">
                {templateOptions.map((template) => {
                  const checked = form.compatibleTemplates.includes(template.slug);

                  return (
                    <label key={template.slug} className={`opening-template-card${checked ? ' is-selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          updateField(
                            'compatibleTemplates',
                            event.target.checked
                              ? [...form.compatibleTemplates, template.slug]
                              : form.compatibleTemplates.filter((slug) => slug !== template.slug),
                          )
                        }
                      />
                      <div>
                        <strong>{template.nameAr}</strong>
                        <span>{template.slug}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="opening-config-section">
        <div className="opening-section-head">
          <div>
            <h3 className="admin-section-title">إعدادات متقدمة</h3>
            <p className="admin-section-subtitle">
              يمكنك التحكم الدقيق في النصوص والثيم والوسائط والسلوك. النسخ من افتتاحية موجودة سيملأ هذه الحقول تلقائيًا.
            </p>
          </div>
          <button
            type="button"
            className={`mini-btn ${showAdvancedConfigs ? 'active' : ''}`}
            onClick={() => setShowAdvancedConfigs((current) => !current)}
          >
            {showAdvancedConfigs ? 'إخفاء الإعدادات المتقدمة' : 'إظهار الإعدادات المتقدمة'}
          </button>
        </div>

        {showAdvancedConfigs ? (
          <div className="opening-config-grid">
            <section className="admin-card card-pad opening-config-card">
              <div className="opening-config-card__head">
                <div>
                  <h4>Default Config</h4>
                  <span>{summarizeConfig(form.defaultConfig)}</span>
                </div>
              </div>
              <textarea rows={11} dir="ltr" value={form.defaultConfig} onChange={(event) => updateField('defaultConfig', event.target.value)} />
            </section>

            <section className="admin-card card-pad opening-config-card">
              <div className="opening-config-card__head">
                <div>
                  <h4>Text Config</h4>
                  <span>{summarizeConfig(form.textConfig)}</span>
                </div>
              </div>
              <textarea rows={11} dir="ltr" value={form.textConfig} onChange={(event) => updateField('textConfig', event.target.value)} />
            </section>

            <section className="admin-card card-pad opening-config-card">
              <div className="opening-config-card__head">
                <div>
                  <h4>Media Config</h4>
                  <span>{summarizeConfig(form.mediaConfig)}</span>
                </div>
              </div>
              <textarea rows={11} dir="ltr" value={form.mediaConfig} onChange={(event) => updateField('mediaConfig', event.target.value)} />
            </section>

            <section className="admin-card card-pad opening-config-card">
              <div className="opening-config-card__head">
                <div>
                  <h4>Theme Config</h4>
                  <span>{summarizeConfig(form.themeConfig)}</span>
                </div>
              </div>
              <textarea rows={11} dir="ltr" value={form.themeConfig} onChange={(event) => updateField('themeConfig', event.target.value)} />
            </section>
          </div>
        ) : (
          <div className="admin-alert info">
            الحقول المباشرة تكفي لمعظم الاستخدامات. افتح الإعدادات المتقدمة فقط إذا كنت تحتاج تعديل JSON يدويًا.
          </div>
        )}
      </section>
    </form>
  );
}
