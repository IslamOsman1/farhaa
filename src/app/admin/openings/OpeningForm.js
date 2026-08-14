'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import MediaPicker from '@/components/admin/MediaPicker';

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

function buildOpeningPreview(form) {
  const textConfig = tryParseJson(form.textConfig);
  const themeConfig = tryParseJson(form.themeConfig);
  const mediaConfig = tryParseJson(form.mediaConfig);
  const defaultConfig = tryParseJson(form.defaultConfig);

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
      form.nameAr,
      form.name,
      'اسم الافتتاحية',
    ),
    description: pickFirstFilled(
      textConfig.openingHint,
      textConfig.subtitle,
      textConfig.description,
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
      form.previewVideo,
    ),
    transition: form.transition || 'fade',
    durationMs: Number(form.durationMs) || Number(defaultConfig.overlayDurationMs) || 2000,
    autoplay: form.autoplay,
    requiresUserInteraction: form.requiresUserInteraction,
    allowSkip: defaultConfig.allowSkip !== false,
  };
}

const COPY_GROUPS = [
  { key: 'text', label: 'النصوص', description: 'نسخ محتوى النصوص وعناوين الواجهة', configKey: 'textConfig' },
  { key: 'theme', label: 'شكل النصوص والثيم', description: 'نسخ الألوان والخطوط والمظهر العام', configKey: 'themeConfig' },
  { key: 'media', label: 'الوسائط', description: 'نسخ الصور وروابط الوسائط وإعداداتها', configKey: 'mediaConfig' },
  { key: 'behavior', label: 'الحركة والتأثير', description: 'نسخ المدة والانتقال وإعدادات السلوك', configKey: 'defaultConfig' },
];

