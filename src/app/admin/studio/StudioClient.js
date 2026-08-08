'use client';

import { startTransition, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RenderFrame from '@/components/invitation/RenderFrame';
import MediaPicker from '@/components/admin/MediaPicker';
import { buildInvitationRenderConfig, getOpeningBySlug } from '@/lib/template-system';

const DEVICE_PRESETS = {
  mobile: { label: 'هاتف', width: 390, height: 844 },
  tablet: { label: 'تابلت', width: 768, height: 1024 },
  desktop: { label: 'سطح مكتب', width: 1280, height: 860 },
};

const SECTION_META = {
  'custom-elements': { icon: '*', label: 'Free Elements', description: 'Add movable text and images over the template' },
  basic: { icon: '👤', label: 'الأساسيات', description: 'أسماء العروسين وبيانات المناسبة' },
  wording: { icon: '📝', label: 'النصوص', description: 'رسائل الدعوة والعناوين' },
  families: { icon: '👪', label: 'العائلات', description: 'أسماء وتواقيع العائلتين' },
  details: { icon: '📍', label: 'المكان والزمان', description: 'التاريخ والقاعة ورابط الخريطة' },
  schedule: { icon: '🗓', label: 'البرنامج', description: 'فقرات اليوم وجدوله' },
  media: { icon: '🖼', label: 'الوسائط', description: 'صور وفيديوهات وموسيقى الدعوة' },
  contact: { icon: '📞', label: 'التواصل', description: 'اسم ورقم جهة التنسيق والاستفسار' },
  closing: { icon: '✒', label: 'الخاتمة', description: 'خاتمة الدعوة والهاشتاغ والتوقيع' },
  opening: { icon: '✨', label: 'الافتتاحية', description: 'المشهد الأول وطريقة الدخول' },
  design: { icon: '🎨', label: 'التصميم', description: 'الألوان والخطوط والمظهر العام' },
  sections: { icon: '☰', label: 'الأقسام', description: 'إظهار وإخفاء وترتيب أجزاء الدعوة' },
  advanced: { icon: '⚙', label: 'إعدادات متقدمة', description: 'القالب الأساسي وخيارات العمل' },
};

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function buildPreviewInvitation(session, draft) {
  return {
    id: session.id,
    slug: `studio-${session.id}`,
    locale: draft.uiConfig?.defaultLocale || 'ar',
    groomName: draft.contentConfig.groomName || '',
    brideName: draft.contentConfig.brideName || '',
    weddingDate: draft.contentConfig.weddingDate ? new Date(draft.contentConfig.weddingDate) : null,
    venueName: draft.contentConfig.venueName || '',
    venueAddress: draft.contentConfig.venueAddress || '',
    welcomeMessage: draft.contentConfig.welcomeMessage || '',
    musicUrl: draft.contentConfig.musicUrl || '',
    contentConfig: draft.contentConfig,
    themeConfig: draft.themeConfig,
    sectionConfig: draft.sectionConfig,
    openingConfig: draft.openingConfig,
    uiConfig: draft.uiConfig,
    customElements: draft.customElements || [],
    textOverrides: draft.textOverrides || {},
    opening: { slug: draft.openingSlug },
    template: { slug: draft.templateSlug },
  };
}

function getEnglishKey(key) {
  return `${key}__en`;
}

function isTranslatableField(field) {
  return ['text', 'textarea', 'list', 'schedule'].includes(field.type);
}

function renderField({ field, draft, onContentChange, onScheduleChange, onListChange }) {
  const value = draft.contentConfig[field.key];
  const bilingualEnabled = Boolean(draft.uiConfig?.bilingualEnabled);
  const englishKey = getEnglishKey(field.key);
  const englishValue = draft.contentConfig[englishKey];

  if (field.type === 'textarea') {
    if (bilingualEnabled && isTranslatableField(field)) {
      return (
        <div className="studio-bilingual-stack">
          <label className="studio-subfield">
            <span>العربي</span>
            <textarea
              rows={4}
              value={value || ''}
              onChange={(event) => onContentChange(field.key, event.target.value)}
            />
          </label>
          <label className="studio-subfield">
            <span>English</span>
            <textarea
              rows={4}
              dir="ltr"
              value={englishValue || ''}
              onChange={(event) => onContentChange(englishKey, event.target.value)}
            />
          </label>
        </div>
      );
    }

    return (
      <textarea
        rows={4}
        value={value || ''}
        onChange={(event) => onContentChange(field.key, event.target.value)}
      />
    );
  }

  if (field.type === 'gallery') {
    const items = arrayValue(value);
    return (
      <div className="array-editor">
        {items.map((item, index) => (
          <div key={`${field.key}-${index}`} className="array-row">
            <MediaPicker
              label="اختيار صورة"
              value={item || ''}
              accept="image"
              folder="studio-gallery"
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
          onClick={() => {
            onContentChange(field.key, [...items, '']);
            if (bilingualEnabled) {
              onContentChange(englishKey, [...englishItems, '']);
            }
          }}
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
              placeholder="عنصر"
              onChange={(event) => onListChange(field.key, index, event.target.value)}
            />
            {bilingualEnabled ? (
              <input
                type="text"
                dir="ltr"
                value={englishItems[index] || ''}
                placeholder="Item (EN)"
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
          إضافة عنصر
        </button>
      </div>
    );
  }

  if (field.type === 'image' || field.type === 'audio' || field.type === 'video') {
    return (
      <MediaPicker
        label={`اختيار ${field.type === 'image' ? 'صورة' : field.type === 'audio' ? 'صوت' : 'فيديو'}`}
        value={value || ''}
        accept={field.type}
        folder={`studio-${field.type}`}
        onChange={(nextValue) => onContentChange(field.key, nextValue)}
      />
    );
  }

  if (field.type === 'boolean') {
    return (
      <label className="studio-boolean-field">
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
  }[field.type] || 'text';

  if (bilingualEnabled && isTranslatableField(field) && inputType === 'text') {
    return (
      <div className="studio-bilingual-stack">
        <label className="studio-subfield">
          <span>العربي</span>
          <input
            type="text"
            value={value || ''}
            onChange={(event) => onContentChange(field.key, event.target.value)}
          />
        </label>
        <label className="studio-subfield">
          <span>English</span>
          <input
            type="text"
            dir="ltr"
            value={englishValue || ''}
            onChange={(event) => onContentChange(englishKey, event.target.value)}
          />
        </label>
      </div>
    );
  }

  return (
    <input
      type={inputType}
      dir={inputType === 'url' ? 'ltr' : undefined}
      value={value || ''}
      onChange={(event) => onContentChange(field.key, event.target.value)}
    />
  );
}

function MediaSummaryCard({ label, value, type, onClear, onChange }) {
  return (
    <div className="studio-media-card">
      <div className="studio-media-card__head">
        <strong>{label}</strong>
        {value ? <span className="studio-media-status">مربوط</span> : <span className="studio-media-status empty">فارغ</span>}
      </div>
      <MediaPicker
        label="اختيار"
        value={value || ''}
        accept={type}
        folder={`studio-${type}`}
        onChange={onChange}
      />
      <div className="studio-media-card__actions">
        <button type="button" className="mini-btn" onClick={onClear}>حذف</button>
      </div>
    </div>
  );
}

const QUICK_MEDIA_KEYS = new Set([
  'venueImage',
  'images.hero',
  'images.background',
  'images.venue',
  'musicUrl',
]);

export default function StudioClient({ session, manifests, openings, inventory }) {
  const router = useRouter();
  const [draft, setDraft] = useState(session.draft);
  const [openSection, setOpenSection] = useState('basic');
  const [saveState, setSaveState] = useState('saved');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [previewReloadToken, setPreviewReloadToken] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [canvasClickMenu, setCanvasClickMenu] = useState(null);
  const autosaveRef = useRef(null);
  const lastSavedRef = useRef(JSON.stringify(session.draft));

  const currentManifest = useMemo(
    () => manifests.find((item) => item.slug === draft.templateSlug) || manifests[0],
    [draft.templateSlug, manifests],
  );
  const availableOpenings = useMemo(() => {
    const activeOpenings = openings.filter((opening) => opening.isActive !== false);
    return activeOpenings.sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0));
  }, [openings]);
  const currentOpening = useMemo(
    () =>
      availableOpenings.find((item) => item.slug === draft.openingSlug)
      || openings.find((item) => item.slug === draft.openingSlug)
      || getOpeningBySlug(draft.openingSlug),
    [draft.openingSlug, availableOpenings, openings],
  );
  const previewInvitation = useMemo(() => buildPreviewInvitation(session, draft), [session, draft]);
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

  const groupedFields = useMemo(
    () =>
      currentManifest.editableFields.reduce((accumulator, field) => {
        const group = field.section || 'basic';
        if (!accumulator[group]) accumulator[group] = [];
        accumulator[group].push(field);
        return accumulator;
      }, {}),
    [currentManifest],
  );

  const activeSections = useMemo(() => {
    const fieldSections = Object.keys(groupedFields).filter((key) => SECTION_META[key]);
    return [...fieldSections, 'custom-elements', 'opening', 'design', 'sections', 'advanced'];
  }, [groupedFields]);

  function addCustomElement(type, position, content = '') {
    setDraft((current) => {
      const nextElement = {
        id: `custom-${Math.random().toString(36).slice(2, 11)}`,
        type,
        content,
        x: Math.max(12, Math.round(position?.x ?? 40)),
        y: Math.max(12, Math.round(position?.y ?? 40)),
        ...(type === 'text'
          ? {
              fontSize: '24px',
              color: '#1f2937',
            }
          : {
              width: '150px',
              height: 'auto',
            }),
      };

      return {
        ...current,
        customElements: [...(current.customElements || []), nextElement],
        ui: {
          ...current.ui,
          addCustomElementMode: '',
        },
      };
    });
    setOpenSection('custom-elements');
  }

  const persistDraft = useEffectEvent(async (nextDraft) => {
    setSaveState('saving');
    try {
      const response = await fetch(`/api/studio/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nextDraft,
          name: session.name,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'تعذر حفظ الجلسة.');
      }

      lastSavedRef.current = JSON.stringify(nextDraft);
      setSaveState('saved');
    } catch (error) {
      setSaveState('error');
      setNotice(error.message || 'تعذر حفظ الجلسة.');
    }
  });

  useEffect(() => {
    function handleMessage(event) {
      if (event.data?.type === 'FARHA_CUSTOM_ELEMENT_UPDATE') {
        setDraft(current => {
          const els = current.customElements || [];
          const idx = els.findIndex(e => e.id === event.data.payload.id);
          if (idx === -1) return current;
          const newEls = [...els];
          newEls[idx] = { ...newEls[idx], ...event.data.payload.updates };
          return { ...current, customElements: newEls };
        });
      } else if (event.data?.type === 'FARHA_CUSTOM_ELEMENT_DELETE') {
        setDraft(current => ({
          ...current,
          customElements: (current.customElements || []).filter((item) => item.id !== event.data.payload.id),
        }));
      } else if (event.data?.type === 'FARHA_CUSTOM_ELEMENT_SELECT') {
        setOpenSection('custom-elements');
      } else if (event.data?.type === 'FARHA_TEXT_OVERRIDE') {
        const { path, text } = event.data.payload;
        setDraft(current => ({
          ...current,
          textOverrides: {
            ...(current.textOverrides || {}),
            [path]: text
          }
        }));
      } else if (event.data?.type === 'FARHA_CANVAS_CLICK') {
        const { x, y } = event.data.payload;
        if (draft.ui?.addCustomElementMode === 'text') {
          addCustomElement('text', { x, y }, 'نص جديد');
          setCanvasClickMenu(null);
          return;
        }
        if (draft.ui?.addCustomElementMode === 'image') {
          setCanvasClickMenu({ x, y, forceImage: true });
          return;
        }
        setCanvasClickMenu({ x, y });
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [draft.ui?.addCustomElementMode]);

  useEffect(() => {
    const serialized = JSON.stringify(draft);
    if (serialized === lastSavedRef.current) {
      return undefined;
    }

    setSaveState('dirty');
    clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => {
      void persistDraft(draft);
    }, 900);

    return () => clearTimeout(autosaveRef.current);
  }, [draft]);

  useEffect(() => () => clearTimeout(autosaveRef.current), []);

  useEffect(() => {
    if (availableOpenings.some((opening) => opening.slug === draft.openingSlug)) {
      return;
    }

    const fallbackOpening = availableOpenings[0];
    if (!fallbackOpening) {
      return;
    }

    setDraft((current) => ({
      ...current,
      openingSlug: fallbackOpening.slug,
      openingConfig: {
        ...current.openingConfig,
        ...fallbackOpening.defaultConfig,
      },
    }));
    setPreviewReloadToken((value) => value + 1);
  }, [availableOpenings, draft.openingSlug]);

  function setContentValue(key, value) {
    setDraft((current) => ({
      ...current,
      contentConfig: {
        ...current.contentConfig,
        [key]: value,
      },
    }));
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

  function setUiValue(key, value) {
    setDraft((current) => ({
      ...current,
      uiConfig: {
        ...current.uiConfig,
        [key]: value,
      },
    }));
  }

  function setScheduleValue(key, index, targetKey, value) {
    const nextItems = arrayValue(draft.contentConfig[key]).map((item, itemIndex) =>
      itemIndex === index ? { ...item, [targetKey]: value } : item,
    );
    setContentValue(key, nextItems);
  }

  function setListValue(key, index, value) {
    const nextItems = arrayValue(draft.contentConfig[key]).map((item, itemIndex) =>
      itemIndex === index ? value : item,
    );
    setContentValue(key, nextItems);
  }

  function handleOpenSection(sectionKey) {
    setOpenSection((current) => (current === sectionKey ? '' : sectionKey));
  }

  async function saveVariant() {
    const name = window.prompt('اسم القالب الداخلي الجديد', `${currentManifest.nameAr} - نسخة داخلية`);
    if (!name) return;

    setBusy(true);
    setNotice('');
    try {
      const response = await fetch(`/api/studio/sessions/${session.id}/save-variant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, nameAr: name, isPublished: false }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'تعذر حفظ القالب الداخلي.');
      }

      setNotice(`تم حفظ القالب الداخلي: ${payload.data.variant.name}`);
      router.refresh();
    } catch (error) {
      setNotice(error.message || 'تعذر حفظ القالب الداخلي.');
    } finally {
      setBusy(false);
    }
  }

  async function createInvitation() {
    const slug = window.prompt('Slug الدعوة الجديدة', `${draft.templateSlug}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
    if (!slug) return;
    const clientName = window.prompt('اسم العميل');
    if (!clientName) return;
    const title = window.prompt('عنوان الدعوة', `${draft.contentConfig.groomName || ''} & ${draft.contentConfig.brideName || ''}`.trim());

    setBusy(true);
    setNotice('');
    try {
      const response = await fetch(`/api/studio/sessions/${session.id}/create-invitation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          title: title || '',
          clientName,
          clientPhone: '',
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'تعذر إنشاء الدعوة.');
      }

      setNotice(`تم إنشاء الدعوة: ${payload.data.invitation.slug}`);
      startTransition(() => {
        router.push(payload.data.editUrl);
      });
    } catch (error) {
      setNotice(error.message || 'تعذر إنشاء الدعوة.');
    } finally {
      setBusy(false);
    }
  }

  function renderAccordionSection(sectionKey) {
    const sectionMeta = SECTION_META[sectionKey];
    const isOpen = openSection === sectionKey;
    const fields = groupedFields[sectionKey] || [];
    const visibleFields = sectionKey === 'media'
      ? fields.filter((field) => !QUICK_MEDIA_KEYS.has(field.key))
      : fields;

    return (
      <section key={sectionKey} className={`studio-accordion ${isOpen ? 'open' : ''}`}>
        <button type="button" className="studio-accordion__header" onClick={() => handleOpenSection(sectionKey)}>
          <span className="studio-accordion__icon">{sectionMeta.icon}</span>
          <span className="studio-accordion__copy">
            <strong>{sectionMeta.label}</strong>
            <small>{sectionMeta.description}</small>
          </span>
          <span className="studio-accordion__arrow">{isOpen ? '−' : '+'}</span>
        </button>

        {isOpen ? (
          <div className="studio-accordion__body">
            {sectionKey === 'design' ? (
              <div className="studio-form-grid">
                {currentManifest.themeOptions.map((field) => (
                  <label key={field.key} className={`studio-field ${field.type === 'color' ? 'studio-field--compact' : ''}`}>
                    <span>{field.labelAr}</span>
                    <input
                      type={field.type === 'color' ? 'color' : 'text'}
                      value={draft.themeConfig[field.key] || ''}
                      onChange={(event) => setThemeValue(field.key, event.target.value)}
                    />
                  </label>
                ))}
              </div>
            ) : null}

            {sectionKey === 'opening' ? (
              <div className="studio-stack">
                <div className="studio-opening-card">
                  <div className="studio-opening-card__meta">
                    <strong>{currentOpening.nameAr}</strong>
                    <small>{currentOpening.type}</small>
                  </div>
                  <div className="studio-opening-card__actions">
                    <button type="button" className="mini-btn" onClick={() => setPreviewReloadToken((value) => value + 1)}>معاينة</button>
                    <button type="button" className="mini-btn" onClick={() => setPreviewReloadToken((value) => value + 1)}>إعادة تشغيل</button>
                  </div>
                </div>
                <label className="studio-field">
                  <span>نوع الافتتاحية</span>
                  <select
                    value={draft.openingSlug}
                    onChange={(event) => {
                      const nextOpening = availableOpenings.find((opening) => opening.slug === event.target.value);
                      setDraft((current) => ({
                        ...current,
                        openingSlug: event.target.value,
                        openingConfig: {
                          ...current.openingConfig,
                          ...(nextOpening?.defaultConfig || {}),
                        },
                      }));
                      setPreviewReloadToken((value) => value + 1);
                    }}
                  >
                    {availableOpenings.map((opening) => (
                      <option key={opening.slug} value={opening.slug}>
                        {opening.nameAr}
                      </option>
                    ))}
                  </select>
                </label>
                {currentOpening.descriptionAr ? (
                  <div className="studio-opening-hint">
                    {currentOpening.descriptionAr}
                  </div>
                ) : null}
                <label className="studio-field">
                  <span>السماح بالتخطي</span>
                  <select
                    value={draft.openingConfig.allowSkip ? 'yes' : 'no'}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        openingConfig: {
                          ...current.openingConfig,
                          allowSkip: event.target.value === 'yes',
                        },
                      }))
                    }
                  >
                    <option value="yes">نعم</option>
                    <option value="no">لا</option>
                  </select>
                </label>
              </div>
            ) : null}

            {sectionKey === 'custom-elements' ? (
              <div className="studio-stack">
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setDraft(current => ({ ...current, ui: { ...current.ui, addCustomElementMode: 'text' } }));
                    }}
                    style={{ flex: 1 }}
                  >
                    إضافة نص حر
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setDraft(current => ({ ...current, ui: { ...current.ui, addCustomElementMode: 'image' } }));
                    }}
                    style={{ flex: 1 }}
                  >
                    إضافة صورة حرة
                  </button>
                </div>
                {draft.ui?.addCustomElementMode ? (
                  <p className="studio-help-text" style={{ color: '#00796b', background: '#e0f2f1', padding: '8px', borderRadius: '4px' }}>
                    ✅ وضع الإضافة مفعل. اضغط في أي مكان على المحاكي لتثبيت العنصر!
                  </p>
                ) : (
                  <p className="studio-help-text">
                    💡 اضغط على مكان فارغ في المحاكي لإضافة نص أو صورة مباشرةً، أو اختر من الأزرار بالأعلى.
                  </p>
                )}

                <div className="studio-custom-elements-list">
                  {(draft.customElements || []).map(el => (
                    <div key={el.id} className="studio-custom-element-item" style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong>{el.type === 'text' ? 'نص' : 'صورة'}</strong>
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={() => {
                            setDraft(current => ({
                              ...current,
                              customElements: current.customElements.filter(e => e.id !== el.id)
                            }));
                          }}
                          style={{ color: '#d32f2f' }}
                        >
                          حذف
                        </button>
                      </div>
                      
                      {el.type === 'text' && (
                        <>
                          <textarea
                            value={el.content}
                            onChange={(e) => {
                              setDraft(current => ({
                                ...current,
                                customElements: current.customElements.map(e2 => e2.id === el.id ? { ...e2, content: e.target.value } : e2)
                              }));
                            }}
                            className="studio-input"
                            rows={3}
                            placeholder="اكتب النص هنا"
                          />
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <input
                              type="color"
                              value={el.color || '#000000'}
                              onChange={(e) => {
                                setDraft(current => ({
                                  ...current,
                                  customElements: current.customElements.map(e2 => e2.id === el.id ? { ...e2, color: e.target.value } : e2)
                                }));
                              }}
                              title="لون النص"
                            />
                            <select
                              value={el.fontSize || '24px'}
                              onChange={(e) => {
                                setDraft(current => ({
                                  ...current,
                                  customElements: current.customElements.map(e2 => e2.id === el.id ? { ...e2, fontSize: e.target.value } : e2)
                                }));
                              }}
                              className="studio-input"
                            >
                              <option value="12px">صغير جداً</option>
                              <option value="16px">صغير</option>
                              <option value="24px">متوسط</option>
                              <option value="32px">كبير</option>
                              <option value="48px">كبير جداً</option>
                            </select>
                          </div>
                        </>
                      )}
                      
                      {el.type === 'image' && (
                        <MediaPicker
                          label="تغيير الصورة"
                          value={el.content}
                          onChange={(url) => {
                            if (url) {
                              setDraft(current => ({
                                ...current,
                                customElements: current.customElements.map(e2 => e2.id === el.id ? { ...e2, content: url } : e2)
                              }));
                            }
                          }}
                          trigger={
                            <button type="button" className="mini-btn">
                              تغيير الصورة
                            </button>
                          }
                        />
                      )}
                    </div>
                  ))}
                  {(draft.customElements || []).length === 0 && (
                    <p style={{ textAlign: 'center', opacity: 0.5, margin: '20px 0' }}>لا يوجد عناصر حرة</p>
                  )}
                </div>
              </div>
            ) : null}

            {sectionKey === 'sections' ? (
              <div className="studio-stack">
                {(currentManifest.sections || []).map((section) => (
                  <div key={section.key} className="studio-section-row">
                    <span className="studio-section-row__drag">⋮⋮</span>
                    <div className="studio-section-row__copy">
                      <strong>{section.labelAr}</strong>
                      <small>{section.labelEn}</small>
                    </div>
                    <button type="button" className="mini-btn" onClick={() => handleOpenSection('sections')}>انتقال</button>
                    <label className="studio-switch">
                      <input
                        type="checkbox"
                        checked={draft.sectionConfig[section.key] !== false}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            sectionConfig: {
                              ...current.sectionConfig,
                              [section.key]: event.target.checked,
                            },
                          }))
                        }
                      />
                      <span className="studio-switch__track" />
                    </label>
                  </div>
                ))}
              </div>
            ) : null}

            {sectionKey === 'advanced' ? (
              <div className="studio-stack">
                <label className="studio-field">
                  <span>القالب الأساسي</span>
                  <select
                    value={draft.templateSlug}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        templateSlug: event.target.value,
                      }))
                    }
                  >
                    {manifests.map((manifest) => (
                      <option key={manifest.slug} value={manifest.slug}>
                        {manifest.nameAr}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="studio-metrics">
                  <div><strong>{inventory.summary.templates}</strong><span>قالب</span></div>
                  <div><strong>{inventory.summary.images}</strong><span>صورة</span></div>
                  <div><strong>{inventory.summary.videos}</strong><span>فيديو</span></div>
                  <div><strong>{inventory.summary.audio}</strong><span>صوت</span></div>
                </div>
              </div>
            ) : null}

            {sectionKey === 'media' ? (
              <div className="studio-media-grid">
                <MediaSummaryCard
                  label="صورة العروسين داخل القالب"
                  type="image"
                  value={draft.contentConfig['images.hero']}
                  onChange={(value) => setContentValue('images.hero', value)}
                  onClear={() => setContentValue('images.hero', '')}
                />
                <MediaSummaryCard
                  label="خلفية المشهد"
                  type="image"
                  value={draft.contentConfig['images.background']}
                  onChange={(value) => setContentValue('images.background', value)}
                  onClear={() => setContentValue('images.background', '')}
                />
                <MediaSummaryCard
                  label="صورة الغلاف"
                  type="image"
                  value={draft.contentConfig.venueImage}
                  onChange={(value) => setContentValue('venueImage', value)}
                  onClear={() => setContentValue('venueImage', '')}
                />
                <MediaSummaryCard
                  label="الموسيقى"
                  type="audio"
                  value={draft.contentConfig.musicUrl}
                  onChange={(value) => setContentValue('musicUrl', value)}
                  onClear={() => setContentValue('musicUrl', '')}
                />
                <MediaSummaryCard
                  label="صورة القاعة"
                  type="image"
                  value={draft.contentConfig['images.venue']}
                  onChange={(value) => setContentValue('images.venue', value)}
                  onClear={() => setContentValue('images.venue', '')}
                />
              </div>
            ) : null}

            {visibleFields.length > 0 ? (
              <div className="studio-form-grid">
                {visibleFields.map((field) => (
                  <label
                    key={field.key}
                    className={`studio-field ${field.type === 'textarea' || field.type === 'gallery' || field.type === 'schedule' || field.type === 'list' ? 'studio-field--full' : ''}`}
                  >
                    <span>{field.labelAr}</span>
                    {renderField({
                      field,
                      draft,
                      onContentChange: setContentValue,
                      onScheduleChange: setScheduleValue,
                      onListChange: setListValue,
                    })}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    );
  }

  const currentDeviceLabel = DEVICE_PRESETS[draft.devicePreview.mode]?.label || '\u0647\u0627\u062A\u0641';
  const studioEyebrow = '\u0627\u0633\u062A\u0648\u062F\u064A\u0648 \u0627\u0644\u062A\u062E\u0635\u064A\u0635';
  const livePreviewBadge = '\u0645\u0639\u0627\u064A\u0646\u0629 \u0645\u0628\u0627\u0634\u0631\u0629';
  const studioMetaLine = `${session.name} \u00B7 ${currentOpening.nameAr}`;

  return (
    <div className="studio-workspace">
      <section className="studio-canvas">
        <div className="studio-canvas__toolbar">
          <div className="studio-canvas__toolbar-main">
            <div className="studio-canvas__meta">
              <span className="studio-canvas__eyebrow">{studioEyebrow}</span>
              <strong>{currentManifest.nameAr}</strong>
              <p>{studioMetaLine}</p>
            </div>
            <div className="studio-canvas__badge">{livePreviewBadge}</div>
          </div>
          <div className="studio-toolbar-groups">
            <label className="studio-boolean-field studio-toolbar-toggle">
              <input
                type="checkbox"
                checked={Boolean(draft.uiConfig?.bilingualEnabled)}
                onChange={(event) => setUiValue('bilingualEnabled', event.target.checked)}
              />
              <span>دعوة بلغتين</span>
            </label>
            <div className="studio-toolbar-group">
              {Object.entries(DEVICE_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  className={`mini-btn ${draft.devicePreview.mode === key ? 'active' : ''}`}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      devicePreview: { mode: key, ...preset },
                    }))
                  }
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="studio-toolbar-group studio-toolbar-group--ghost">
              <button type="button" className="mini-btn" onClick={() => setPreviewReloadToken((value) => value + 1)}>تحديث</button>
              <button type="button" className="mini-btn" onClick={() => setPreviewReloadToken((value) => value + 1)}>إعادة الافتتاحية</button>
              <button type="button" className="mini-btn" onClick={() => setPreviewReloadToken((value) => value + 1)}>صوت</button>
              <Link className="mini-btn" href={`/admin/studio/${session.id}/preview`} target="_blank">ملء الشاشة</Link>
            </div>
          </div>
        </div>

        <div className="studio-canvas__frame">
          <div className="studio-phone-stage studio-phone-stage--sticky">
            <div className={`studio-device studio-device--${draft.devicePreview.mode}`}>
              <div className="studio-phone-shell">
                        {canvasClickMenu && (
          <div style={{
            position: 'absolute',
            top: canvasClickMenu.y + 'px',
            left: canvasClickMenu.x + 'px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            gap: '8px',
            padding: '8px',
            zIndex: 1000,
            transform: 'translate(-50%, -50%)'
          }}>
            <button
              type="button"
              className="mini-btn"
              onClick={() => {
                setDraft(current => {
                  const newEl = {
                    id: 'custom-' + Math.random().toString(36).substr(2, 9),
                    type: 'text',
                    content: 'نص جديد',
                    x: canvasClickMenu.x,
                    y: canvasClickMenu.y,
                    fontSize: '24px',
                    color: '#000000',
                  };
                  return {
                    ...current,
                    customElements: [...(current.customElements || []), newEl],
                  };
                });
                setCanvasClickMenu(null);
                setOpenSection('custom-elements');
              }}
              style={{ padding: '8px', fontSize: '18px', width: '40px', height: '40px' }}
              title="إضافة نص"
            >
              T
            </button>
            <MediaPicker
              label="+"
              value=""
              onChange={(url) => {
                if (url) {
                  setDraft(current => {
                    const newEl = {
                      id: 'custom-' + Math.random().toString(36).substr(2, 9),
                      type: 'image',
                      content: url,
                      x: canvasClickMenu.x,
                      y: canvasClickMenu.y,
                      width: '150px',
                      height: 'auto',
                    };
                    return {
                      ...current,
                      customElements: [...(current.customElements || []), newEl],
                    };
                  });
                  setCanvasClickMenu(null);
                  setOpenSection('custom-elements');
                }
              }}
              trigger={<button type="button" className="mini-btn" style={{ padding: '8px', fontSize: '20px', width: '40px', height: '40px', background: '#e0f2f1', color: '#00796b', border: 'none' }} title="إضافة صورة">+</button>}
            />
            <button
              type="button"
              className="mini-btn"
              onClick={() => setCanvasClickMenu(null)}
              style={{ padding: '8px', fontSize: '18px', width: '40px', height: '40px', color: '#d32f2f', background: '#ffebee', border: 'none' }}
              title="إغلاق"
            >
              ✕
            </button>
          </div>
        )}

        <RenderFrame
                  key={`${draft.devicePreview.mode}-${previewReloadToken}`}
                  templateSlug={currentManifest.slug}
                  renderConfig={renderConfig}
                  manifest={currentManifest}
                  className="studio-frame-wrapper"
                  frameClassName="studio-frame"
                />
              </div>
            </div>
          </div>
        </div>

        <button type="button" className="studio-mobile-editor-toggle" onClick={() => setEditorOpen(true)}>
          فتح التعديلات
        </button>
      </section>

      <aside className={`studio-editor ${editorOpen ? 'open' : ''}`}>
        <div className="studio-editor__sheet" onClick={() => setEditorOpen(false)} />
        <div className="studio-editor__panel">
          <div className="studio-editor__header">
            <div>
              <h1>تعديل الدعوة</h1>
              <p>{currentManifest.nameAr}</p>
            </div>
            <div className="studio-editor__header-actions">
              <span className={`studio-save-indicator ${saveState}`}>{saveState === 'saved' ? 'تم الحفظ' : saveState === 'saving' ? 'جارٍ الحفظ' : saveState === 'error' ? 'فشل الحفظ' : 'توجد تعديلات غير محفوظة'}</span>
              <button type="button" className="studio-editor__close" onClick={() => setEditorOpen(false)}>×</button>
            </div>
          </div>

          <div className="studio-editor__summary">
            <div>
              <span>الجلسة</span>
              <strong>{session.name}</strong>
            </div>
            <div>
              <span>القالب</span>
              <strong>{currentManifest.nameAr}</strong>
            </div>
            <div>
              <span>المعاينة</span>
              <strong>{currentDeviceLabel}</strong>
            </div>
          </div>

          {notice ? <div className="admin-alert info">{notice}</div> : null}

          <div className="studio-editor__sections">
            {activeSections.map((sectionKey) => renderAccordionSection(sectionKey))}
          </div>

          <div className="studio-editor__footer">
            <button type="button" className="mini-btn" onClick={() => setEditorOpen(false)}>إلغاء</button>
            <button type="button" className="mini-btn" onClick={() => void saveVariant()} disabled={busy}>حفظ كمسودة</button>
            <Link className="mini-btn" href={`/admin/studio/${session.id}/preview`} target="_blank">معاينة كاملة</Link>
            <button type="button" className="btn-primary studio-primary-action" onClick={() => void createInvitation()} disabled={busy}>
              إنشاء الدعوة
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
