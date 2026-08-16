'use client';

import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import RenderFrame from '@/components/invitation/RenderFrame';
import MediaPicker from '@/components/admin/MediaPicker';
import {
  BUILTIN_FONT_LIBRARY,
  PUBLIC_FONT_LIBRARY_STYLESHEET_PATH,
} from '@/lib/font-library';
import {
  buildInvitationRenderConfig,
  getOpeningBySlug,
  migrateTemplateConfigBetweenManifests,
} from '@/lib/template-system';

const GROUPS = [
  { key: 'basic', label: 'الأساسيات' },
  { key: 'wording', label: 'النصوص' },
  { key: 'families', label: 'العائلات' },
  { key: 'sections', label: 'الأقسام' },
  { key: 'details', label: 'المكان والزمان' },
  { key: 'schedule', label: 'البرنامج' },
  { key: 'media', label: 'الوسائط' },
  { key: 'contact', label: 'التواصل' },
  { key: 'closing', label: 'الخاتمة' },
  { key: 'theme', label: 'الهوية البصرية' },
  { key: 'opening', label: 'الافتتاحية' },
  { key: 'publishing', label: 'النشر والإصدارات' },
];

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeLocale(value) {
  return value === 'en' ? 'en' : 'ar';
}

function getEnglishKey(key) {
  return `${key}__en`;
}

function buildUiConfig(contentConfig = {}, fallbackLocale = 'ar') {
  const storedConfig =
    contentConfig?.__uiConfig && typeof contentConfig.__uiConfig === 'object' ? contentConfig.__uiConfig : {};

  return {
    bilingualEnabled: Boolean(storedConfig.bilingualEnabled),
    defaultLocale: normalizeLocale(storedConfig.defaultLocale || fallbackLocale),
  };
}

function withUiConfig(contentConfig = {}, uiConfig = {}) {
  return {
    ...contentConfig,
    __uiConfig: {
      ...(contentConfig?.__uiConfig && typeof contentConfig.__uiConfig === 'object' ? contentConfig.__uiConfig : {}),
      bilingualEnabled: Boolean(uiConfig.bilingualEnabled),
      defaultLocale: normalizeLocale(uiConfig.defaultLocale || 'ar'),
    },
  };
}

function normalizeFieldTextStyle(style = {}) {
  const fontFamily = typeof style?.fontFamily === 'string' ? style.fontFamily.trim() : '';
  const color = typeof style?.color === 'string' ? style.color.trim() : '';

  return {
    fontFamily,
    color,
  };
}

function extractTextStyleOverrides(contentConfig = {}) {
  const rawValue =
    contentConfig?.__textStyleOverrides
    && typeof contentConfig.__textStyleOverrides === 'object'
    && !Array.isArray(contentConfig.__textStyleOverrides)
      ? contentConfig.__textStyleOverrides
      : {};

  return Object.entries(rawValue).reduce((accumulator, [key, value]) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return accumulator;
    }

    const normalized = normalizeFieldTextStyle(value);
    if (normalized.fontFamily || normalized.color) {
      accumulator[key] = normalized;
    }
    return accumulator;
  }, {});
}

function withTextStyleOverrides(contentConfig = {}, nextOverrides = {}) {
  const cleaned = Object.entries(nextOverrides).reduce((accumulator, [key, value]) => {
    const normalized = normalizeFieldTextStyle(value);
    if (normalized.fontFamily || normalized.color) {
      accumulator[key] = normalized;
    }
    return accumulator;
  }, {});

  if (!Object.keys(cleaned).length) {
    const { __textStyleOverrides, ...rest } = contentConfig || {};
    return rest;
  }

  return {
    ...contentConfig,
    __textStyleOverrides: cleaned,
  };
}

function getFieldTextStyle(contentConfig = {}, key = '') {
  return extractTextStyleOverrides(contentConfig)[key] || { fontFamily: '', color: '' };
}

function isTranslatableField(field) {
  return ['text', 'textarea', 'list', 'schedule'].includes(field.type);
}

function supportsFieldStyleControls(field) {
  return field?.type === 'text' || field?.type === 'textarea';
}

function buildInitialDraft(invitation, manifest, normalized) {
  const uiConfig = buildUiConfig(normalized.contentConfig, invitation.locale || 'ar');

  return {
    templateSlug: manifest.slug,
    openingSlug: invitation.opening?.slug || 'native-template',
    contentConfig: withUiConfig(
      {
        ...normalized.contentConfig,
        weddingDate: invitation.weddingDate ? new Date(invitation.weddingDate).toISOString().slice(0, 16) : '',
        galleryImages: arrayValue(normalized.contentConfig.galleryImages),
        program: arrayValue(normalized.contentConfig.program),
        notes: arrayValue(normalized.contentConfig.notes),
      },
      uiConfig,
    ),
    themeConfig: {
      ...(manifest.defaultValues.theme || {}),
      ...(normalized.themeConfig || {}),
    },
    sectionConfig: {
      ...(manifest.defaultValues.sections || {}),
      ...(normalized.sectionConfig || {}),
    },
    openingConfig: {
      ...(normalized.openingConfig || {}),
    },
    uiConfig,
    hiddenConfig: {},
  };
}

