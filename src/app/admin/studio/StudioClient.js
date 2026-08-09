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
  'custom-elements': { icon: '✚', label: 'العناصر الحرة', description: 'إضافة نصوص وصور متحركة فوق القالب' },
  layers: { icon: '🗂', label: 'الطبقات', description: 'إدارة العناصر الحرة وترتيبها والتحكم بها' },
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

function toFiniteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getCustomElementLabel(element, index) {
  if (element?.name) {
    return element.name;
  }

  const baseLabel = element?.type === 'text' ? 'نص حر' : element?.type === 'image' ? 'صورة حرة' : 'عنصر حر';
  return `${baseLabel} ${index + 1}`;
}

function normalizeCustomElements(elements) {
  return arrayValue(elements).map((element, index) => ({
    ...element,
    name: getCustomElementLabel(element, index),
    opacity: toFiniteNumber(element?.opacity, 1),
    rotation: toFiniteNumber(element?.rotation, 0),
    zIndex: toFiniteNumber(element?.zIndex, index + 1),
    cropX: toFiniteNumber(element?.cropX, 50),
    cropY: toFiniteNumber(element?.cropY, 50),
    hidden: Boolean(element?.hidden),
    locked: Boolean(element?.locked),
  }));
}

function cloneValue(value) {
  if (value == null) {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
}

function defaultFieldValueFromManifest(manifest, key, type) {
  const defaults = manifest?.defaultValues || {};
  if (Object.prototype.hasOwnProperty.call(defaults, key)) {
    return cloneValue(defaults[key]);
  }

  if (type === 'gallery' || type === 'schedule' || type === 'list') {
    return [];
  }

  if (type === 'boolean') {
    return false;
  }

  return '';
}

function buildDefaultCustomElement(type, seed = {}) {
  const base = {
    opacity: 1,
    rotation: 0,
    hidden: false,
    locked: false,
    cropX: 50,
    cropY: 50,
  };

  if (type === 'text') {
    return {
      ...base,
      fontSize: '24px',
      color: '#1f2937',
      fontFamily: '',
      ...seed,
    };
  }

  return {
    ...base,
    width: '150px',
    height: '150px',
    ...seed,
  };
}

function getElementStyleClipboardPayload(element) {
  if (!element) {
    return null;
  }

  const common = {
    opacity: toFiniteNumber(element.opacity, 1),
    rotation: toFiniteNumber(element.rotation, 0),
  };

  if (element.type === 'text') {
    return {
      type: 'text',
      styles: {
        ...common,
        fontSize: element.fontSize || '24px',
        color: element.color || '#1f2937',
        fontFamily: element.fontFamily || '',
      },
    };
  }

  return {
    type: 'image',
    styles: {
      ...common,
      width: element.width || '150px',
      height: element.height || '150px',
      cropX: toFiniteNumber(element.cropX, 50),
      cropY: toFiniteNumber(element.cropY, 50),
    },
  };
}

function normalizeDraftState(input) {
  const safe = input || {};
  return {
    ...safe,
    contentConfig: safe.contentConfig || {},
    themeConfig: safe.themeConfig || {},
    sectionConfig: safe.sectionConfig || {},
    openingConfig: safe.openingConfig || {},
    textOverrides: safe.textOverrides || {},
    uiConfig: {
      ...(safe.uiConfig || {}),
      editorGuides: safe.uiConfig?.editorGuides !== false,
    },
    devicePreview: {
      mode: 'mobile',
      width: 390,
      height: 844,
      ...(safe.devicePreview || {}),
    },
    customElements: normalizeCustomElements(safe.customElements || []),
  };
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
  const initialDraft = useMemo(() => normalizeDraftState(session.draft), [session.draft]);
  const [draft, setDraft] = useState(initialDraft);
  const [openSection, setOpenSection] = useState('basic');
  const [saveState, setSaveState] = useState('saved');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [previewReloadToken, setPreviewReloadToken] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [canvasClickMenu, setCanvasClickMenu] = useState(null);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [styleClipboard, setStyleClipboard] = useState(null);
  const [historyMeta, setHistoryMeta] = useState({ canUndo: false, canRedo: false, pastCount: 0, futureCount: 0 });
  const autosaveRef = useRef(null);
  const lastSavedRef = useRef(JSON.stringify(initialDraft));
  const historyRef = useRef({ current: null, past: [], future: [] });
  const suppressHistoryRef = useRef(false);

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

  const normalizedCustomElements = useMemo(
    () => normalizeCustomElements(draft.customElements || []),
    [draft.customElements],
  );
  const orderedLayerElements = useMemo(
    () => [...normalizedCustomElements].sort((left, right) => (left.zIndex || 0) - (right.zIndex || 0)),
    [normalizedCustomElements],
  );
  const layerElementsForPanel = useMemo(
    () => [...orderedLayerElements].reverse(),
    [orderedLayerElements],
  );
  const selectedCustomElement = useMemo(
    () => orderedLayerElements.find((item) => item.id === selectedElementId) || null,
    [orderedLayerElements, selectedElementId],
  );

  function syncHistoryMeta() {
    setHistoryMeta({
      canUndo: historyRef.current.past.length > 0,
      canRedo: historyRef.current.future.length > 0,
      pastCount: historyRef.current.past.length,
      futureCount: historyRef.current.future.length,
    });
  }

  function applySnapshotFromHistory(serializedSnapshot, direction) {
    const currentSerialized = historyRef.current.current;
    if (!serializedSnapshot || !currentSerialized) {
      return;
    }

    suppressHistoryRef.current = true;
    if (direction === 'undo') {
      historyRef.current.future.unshift(currentSerialized);
      historyRef.current.future = historyRef.current.future.slice(0, 50);
      historyRef.current.past.pop();
    } else {
      historyRef.current.past.push(currentSerialized);
      historyRef.current.past = historyRef.current.past.slice(-50);
      historyRef.current.future.shift();
    }
    historyRef.current.current = serializedSnapshot;
    syncHistoryMeta();
    setDraft(normalizeDraftState(JSON.parse(serializedSnapshot)));
    setNotice(direction === 'undo' ? 'تم التراجع عن آخر تعديل.' : 'تمت إعادة التعديل.');
  }

  function handleUndo() {
    if (!historyRef.current.past.length) {
      return;
    }

    const previousSnapshot = historyRef.current.past[historyRef.current.past.length - 1];
    applySnapshotFromHistory(previousSnapshot, 'undo');
  }

  function handleRedo() {
    if (!historyRef.current.future.length) {
      return;
    }

    const nextSnapshot = historyRef.current.future[0];
    applySnapshotFromHistory(nextSnapshot, 'redo');
  }

  const activeSections = useMemo(() => {
    const fieldSections = Object.keys(groupedFields).filter((key) => SECTION_META[key]);
    return [...fieldSections, 'custom-elements', 'layers', 'opening', 'design', 'sections', 'advanced'];
  }, [groupedFields]);

  function updateCustomElements(updater) {
    setDraft((current) => ({
      ...current,
      customElements: normalizeCustomElements(updater(current.customElements || [])),
    }));
  }

  function patchCustomElement(id, updates) {
    updateCustomElements((elements) =>
      elements.map((element) =>
        element.id === id
          ? {
              ...element,
              ...(typeof updates === 'function' ? updates(element) : updates),
            }
          : element,
      ),
    );
  }

  function removeCustomElement(id) {
    updateCustomElements((elements) => elements.filter((element) => element.id !== id));
    setSelectedElementId((current) => (current === id ? null : current));
  }

  function moveCustomElement(id, direction) {
    updateCustomElements((elements) => {
      const next = [...elements];
      const currentIndex = next.findIndex((element) => element.id === id);
      if (currentIndex === -1) {
        return next;
      }

      const targetIndex = currentIndex + direction;
      if (targetIndex < 0 || targetIndex >= next.length) {
        return next;
      }

      const [item] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, item);
      return next.map((element, index) => ({ ...element, zIndex: index + 1 }));
    });
    setSelectedElementId(id);
    setOpenSection('layers');
  }

  function duplicateCustomElement(id) {
    const source = orderedLayerElements.find((element) => element.id === id);
    if (!source) {
      return;
    }

    const duplicateId = `custom-${Math.random().toString(36).slice(2, 11)}`;
    updateCustomElements((elements) => [
      ...elements,
      {
        ...source,
        id: duplicateId,
        name: `${source.name || getCustomElementLabel(source, elements.length)} (نسخة)`,
        x: Math.max(12, toFiniteNumber(source.x, 40) + 18),
        y: Math.max(12, toFiniteNumber(source.y, 40) + 18),
        hidden: false,
        locked: false,
      },
    ]);
    setSelectedElementId(duplicateId);
    setOpenSection('layers');
  }

  function addCustomElement(type, position, content = '') {
    const nextId = `custom-${Math.random().toString(36).slice(2, 11)}`;
    setDraft((current) => {
      const elements = current.customElements || [];
      return {
        ...current,
        customElements: normalizeCustomElements([
          ...elements,
          {
            id: nextId,
            type,
            name: getCustomElementLabel({ type }, elements.length),
            content,
            x: Math.max(12, Math.round(position?.x ?? 40)),
            y: Math.max(12, Math.round(position?.y ?? 40)),
            ...buildDefaultCustomElement(type, {
              zIndex: elements.length + 1,
            }),
          },
        ]),
        ui: {
          ...current.ui,
          addCustomElementMode: '',
        },
      };
    });
    setSelectedElementId(nextId);
    setOpenSection('layers');
  }

  useEffect(() => {
    const currentElements = draft.customElements || [];
    const normalized = normalizeCustomElements(currentElements);
    const needsNormalization = currentElements.some((element, index) => {
      const next = normalized[index];
      return (
        element?.name !== next.name
        || toFiniteNumber(element?.opacity, 1) !== next.opacity
        || toFiniteNumber(element?.rotation, 0) !== next.rotation
        || toFiniteNumber(element?.zIndex, index + 1) !== next.zIndex
        || toFiniteNumber(element?.cropX, 50) !== next.cropX
        || toFiniteNumber(element?.cropY, 50) !== next.cropY
        || Boolean(element?.hidden) !== next.hidden
        || Boolean(element?.locked) !== next.locked
      );
    });

    if (!needsNormalization) {
      return;
    }

    setDraft((current) => ({
      ...current,
      customElements: normalized,
    }));
  }, [draft.customElements]);

  useEffect(() => {
    if (!orderedLayerElements.length) {
      if (selectedElementId !== null) {
        setSelectedElementId(null);
      }
      return;
    }

    if (!selectedElementId || !orderedLayerElements.some((element) => element.id === selectedElementId)) {
      setSelectedElementId(orderedLayerElements[orderedLayerElements.length - 1].id);
    }
  }, [orderedLayerElements, selectedElementId]);

  useEffect(() => {
    const serialized = JSON.stringify(draft);
    if (historyRef.current.current == null) {
      historyRef.current.current = serialized;
      syncHistoryMeta();
      return;
    }

    if (suppressHistoryRef.current) {
      historyRef.current.current = serialized;
      suppressHistoryRef.current = false;
      syncHistoryMeta();
      return;
    }

    if (serialized === historyRef.current.current) {
      return;
    }

    historyRef.current.past.push(historyRef.current.current);
    historyRef.current.past = historyRef.current.past.slice(-50);
    historyRef.current.future = [];
    historyRef.current.current = serialized;
    syncHistoryMeta();
  }, [draft]);

  useEffect(() => {
    function handleHistoryShortcuts(event) {
      const target = event.target;
      if (target?.closest?.('input, textarea, select, [contenteditable="true"]')) {
        return;
      }

      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }

      const key = String(event.key || '').toLowerCase();
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
        return;
      }

      if (key === 'y' || (key === 'z' && event.shiftKey)) {
        event.preventDefault();
        handleRedo();
      }
    }

    window.addEventListener('keydown', handleHistoryShortcuts);
    return () => window.removeEventListener('keydown', handleHistoryShortcuts);
  }, []);

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
        patchCustomElement(event.data.payload.id, event.data.payload.updates);
      } else if (event.data?.type === 'FARHA_CUSTOM_ELEMENT_DELETE') {
        removeCustomElement(event.data.payload.id);
      } else if (event.data?.type === 'FARHA_CUSTOM_ELEMENT_SELECT') {
        setSelectedElementId(event.data.payload?.id || null);
        setOpenSection('layers');
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

  function setCustomElementNumber(id, key, value, fallback = 0) {
    const numeric = Number(value);
    patchCustomElement(id, {
      [key]: Number.isFinite(numeric) ? numeric : fallback,
    });
  }

  function setCustomElementDimension(id, key, value, fallback = '0px') {
    const normalizedValue = String(value || '').trim();
    if (!normalizedValue) {
      patchCustomElement(id, { [key]: fallback });
      return;
    }

    if (/^\d+(\.\d+)?$/.test(normalizedValue)) {
      patchCustomElement(id, { [key]: `${normalizedValue}px` });
      return;
    }

    patchCustomElement(id, { [key]: normalizedValue });
  }

  function resetSelectedCustomElement() {
    if (!selectedCustomElement) {
      return;
    }

    patchCustomElement(selectedCustomElement.id, (element) => ({
      ...buildDefaultCustomElement(element.type, {
        name: element.name,
        content: element.content,
        x: toFiniteNumber(element.x, 40),
        y: toFiniteNumber(element.y, 40),
        zIndex: toFiniteNumber(element.zIndex, 1),
      }),
    }));
    setNotice(`تمت إعادة ضبط العنصر: ${selectedCustomElement.name}`);
  }

  function copySelectedElementStyles() {
    if (!selectedCustomElement) {
      return;
    }

    const payload = getElementStyleClipboardPayload(selectedCustomElement);
    setStyleClipboard(payload);
    setNotice(`تم نسخ تنسيق العنصر: ${selectedCustomElement.name}`);
  }

  function pasteStylesToSelectedElement() {
    if (!selectedCustomElement || !styleClipboard) {
      return;
    }

    if (styleClipboard.type !== selectedCustomElement.type) {
      patchCustomElement(selectedCustomElement.id, {
        opacity: styleClipboard.styles.opacity,
        rotation: styleClipboard.styles.rotation,
      });
      setNotice('تم لصق التنسيق المشترك فقط لأن نوع العنصر مختلف.');
      return;
    }

    patchCustomElement(selectedCustomElement.id, styleClipboard.styles);
    setNotice(`تم لصق التنسيق على: ${selectedCustomElement.name}`);
  }

  function canResetSection(sectionKey) {
    return !['advanced'].includes(sectionKey);
  }

  function resetSection(sectionKey) {
    if (sectionKey === 'design') {
      setDraft((current) => ({
        ...current,
        themeConfig: cloneValue(currentManifest.defaultValues?.theme || {}),
      }));
      setNotice('تمت إعادة ضبط إعدادات التصميم.');
      return;
    }

    if (sectionKey === 'sections') {
      setDraft((current) => ({
        ...current,
        sectionConfig: cloneValue(currentManifest.defaultValues?.sections || {}),
      }));
      setNotice('تمت إعادة ضبط إعدادات الأقسام.');
      return;
    }

    if (sectionKey === 'opening') {
      const preferredOpening =
        availableOpenings.find(
          (opening) =>
            opening.slug === 'native-template'
            && currentManifest.openingCompatibility?.includes(opening.slug),
        )
        || availableOpenings.find((opening) => currentManifest.openingCompatibility?.includes(opening.slug))
        || availableOpenings[0]
        || currentOpening;

      setDraft((current) => ({
        ...current,
        openingSlug: preferredOpening?.slug || 'native-template',
        openingConfig: {
          allowSkip: true,
          ...(preferredOpening?.defaultConfig || {}),
        },
      }));
      setPreviewReloadToken((value) => value + 1);
      setNotice('تمت إعادة ضبط الافتتاحية.');
      return;
    }

    if (sectionKey === 'custom-elements') {
      setDraft((current) => ({
        ...current,
        customElements: [],
      }));
      setSelectedElementId(null);
      setNotice('تم حذف جميع العناصر الحرة من هذه الجلسة.');
      return;
    }

    if (sectionKey === 'layers') {
      if (selectedCustomElement) {
        resetSelectedCustomElement();
      }
      return;
    }

    const sectionFields = groupedFields[sectionKey] || [];
    if (!sectionFields.length && sectionKey !== 'media') {
      return;
    }

    setDraft((current) => {
      const nextContentConfig = { ...current.contentConfig };
      const fieldsToReset = [...sectionFields];

      if (sectionKey === 'media') {
        QUICK_MEDIA_KEYS.forEach((key) => {
          if (!fieldsToReset.some((field) => field.key === key)) {
            fieldsToReset.push({ key, type: key === 'musicUrl' ? 'audio' : 'image' });
          }
        });
      }

      fieldsToReset.forEach((field) => {
        nextContentConfig[field.key] = defaultFieldValueFromManifest(currentManifest, field.key, field.type);
        if (isTranslatableField(field)) {
          const englishKey = getEnglishKey(field.key);
          nextContentConfig[englishKey] = defaultFieldValueFromManifest(currentManifest, englishKey, field.type);
        }
      });

      return {
        ...current,
        contentConfig: nextContentConfig,
      };
    });
    setNotice(`تمت إعادة ضبط قسم: ${SECTION_META[sectionKey]?.label || sectionKey}`);
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
            {canResetSection(sectionKey) ? (
              <div className="studio-section-actions">
                <button
                  type="button"
                  className="mini-btn"
                  onClick={() => resetSection(sectionKey)}
                  disabled={sectionKey === 'layers' && !selectedCustomElement}
                >
                  {sectionKey === 'layers' ? 'Reset Element' : 'Reset Section'}
                </button>
              </div>
            ) : null}
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
                <div className="studio-inline-actions">
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
                  <p className="studio-help-text studio-help-text--success">
                    ✅ وضع الإضافة مفعل. اضغط في أي مكان على المحاكي لتثبيت العنصر!
                  </p>
                ) : (
                  <p className="studio-help-text">
                    💡 اضغط على مكان فارغ في المحاكي لإضافة نص أو صورة مباشرة، ثم اختر العنصر من لوحة الطبقات لتعديله بدقة.
                  </p>
                )}
                <div className="studio-element-summary-grid">
                  <div className="studio-element-summary-card">
                    <span>العناصر الحرة</span>
                    <strong>{orderedLayerElements.length}</strong>
                  </div>
                  <div className="studio-element-summary-card">
                    <span>العنصر المحدد</span>
                    <strong>{selectedCustomElement ? selectedCustomElement.name : 'لا يوجد'}</strong>
                  </div>
                </div>
                <div className="studio-selection-summary">
                  {selectedCustomElement ? (
                    <>
                      <div className="studio-selection-summary__meta">
                        <strong>{selectedCustomElement.name}</strong>
                        <small>
                          {selectedCustomElement.type === 'text' ? 'نص حر' : 'صورة حرة'}
                          {' · '}
                          X:{Math.round(toFiniteNumber(selectedCustomElement.x, 0))}
                          {' / '}
                          Y:{Math.round(toFiniteNumber(selectedCustomElement.y, 0))}
                        </small>
                      </div>
                      <button type="button" className="mini-btn" onClick={() => setOpenSection('layers')}>
                        إدارة الطبقات
                      </button>
                    </>
                  ) : (
                    <p className="studio-layer-empty">اختر عنصرًا من المحاكي أو أضف عنصرًا جديدًا ليظهر هنا.</p>
                  )}
                </div>
              </div>
            ) : null}

            {sectionKey === 'layers' ? (
              <div className="studio-stack">
                <div className="studio-layers-toolbar">
                  <span className="studio-layer-count">عدد الطبقات: {orderedLayerElements.length}</span>
                  {selectedCustomElement ? (
                    <div className="studio-inline-actions">
                      <button type="button" className="mini-btn" onClick={() => duplicateCustomElement(selectedCustomElement.id)}>
                        نسخ العنصر
                      </button>
                      <button type="button" className="mini-btn danger" onClick={() => removeCustomElement(selectedCustomElement.id)}>
                        حذف
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="studio-layers-list">
                  {layerElementsForPanel.map((element) => {
                    const currentIndex = orderedLayerElements.findIndex((item) => item.id === element.id);
                    const isSelected = selectedCustomElement?.id === element.id;
                    const canRaise = currentIndex < orderedLayerElements.length - 1;
                    const canLower = currentIndex > 0;

                    return (
                      <div key={element.id} className={`studio-layer-row ${isSelected ? 'active' : ''}`}>
                        <button
                          type="button"
                          className={`studio-layer-row__select ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedElementId(element.id);
                            setOpenSection('layers');
                          }}
                        >
                          <span className="studio-layer-row__type">{element.type === 'text' ? 'T' : 'IMG'}</span>
                          <span className="studio-layer-row__meta">
                            <strong>{element.name}</strong>
                            <small>
                              طبقة {element.zIndex}
                              {element.hidden ? ' · مخفية' : ''}
                              {element.locked ? ' · مقفلة' : ''}
                            </small>
                          </span>
                        </button>

                        <div className="studio-layer-row__actions">
                          <button type="button" className="mini-btn" disabled={!canRaise} onClick={() => moveCustomElement(element.id, 1)}>
                            رفع
                          </button>
                          <button type="button" className="mini-btn" disabled={!canLower} onClick={() => moveCustomElement(element.id, -1)}>
                            خفض
                          </button>
                          <button
                            type="button"
                            className={`mini-btn ${element.hidden ? 'active' : ''}`}
                            onClick={() => patchCustomElement(element.id, { hidden: !element.hidden })}
                          >
                            {element.hidden ? 'إظهار' : 'إخفاء'}
                          </button>
                          <button
                            type="button"
                            className={`mini-btn ${element.locked ? 'active' : ''}`}
                            onClick={() => patchCustomElement(element.id, { locked: !element.locked })}
                          >
                            {element.locked ? 'فتح' : 'قفل'}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {!layerElementsForPanel.length ? (
                    <p className="studio-layer-empty">لا توجد طبقات حرة بعد. أضف نصًا أو صورة من قسم العناصر الحرة.</p>
                  ) : null}
                </div>

                {selectedCustomElement ? (
                  <div className="studio-layer-inspector">
                    <div className="studio-layer-inspector__head">
                      <div>
                        <strong>{selectedCustomElement.name}</strong>
                        <small>
                          {selectedCustomElement.type === 'text' ? 'نص حر قابل للتحريك' : 'صورة حرة قابلة للتحريك'}
                        </small>
                      </div>
                      <div className="studio-inline-actions">
                        <button type="button" className="mini-btn" onClick={copySelectedElementStyles}>
                          نسخ التنسيق
                        </button>
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={pasteStylesToSelectedElement}
                          disabled={!styleClipboard}
                        >
                          لصق التنسيق
                        </button>
                        <button type="button" className="mini-btn" onClick={resetSelectedCustomElement}>
                          Reset Element
                        </button>
                        <button type="button" className="mini-btn" onClick={() => duplicateCustomElement(selectedCustomElement.id)}>
                          نسخ
                        </button>
                        <button type="button" className="mini-btn danger" onClick={() => removeCustomElement(selectedCustomElement.id)}>
                          حذف
                        </button>
                      </div>
                    </div>

                    <div className="studio-form-grid">
                      <label className="studio-field">
                        <span>اسم الطبقة</span>
                        <input
                          type="text"
                          value={selectedCustomElement.name || ''}
                          onChange={(event) => patchCustomElement(selectedCustomElement.id, { name: event.target.value })}
                        />
                      </label>
                      <label className="studio-field">
                        <span>النوع</span>
                        <input
                          type="text"
                          value={selectedCustomElement.type === 'text' ? 'نص حر' : 'صورة حرة'}
                          readOnly
                        />
                      </label>
                      <label className="studio-field">
                        <span>الموضع الأفقي X</span>
                        <input
                          type="number"
                          value={Math.round(toFiniteNumber(selectedCustomElement.x, 0))}
                          onChange={(event) => setCustomElementNumber(selectedCustomElement.id, 'x', event.target.value)}
                        />
                      </label>
                      <label className="studio-field">
                        <span>الموضع الرأسي Y</span>
                        <input
                          type="number"
                          value={Math.round(toFiniteNumber(selectedCustomElement.y, 0))}
                          onChange={(event) => setCustomElementNumber(selectedCustomElement.id, 'y', event.target.value)}
                        />
                      </label>
                      <label className="studio-field">
                        <span>الشفافية %</span>
                        <input
                          type="number"
                          min="5"
                          max="100"
                          value={Math.round(toFiniteNumber(selectedCustomElement.opacity, 1) * 100)}
                          onChange={(event) =>
                            patchCustomElement(selectedCustomElement.id, {
                              opacity: Math.min(1, Math.max(0.05, toFiniteNumber(event.target.value, 100) / 100)),
                            })
                          }
                        />
                      </label>
                      <label className="studio-field">
                        <span>الدوران</span>
                        <input
                          type="number"
                          min="-180"
                          max="180"
                          value={Math.round(toFiniteNumber(selectedCustomElement.rotation, 0))}
                          onChange={(event) => setCustomElementNumber(selectedCustomElement.id, 'rotation', event.target.value)}
                        />
                      </label>
                      <div className="studio-field studio-field--switch">
                        <span>إظهار الطبقة</span>
                        <label className="studio-switch">
                          <input
                            type="checkbox"
                            checked={!selectedCustomElement.hidden}
                            onChange={(event) => patchCustomElement(selectedCustomElement.id, { hidden: !event.target.checked })}
                          />
                          <span className="studio-switch__track" />
                        </label>
                      </div>
                      <div className="studio-field studio-field--switch">
                        <span>السماح بالحركة</span>
                        <label className="studio-switch">
                          <input
                            type="checkbox"
                            checked={!selectedCustomElement.locked}
                            onChange={(event) => patchCustomElement(selectedCustomElement.id, { locked: !event.target.checked })}
                          />
                          <span className="studio-switch__track" />
                        </label>
                      </div>

                      {selectedCustomElement.type === 'text' ? (
                        <>
                          <label className="studio-field studio-field--full">
                            <span>محتوى النص</span>
                            <textarea
                              rows={4}
                              value={selectedCustomElement.content || ''}
                              onChange={(event) => patchCustomElement(selectedCustomElement.id, { content: event.target.value })}
                            />
                          </label>
                          <label className="studio-field">
                            <span>حجم الخط</span>
                            <input
                              type="text"
                              value={selectedCustomElement.fontSize || '24px'}
                              onChange={(event) => setCustomElementDimension(selectedCustomElement.id, 'fontSize', event.target.value, '24px')}
                            />
                          </label>
                          <label className="studio-field studio-field--compact">
                            <span>لون النص</span>
                            <input
                              type="color"
                              value={selectedCustomElement.color || '#1f2937'}
                              onChange={(event) => patchCustomElement(selectedCustomElement.id, { color: event.target.value })}
                            />
                          </label>
                          <label className="studio-field studio-field--full">
                            <span>Font Family</span>
                            <input
                              type="text"
                              dir="ltr"
                              value={selectedCustomElement.fontFamily || ''}
                              placeholder="مثال: Tajawal, serif"
                              onChange={(event) => patchCustomElement(selectedCustomElement.id, { fontFamily: event.target.value })}
                            />
                          </label>
                        </>
                      ) : (
                        <>
                          <label className="studio-field studio-field--full">
                            <span>الصورة</span>
                            <MediaPicker
                              label="اختيار صورة"
                              value={selectedCustomElement.content}
                              accept="image"
                              folder="studio-free-elements"
                              onChange={(url) => {
                                if (url) {
                                  patchCustomElement(selectedCustomElement.id, { content: url });
                                }
                              }}
                            />
                          </label>
                          <label className="studio-field">
                            <span>العرض</span>
                            <input
                              type="text"
                              value={selectedCustomElement.width || '150px'}
                              onChange={(event) => setCustomElementDimension(selectedCustomElement.id, 'width', event.target.value, '150px')}
                            />
                          </label>
                          <label className="studio-field">
                            <span>الارتفاع</span>
                            <input
                              type="text"
                              value={selectedCustomElement.height || '150px'}
                              onChange={(event) => setCustomElementDimension(selectedCustomElement.id, 'height', event.target.value, '150px')}
                            />
                          </label>
                          <label className="studio-field">
                            <span>قص أفقي</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={Math.round(toFiniteNumber(selectedCustomElement.cropX, 50))}
                              onChange={(event) => setCustomElementNumber(selectedCustomElement.id, 'cropX', event.target.value, 50)}
                            />
                          </label>
                          <label className="studio-field">
                            <span>قص رأسي</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={Math.round(toFiniteNumber(selectedCustomElement.cropY, 50))}
                              onChange={(event) => setCustomElementNumber(selectedCustomElement.id, 'cropY', event.target.value, 50)}
                            />
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                ) : null}
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
            <label className="studio-boolean-field studio-toolbar-toggle">
              <input
                type="checkbox"
                checked={draft.uiConfig?.editorGuides !== false}
                onChange={(event) => setUiValue('editorGuides', event.target.checked)}
              />
              <span>إظهار الأدلة</span>
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
            <div className="studio-toolbar-group">
              <button
                type="button"
                className="mini-btn"
                onClick={handleUndo}
                disabled={!historyMeta.canUndo}
                title="Ctrl/Cmd + Z"
              >
                تراجع
              </button>
              <button
                type="button"
                className="mini-btn"
                onClick={handleRedo}
                disabled={!historyMeta.canRedo}
                title="Ctrl/Cmd + Y"
              >
                إعادة
              </button>
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
              <RenderFrame
                  key={`${draft.devicePreview.mode}-${previewReloadToken}`}
                  templateSlug={currentManifest.slug}
                  renderConfig={renderConfig}
                  manifest={currentManifest}
                  className="studio-frame-wrapper"
                  frameClassName="studio-frame"
                />
              {draft.uiConfig?.editorGuides !== false ? (
                <div className="studio-guides" aria-hidden="true">
                  <span className="studio-guides__safe" />
                  <span className="studio-guides__center-x" />
                  <span className="studio-guides__center-y" />
                </div>
              ) : null}
              {canvasClickMenu ? (
                <div
                  className="studio-canvas-menu"
                  style={{
                    top: `${canvasClickMenu.y}px`,
                    left: `${canvasClickMenu.x}px`,
                  }}
                >
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={() => {
                      addCustomElement('text', { x: canvasClickMenu.x, y: canvasClickMenu.y }, 'نص جديد');
                      setCanvasClickMenu(null);
                    }}
                    title="إضافة نص"
                  >
                    T
                  </button>
                  <MediaPicker
                    label="+"
                    value=""
                    accept="image"
                    folder="studio-free-elements"
                    onChange={(url) => {
                      if (url) {
                        addCustomElement('image', { x: canvasClickMenu.x, y: canvasClickMenu.y }, url);
                        setCanvasClickMenu(null);
                      }
                    }}
                    trigger={
                      <button
                        type="button"
                        className="mini-btn studio-canvas-menu__image-trigger"
                        title="إضافة صورة"
                      >
                        +
                      </button>
                    }
                  />
                  <button
                    type="button"
                    className="mini-btn studio-canvas-menu__close"
                    onClick={() => setCanvasClickMenu(null)}
                    title="إغلاق"
                  >
                    ✕
                  </button>
                </div>
              ) : null}
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
