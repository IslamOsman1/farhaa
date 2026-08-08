'use client';

import { startTransition, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RenderFrame from '@/components/invitation/RenderFrame';
import MediaPicker from '@/components/admin/MediaPicker';
import { buildInvitationRenderConfig, getOpeningBySlug } from '@/lib/template-system';

const DEVICE_PRESETS = {
  mobile: { label: 'Ù‡Ø§ØªÙ', width: 390, height: 844 },
  tablet: { label: 'ØªØ§Ø¨Ù„Øª', width: 768, height: 1024 },
  desktop: { label: 'Ø³Ø·Ø­ Ù…ÙƒØªØ¨', width: 1280, height: 860 },
};

const SECTION_META = {
  basic: { icon: '👤', label: 'الأساسيات', description: 'أسماء العروسين وبيانات المناسبة' },
  wording: { icon: '✉️', label: 'النصوص', description: 'رسائل الدعوة والعناوين' },
  families: { icon: '👪', label: 'العائلات', description: 'أسماء وتواقيع العائلتين' },
  details: { icon: '📍', label: 'المكان والزمان', description: 'التاريخ والقاعة ورابط الخريطة' },
  schedule: { icon: '🗓️', label: 'البرنامج', description: 'فقرات اليوم وجدوله' },
  media: { icon: '🖼️', label: 'الوسائط', description: 'صور وفيديوهات وموسيقى الدعوة' },
  contact: { icon: '📞', label: 'التواصل', description: 'اسم ورقم جهة التنسيق والاستفسار' },
  closing: { icon: '✒️', label: 'الخاتمة', description: 'خاتمة الدعوة والهاشتاغ والتوقيع' },
  'custom-elements': { icon: '✨', label: 'عناصر حرة', description: 'إضافة وتحريك نصوص وصور بحرية' },
  opening: { icon: '✨', label: 'الافتتاحية', description: 'المشهد الأول وطريقة الدخول' },
  design: { icon: '🎨', label: 'التصميم', description: 'الألوان والخطوط والمظهر العام' },
  sections: { icon: '☰', label: 'الأقسام', description: 'إظهار وإخفاء وترتيب أجزاء الدعوة' },
  advanced: { icon: '⚙️', label: 'إعدادات متقدمة', description: 'القالب الأساسي وخيارات العمل' },
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
            <span>Ø§Ù„Ø¹Ø±Ø¨ÙŠ</span>
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
              label="Ø§Ø®ØªÙŠØ§Ø± ØµÙˆØ±Ø©"
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
              Ø­Ø°Ù
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
          Ø¥Ø¶Ø§ÙØ© ØµÙˆØ±Ø©
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
              placeholder="Ø§Ù„ÙˆÙ‚Øª"
              onChange={(event) => onScheduleChange(field.key, index, 'time', event.target.value)}
            />
            <input
              type="text"
              value={item.title || ''}
              placeholder="Ø§Ù„ÙÙ‚Ø±Ø©"
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
              Ø­Ø°Ù
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
          Ø¥Ø¶Ø§ÙØ© ÙÙ‚Ø±Ø©
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
              placeholder="Ø¹Ù†ØµØ±"
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
              Ø­Ø°Ù
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
          Ø¥Ø¶Ø§ÙØ© Ø¹Ù†ØµØ±
        </button>
      </div>
    );
  }

  if (field.type === 'image' || field.type === 'audio' || field.type === 'video') {
    return (
      <MediaPicker
        label={`Ø§Ø®ØªÙŠØ§Ø± ${field.type === 'image' ? 'ØµÙˆØ±Ø©' : field.type === 'audio' ? 'ØµÙˆØª' : 'ÙÙŠØ¯ÙŠÙˆ'}`}
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
        <span>{value ? 'Ù…ÙØ¹Ù„' : 'ØºÙŠØ± Ù…ÙØ¹Ù„'}</span>
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
          <span>Ø§Ù„Ø¹Ø±Ø¨ÙŠ</span>
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
        {value ? <span className="studio-media-status">Ù…Ø±Ø¨ÙˆØ·</span> : <span className="studio-media-status empty">ÙØ§Ø±Øº</span>}
      </div>
      <MediaPicker
        label="Ø§Ø®ØªÙŠØ§Ø±"
        value={value || ''}
        accept={type}
        folder={`studio-${type}`}
        onChange={onChange}
      />
      <div className="studio-media-card__actions">
        <button type="button" className="mini-btn" onClick={onClear}>Ø­Ø°Ù</button>
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
        throw new Error(payload.message || 'ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ø¬Ù„Ø³Ø©.');
      }

      lastSavedRef.current = JSON.stringify(nextDraft);
      setSaveState('saved');
    } catch (error) {
      setSaveState('error');
      setNotice(error.message || 'ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ø¬Ù„Ø³Ø©.');
    }
  });

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

  useEffect(() => {
    function handleMessage(event) {
      if (event.data?.type === 'FARHA_EDIT_FIELD') {
        const fieldKey = event.data.fieldKey;
        
        let targetSection = null;
        Object.entries(groupedFields).forEach(([section, fields]) => {
          if (fields.some(f => f.key === fieldKey)) {
            targetSection = section;
          }
        });

        if (QUICK_MEDIA_KEYS.has(fieldKey)) {
          targetSection = 'media';
        }

        if (targetSection) {
          setOpenSection(targetSection);
          
          setTimeout(() => {
            const elId = QUICK_MEDIA_KEYS.has(fieldKey) 
              ? `studio-media-${fieldKey.replace('.', '-')}` 
              : `studio-field-${fieldKey}`;
              
            const el = document.getElementById(elId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              
              // Add a highlight effect
              el.style.transition = 'box-shadow 0.3s';
              el.style.boxShadow = '0 0 0 3px rgba(255, 77, 125, 0.5)';
              setTimeout(() => {
                el.style.boxShadow = 'none';
              }, 1500);

              const input = el.querySelector('input, textarea, button');
              if (input) {
                if (targetSection === 'media') {
                  const mediaBtn = Array.from(el.querySelectorAll('button')).find(b => b.textContent.includes('Ø§Ø®ØªÙŠØ§Ø±'));
                  if (mediaBtn) {
                    mediaBtn.click();
                  } else {
                    input.focus();
                  }
                } else {
                  input.focus();
                }
              }
            }
          }, 300);
        }
      } else if (event.data?.type === 'FARHA_CANVAS_CLICK') {
        const { x, y } = event.data.payload;
        
        setDraft(current => {
          const mode = current.ui?.addCustomElementMode;
          if (!mode) return current;

          const newEl = {
            id: 'custom-' + Math.random().toString(36).substr(2, 9),
            type: mode,
            content: mode === 'text' ? 'Ù†Øµ Ø¬Ø¯ÙŠØ¯' : '/images/placeholder.jpg',
            x: x,
            y: y,
            fontSize: mode === 'text' ? '24px' : undefined,
            color: mode === 'text' ? '#000000' : undefined,
            width: mode === 'image' ? '150px' : undefined,
            height: mode === 'image' ? 'auto' : undefined,
          };

          return {
            ...current,
            customElements: [...(current.customElements || []), newEl],
            ui: { ...current.ui, addCustomElementMode: null }
          };
        });

        setOpenSection('custom-elements');

      } else if (event.data?.type === 'FARHA_CUSTOM_ELEMENT_UPDATE') {
        const { id, x, y } = event.data.payload;
        setDraft(current => {
          const elements = current.customElements || [];
          return {
            ...current,
            customElements: elements.map(el => el.id === id ? { ...el, x, y } : el)
          };
        });
      } else if (event.data?.type === 'FARHA_CUSTOM_ELEMENT_SELECT') {
        setOpenSection('custom-elements');
        setTimeout(() => {
          const el = document.getElementById(`custom-el-${event.data.payload.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.style.transition = 'box-shadow 0.3s';
            el.style.boxShadow = '0 0 0 3px rgba(255, 77, 125, 0.5)';
            setTimeout(() => {
              el.style.boxShadow = 'none';
            }, 1500);
          }
        }, 300);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [groupedFields]);

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
    const name = window.prompt('Ø§Ø³Ù… Ø§Ù„Ù‚Ø§Ù„Ø¨ Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠ Ø§Ù„Ø¬Ø¯ÙŠØ¯', `${currentManifest.nameAr} - Ù†Ø³Ø®Ø© Ø¯Ø§Ø®Ù„ÙŠØ©`);
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
        throw new Error(payload.message || 'ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ù‚Ø§Ù„Ø¨ Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠ.');
      }

      setNotice(`ØªÙ… Ø­ÙØ¸ Ø§Ù„Ù‚Ø§Ù„Ø¨ Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠ: ${payload.data.variant.name}`);
      router.refresh();
    } catch (error) {
      setNotice(error.message || 'ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ù‚Ø§Ù„Ø¨ Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠ.');
    } finally {
      setBusy(false);
    }
  }

  async function createInvitation() {
    const slug = window.prompt('Slug Ø§Ù„Ø¯Ø¹ÙˆØ© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©', `${draft.templateSlug}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
    if (!slug) return;
    const clientName = window.prompt('Ø§Ø³Ù… Ø§Ù„Ø¹Ù…ÙŠÙ„');
    if (!clientName) return;
    const title = window.prompt('Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø¯Ø¹ÙˆØ©', `${draft.contentConfig.groomName || ''} & ${draft.contentConfig.brideName || ''}`.trim());

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
        throw new Error(payload.message || 'ØªØ¹Ø°Ø± Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¯Ø¹ÙˆØ©.');
      }

      setNotice(`ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¯Ø¹ÙˆØ©: ${payload.data.invitation.slug}`);
      startTransition(() => {
        router.push(payload.data.editUrl);
      });
    } catch (error) {
      setNotice(error.message || 'ØªØ¹Ø°Ø± Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¯Ø¹ÙˆØ©.');
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
          <span className="studio-accordion__arrow">{isOpen ? 'âˆ’' : '+'}</span>
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

                        {sectionKey === 'custom-elements' ? (
              <div className="studio-stack">
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button type="button" className={`mini-btn ${draft.ui?.addCustomElementMode === 'text' ? 'active' : ''}`} style={{ background: draft.ui?.addCustomElementMode === 'text' ? '#ff4d7d' : '', color: draft.ui?.addCustomElementMode === 'text' ? '#fff' : '' }} onClick={() => setDraft(curr => ({...curr, ui: {...curr.ui, addCustomElementMode: curr.ui?.addCustomElementMode === 'text' ? null : 'text'}}))}>إضافة نص</button>
                  <button type="button" className={`mini-btn ${draft.ui?.addCustomElementMode === 'image' ? 'active' : ''}`} style={{ background: draft.ui?.addCustomElementMode === 'image' ? '#ff4d7d' : '', color: draft.ui?.addCustomElementMode === 'image' ? '#fff' : '' }} onClick={() => setDraft(curr => ({...curr, ui: {...curr.ui, addCustomElementMode: curr.ui?.addCustomElementMode === 'image' ? null : 'image'}}))}>إضافة صورة</button>
                </div>
                {draft.ui?.addCustomElementMode ? <div className="studio-opening-hint" style={{ color: '#ff4d7d' }}>اضغط على أي مكان فارغ في المحاكي لإضافة العنصر.</div> : null}
                
                {(draft.customElements || []).map((el, i) => (
                  <div key={el.id} id={`custom-el-${el.id}`} style={{ padding: '12px', border: '1px solid #eaeaea', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong>{el.type === 'text' ? 'نص حر' : 'صورة حرة'}</strong>
                      <button type="button" style={{ background: 'none', border: 'none', color: '#ff4d7d', cursor: 'pointer' }} onClick={() => setDraft(curr => ({...curr, customElements: curr.customElements.filter(e => e.id !== el.id)}))}>حذف</button>
                    </div>
                    {el.type === 'text' ? (
                      <textarea className="studio-input" value={el.content} onChange={e => {
                        const val = e.target.value;
                        setDraft(curr => ({...curr, customElements: curr.customElements.map(e => e.id === el.id ? {...e, content: val} : e)}));
                      }} style={{ width: '100%', minHeight: '60px', marginBottom: '8px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    ) : (
                      <input type="text" className="studio-input" placeholder="رابط الصورة" value={el.content} onChange={e => {
                        const val = e.target.value;
                        setDraft(curr => ({...curr, customElements: curr.customElements.map(e => e.id === el.id ? {...e, content: val} : e)}));
                      }} style={{ width: '100%', marginBottom: '8px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {el.type === 'text' ? (
                        <>
                          <label className="studio-field" style={{ flex: 1 }}><span>حجم الخط</span><input type="text" className="studio-input" value={el.fontSize || ''} placeholder="24px" onChange={e => { const val = e.target.value; setDraft(curr => ({...curr, customElements: curr.customElements.map(e => e.id === el.id ? {...e, fontSize: val} : e)})); }} /></label>
                          <label className="studio-field" style={{ flex: 1 }}><span>لون الخط</span><input type="color" className="studio-input" value={el.color || '#000000'} onChange={e => { const val = e.target.value; setDraft(curr => ({...curr, customElements: curr.customElements.map(e => e.id === el.id ? {...e, color: val} : e)})); }} /></label>
                        </>
                      ) : (
                        <>
                          <label className="studio-field" style={{ flex: 1 }}><span>العرض</span><input type="text" className="studio-input" value={el.width || ''} placeholder="150px" onChange={e => { const val = e.target.value; setDraft(curr => ({...curr, customElements: curr.customElements.map(e => e.id === el.id ? {...e, width: val} : e)})); }} /></label>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {!(draft.customElements?.length) && <p style={{ fontSize: '12px', color: '#888' }}>لا توجد عناصر حرة مضافة حتى الآن.</p>}
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
                    <button type="button" className="mini-btn" onClick={() => setPreviewReloadToken((value) => value + 1)}>Ù…Ø¹Ø§ÙŠÙ†Ø©</button>
                    <button type="button" className="mini-btn" onClick={() => setPreviewReloadToken((value) => value + 1)}>Ø¥Ø¹Ø§Ø¯Ø© ØªØ´ØºÙŠÙ„</button>
                  </div>
                </div>
                <label className="studio-field">
                  <span>Ù†ÙˆØ¹ Ø§Ù„Ø§ÙØªØªØ§Ø­ÙŠØ©</span>
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
                  <span>Ø§Ù„Ø³Ù…Ø§Ø­ Ø¨Ø§Ù„ØªØ®Ø·ÙŠ</span>
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
                    <option value="yes">Ù†Ø¹Ù…</option>
                    <option value="no">Ù„Ø§</option>
                  </select>
                </label>
              </div>
            ) : null}

            {sectionKey === 'sections' ? (
              <div className="studio-stack">
                {(currentManifest.sections || []).map((section) => (
                  <div key={section.key} className="studio-section-row">
                    <span className="studio-section-row__drag">â‹®â‹®</span>
                    <div className="studio-section-row__copy">
                      <strong>{section.labelAr}</strong>
                      <small>{section.labelEn}</small>
                    </div>
                    <button type="button" className="mini-btn" onClick={() => handleOpenSection('sections')}>Ø§Ù†ØªÙ‚Ø§Ù„</button>
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
                  <span>Ø§Ù„Ù‚Ø§Ù„Ø¨ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ</span>
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
                  <div><strong>{inventory.summary.templates}</strong><span>Ù‚Ø§Ù„Ø¨</span></div>
                  <div><strong>{inventory.summary.images}</strong><span>ØµÙˆØ±Ø©</span></div>
                  <div><strong>{inventory.summary.videos}</strong><span>ÙÙŠØ¯ÙŠÙˆ</span></div>
                  <div><strong>{inventory.summary.audio}</strong><span>ØµÙˆØª</span></div>
                </div>
              </div>
            ) : null}

            {sectionKey === 'media' ? (
              <div className="studio-media-grid">
                <div id="studio-media-images-hero">
                  <MediaSummaryCard
                    label="ØµÙˆØ±Ø© Ø§Ù„Ø¹Ø±ÙˆØ³ÙŠÙ† Ø¯Ø§Ø®Ù„ Ø§Ù„Ù‚Ø§Ù„Ø¨"
                    type="image"
                    value={draft.contentConfig['images.hero']}
                    onChange={(value) => setContentValue('images.hero', value)}
                    onClear={() => setContentValue('images.hero', '')}
                  />
                </div>
                <div id="studio-media-images-background">
                  <MediaSummaryCard
                    label="Ø®Ù„ÙÙŠØ© Ø§Ù„Ù…Ø´Ù‡Ø¯"
                    type="image"
                    value={draft.contentConfig['images.background']}
                    onChange={(value) => setContentValue('images.background', value)}
                    onClear={() => setContentValue('images.background', '')}
                  />
                </div>
                <div id="studio-media-venueImage">
                  <MediaSummaryCard
                    label="ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù"
                    type="image"
                    value={draft.contentConfig.venueImage}
                    onChange={(value) => setContentValue('venueImage', value)}
                    onClear={() => setContentValue('venueImage', '')}
                  />
                </div>
                <div id="studio-media-musicUrl">
                  <MediaSummaryCard
                    label="Ø§Ù„Ù…ÙˆØ³ÙŠÙ‚Ù‰"
                    type="audio"
                    value={draft.contentConfig.musicUrl}
                    onChange={(value) => setContentValue('musicUrl', value)}
                    onClear={() => setContentValue('musicUrl', '')}
                  />
                </div>
                <div id="studio-media-images-venue">
                  <MediaSummaryCard
                    label="ØµÙˆØ±Ø© Ø§Ù„Ù‚Ø§Ø¹Ø©"
                    type="image"
                    value={draft.contentConfig['images.venue']}
                    onChange={(value) => setContentValue('images.venue', value)}
                    onClear={() => setContentValue('images.venue', '')}
                  />
                </div>
              </div>
            ) : null}

            {visibleFields.length > 0 ? (
              <div className="studio-form-grid">
                {visibleFields.map((field) => (
                  <label
                    key={field.key}
                    id={`studio-field-${field.key}`}
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
              <span>Ø¯Ø¹ÙˆØ© Ø¨Ù„ØºØªÙŠÙ†</span>
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
              <button type="button" className="mini-btn" onClick={() => setPreviewReloadToken((value) => value + 1)}>ØªØ­Ø¯ÙŠØ«</button>
              <button type="button" className="mini-btn" onClick={() => setPreviewReloadToken((value) => value + 1)}>Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„Ø§ÙØªØªØ§Ø­ÙŠØ©</button>
              <button type="button" className="mini-btn" onClick={() => setPreviewReloadToken((value) => value + 1)}>ØµÙˆØª</button>
              <Link className="mini-btn" href={`/admin/studio/${session.id}/preview`} target="_blank">Ù…Ù„Ø¡ Ø§Ù„Ø´Ø§Ø´Ø©</Link>
            </div>
          </div>
        </div>

        <div className="studio-canvas__frame">
          <div className="studio-phone-stage studio-phone-stage--sticky">
            <div className={`studio-device studio-device--${draft.devicePreview.mode}`}>
              <div className="studio-phone-shell">
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
          ÙØªØ­ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª
        </button>
      </section>

      <aside className={`studio-editor ${editorOpen ? 'open' : ''}`}>
        <div className="studio-editor__sheet" onClick={() => setEditorOpen(false)} />
        <div className="studio-editor__panel">
          <div className="studio-editor__header">
            <div>
              <h1>ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø¯Ø¹ÙˆØ©</h1>
              <p>{currentManifest.nameAr}</p>
            </div>
            <div className="studio-editor__header-actions">
              <span className={`studio-save-indicator ${saveState}`}>{saveState === 'saved' ? 'ØªÙ… Ø§Ù„Ø­ÙØ¸' : saveState === 'saving' ? 'Ø¬Ø§Ø±Ù Ø§Ù„Ø­ÙØ¸' : saveState === 'error' ? 'ÙØ´Ù„ Ø§Ù„Ø­ÙØ¸' : 'ØªÙˆØ¬Ø¯ ØªØ¹Ø¯ÙŠÙ„Ø§Øª ØºÙŠØ± Ù…Ø­ÙÙˆØ¸Ø©'}</span>
              <button type="button" className="studio-editor__close" onClick={() => setEditorOpen(false)}>Ã—</button>
            </div>
          </div>

          <div className="studio-editor__summary">
            <div>
              <span>Ø§Ù„Ø¬Ù„Ø³Ø©</span>
              <strong>{session.name}</strong>
            </div>
            <div>
              <span>Ø§Ù„Ù‚Ø§Ù„Ø¨</span>
              <strong>{currentManifest.nameAr}</strong>
            </div>
            <div>
              <span>Ø§Ù„Ù…Ø¹Ø§ÙŠÙ†Ø©</span>
              <strong>{currentDeviceLabel}</strong>
            </div>
          </div>

          {notice ? <div className="admin-alert info">{notice}</div> : null}

          <div className="studio-editor__sections">
            {activeSections.map((sectionKey) => renderAccordionSection(sectionKey))}
          </div>

          <div className="studio-editor__footer">
            <button type="button" className="mini-btn" onClick={() => setEditorOpen(false)}>Ø¥Ù„ØºØ§Ø¡</button>
            <button type="button" className="mini-btn" onClick={() => void saveVariant()} disabled={busy}>Ø­ÙØ¸ ÙƒÙ…Ø³ÙˆØ¯Ø©</button>
            <Link className="mini-btn" href={`/admin/studio/${session.id}/preview`} target="_blank">Ù…Ø¹Ø§ÙŠÙ†Ø© ÙƒØ§Ù…Ù„Ø©</Link>
            <button type="button" className="btn-primary studio-primary-action" onClick={() => void createInvitation()} disabled={busy}>
              Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¯Ø¹ÙˆØ©
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