function buildPreviewInvitation(invitation, draft) {
  const uiConfig = buildUiConfig(draft.contentConfig, draft.uiConfig?.defaultLocale || invitation.locale || 'ar');
  const contentConfig = withUiConfig(draft.contentConfig, uiConfig);

  return {
    ...invitation,
    locale: uiConfig.defaultLocale || invitation.locale || 'ar',
    groomName: contentConfig.groomName,
    brideName: contentConfig.brideName,
    weddingDate: contentConfig.weddingDate ? new Date(contentConfig.weddingDate) : invitation.weddingDate,
    venueName: contentConfig.venueName,
    venueAddress: contentConfig.venueAddress,
    welcomeMessage: contentConfig.welcomeMessage,
    musicUrl: contentConfig.musicUrl,
    contentConfig,
    themeConfig: draft.themeConfig,
    sectionConfig: draft.sectionConfig,
    openingConfig: draft.openingConfig,
    uiConfig,
    opening: { slug: draft.openingSlug },
    template: { slug: draft.templateSlug },
  };
}

function renderField({
  field,
  draft,
  onContentChange,
  onScheduleChange,
  onListChange,
  onTextStyleChange,
  fontLibraryOptions,
}) {
  const value = draft.contentConfig[field.key];
  const bilingualEnabled = Boolean(draft.uiConfig?.bilingualEnabled);
  const englishKey = getEnglishKey(field.key);
  const englishValue = draft.contentConfig[englishKey];
  const fieldTextStyle = getFieldTextStyle(draft.contentConfig, field.key);
  const activeColor = fieldTextStyle.color || '#7f2a1f';
  const activeFont = fieldTextStyle.fontFamily || '';
  const showStyleControls = supportsFieldStyleControls(field);

  const inlineStyleControls = showStyleControls ? (
    <div className="field-style-tools">
      <div className="field-style-tools__header">
        <strong>تنسيق هذا النص</strong>
        <Link href="/admin/fonts" className="field-style-tools__link">
          مكتبة الخطوط
        </Link>
      </div>
      <div className="field-style-tools__grid">
        <label className="bilingual-subfield">
          <span>لون النص</span>
          <input
            type="color"
            value={activeColor}
            onChange={(event) => onTextStyleChange(field.key, 'color', event.target.value)}
          />
        </label>
        <label className="bilingual-subfield">
          <span>نوع الخط</span>
          <select
            value={activeFont}
            onChange={(event) => onTextStyleChange(field.key, 'fontFamily', event.target.value)}
          >
            <option value="">خط القالب</option>
            {fontLibraryOptions.map((font) => (
              <option key={font.id || font.family} value={font.family}>
                {font.nameAr || font.family}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="field-style-preview"
        style={{
          color: activeColor,
          fontFamily: activeFont ? `"${String(activeFont).replace(/"/g, '')}"` : undefined,
        }}
      >
        {value || 'معاينة الخط داخل القالب'}
      </div>
    </div>
  ) : null;

  if (field.type === 'textarea') {
    if (bilingualEnabled && isTranslatableField(field)) {
      return (
        <>
          <div className="bilingual-stack">
            <label className="bilingual-subfield">
              <span>العربي</span>
              <textarea rows={4} value={value || ''} onChange={(event) => onContentChange(field.key, event.target.value)} />
            </label>
            <label className="bilingual-subfield">
              <span>English</span>
              <textarea
                rows={4}
                dir="ltr"
                value={englishValue || ''}
                onChange={(event) => onContentChange(englishKey, event.target.value)}
              />
            </label>
          </div>
          {inlineStyleControls}
        </>
      );
    }

    return (
      <>
        <textarea rows={4} value={value || ''} onChange={(event) => onContentChange(field.key, event.target.value)} />
        {inlineStyleControls}
      </>
    );
  }

  if (field.type === 'gallery') {
    const items = arrayValue(value);
    const englishItems = arrayValue(englishValue);
    return (
      <div className="array-editor">
        {items.map((item, index) => (
          <div key={`${field.key}-${index}`} className="array-row">
            <MediaPicker
              label="اختيار صورة"
              value={item || ''}
              accept="image"
              folder="gallery"
              onChange={(nextValue) => {
                const next = [...items];
                next[index] = nextValue;
                onContentChange(field.key, next);
              }}
            />
            <button
              type="button"
              className="mini-btn danger"
              onClick={() => {
                onContentChange(field.key, items.filter((_, itemIndex) => itemIndex !== index));
                if (bilingualEnabled) {
                  onContentChange(englishKey, englishItems.filter((_, itemIndex) => itemIndex !== index));
                }
              }}
            >
              حذف
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mini-btn"
          onClick={() => onContentChange(field.key, [...items, ''])}
        >
          إضافة صورة
        </button>
      </div>
    );
  }

  if (field.type === 'schedule') {
    const items = arrayValue(value);
    const englishItems = arrayValue(englishValue);
    return (
      <div className="array-editor">
        {items.map((item, index) => (
          <div key={`${field.key}-${index}`} className="schedule-row">
            <input
              type="text"
              value={item.time || ''}
              placeholder="الوقت"
              onChange={(event) => onScheduleChange(field.key, index, 'time', event.target.value)}
            />
            <input
              type="text"
              value={item.title || ''}
              placeholder="الفقرة"
              onChange={(event) => onScheduleChange(field.key, index, 'title', event.target.value)}
            />
            {bilingualEnabled ? (
              <input
                type="text"
                dir="ltr"
                value={englishItems[index]?.title || ''}
                placeholder="Title (EN)"
                onChange={(event) => onScheduleChange(englishKey, index, 'title', event.target.value)}
              />
            ) : null}
            <button
              type="button"
              className="mini-btn danger"
              onClick={() => {
                onContentChange(field.key, items.filter((_, itemIndex) => itemIndex !== index));
                if (bilingualEnabled) {
                  onContentChange(englishKey, englishItems.filter((_, itemIndex) => itemIndex !== index));
                }
              }}
            >
              حذف
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mini-btn"
          onClick={() => {
            onContentChange(field.key, [...items, { time: '', title: '' }]);
            if (bilingualEnabled) {
              onContentChange(englishKey, [...englishItems, { time: '', title: '' }]);
            }
          }}
        >
          إضافة فقرة
        </button>
      </div>
    );
  }

  if (field.type === 'list') {
    const items = arrayValue(value);
    const englishItems = arrayValue(englishValue);
    return (
      <div className="array-editor">
        {items.map((item, index) => (
          <div key={`${field.key}-${index}`} className="array-row">
            <input
              type="text"
              value={item || ''}
              placeholder="ملاحظة"
              onChange={(event) => onListChange(field.key, index, event.target.value)}
            />
            {bilingualEnabled ? (
              <input
                type="text"
                dir="ltr"
                value={englishItems[index] || ''}
                placeholder="Note (EN)"
                onChange={(event) => onListChange(englishKey, index, event.target.value)}
              />
            ) : null}
            <button
              type="button"
              className="mini-btn danger"
              onClick={() => {
                onContentChange(field.key, items.filter((_, itemIndex) => itemIndex !== index));
                if (bilingualEnabled) {
                  onContentChange(englishKey, englishItems.filter((_, itemIndex) => itemIndex !== index));
                }
              }}
            >
              حذف
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mini-btn"
          onClick={() => {
            onContentChange(field.key, [...items, '']);
            if (bilingualEnabled) {
              onContentChange(englishKey, [...englishItems, '']);
            }
          }}
        >
          إضافة ملاحظة
        </button>
      </div>
    );
  }

  if (field.type === 'image' || field.type === 'audio' || field.type === 'video') {
    return (
      <MediaPicker
        label={`اختيار ${field.type === 'image' ? 'ملف' : field.type === 'audio' ? 'صوت' : 'فيديو'}`}
        value={value || ''}
        accept={field.type}
        folder={field.type}
        onChange={(nextValue) => onContentChange(field.key, nextValue)}
      />
    );
  }

  if (field.type === 'boolean') {
    return (
      <label className="editor-boolean-field">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onContentChange(field.key, event.target.checked)}
        />
        <span>{value ? 'مفعل' : 'غير مفعل'}</span>
      </label>
    );
  }

  const inputType = {
    datetime: 'datetime-local',
    url: 'url',
    phone: 'text',
  }[field.type] || 'text';

  if (bilingualEnabled && isTranslatableField(field) && inputType === 'text') {
    return (
      <>
        <div className="bilingual-stack">
          <label className="bilingual-subfield">
            <span>العربي</span>
            <input type="text" value={value || ''} onChange={(event) => onContentChange(field.key, event.target.value)} />
          </label>
          <label className="bilingual-subfield">
            <span>English</span>
            <input
              type="text"
              dir="ltr"
              value={englishValue || ''}
              onChange={(event) => onContentChange(englishKey, event.target.value)}
            />
          </label>
        </div>
        {inlineStyleControls}
      </>
    );
  }

  return (
    <>
      <input
        type={inputType}
        value={value || ''}
        dir={inputType === 'url' ? 'ltr' : undefined}
        onChange={(event) => onContentChange(field.key, event.target.value)}
      />
      {inputType === 'text' ? inlineStyleControls : null}
    </>
  );
}

export default function EditorClient({ invitation, manifest, manifests, openings, normalized }) {
  const initialDraft = useMemo(() => buildInitialDraft(invitation, manifest, normalized), [invitation, manifest, normalized]);
  const [draft, setDraft] = useState(initialDraft);
  const [activeGroup, setActiveGroup] = useState('basic');
  const [previewDevice, setPreviewDevice] = useState('mobile');
  const [saveState, setSaveState] = useState('saved');
  const [notice, setNotice] = useState('');
  const [currentInvitation, setCurrentInvitation] = useState(invitation);
  const [revisions, setRevisions] = useState(invitation.revisions || []);
  const [compareSelection, setCompareSelection] = useState({ from: '', to: '' });
  const [compareResult, setCompareResult] = useState(null);
  const [fontLibrary, setFontLibrary] = useState(BUILTIN_FONT_LIBRARY);
  const autosaveTimer = useRef(null);
  const lastSavedRef = useRef(JSON.stringify(initialDraft));

  const currentManifest = useMemo(
    () => manifests.find((item) => item.slug === draft.templateSlug) || manifest,
    [draft.templateSlug, manifests, manifest],
  );

  const currentOpening = useMemo(
    () => openings.find((item) => item.slug === draft.openingSlug) || getOpeningBySlug(draft.openingSlug),
    [draft.openingSlug, openings],
  );
  const sortedOpenings = useMemo(
    () => [...openings].sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0)),
    [openings],
  );

  const previewInvitation = useMemo(() => buildPreviewInvitation(currentInvitation, draft), [currentInvitation, draft]);
  const fontLibraryOptions = useMemo(() => {
    const seenFamilies = new Set();
    return fontLibrary.filter((font) => {
      const family = String(font?.family || '').trim();
      if (!family || seenFamilies.has(family)) {
        return false;
      }
      seenFamilies.add(family);
      return true;
    });
  }, [fontLibrary]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (!document.querySelector('link[data-farha-font-library-styles="true"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = PUBLIC_FONT_LIBRARY_STYLESHEET_PATH;
      link.dataset.farhaFontLibraryStyles = 'true';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadFontLibrary() {
      try {
        const response = await fetch('/api/public/font-library', { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          return;
        }

        if (isMounted && Array.isArray(payload.data?.all) && payload.data.all.length) {
          setFontLibrary(payload.data.all);
        }
      } catch (_error) {
        // Keep the built-in library as a safe fallback for the editor.
      }
    }

    void loadFontLibrary();
    return () => {
      isMounted = false;
    };
  }, []);

  const renderConfig = useMemo(
    () =>
      buildInvitationRenderConfig({
        invitation: previewInvitation,
        manifest: currentManifest,
        opening: currentOpening,
        preview: true,
      }),
    [previewInvitation, currentManifest, currentOpening],
  );

  function setContentValue(key, value) {
    setDraft((current) => ({
      ...current,
      contentConfig: {
        ...current.contentConfig,
        [key]: value,
      },
    }));
  }

  function setFieldTextStyleValue(key, property, value) {
    setDraft((current) => {
      const currentOverrides = extractTextStyleOverrides(current.contentConfig);
      const nextOverrides = {
        ...currentOverrides,
        [key]: {
          ...(currentOverrides[key] || {}),
          [property]: value,
        },
      };

      return {
        ...current,
        contentConfig: withTextStyleOverrides(current.contentConfig, nextOverrides),
      };
    });
  }

  function setThemeValue(key, value) {
    setDraft((current) => ({
      ...current,
      themeConfig: {
        ...current.themeConfig,
        [key]: value,
      },
    }));
  }

  function setSectionValue(key, value) {
    setDraft((current) => ({
      ...current,
      sectionConfig: {
        ...current.sectionConfig,
        [key]: value,
      },
    }));
  }

  function setUiValue(key, value) {
    setDraft((current) => {
      const nextUiConfig = {
        ...(current.uiConfig || buildUiConfig(current.contentConfig, currentInvitation.locale || 'ar')),
        [key]: value,
      };

      return {
        ...current,
        uiConfig: nextUiConfig,
        contentConfig: withUiConfig(current.contentConfig, nextUiConfig),
      };
    });
  }

  function setScheduleValue(key, index, property, value) {
    const items = [...arrayValue(draft.contentConfig[key])];
    items[index] = { ...items[index], [property]: value };
    setContentValue(key, items);
  }

  function setListValue(key, index, value) {
    const items = [...arrayValue(draft.contentConfig[key])];
    items[index] = value;
    setContentValue(key, items);
  }

  async function loadRevisions() {
    try {
      const response = await fetch(`/api/editor/${currentInvitation.slug}/revisions`);
      const result = await response.json();
      if (response.ok && result.success) {
        setRevisions(result.data);
      }
    } catch (error) {
      console.error('Failed to load revisions', error);
    }
  }

  async function persistDraft(action = 'save', silent = false) {
    setSaveState('saving');
    const nextDraft = {
      ...draft,
      uiConfig: {
        ...(draft.uiConfig || buildUiConfig(draft.contentConfig, currentInvitation.locale || 'ar')),
      },
    };
    nextDraft.contentConfig = withUiConfig(nextDraft.contentConfig, nextDraft.uiConfig);

    try {
      const response = await fetch(`/api/editor/${currentInvitation.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateSlug: nextDraft.templateSlug,
          openingSlug: nextDraft.openingSlug,
          contentConfig: nextDraft.contentConfig,
          themeConfig: nextDraft.themeConfig,
          sectionConfig: nextDraft.sectionConfig,
          openingConfig: nextDraft.openingConfig,
          action,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || 'تعذر حفظ الدعوة.');
      }

      setDraft(nextDraft);
      lastSavedRef.current = JSON.stringify(nextDraft);
      setSaveState('saved');
      setCurrentInvitation((current) => ({
        ...current,
        ...result.invitation,
      }));

      if (result.revisionNumber) {
        void loadRevisions();
      }

      if (!silent) {
        setNotice(action === 'publish' ? 'تم نشر الدعوة بنجاح.' : action === 'unpublish' ? 'تم إلغاء نشر الدعوة.' : 'تم حفظ المسودة.');
        window.setTimeout(() => setNotice(''), 2500);
      }
    } catch (error) {
      console.error(error);
      setSaveState('error');
      setNotice(error.message || 'حدث خطأ أثناء الحفظ.');
    }
  }

  const saveDraftEffect = useEffectEvent(() => {
    void persistDraft('save', true);
  });

  useEffect(() => {
    const serialized = JSON.stringify(draft);
    const isDirty = serialized !== lastSavedRef.current;

    if (!isDirty) {
      setSaveState('saved');
      return undefined;
    }

    setSaveState('dirty');
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      saveDraftEffect();
    }, 1200);

    return () => clearTimeout(autosaveTimer.current);
  }, [draft]);

  useEffect(() => {
    const beforeUnload = (event) => {
      if (saveState !== 'dirty') return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [saveState]);

  async function compareRevisions() {
    if (!compareSelection.from || !compareSelection.to) {
      setNotice('اختر نسختين أولًا للمقارنة.');
      return;
    }

    try {
      const response = await fetch(
        `/api/editor/${currentInvitation.slug}/revisions/compare?from=${compareSelection.from}&to=${compareSelection.to}`,
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذرت المقارنة بين النسختين.');
      }

      setCompareResult(result.data);
    } catch (error) {
      setNotice(error.message || 'تعذرت المقارنة بين النسختين.');
    }
  }

  async function restoreRevision(revisionId) {
    if (!window.confirm('هل تريد استعادة هذه النسخة؟ سيتم إنشاء إصدار جديد يمثل عملية الاستعادة.')) {
      return;
    }

    try {
      const response = await fetch(`/api/editor/${currentInvitation.slug}/revisions/${revisionId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: false }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذرت استعادة النسخة.');
      }

      const restoredInvitation = result.data.invitation;
      setCurrentInvitation((current) => ({ ...current, ...restoredInvitation }));
      setDraft((current) => {
        const restoredUiConfig = buildUiConfig(
          restoredInvitation.contentConfig || current.contentConfig,
          restoredInvitation.locale || current.uiConfig?.defaultLocale || 'ar',
        );
        const nextDraft = {
          ...current,
          templateSlug: restoredInvitation.template?.slug || current.templateSlug,
          openingSlug: restoredInvitation.opening?.slug || current.openingSlug,
          contentConfig: withUiConfig(restoredInvitation.contentConfig || current.contentConfig, restoredUiConfig),
          themeConfig: restoredInvitation.themeConfig || current.themeConfig,
          sectionConfig: restoredInvitation.sectionConfig || current.sectionConfig,
          openingConfig: restoredInvitation.openingConfig || current.openingConfig,
          uiConfig: restoredUiConfig,
        };
        lastSavedRef.current = JSON.stringify(nextDraft);
        return nextDraft;
      });
      setSaveState('saved');
      setCompareResult(null);
      setNotice('تمت استعادة النسخة بنجاح.');
      void loadRevisions();
    } catch (error) {
      setNotice(error.message || 'تعذرت استعادة النسخة.');
    }
  }

  function switchTemplate(nextSlug) {
    const nextManifest = manifests.find((item) => item.slug === nextSlug);
    if (!nextManifest || nextManifest.slug === currentManifest.slug) return;

    const migration = migrateTemplateConfigBetweenManifests(draft.contentConfig, currentManifest, nextManifest);
    setDraft((current) => ({
      ...current,
      templateSlug: nextSlug,
      contentConfig: {
        ...current.contentConfig,
        ...migration.preserved,
      },
      hiddenConfig: {
        ...current.hiddenConfig,
        ...migration.hidden,
      },
    }));

    setNotice(
      migration.lostKeys.length > 0
        ? `تم تبديل القالب مع الاحتفاظ بالحقول المتوافقة. بقيت ${migration.lostKeys.length} قيمة مخزنة للرجوع إليها لاحقًا.`
        : 'تم تبديل القالب مع الحفاظ على البيانات المتوافقة.',
    );
  }

  const groupedFields = currentManifest.editableFields.filter((field) => field.section === activeGroup);
  const manifestSectionEntries = Array.isArray(currentManifest.sections)
    ? currentManifest.sections.map((section) => ({
        key: section.key,
        label: section.labelAr,
        enabled: draft.sectionConfig[section.key] !== false,
      }))
    : [];
  const extraSectionEntries = Object.keys(draft.sectionConfig || {})
    .filter((sectionKey) => !manifestSectionEntries.some((entry) => entry.key === sectionKey))
    .map((sectionKey) => ({
      key: sectionKey,
      label: sectionKey,
      enabled: draft.sectionConfig[sectionKey] !== false,
    }));
  const allSectionEntries = [...manifestSectionEntries, ...extraSectionEntries];
  const previewWidth = previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '820px' : '390px';

  return (
    <div className="editor-shell">
      <header className="editor-topbar">
        <div className="topbar-left">
          <Link href="/admin/invitations" className="back-link">
            العودة للدعوات
          </Link>
          <div className="editor-title">
            <h1>محرر الدعوة</h1>
            <p>{currentInvitation.slug}</p>
          </div>
        </div>
        <div className="topbar-actions">
          <label className="topbar-toggle">
            <input
              type="checkbox"
              checked={Boolean(draft.uiConfig?.bilingualEnabled)}
              onChange={(event) => setUiValue('bilingualEnabled', event.target.checked)}
            />
            <span>السماح بلغتين</span>
          </label>
          <span className={`save-state ${saveState}`}>
            {saveState === 'saving' ? 'جارٍ الحفظ' : saveState === 'dirty' ? 'تغييرات غير محفوظة' : saveState === 'error' ? 'فشل الحفظ' : 'محفوظ'}
          </span>
          <button type="button" className="action-btn secondary" onClick={() => persistDraft('save', false)}>
            حفظ الآن
          </button>
          <button type="button" className="action-btn secondary" onClick={() => persistDraft('unpublish', false)}>
            إلغاء النشر
          </button>
          <button type="button" className="action-btn primary" onClick={() => persistDraft('publish', false)}>
            نشر
          </button>
        </div>
      </header>

      {notice ? <div className="notice-banner">{notice}</div> : null}

      <div className="editor-layout">
        <aside className="editor-sidebar">
          <div className="group-list">
            {GROUPS.map((group) => (
              <button
                key={group.key}
                type="button"
                className={`group-btn ${activeGroup === group.key ? 'active' : ''}`}
                onClick={() => setActiveGroup(group.key)}
              >
                {group.label}
              </button>
            ))}
          </div>

          <div className="editor-panel">
            {activeGroup === 'opening' ? (
              <section className="panel-section">
                <h2>اختيار الافتتاحية</h2>
                <div className="cards-grid">
                  {sortedOpenings.map((opening) => (
                    <button
                      key={opening.slug}
                      type="button"
                      className={`select-card ${draft.openingSlug === opening.slug ? 'active' : ''}`}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          openingSlug: opening.slug,
                          openingConfig: {
                            ...current.openingConfig,
                            ...(opening.defaultConfig || {}),
                          },
                        }))
                      }
                    >
                      <strong>{opening.nameAr}</strong>
                      <span>{opening.type}</span>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {activeGroup === 'theme' ? (
              <section className="panel-section">
                <h2>الهوية البصرية</h2>
                <div className="field-grid">
                  {currentManifest.themeOptions.map((field) => (
                    <label key={field.key} className="field-block">
                      <span>{field.labelAr}</span>
                      {field.type === 'font' ? (
                        <>
                          <select
                            value={draft.themeConfig[field.key] || ''}
                            onChange={(event) => setThemeValue(field.key, event.target.value)}
                          >
                            <option value="">خط القالب</option>
                            {fontLibraryOptions.map((font) => (
                              <option key={`${field.key}-${font.id || font.family}`} value={font.family}>
                                {font.nameAr || font.family}
                              </option>
                            ))}
                          </select>
                          <div
                            className="field-style-preview"
                            style={{
                              fontFamily: draft.themeConfig[field.key]
                                ? `"${String(draft.themeConfig[field.key]).replace(/"/g, '')}"`
                                : undefined,
                            }}
                          >
                            {draft.themeConfig[field.key] || 'معاينة الخط'}
                          </div>
                        </>
                      ) : (
                        <input
                          type={field.type === 'color' ? 'color' : 'text'}
                          value={draft.themeConfig[field.key] || ''}
                          onChange={(event) => setThemeValue(field.key, event.target.value)}
                        />
                      )}
                    </label>
                  ))}
                </div>
              </section>
            ) : null}

            {activeGroup === 'publishing' ? (
              <section className="panel-section">
                <h2>النشر والإصدارات</h2>
                <div className="meta-card">
                  <div><strong>الحالة الحالية:</strong> {currentInvitation.status}</div>
                  <div><strong>إصدار المسودة:</strong> v{currentInvitation.draftVersion || 1}</div>
                  <div><strong>آخر تحديث:</strong> {new Date(currentInvitation.updatedAt || currentInvitation.createdAt).toLocaleString('ar-EG')}</div>
                </div>

                <h3>مقارنة الإصدارات</h3>
                <div className="compare-toolbar">
                  <select value={compareSelection.from} onChange={(event) => setCompareSelection((current) => ({ ...current, from: event.target.value }))}>
                    <option value="">اختر النسخة الأولى</option>
                    {revisions.map((revision) => (
                      <option key={`from-${revision.id}`} value={revision.id}>
                        v{revision.revisionNumber} - {revision.status}
                      </option>
                    ))}
                  </select>
                  <select value={compareSelection.to} onChange={(event) => setCompareSelection((current) => ({ ...current, to: event.target.value }))}>
                    <option value="">اختر النسخة الثانية</option>
                    {revisions.map((revision) => (
                      <option key={`to-${revision.id}`} value={revision.id}>
                        v{revision.revisionNumber} - {revision.status}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="mini-btn" onClick={() => void compareRevisions()}>
                    مقارنة
                  </button>
                </div>

                <h3>سجل التعديلات</h3>
                <div className="revision-list">
                  {revisions.map((revision) => (
                    <div key={revision.id} className="revision-item">
                      <div className="revision-main">
                        <strong>v{revision.revisionNumber}</strong>
                        <span>{revision.status}</span>
                        <small>{new Date(revision.createdAt).toLocaleString('ar-EG')}</small>
                        {revision.changeSummary ? <small>{revision.changeSummary}</small> : null}
                      </div>
                      <div className="revision-actions">
                        <button type="button" className="mini-btn" onClick={() => setCompareSelection((current) => ({ ...current, from: revision.id }))}>
                          كنسخة أولى
                        </button>
                        <button type="button" className="mini-btn" onClick={() => setCompareSelection((current) => ({ ...current, to: revision.id }))}>
                          كنسخة ثانية
                        </button>
                        <button type="button" className="mini-btn danger" onClick={() => void restoreRevision(revision.id)}>
                          استعادة
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {compareResult ? (
                  <div className="diff-panel">
                    <h3>نتيجة المقارنة</h3>
                    <p>
                      مقارنة النسخة v{compareResult.fromRevision.revisionNumber} مع v{compareResult.toRevision.revisionNumber}
                    </p>
                    <div className="diff-list">
                      {compareResult.diff.changes.slice(0, 20).map((change) => (
                        <div key={change.key} className="diff-item">
                          <strong>{change.key}</strong>
                          <span>قبل: {change.beforeDisplay}</span>
                          <span>بعد: {change.afterDisplay}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            {activeGroup === 'basic' ? (
              <section className="panel-section">
                <h2>القالب</h2>
                <label className="field-block">
                  <span>اختيار القالب</span>
                  <select value={draft.templateSlug} onChange={(event) => switchTemplate(event.target.value)}>
                    {manifests.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.nameAr}
                      </option>
                    ))}
                  </select>
                </label>
              </section>
            ) : null}

            {groupedFields.length > 0 ? (
              <section className="panel-section">
                <h2>{GROUPS.find((group) => group.key === activeGroup)?.label}</h2>
                <div className="field-grid">
                  {groupedFields.map((field) => (
                    <label key={field.key} className="field-block">
                      <span>{field.labelAr}</span>
                      {renderField({
                        field,
                        draft,
                        onContentChange: setContentValue,
                        onScheduleChange: setScheduleValue,
                        onListChange: setListValue,
                        onTextStyleChange: setFieldTextStyleValue,
                        fontLibraryOptions,
                      })}
                    </label>
                  ))}
                </div>
              </section>
            ) : null}

            {activeGroup === 'sections' ? (
              <section className="panel-section">
                <h2>الأقسام</h2>
                <div className="toggle-list">
                  {allSectionEntries.map((section) => (
                    <label key={section.key} className="toggle-row">
                      <span>{section.label}</span>
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={(event) => setSectionValue(section.key, event.target.checked)}
                      />
                    </label>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </aside>

        <main className="preview-pane">
          <div className="preview-toolbar">
            <div className="preview-device-group">
              <button type="button" className={previewDevice === 'desktop' ? 'active' : ''} onClick={() => setPreviewDevice('desktop')}>سطح المكتب</button>
              <button type="button" className={previewDevice === 'tablet' ? 'active' : ''} onClick={() => setPreviewDevice('tablet')}>تابلت</button>
              <button type="button" className={previewDevice === 'mobile' ? 'active' : ''} onClick={() => setPreviewDevice('mobile')}>موبايل</button>
            </div>
            <span className="preview-label">{currentManifest.nameAr}</span>
          </div>

          <div className="preview-stage">
            <div className="preview-frame-shell" style={{ width: previewWidth }}>
              <RenderFrame
                templateSlug={currentManifest.slug}
                manifest={currentManifest}
                renderConfig={renderConfig}
                className="runtime-host"
                frameClassName="runtime-frame"
              />
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .editor-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f6f0ea;
          direction: rtl;
        }
        .editor-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 24px;
          background: rgba(255, 250, 246, 0.96);
          border-bottom: 1px solid rgba(127, 42, 31, 0.08);
          backdrop-filter: blur(16px);
          position: sticky;
          top: 0;
          z-index: 30;
        }
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .back-link {
          padding: 10px 14px;
          border-radius: 999px;
          background: #fff;
          color: #7f2a1f;
          font-weight: 700;
        }
        .editor-title h1 {
          margin: 0;
          font-size: 1.25rem;
          color: #2f2430;
        }
        .editor-title p {
          margin: 4px 0 0;
          color: #7b6770;
          font-size: 0.86rem;
        }
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .topbar-toggle {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 999px;
          background: #fff;
          border: 1px solid rgba(127, 42, 31, 0.12);
          color: #564a54;
          font-size: 0.9rem;
          font-weight: 700;
        }
        .topbar-toggle input {
          width: 18px;
          height: 18px;
          accent-color: #7f2a1f;
        }
        .save-state {
          padding: 8px 12px;
          border-radius: 999px;
          background: #fff;
          color: #6b5d67;
          font-size: 0.85rem;
          font-weight: 700;
        }
        .save-state.saving { color: #94611f; }
        .save-state.dirty { color: #a24b45; }
        .save-state.error { color: #c43d54; }
        .action-btn {
          border: none;
          border-radius: 999px;
          padding: 12px 18px;
          font: inherit;
          font-weight: 800;
        }
        .action-btn.primary {
          background: linear-gradient(135deg, #7f2a1f, #bc7859);
          color: #fff;
        }
        .action-btn.secondary {
          background: #fff;
          color: #2f2430;
          border: 1px solid rgba(127, 42, 31, 0.12);
        }
        .notice-banner {
          margin: 12px 24px 0;
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(195, 154, 88, 0.14);
          color: #6e5438;
          font-weight: 700;
        }
        .editor-layout {
          display: grid;
          grid-template-columns: 420px minmax(0, 1fr);
          min-height: calc(100vh - 86px);
        }
        .editor-sidebar {
          border-left: 1px solid rgba(127, 42, 31, 0.08);
          background: #fffaf6;
          display: grid;
          grid-template-columns: 112px minmax(0, 1fr);
          min-height: 0;
        }
        .group-list {
          padding: 14px 10px;
          border-left: 1px solid rgba(127, 42, 31, 0.06);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .group-btn {
          border: none;
          border-radius: 16px;
          padding: 12px 10px;
          background: transparent;
          color: #6f6470;
          font: inherit;
          font-weight: 700;
          text-align: center;
        }
        .group-btn.active {
          background: linear-gradient(180deg, rgba(195, 154, 88, 0.18), rgba(127, 42, 31, 0.08));
          color: #7f2a1f;
        }
        .editor-panel {
          overflow: auto;
          padding: 18px;
        }
        .panel-section {
          background: #fff;
          border-radius: 22px;
          padding: 20px;
          border: 1px solid rgba(127, 42, 31, 0.08);
          box-shadow: 0 18px 40px rgba(83, 38, 31, 0.05);
          margin-bottom: 16px;
        }
        .panel-section h2 {
          margin: 0 0 16px;
          font-size: 1.05rem;
          color: #2f2430;
        }
        .panel-section h3 {
          margin: 14px 0 10px;
          font-size: 0.95rem;
        }
        .field-grid {
          display: grid;
          gap: 14px;
        }
        .field-block {
          display: grid;
          gap: 8px;
          color: #5b4f5b;
          font-weight: 700;
          font-size: 0.92rem;
        }
        .field-block input,
        .field-block textarea,
        .field-block select {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(127, 42, 31, 0.12);
          background: #fffaf9;
          padding: 12px 14px;
          font: inherit;
        }
        .bilingual-stack {
          display: grid;
          gap: 12px;
        }
        .bilingual-subfield {
          display: grid;
          gap: 8px;
        }
        .bilingual-subfield span {
          margin: 0;
          color: #7b6770;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .field-style-tools {
          display: grid;
          gap: 10px;
          margin-top: 6px;
          padding: 12px;
          border-radius: 16px;
          background: rgba(195, 154, 88, 0.08);
          border: 1px solid rgba(127, 42, 31, 0.08);
        }
        .field-style-tools__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .field-style-tools__header strong {
          color: #7f2a1f;
          font-size: 0.82rem;
        }
        .field-style-tools__link {
          color: #9f7a38;
          font-size: 0.8rem;
          font-weight: 800;
        }
        .field-style-tools__grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        .field-style-preview {
          border-radius: 14px;
          background: #fff;
          border: 1px solid rgba(127, 42, 31, 0.1);
          padding: 12px 14px;
          min-height: 52px;
          display: flex;
          align-items: center;
          color: #7f2a1f;
          line-height: 1.6;
        }
        .cards-grid {
          display: grid;
          gap: 10px;
        }
        .select-card {
          display: grid;
          gap: 6px;
          text-align: right;
          border-radius: 16px;
          border: 1px solid rgba(127, 42, 31, 0.12);
          background: #fffaf9;
          padding: 14px;
          font: inherit;
          color: #453b45;
        }
        .select-card.active {
          border-color: #7f2a1f;
          box-shadow: 0 0 0 3px rgba(127, 42, 31, 0.08);
        }
        .array-editor,
        .compare-toolbar,
        .diff-list,
        .revision-main,
        .revision-actions {
          display: grid;
          gap: 10px;
        }
        .array-row,
        .schedule-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 8px;
          align-items: center;
        }
        .schedule-row {
          grid-template-columns: 120px minmax(0, 1fr) auto;
        }
        .mini-btn {
          border: none;
          border-radius: 12px;
          padding: 10px 12px;
          background: rgba(195, 154, 88, 0.14);
          color: #704d1c;
          font: inherit;
          font-weight: 700;
        }
        .mini-btn.danger {
          background: rgba(212, 75, 106, 0.12);
          color: #b53d58;
        }
        .toggle-list {
          display: grid;
          gap: 10px;
        }
        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #fffaf9;
          border: 1px solid rgba(127, 42, 31, 0.08);
        }
        .meta-card,
        .revision-list {
          display: grid;
          gap: 10px;
        }
        .revision-item {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 10px;
          align-items: start;
          padding: 12px 14px;
          border-radius: 14px;
          background: #fffaf9;
        }
        .diff-panel {
          margin-top: 16px;
          padding: 16px;
          border-radius: 16px;
          background: rgba(195, 154, 88, 0.08);
        }
        .diff-item {
          display: grid;
          gap: 4px;
          border-radius: 12px;
          background: #fff;
          padding: 12px;
        }
        .compare-toolbar select {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(127, 42, 31, 0.12);
          background: #fffaf9;
          padding: 10px 12px;
          font: inherit;
        }
        .preview-pane {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .preview-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 24px;
        }
        .preview-device-group {
          display: inline-flex;
          gap: 8px;
          padding: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
          box-shadow: 0 10px 24px rgba(83, 38, 31, 0.06);
        }
        .preview-device-group button {
          border: none;
          background: transparent;
          padding: 10px 16px;
          border-radius: 999px;
          font: inherit;
          font-weight: 800;
          color: #6f6470;
        }
        .preview-device-group button.active {
          background: #7f2a1f;
          color: #fff;
        }
        .preview-label {
          color: #6f6470;
          font-weight: 800;
        }
        .preview-stage {
          flex: 1;
          display: grid;
          place-items: center;
          padding: 24px;
        }
        .preview-frame-shell {
          height: min(84vh, 880px);
          border-radius: 32px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 30px 90px rgba(60, 31, 27, 0.15);
        }
        .runtime-host,
        .runtime-frame {
          width: 100%;
          height: 100%;
          border: none;
        }
        @media (max-width: 1100px) {
          .editor-layout {
            grid-template-columns: 1fr;
          }
          .editor-sidebar {
            grid-template-columns: 1fr;
          }
          .group-list {
            flex-direction: row;
            overflow: auto;
            border-left: none;
            border-bottom: 1px solid rgba(127, 42, 31, 0.06);
          }
          .field-style-tools__grid,
          .schedule-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