export default function OpeningForm({ mode = 'create', opening = null, templateOptions = [] }) {
  const router = useRouter();
  const [form, setForm] = useState(() => buildInitialForm(opening));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copySource, setCopySource] = useState('');
  const [copyOptions, setCopyOptions] = useState({
    text: true,
    theme: true,
    media: false,
    behavior: true,
  });
  const [availableOpenings, setAvailableOpenings] = useState([]);
  const [loadingOpenings, setLoadingOpenings] = useState(true);
  const [copyMessage, setCopyMessage] = useState('');
  const [previewOpened, setPreviewOpened] = useState(false);

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
  const copyCandidates = useMemo(
    () => availableOpenings.filter((item) => item.id !== currentOpeningId && item.slug !== form.slug),
    [availableOpenings, currentOpeningId, form.slug],
  );

  const selectedSourceOpening = useMemo(
    () => copyCandidates.find((item) => item.id === copySource || item.slug === copySource) || null,
    [copyCandidates, copySource],
  );
  const openingPreview = useMemo(() => buildOpeningPreview(form), [form]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateCopyOption(key, value) {
    setCopyOptions((current) => ({ ...current, [key]: value }));
  }

  function applyOpeningEffects() {
    if (!selectedSourceOpening) {
      setCopyMessage('اختر افتتاحية أولًا حتى يمكن نسخ التأثير منها.');
      return;
    }

    const updates = {};

    if (copyOptions.text) {
      updates.textConfig = toJsonString(selectedSourceOpening.textConfig);
    }

    if (copyOptions.theme) {
      updates.themeConfig = toJsonString(selectedSourceOpening.themeConfig);
    }

    if (copyOptions.media) {
      updates.mediaConfig = toJsonString(selectedSourceOpening.mediaConfig);
      updates.thumbnail = selectedSourceOpening.thumbnail || '';
      updates.previewImage = selectedSourceOpening.previewImage || '';
      updates.previewVideo = selectedSourceOpening.previewVideo || '';
      updates.previewMediaUrl = selectedSourceOpening.previewMediaUrl || '';
    }

    if (copyOptions.behavior) {
      updates.defaultConfig = toJsonString(selectedSourceOpening.defaultConfig);
      updates.durationMs = selectedSourceOpening.durationMs || 2000;
      updates.transition = selectedSourceOpening.transition || 'fade';
      updates.autoplay = selectedSourceOpening.autoplay ?? false;
      updates.requiresUserInteraction = selectedSourceOpening.requiresUserInteraction ?? false;
      updates.type = selectedSourceOpening.type || form.type;
    }

    setForm((current) => ({ ...current, ...updates }));
    setCopyMessage(`تم تجهيز إعدادات التأثير من "${selectedSourceOpening.nameAr || selectedSourceOpening.name}".`);
  }

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
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
        throw new Error(result.message || 'تعذر حفظ الافتتاحية.');
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
              معاينة سريعة ومبسطة توضح شكل النصوص، الخلفية، الحركة، وزر الفتح قبل الحفظ.
            </p>
          </div>
          <div className="opening-preview-actions">
            <span className="opening-chip">{openingPreview.transition}</span>
            <button
              type="button"
              className="mini-btn"
              onClick={() => setPreviewOpened((current) => !current)}
            >
              {previewOpened ? 'إعادة إغلاق المحاكي' : 'محاكاة فتح الافتتاحية'}
            </button>
          </div>
        </div>

        <div className="opening-preview-layout">
          <div className="opening-preview-phone">
            <div className="opening-preview-device">
              <div className="opening-preview-screen">
                <div
                  className={`opening-preview-canvas transition-${String(openingPreview.transition).toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    '--opening-preview-primary': openingPreview.primaryColor,
                    '--opening-preview-accent': openingPreview.accentColor,
                    '--opening-preview-surface': openingPreview.surfaceColor,
                    '--opening-preview-duration': `${openingPreview.durationMs}ms`,
                    backgroundImage: openingPreview.backgroundImage
                      ? `linear-gradient(180deg, rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.68)), url(${openingPreview.backgroundImage})`
                      : `linear-gradient(160deg, ${openingPreview.surfaceColor} 0%, #f3e5d8 100%)`,
                  }}
                >
                  <div className={`opening-preview-overlay${previewOpened ? ' is-opened' : ''}`}>
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
                      {openingPreview.description}
                    </p>
                    {openingPreview.poem ? (
                      <p
                        className="opening-preview-poem"
                        style={{ fontFamily: openingPreview.bodyFont }}
                      >
                        {openingPreview.poem}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      className="opening-preview-button"
                      onClick={() => setPreviewOpened(true)}
                    >
                      {openingPreview.buttonLabel}
                    </button>
                  </div>

                  <div className="opening-preview-invitation-card">
                    {openingPreview.posterImage ? (
                      <div
                        className="opening-preview-poster"
                        style={{ backgroundImage: `url(${openingPreview.posterImage})` }}
                      />
                    ) : null}
                    <strong style={{ fontFamily: openingPreview.headingFont }}>
                      {form.nameAr || form.name || 'عنوان الدعوة'}
                    </strong>
                    <span style={{ fontFamily: openingPreview.bodyFont }}>
                      {form.descriptionAr || form.description || 'بعد فتح الافتتاحية يظهر محتوى الدعوة هنا.'}
                    </span>
                    <small>
                      {openingPreview.autoplay ? 'تشغيل تلقائي' : 'تشغيل يدوي'} •{' '}
                      {openingPreview.requiresUserInteraction ? 'يتطلب تفاعل' : 'مرن للمستخدم'}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="opening-preview-notes">
            <div className="opening-preview-note-card">
              <strong>ملخص المحاكاة</strong>
              <span>المدة المتوقعة: {openingPreview.durationMs} ms</span>
              <span>الانتقال: {openingPreview.transition}</span>
              <span>الخلفية: {openingPreview.backgroundImage ? 'موجودة' : 'لون فقط'}</span>
              <span>المعاينة بالفيديو: {openingPreview.previewVideo ? 'موجودة' : 'غير مضافة'}</span>
            </div>

            <div className="opening-preview-note-card">
              <strong>ماذا يعرض المحاكي؟</strong>
              <span>يعرض شكل تقريبي للواجهة وليس تنفيذًا حرفيًا لكل قالب.</span>
              <span>أفضل استخدام له هو مقارنة النصوص والثيم والصورة والحركة بسرعة.</span>
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="admin-alert error">{error}</div> : null}

      <section className="opening-copy-panel admin-card card-pad">
        <div className="opening-section-head">
          <div>
            <h3 className="admin-section-title admin-section-title--sm">استيراد تأثير من افتتاحية موجودة</h3>
            <p className="admin-section-subtitle">
              استخدم افتتاحية سابقة كبداية سريعة، ثم عدّل عليها بدل كتابة الإعدادات من الصفر.
            </p>
          </div>
          {copyMessage ? <span className="opening-copy-badge">{copyMessage}</span> : null}
        </div>

        <div className="opening-copy-grid">
          <label className="field-block">
            <span>الافتتاحية المصدر</span>
            <select value={copySource} onChange={(event) => setCopySource(event.target.value)}>
              <option value="">{loadingOpenings ? 'جارٍ تحميل الافتتاحيات...' : 'اختر افتتاحية موجودة'}</option>
              {copyCandidates.map((item) => (
                <option key={item.id || item.slug} value={item.id || item.slug}>
                  {item.nameAr || item.name} - {item.type}
                </option>
              ))}
            </select>
          </label>

          <div className="opening-copy-options">
            {COPY_GROUPS.map((item) => (
              <label key={item.key} className="opening-copy-option">
                <input
                  type="checkbox"
                  checked={copyOptions[item.key]}
                  onChange={(event) => updateCopyOption(item.key, event.target.checked)}
                />
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="opening-copy-preview">
            {selectedSourceOpening ? (
              <>
                <strong>{selectedSourceOpening.nameAr || selectedSourceOpening.name}</strong>
                <span>النوع: {selectedSourceOpening.type}</span>
                <span>الانتقال: {selectedSourceOpening.transition || 'fade'}</span>
                <span>المدة: {selectedSourceOpening.durationMs || 2000} ms</span>
              </>
            ) : (
              <span>اختر افتتاحية لعرض ملخص سريع قبل النسخ.</span>
            )}
          </div>

          <button type="button" className="mini-btn opening-copy-btn" onClick={applyOpeningEffects}>
            تطبيق التأثير المختار
          </button>
        </div>
      </section>

      <div className="opening-main-grid">
        <section className="admin-card card-pad opening-section-card">
          <div className="opening-section-head">
            <div>
              <h3 className="admin-section-title admin-section-title--sm">البيانات الأساسية</h3>
              <p className="admin-section-subtitle">الاسم والوصف والنوع والهوية الأساسية للافتتاحية.</p>
            </div>
          </div>

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
        </section>

        <section className="admin-card card-pad opening-section-card">
          <div className="opening-section-head">
            <div>
              <h3 className="admin-section-title admin-section-title--sm">الوسائط والمعاينة</h3>
              <p className="admin-section-subtitle">اختر صورة مصغرة ووسائط المعاينة التي تظهر في المكتبة والإدارة.</p>
            </div>
          </div>

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
        </section>

        <section className="admin-card card-pad opening-section-card">
          <div className="opening-section-head">
            <div>
              <h3 className="admin-section-title admin-section-title--sm">الحركة والسلوك</h3>
              <p className="admin-section-subtitle">المدة والانتقال والتشغيل التلقائي وسلوك التفاعل.</p>
            </div>
          </div>

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
          </div>
        </section>

        <section className="admin-card card-pad opening-section-card">
          <div className="opening-section-head">
            <div>
              <h3 className="admin-section-title admin-section-title--sm">توافق القوالب</h3>
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
        </section>
      </div>

      <section className="opening-config-section">
        <div className="opening-section-head">
          <div>
            <h3 className="admin-section-title">إعدادات متقدمة</h3>
            <p className="admin-section-subtitle">
              يمكنك التحكم الدقيق في النصوص والثيم والوسائط والسلوك. النسخ من افتتاحية موجودة سيملأ هذه الحقول تلقائيًا.
            </p>
          </div>
        </div>

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
      </section>
    </form>
  );
}
