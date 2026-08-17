'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MediaPicker from '@/components/admin/MediaPicker';
import StudioPreviewShell from '@/components/admin/studio/StudioPreviewShell';
import {
  BUILTIN_FONT_LIBRARY,
} from '@/lib/font-library';
import { parseStudioBridgeMessage, STUDIO_BRIDGE_EVENT } from '@/lib/studio-bridge';
import { buildInvitationRenderConfig, getOpeningBySlug } from '@/lib/template-system';

const DEVICE_PRESETS = {
  mobile: { label: 'هاتف', width: 390, height: 844 },
  tablet: { label: 'تابلت', width: 768, height: 1024 },
  desktop: { label: 'سطح مكتب', width: 1280, height: 860 },
};

const TEXT_SECTION_ORDER = [
  'basic',
  'opening',
  'wording',
  'families',
  'details',
  'schedule',
  'media',
  'contact',
  'closing',
  'sections',
];

const SECTION_LABELS = {
  basic: 'البيانات الأساسية',
  opening: 'الافتتاحية',
  wording: 'نصوص الدعوة',
  families: 'العائلات',
  details: 'التفاصيل',
  schedule: 'البرنامج',
  media: 'الوسائط',
  contact: 'التواصل',
  closing: 'الختام',
  sections: 'الأقسام الإضافية',
};

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function toFiniteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function generateId(prefix = 'item') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getEnglishKey(key) {
  return `${key}__en`;
}

function isTranslatableField(field) {
  return ['text', 'textarea', 'list', 'schedule'].includes(field.type);
}

function normalizeCustomElement(element, index) {
  const type = element?.type === 'image' ? 'image' : 'text';
  return {
    id: element?.id || generateId(type === 'image' ? 'image' : 'text'),
    type,
    content: String(element?.content || ''),
    contentEn: String(element?.contentEn || ''),
    name: String(element?.name || (type === 'image' ? `صورة حرة ${index + 1}` : `نص حر ${index + 1}`)),
    x: toFiniteNumber(element?.x, 40),
    y: toFiniteNumber(element?.y, 40),
    width: String(element?.width || (type === 'image' ? '180px' : '220px')),
    height: String(element?.height || (type === 'image' ? '180px' : 'auto')),
    fontSize: String(element?.fontSize || '28px'),
    fontFamily: String(element?.fontFamily || 'Tajawal'),
    color: String(element?.color || '#1f2937'),
    opacity: toFiniteNumber(element?.opacity, 1),
    rotation: toFiniteNumber(element?.rotation, 0),
    zIndex: toFiniteNumber(element?.zIndex, index + 10),
  };
}

function normalizeDraftState(sessionDraft, templateSlug) {
  const safe = sessionDraft || {};
  const deviceMode = safe.devicePreview?.mode || 'mobile';
  const preset = DEVICE_PRESETS[deviceMode] || DEVICE_PRESETS.mobile;

  return {
    templateSlug: safe.templateSlug || templateSlug,
    openingSlug: safe.openingSlug || 'native-template',
    contentConfig: safe.contentConfig || {},
    themeConfig: safe.themeConfig || {},
    sectionConfig: safe.sectionConfig || {},
    openingConfig: safe.openingConfig || {},
    textOverrides: safe.textOverrides || {},
    nativeElementOverrides: safe.nativeElementOverrides || {},
    uiConfig: {
      bilingualEnabled: false,
      defaultLocale: 'ar',
      textStyleOverrides: {},
      ...(safe.uiConfig || {}),
    },
    devicePreview: {
      mode: deviceMode,
      width: preset.width,
      height: preset.height,
      ...(safe.devicePreview || {}),
    },
    customElements: arrayValue(safe.customElements).map(normalizeCustomElement),
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
    uiConfig: {
      ...(draft.uiConfig || {}),
      deviceMode: draft.devicePreview?.mode || 'mobile',
      showPromoBar: false,
    },
    customElements: draft.customElements || [],
    nativeElementOverrides: draft.nativeElementOverrides || {},
    textOverrides: draft.textOverrides || {},
    opening: { slug: draft.openingSlug },
    template: { slug: draft.templateSlug },
  };
}

function getTemplateTextValue(draft, path) {
  if (Object.prototype.hasOwnProperty.call(draft.textOverrides || {}, path)) {
    return draft.textOverrides[path];
  }

  return draft.contentConfig?.[path] ?? '';
}

function getTextBindings(manifest) {
  const bindings = manifest?.runtimeBindings?.fieldBindings || {};
  return Object.entries(bindings).filter(([, binding]) => binding?.method === 'text' && binding?.selector);
}

function buildTemplateTextCatalog(manifest, draft) {
  return getTextBindings(manifest).map(([path, binding]) => ({
    path,
    selector: binding?.selector || path,
    label: manifest?.editableFields?.find((field) => field.key === path)?.labelAr || path,
    text: String(getTemplateTextValue(draft, path) || ''),
  }));
}

function FieldRenderer({ field, draft, onContentChange, onScheduleChange, onListChange }) {
  const value = draft.contentConfig[field.key];
  const bilingualEnabled = Boolean(draft.uiConfig?.bilingualEnabled);
  const englishKey = getEnglishKey(field.key);
  const englishValue = draft.contentConfig[englishKey];

  if (field.type === 'textarea') {
    if (bilingualEnabled && isTranslatableField(field)) {
      return (
        <div className="studio-dual">
          <textarea rows={4} placeholder="العربية" value={value || ''} onChange={(event) => onContentChange(field.key, event.target.value)} />
          <textarea rows={4} dir="ltr" placeholder="English" value={englishValue || ''} onChange={(event) => onContentChange(englishKey, event.target.value)} />
        </div>
      );
    }

    return <textarea rows={4} value={value || ''} onChange={(event) => onContentChange(field.key, event.target.value)} />;
  }

  if (field.type === 'gallery') {
    const items = arrayValue(value);
    return (
      <div className="studio-stack-list">
        {items.map((item, index) => (
          <div key={`${field.key}-${index}`} className="studio-inline-row">
            <MediaPicker
              label="اختر صورة"
              value={item || ''}
              accept="image"
              folder="studio-gallery"
              onChange={(nextValue) => {
                const next = [...items];
                next[index] = nextValue;
                onContentChange(field.key, next);
              }}
            />
            <button type="button" className="mini-btn danger" onClick={() => onContentChange(field.key, items.filter((_, itemIndex) => itemIndex !== index))}>
              حذف
            </button>
          </div>
        ))}
        <button type="button" className="mini-btn" onClick={() => onContentChange(field.key, [...items, ''])}>
          إضافة صورة
        </button>
      </div>
    );
  }

  if (field.type === 'schedule') {
    const items = arrayValue(value);
    const englishItems = arrayValue(englishValue);
    return (
      <div className="studio-stack-list">
        {items.map((item, index) => (
          <div key={`${field.key}-${index}`} className="studio-schedule-grid">
            <input type="text" placeholder="الوقت" value={item.time || ''} onChange={(event) => onScheduleChange(field.key, index, 'time', event.target.value)} />
            <input type="text" placeholder="العربية" value={item.title || ''} onChange={(event) => onScheduleChange(field.key, index, 'title', event.target.value)} />
            {bilingualEnabled ? (
              <input
                type="text"
                dir="ltr"
                placeholder="English"
                value={englishItems[index]?.title || ''}
                onChange={(event) => onScheduleChange(englishKey, index, 'title', event.target.value)}
              />
            ) : null}
            <button type="button" className="mini-btn danger" onClick={() => onContentChange(field.key, items.filter((_, itemIndex) => itemIndex !== index))}>
              حذف
            </button>
          </div>
        ))}
        <button type="button" className="mini-btn" onClick={() => onContentChange(field.key, [...items, { time: '', title: '' }])}>
          إضافة فقرة
        </button>
      </div>
    );
  }

  if (field.type === 'list') {
    const items = arrayValue(value);
    const englishItems = arrayValue(englishValue);
    return (
      <div className="studio-stack-list">
        {items.map((item, index) => (
          <div key={`${field.key}-${index}`} className="studio-inline-row">
            <input type="text" placeholder="العربية" value={item || ''} onChange={(event) => onListChange(field.key, index, event.target.value)} />
            {bilingualEnabled ? (
              <input type="text" dir="ltr" placeholder="English" value={englishItems[index] || ''} onChange={(event) => onListChange(englishKey, index, event.target.value)} />
            ) : null}
            <button type="button" className="mini-btn danger" onClick={() => onContentChange(field.key, items.filter((_, itemIndex) => itemIndex !== index))}>
              حذف
            </button>
          </div>
        ))}
        <button type="button" className="mini-btn" onClick={() => onContentChange(field.key, [...items, ''])}>
          إضافة عنصر
        </button>
      </div>
    );
  }

  if (field.type === 'image' || field.type === 'audio' || field.type === 'video') {
    return (
      <MediaPicker
        label={field.type === 'image' ? 'اختر صورة' : field.type === 'audio' ? 'اختر صوتًا' : 'اختر فيديو'}
        value={value || ''}
        accept={field.type}
        folder={`studio-${field.type}`}
        onChange={(nextValue) => onContentChange(field.key, nextValue)}
      />
    );
  }

  if (field.type === 'boolean') {
    return (
      <label className="studio-toggle">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onContentChange(field.key, event.target.checked)} />
        <span>{value ? 'مفعل' : 'غير مفعل'}</span>
      </label>
    );
  }

  const inputType = field.type === 'datetime' ? 'datetime-local' : field.type === 'url' ? 'url' : 'text';

  if (bilingualEnabled && isTranslatableField(field) && inputType === 'text') {
    return (
      <div className="studio-dual">
        <input type="text" placeholder="العربية" value={value || ''} onChange={(event) => onContentChange(field.key, event.target.value)} />
        <input type="text" dir="ltr" placeholder="English" value={englishValue || ''} onChange={(event) => onContentChange(englishKey, event.target.value)} />
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

export default function StudioClient({
  session,
  manifests,
  openings,
  inventory,
  existingInvitation = null,
  mode = 'studio',
}) {
  const router = useRouter();
  const initialManifest = manifests.find((item) => item.slug === session.baseTemplate?.slug) || manifests[0];
  const [draft, setDraft] = useState(() => normalizeDraftState(session.draft, initialManifest?.slug || 'classic'));
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [saveState, setSaveState] = useState('saved');
  const [selection, setSelection] = useState(null);
  const [nativeSelectionMeta, setNativeSelectionMeta] = useState(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState('template-texts');
  const [openGeneralSections, setOpenGeneralSections] = useState(() => ({
    basic: true,
    opening: false,
    wording: false,
    families: false,
    details: false,
    schedule: false,
    media: false,
    contact: false,
    closing: false,
    sections: false,
  }));
  const lastSavedRef = useRef(JSON.stringify(normalizeDraftState(session.draft, initialManifest?.slug || 'classic')));

  const currentManifest = useMemo(
    () => manifests.find((item) => item.slug === draft.templateSlug) || initialManifest,
    [draft.templateSlug, initialManifest, manifests],
  );
  const currentOpening = useMemo(
    () => openings.find((item) => item.slug === draft.openingSlug) || getOpeningBySlug(draft.openingSlug),
    [draft.openingSlug, openings],
  );
  const groupedFields = useMemo(() => {
    return currentManifest.editableFields.reduce((accumulator, field) => {
      const section = field.section || 'basic';
      if (!accumulator[section]) {
        accumulator[section] = [];
      }
      accumulator[section].push(field);
      return accumulator;
    }, {});
  }, [currentManifest]);
  const templateTextCatalog = useMemo(
    () => buildTemplateTextCatalog(currentManifest, draft),
    [currentManifest, draft],
  );
  const previewInvitation = useMemo(() => buildPreviewInvitation(session, draft), [draft, session]);
  const renderConfig = useMemo(
    () => buildInvitationRenderConfig({
      invitation: previewInvitation,
      manifest: currentManifest,
      opening: currentOpening,
      preview: true,
    }),
    [currentManifest, currentOpening, previewInvitation],
  );
  const selectedTemplateText = useMemo(() => {
    if (selection?.kind !== 'template-text' || !selection.key) return null;
    return templateTextCatalog.find((item) => item.path === selection.key) || null;
  }, [selection, templateTextCatalog]);
  const selectedFreeElement = useMemo(() => {
    if (!selection?.key || !selection.kind?.startsWith('free-')) return null;
    return draft.customElements.find((item) => item.id === selection.key) || null;
  }, [draft.customElements, selection]);
  const selectedNativeElement = useMemo(() => {
    if (selection?.kind !== 'native-element' || !selection.key) return null;
    return {
      id: selection.key,
      ...(draft.nativeElementOverrides?.[selection.key] || {}),
      ...(nativeSelectionMeta?.id === selection.key ? nativeSelectionMeta : {}),
    };
  }, [draft.nativeElementOverrides, nativeSelectionMeta, selection]);
  const fontOptions = BUILTIN_FONT_LIBRARY;

  useEffect(() => {
    const serialized = JSON.stringify(draft);
    if (serialized === lastSavedRef.current) {
      return undefined;
    }

    setSaveState('dirty');
    const timeoutId = window.setTimeout(async () => {
      setSaveState('saving');
      try {
        const response = await fetch(`/api/studio/sessions/${session.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...draft,
            name: session.name,
          }),
        });
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'تعذر حفظ الجلسة.');
        }

        lastSavedRef.current = serialized;
        setSaveState('saved');
      } catch (error) {
        setSaveState('error');
        setNotice(error.message || 'تعذر حفظ الجلسة.');
      }
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [draft, session.id, session.name]);

  function setContentValue(key, value) {
    setDraft((current) => ({
      ...current,
      contentConfig: {
        ...current.contentConfig,
        [key]: value,
      },
    }));
  }

  function setScheduleValue(key, index, targetKey, value) {
    const items = arrayValue(draft.contentConfig[key]);
    const next = items.map((item, itemIndex) => (itemIndex === index ? { ...item, [targetKey]: value } : item));
    setContentValue(key, next);
  }

  function setListValue(key, index, value) {
    const items = arrayValue(draft.contentConfig[key]);
    const next = items.map((item, itemIndex) => (itemIndex === index ? value : item));
    setContentValue(key, next);
  }

  function updateSelectedTemplateText(value) {
    if (!selectedTemplateText?.path) return;

    updateTemplateTextValue(selectedTemplateText.path, value);
  }

  function updateTemplateTextValue(path, value) {
    if (!path) return;

    setDraft((current) => {
      const nextOverrides = { ...(current.textOverrides || {}) };
      const baseValue = current.contentConfig?.[path] ?? '';
      if (value === baseValue) {
        delete nextOverrides[path];
      } else {
        nextOverrides[path] = value;
      }

      return {
        ...current,
        textOverrides: nextOverrides,
      };
    });
  }

  function updateSelectedTemplateStyle(key, value) {
    if (!selectedTemplateText?.path) return;

    updateTemplateTextStyles(selectedTemplateText.path, { [key]: value });
  }

  function updateTemplateTextStyles(path, styles) {
    if (!path || !styles || typeof styles !== 'object') return;

    setDraft((current) => {
      const textStyleOverrides = { ...(current.uiConfig?.textStyleOverrides || {}) };
      const nextPathStyles = { ...(textStyleOverrides[path] || {}) };
      Object.entries(styles).forEach(([styleKey, styleValue]) => {
        if (styleValue == null || styleValue === '') {
          delete nextPathStyles[styleKey];
        } else {
          nextPathStyles[styleKey] = styleValue;
        }
      });

      if (Object.keys(nextPathStyles).length) {
        textStyleOverrides[path] = nextPathStyles;
      } else {
        delete textStyleOverrides[path];
      }

      return {
        ...current,
        uiConfig: {
          ...(current.uiConfig || {}),
          textStyleOverrides,
        },
      };
    });
  }

  function resetSelectedTemplateText() {
    if (!selectedTemplateText?.path) return;

    setDraft((current) => {
      const nextOverrides = { ...(current.textOverrides || {}) };
      const nextStyles = { ...(current.uiConfig?.textStyleOverrides || {}) };
      delete nextOverrides[selectedTemplateText.path];
      delete nextOverrides[getEnglishKey(selectedTemplateText.path)];
      delete nextStyles[selectedTemplateText.path];

      return {
        ...current,
        textOverrides: nextOverrides,
        uiConfig: {
          ...(current.uiConfig || {}),
          textStyleOverrides: nextStyles,
        },
      };
    });
  }

  function updateFreeElement(id, updates) {
    setDraft((current) => ({
      ...current,
      customElements: current.customElements.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    }));
  }

  function updateNativeElement(id, updates) {
    if (!id || !updates || typeof updates !== 'object') return;

    setDraft((current) => ({
      ...current,
      nativeElementOverrides: {
        ...(current.nativeElementOverrides || {}),
        [id]: {
          ...((current.nativeElementOverrides && current.nativeElementOverrides[id]) || {}),
          ...updates,
        },
      },
    }));
  }

  function resetNativeElement(id) {
    if (!id) return;

    setDraft((current) => {
      const nextOverrides = { ...(current.nativeElementOverrides || {}) };
      delete nextOverrides[id];
      return {
        ...current,
        nativeElementOverrides: nextOverrides,
      };
    });
  }

  function selectTemplateText(path) {
    setSelection({ kind: 'template-text', key: path });
    setNativeSelectionMeta(null);
    setActiveSidebarTab('template-texts');
  }

  function selectFreeElement(item) {
    setSelection({ kind: item.type === 'image' ? 'free-image' : 'free-text', key: item.id });
    setNativeSelectionMeta(null);
    setActiveSidebarTab('free-elements');
  }

  function addFreeText() {
    const id = generateId('free-text');
    const nextElement = normalizeCustomElement({
      id,
      type: 'text',
      name: 'نص حر جديد',
      content: 'اكتب هنا',
      contentEn: '',
      x: 48,
      y: 48,
      width: '220px',
      fontSize: '28px',
      fontFamily: 'Tajawal',
      color: '#1f2937',
    }, draft.customElements.length);

    setDraft((current) => ({
      ...current,
      customElements: [...current.customElements, nextElement],
    }));
    selectFreeElement(nextElement);
  }

  function addFreeImage(url) {
    const id = generateId('free-image');
    const nextElement = normalizeCustomElement({
      id,
      type: 'image',
      name: 'صورة حرة جديدة',
      content: url,
      x: 52,
      y: 52,
      width: '180px',
      height: '180px',
    }, draft.customElements.length);

    setDraft((current) => ({
      ...current,
      customElements: [...current.customElements, nextElement],
    }));
    selectFreeElement(nextElement);
  }

  async function createInvitation() {
    setBusy(true);
    setNotice('');
    try {
      const slug = `${draft.templateSlug}-${Date.now()}`.toLowerCase();
      const response = await fetch(`/api/studio/sessions/${session.id}/create-invitation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          clientName: `${draft.contentConfig.groomName || ''} ${draft.contentConfig.brideName || ''}`.trim() || 'عميل جديد',
          clientPhone: '',
          title: `${draft.contentConfig.groomName || ''} & ${draft.contentConfig.brideName || ''}`.trim(),
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'تعذر إنشاء الدعوة.');
      }

      setNotice('تم إنشاء الدعوة بنجاح.');
      router.push(payload.data?.editUrl || `/edit/${slug}`);
    } catch (error) {
      setNotice(error.message || 'تعذر إنشاء الدعوة.');
    } finally {
      setBusy(false);
    }
  }

  async function persistInvitationDraft(action = 'save') {
    if (!existingInvitation?.slug) return;

    setBusy(true);
    setNotice('');
    try {
      const response = await fetch(`/api/editor/${existingInvitation.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateSlug: draft.templateSlug,
          openingSlug: draft.openingSlug,
          contentConfig: {
            ...draft.contentConfig,
            __uiConfig: draft.uiConfig || {},
            __customElements: draft.customElements || [],
            __nativeElementOverrides: draft.nativeElementOverrides || {},
            __textOverrides: draft.textOverrides || {},
          },
          themeConfig: draft.themeConfig || {},
          sectionConfig: draft.sectionConfig || {},
          openingConfig: draft.openingConfig || {},
          action,
        }),
      });
      const payload = await response.json();
      if (!response.ok || payload.success === false) {
        throw new Error(payload.error || payload.message || 'تعذر حفظ الدعوة.');
      }

      setNotice(action === 'publish' ? 'تم نشر الدعوة.' : 'تم حفظ تغييرات الدعوة.');
      router.refresh();
    } catch (error) {
      setNotice(error.message || 'تعذر حفظ الدعوة.');
    } finally {
      setBusy(false);
    }
  }

  const selectedTemplateTextStyles = selectedTemplateText
    ? draft.uiConfig?.textStyleOverrides?.[selectedTemplateText.path] || {}
    : {};

  useEffect(() => {
    const handleFrameMessage = (event) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      const message = parseStudioBridgeMessage(event.data);
      if (!message) {
        return;
      }

      const { event: bridgeEvent, payload } = message;

      if (bridgeEvent === STUDIO_BRIDGE_EVENT.templateTextSelect) {
        if (!payload?.path) {
          setSelection((current) => (current?.kind === 'template-text' ? null : current));
          return;
        }

        setSelection({ kind: 'template-text', key: payload.path });
        setNativeSelectionMeta(null);
        setActiveSidebarTab('template-texts');
        return;
      }

      if (bridgeEvent === STUDIO_BRIDGE_EVENT.textOverride) {
        if (!payload?.path) return;
        updateTemplateTextValue(payload.path, String(payload.text ?? ''));
        setSelection({ kind: 'template-text', key: payload.path });
        setNativeSelectionMeta(null);
        setActiveSidebarTab('template-texts');
        return;
      }

      if (bridgeEvent === STUDIO_BRIDGE_EVENT.textStyleOverride) {
        if (!payload?.path || !payload?.styles) return;
        updateTemplateTextStyles(payload.path, payload.styles);
        setSelection({ kind: 'template-text', key: payload.path });
        setNativeSelectionMeta(null);
        setActiveSidebarTab('template-texts');
        return;
      }

      if (bridgeEvent === STUDIO_BRIDGE_EVENT.editField) {
        if (!payload?.fieldKey) return;
        selectTemplateText(payload.fieldKey);
        return;
      }

      if (bridgeEvent === STUDIO_BRIDGE_EVENT.customElementSelect) {
        if (!payload?.id) {
          setSelection((current) => (current?.kind?.startsWith('free-') ? null : current));
          return;
        }

        const item = draft.customElements.find((entry) => entry.id === payload.id);
        if (item) {
          setSelection({ kind: item.type === 'image' ? 'free-image' : 'free-text', key: item.id });
          setNativeSelectionMeta(null);
          setActiveSidebarTab('free-elements');
        }
        return;
      }

      if (bridgeEvent === STUDIO_BRIDGE_EVENT.customElementUpdate) {
        if (!payload?.id || !payload?.updates) return;
        updateFreeElement(payload.id, payload.updates);
        const item = draft.customElements.find((entry) => entry.id === payload.id);
        if (item) {
          setSelection({ kind: item.type === 'image' ? 'free-image' : 'free-text', key: item.id });
          setNativeSelectionMeta(null);
          setActiveSidebarTab('free-elements');
        }
        return;
      }

      if (bridgeEvent === STUDIO_BRIDGE_EVENT.customElementDelete) {
        if (!payload?.id) return;
        setDraft((current) => ({
          ...current,
          customElements: current.customElements.filter((item) => item.id !== payload.id),
        }));
        setSelection((current) => (current?.key === payload.id ? null : current));
        return;
      }

      if (bridgeEvent === STUDIO_BRIDGE_EVENT.nativeElementSelect) {
        if (!payload?.id) {
          setSelection((current) => (current?.kind === 'native-element' ? null : current));
          setNativeSelectionMeta(null);
          return;
        }

        setSelection({ kind: 'native-element', key: payload.id });
        setNativeSelectionMeta(payload);
        return;
      }

      if (bridgeEvent === STUDIO_BRIDGE_EVENT.nativeElementUpdate) {
        if (!payload?.id || !payload?.updates) return;
        updateNativeElement(payload.id, {
          ...(payload.label ? { label: payload.label } : {}),
          ...(payload.selector ? { selector: payload.selector } : {}),
          ...(payload.kind ? { kind: payload.kind } : {}),
          ...payload.updates,
        });
        setSelection({ kind: 'native-element', key: payload.id });
        setNativeSelectionMeta(payload);
      }
    };

    window.addEventListener('message', handleFrameMessage);
    return () => window.removeEventListener('message', handleFrameMessage);
  }, [draft.customElements]);

  return (
    <div className="studio-shell">
      <div className="studio-topbar">
        <div>
          <span className="studio-kicker">محرر الدعوات الجديد</span>
          <h1>{currentManifest.nameAr}</h1>
          <p>المعاينة الآن نظيفة بالكامل. لا يوجد أي التقاط أو تعديل من داخل المحاكي. كل التحكم يتم من اللوحة الجانبية فقط.</p>
          <label className="studio-toggle studio-toggle--top">
            <input
              data-testid="studio-bilingual-toggle"
              type="checkbox"
              checked={Boolean(draft.uiConfig?.bilingualEnabled)}
              onChange={(event) => setDraft((current) => ({
                ...current,
                uiConfig: {
                  ...(current.uiConfig || {}),
                  bilingualEnabled: event.target.checked,
                },
              }))}
            />
            <span>تفعيل القالب بلغتين</span>
          </label>
        </div>
        <div className="studio-actions">
          <span className={`studio-save ${saveState}`}>{saveState === 'saved' ? 'تم الحفظ' : saveState === 'saving' ? 'جارٍ الحفظ' : saveState === 'error' ? 'فشل الحفظ' : 'توجد تعديلات'}</span>
          <button type="button" className="mini-btn" data-testid="studio-refresh-preview" onClick={() => setSelection((current) => (current ? { ...current } : current))}>تحديث المعاينة</button>
          <Link className="mini-btn" data-testid="studio-open-fullscreen-preview" href={`/admin/studio/${session.id}/preview`} target="_blank">معاينة كاملة</Link>
          {mode === 'invitation' ? (
            <>
              <button type="button" className="mini-btn" data-testid="studio-save-invitation" onClick={() => void persistInvitationDraft('save')} disabled={busy}>حفظ الدعوة</button>
              <button type="button" className="btn-primary" data-testid="studio-publish-invitation" onClick={() => void persistInvitationDraft('publish')} disabled={busy}>نشر</button>
            </>
          ) : (
            <button type="button" className="btn-primary" data-testid="studio-create-invitation" onClick={() => void createInvitation()} disabled={busy}>إنشاء دعوة</button>
          )}
        </div>
      </div>

      {notice ? <div className="studio-notice">{notice}</div> : null}

      <div className="studio-layout">
        <section className="studio-preview">
          <div className="studio-preview-toolbar">
            <div className="studio-preview-toolbar__group">
              <button type="button" className="mini-btn" data-testid="studio-add-free-text" onClick={addFreeText}>إضافة نص حر</button>
              <MediaPicker
                label="إضافة صورة حرة"
                value=""
                accept="image"
                folder="studio-free-elements"
                onChange={(url) => {
                  if (url) {
                    addFreeImage(url);
                  }
                }}
                trigger={<button type="button" className="mini-btn" data-testid="studio-add-free-image">إضافة صورة حرة</button>}
              />
            </div>
            <div className="studio-preview-toolbar__group">
              {Object.entries(DEVICE_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  className={`mini-btn ${draft.devicePreview.mode === key ? 'active' : ''}`}
                  onClick={() => setDraft((current) => ({
                    ...current,
                    devicePreview: { mode: key, width: preset.width, height: preset.height },
                  }))}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <StudioPreviewShell
            templateSlug={currentManifest.slug}
            manifest={currentManifest}
            renderConfig={renderConfig}
            deviceMode={draft.devicePreview.mode}
          />
        </section>

        <aside className="studio-sidebar">
          <div className="studio-card">
            <h2>العنصر المحدد</h2>
            {!selection ? (
              <p className="studio-empty">اختر نصًا من قائمة نصوص القالب أو عنصرًا حرًا من قائمة العناصر الحرة.</p>
            ) : null}

            {selectedTemplateText ? (
              <div className="studio-stack">
                <div className="studio-meta">
                  <strong>{selectedTemplateText.label}</strong>
                  <span>نص من القالب</span>
                </div>
                <label className="studio-field">
                  <span>النص</span>
                  {Boolean(draft.uiConfig?.bilingualEnabled) ? (
                    <div className="studio-dual">
                      <textarea
                        data-testid="studio-template-text-input"
                        rows={4}
                        placeholder="العربية"
                        value={String(getTemplateTextValue(draft, selectedTemplateText.path) || '')}
                        onChange={(event) => updateSelectedTemplateText(event.target.value)}
                      />
                      <textarea
                        data-testid="studio-template-text-input-en"
                        rows={4}
                        dir="ltr"
                        placeholder="English"
                        value={String(getTemplateTextValue(draft, getEnglishKey(selectedTemplateText.path)) || '')}
                        onChange={(event) => setContentValue(getEnglishKey(selectedTemplateText.path), event.target.value)}
                      />
                    </div>
                  ) : (
                    <textarea
                      data-testid="studio-template-text-input"
                      rows={4}
                      value={String(getTemplateTextValue(draft, selectedTemplateText.path) || '')}
                      onChange={(event) => updateSelectedTemplateText(event.target.value)}
                    />
                  )}
                </label>
                <div className="studio-grid">
                  <label className="studio-field">
                    <span>لون النص</span>
                    <input data-testid="studio-template-text-color" type="color" value={selectedTemplateTextStyles.color || '#1f2937'} onChange={(event) => updateSelectedTemplateStyle('color', event.target.value)} />
                  </label>
                  <label className="studio-field">
                    <span>نوع الخط</span>
                    <select data-testid="studio-template-text-font" value={selectedTemplateTextStyles.fontFamily || ''} onChange={(event) => updateSelectedTemplateStyle('fontFamily', event.target.value)}>
                      <option value="">الخط الأصلي</option>
                      {fontOptions.map((font) => (
                        <option key={font.id || font.family} value={font.family}>{font.nameAr || font.family}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <button type="button" className="mini-btn" data-testid="studio-template-text-reset" onClick={resetSelectedTemplateText}>إعادة النص الأصلي</button>
              </div>
            ) : null}

            {selectedFreeElement ? (
              <div className="studio-stack">
                <div className="studio-meta">
                  <strong>{selectedFreeElement.name}</strong>
                  <span>{selectedFreeElement.type === 'image' ? 'صورة حرة' : 'نص حر'}</span>
                </div>
                {selectedFreeElement.type === 'text' ? (
                  <>
                    <label className="studio-field">
                      <span>النص</span>
                      {Boolean(draft.uiConfig?.bilingualEnabled) ? (
                        <div className="studio-dual">
                          <textarea
                            data-testid="studio-free-text-input"
                            rows={4}
                            placeholder="العربية"
                            value={selectedFreeElement.content}
                            onChange={(event) => updateFreeElement(selectedFreeElement.id, { content: event.target.value })}
                          />
                          <textarea
                            data-testid="studio-free-text-input-en"
                            rows={4}
                            dir="ltr"
                            placeholder="English"
                            value={selectedFreeElement.contentEn || ''}
                            onChange={(event) => updateFreeElement(selectedFreeElement.id, { contentEn: event.target.value })}
                          />
                        </div>
                      ) : (
                        <textarea data-testid="studio-free-text-input" rows={4} value={selectedFreeElement.content} onChange={(event) => updateFreeElement(selectedFreeElement.id, { content: event.target.value })} />
                      )}
                    </label>
                    <div className="studio-grid">
                      <label className="studio-field">
                        <span>لون النص</span>
                        <input data-testid="studio-free-text-color" type="color" value={selectedFreeElement.color || '#1f2937'} onChange={(event) => updateFreeElement(selectedFreeElement.id, { color: event.target.value })} />
                      </label>
                      <label className="studio-field">
                        <span>نوع الخط</span>
                        <select data-testid="studio-free-text-font" value={selectedFreeElement.fontFamily || 'Tajawal'} onChange={(event) => updateFreeElement(selectedFreeElement.id, { fontFamily: event.target.value })}>
                          {fontOptions.map((font) => (
                            <option key={font.id || font.family} value={font.family}>{font.nameAr || font.family}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="studio-field">
                      <span>حجم الخط</span>
                      <input data-testid="studio-free-text-size" type="text" value={selectedFreeElement.fontSize || '28px'} onChange={(event) => updateFreeElement(selectedFreeElement.id, { fontSize: event.target.value })} />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="studio-field">
                      <span>الصورة</span>
                      <MediaPicker
                        label="استبدال الصورة"
                        value={selectedFreeElement.content}
                        accept="image"
                        folder="studio-free-elements"
                        onChange={(url) => updateFreeElement(selectedFreeElement.id, { content: url })}
                      />
                    </label>
                    <div className="studio-grid">
                      <label className="studio-field">
                        <span>العرض</span>
                        <input type="text" value={selectedFreeElement.width || '180px'} onChange={(event) => updateFreeElement(selectedFreeElement.id, { width: event.target.value })} />
                      </label>
                      <label className="studio-field">
                        <span>الارتفاع</span>
                        <input type="text" value={selectedFreeElement.height || '180px'} onChange={(event) => updateFreeElement(selectedFreeElement.id, { height: event.target.value })} />
                      </label>
                    </div>
                  </>
                )}

                <div className="studio-grid">
                  <label className="studio-field">
                    <span>X</span>
                    <input type="number" value={Math.round(toFiniteNumber(selectedFreeElement.x, 40))} onChange={(event) => updateFreeElement(selectedFreeElement.id, { x: toFiniteNumber(event.target.value, 0) })} />
                  </label>
                  <label className="studio-field">
                    <span>Y</span>
                    <input type="number" value={Math.round(toFiniteNumber(selectedFreeElement.y, 40))} onChange={(event) => updateFreeElement(selectedFreeElement.id, { y: toFiniteNumber(event.target.value, 0) })} />
                  </label>
                </div>

                <button
                  type="button"
                  data-testid="studio-delete-selected-element"
                  className="mini-btn danger"
                  onClick={() => {
                    setDraft((current) => ({
                      ...current,
                      customElements: current.customElements.filter((item) => item.id !== selectedFreeElement.id),
                    }));
                    setSelection(null);
                  }}
                >
                  حذف العنصر
                </button>
              </div>
            ) : null}

            {selectedNativeElement ? (
              <div className="studio-stack">
                <div className="studio-meta">
                  <strong>{selectedNativeElement.label || selectedNativeElement.selector || selectedNativeElement.id}</strong>
                  <span>عنصر ثابت من القالب</span>
                </div>

                {selectedNativeElement.kind === 'text' || selectedNativeElement.textContent != null ? (
                  <>
                    <label className="studio-field">
                      <span>النص</span>
                      <textarea
                        rows={4}
                        value={selectedNativeElement.textContent || ''}
                        onChange={(event) => updateNativeElement(selectedNativeElement.id, { textContent: event.target.value })}
                      />
                    </label>
                    <div className="studio-grid">
                      <label className="studio-field">
                        <span>لون النص</span>
                        <input
                          type="color"
                          value={selectedNativeElement.color || '#1f2937'}
                          onChange={(event) => updateNativeElement(selectedNativeElement.id, { color: event.target.value })}
                        />
                      </label>
                      <label className="studio-field">
                        <span>نوع الخط</span>
                        <select
                          value={selectedNativeElement.fontFamily || ''}
                          onChange={(event) => updateNativeElement(selectedNativeElement.id, { fontFamily: event.target.value })}
                        >
                          <option value="">الخط الأصلي</option>
                          {fontOptions.map((font) => (
                            <option key={font.id || font.family} value={font.family}>{font.nameAr || font.family}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="studio-field">
                      <span>حجم الخط</span>
                      <input
                        type="text"
                        value={selectedNativeElement.fontSize || ''}
                        onChange={(event) => updateNativeElement(selectedNativeElement.id, { fontSize: event.target.value })}
                      />
                    </label>
                  </>
                ) : null}

                <div className="studio-grid">
                  <label className="studio-field">
                    <span>X</span>
                    <input
                      type="number"
                      value={Math.round(toFiniteNumber(selectedNativeElement.x, 0))}
                      onChange={(event) => updateNativeElement(selectedNativeElement.id, { x: toFiniteNumber(event.target.value, 0) })}
                    />
                  </label>
                  <label className="studio-field">
                    <span>Y</span>
                    <input
                      type="number"
                      value={Math.round(toFiniteNumber(selectedNativeElement.y, 0))}
                      onChange={(event) => updateNativeElement(selectedNativeElement.id, { y: toFiniteNumber(event.target.value, 0) })}
                    />
                  </label>
                </div>

                <div className="studio-grid">
                  <label className="studio-field">
                    <span>التكبير</span>
                    <input
                      type="number"
                      step="0.05"
                      value={toFiniteNumber(selectedNativeElement.scale, 1)}
                      onChange={(event) => updateNativeElement(selectedNativeElement.id, { scale: toFiniteNumber(event.target.value, 1) })}
                    />
                  </label>
                  <label className="studio-field">
                    <span>الدوران</span>
                    <input
                      type="number"
                      value={toFiniteNumber(selectedNativeElement.rotation, 0)}
                      onChange={(event) => updateNativeElement(selectedNativeElement.id, { rotation: toFiniteNumber(event.target.value, 0) })}
                    />
                  </label>
                </div>

                <div className="studio-grid">
                  <label className="studio-toggle">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedNativeElement.hidden)}
                      onChange={(event) => updateNativeElement(selectedNativeElement.id, { hidden: event.target.checked })}
                    />
                    <span>{selectedNativeElement.hidden ? 'العنصر مخفي' : 'إخفاء العنصر'}</span>
                  </label>
                  <label className="studio-toggle">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedNativeElement.locked)}
                      onChange={(event) => updateNativeElement(selectedNativeElement.id, { locked: event.target.checked })}
                    />
                    <span>{selectedNativeElement.locked ? 'العنصر مقفل' : 'قفل العنصر'}</span>
                  </label>
                </div>

                <button type="button" className="mini-btn" onClick={() => resetNativeElement(selectedNativeElement.id)}>إعادة ضبط العنصر</button>
                <button type="button" className="mini-btn danger" onClick={() => updateNativeElement(selectedNativeElement.id, { hidden: true })}>حذف العنصر من المعاينة</button>
              </div>
            ) : null}
          </div>

          <div className="studio-card studio-tabs-card">
            <div className="studio-tabs">
              <button
                type="button"
                className={`studio-tab ${activeSidebarTab === 'template-texts' ? 'active' : ''}`}
                onClick={() => setActiveSidebarTab('template-texts')}
              >
                نصوص القالب
              </button>
              <button
                type="button"
                className={`studio-tab ${activeSidebarTab === 'free-elements' ? 'active' : ''}`}
                onClick={() => setActiveSidebarTab('free-elements')}
              >
                العناصر الحرة
              </button>
              <button
                type="button"
                className={`studio-tab ${activeSidebarTab === 'general-fields' ? 'active' : ''}`}
                onClick={() => setActiveSidebarTab('general-fields')}
              >
                الحقول العامة
              </button>
            </div>

            {activeSidebarTab === 'template-texts' ? (
              <div className="studio-tab-panel">
                <h2>نصوص القالب</h2>
                <div className="studio-list">
                  {templateTextCatalog.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      data-testid={`studio-template-text-item-${item.path}`}
                      className={`studio-list-item ${selection?.kind === 'template-text' && selection.key === item.path ? 'active' : ''}`}
                      onClick={() => selectTemplateText(item.path)}
                    >
                      <strong>{item.label}</strong>
                      <span>{String(item.text || '').slice(0, 70) || item.path}</span>
                    </button>
                  ))}
                  {!templateTextCatalog.length ? <p className="studio-empty">لا توجد نصوص مفهرسة لهذا القالب.</p> : null}
                </div>
              </div>
            ) : null}

            {activeSidebarTab === 'free-elements' ? (
              <div className="studio-tab-panel">
                <h2>العناصر الحرة</h2>
                <div className="studio-list">
                  {draft.customElements.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`studio-list-item ${selection?.key === item.id ? 'active' : ''}`}
                      onClick={() => selectFreeElement(item)}
                    >
                      <strong>{item.name}</strong>
                      <span>{item.type === 'image' ? 'صورة حرة' : String(item.content || '').slice(0, 70) || 'نص حر'}</span>
                    </button>
                  ))}
                  {!draft.customElements.length ? <p className="studio-empty">لا توجد عناصر حرة بعد.</p> : null}
                </div>
              </div>
            ) : null}

            {activeSidebarTab === 'general-fields' ? (
              <div className="studio-tab-panel studio-tab-panel--stack">
                <div className="studio-stack">
                  <h2>القالب والإعدادات</h2>
                  <label className="studio-field">
                    <span>القالب</span>
                    <select
                      value={draft.templateSlug}
                      onChange={(event) => {
                        setDraft((current) => ({ ...current, templateSlug: event.target.value }));
                        setSelection(null);
                      }}
                    >
                      {manifests.map((item) => (
                        <option key={item.slug} value={item.slug}>{item.nameAr}</option>
                      ))}
                    </select>
                  </label>
                  <label className="studio-field">
                    <span>الافتتاحية</span>
                    <select value={draft.openingSlug} onChange={(event) => setDraft((current) => ({ ...current, openingSlug: event.target.value }))}>
                      {openings.map((item) => (
                        <option key={item.slug} value={item.slug}>{item.nameAr || item.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {TEXT_SECTION_ORDER.filter((sectionKey) => groupedFields[sectionKey]?.length).map((sectionKey) => (
                  <div key={sectionKey} className="studio-section-block">
                    <button
                      type="button"
                      className={`studio-accordion-trigger ${openGeneralSections[sectionKey] ? 'open' : ''}`}
                      onClick={() => setOpenGeneralSections((current) => ({
                        ...current,
                        [sectionKey]: !current[sectionKey],
                      }))}
                    >
                      <span>{SECTION_LABELS[sectionKey] || sectionKey}</span>
                      <strong>{openGeneralSections[sectionKey] ? '−' : '+'}</strong>
                    </button>
                    {openGeneralSections[sectionKey] ? (
                      <div className="studio-form studio-accordion-body">
                        {groupedFields[sectionKey].map((field) => (
                          <label key={field.key} className="studio-field">
                            <span>{field.labelAr}</span>
                            <FieldRenderer
                              field={field}
                              draft={draft}
                              onContentChange={setContentValue}
                              onScheduleChange={setScheduleValue}
                              onListChange={setListValue}
                            />
                          </label>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      <style jsx>{`
        .studio-shell {
          display: grid;
          gap: 18px;
        }
        .studio-topbar {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          background: linear-gradient(135deg, #fff8f4, #fff);
          border: 1px solid rgba(127, 42, 31, 0.1);
          border-radius: 24px;
          padding: 22px;
        }
        .studio-kicker {
          display: inline-block;
          font-size: 0.8rem;
          color: #8f6a61;
          margin-bottom: 6px;
        }
        .studio-topbar h1 {
          margin: 0;
          font-size: 1.7rem;
          color: #311b1a;
        }
        .studio-topbar p {
          margin: 8px 0 0;
          color: #6f5955;
          max-width: 720px;
          line-height: 1.8;
        }
        .studio-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: flex-end;
          align-items: center;
        }
        .studio-save {
          font-size: 0.86rem;
          color: #7d6662;
          padding-inline: 4px;
        }
        .studio-save.saved {
          color: #2f7a45;
        }
        .studio-save.saving {
          color: #9a6b12;
        }
        .studio-save.error {
          color: #a12727;
        }
        .studio-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(360px, 420px);
          gap: 18px;
          align-items: start;
        }
        .studio-preview,
        .studio-card {
          background: #fff;
          border: 1px solid rgba(127, 42, 31, 0.1);
          border-radius: 24px;
          box-shadow: 0 18px 48px rgba(26, 14, 12, 0.06);
        }
        .studio-preview {
          padding: 18px;
          position: sticky;
          top: 20px;
        }
        .studio-preview-toolbar {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .studio-preview-toolbar__group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .studio-device {
          width: 100%;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at top, rgba(255, 244, 238, 0.96), rgba(244, 235, 230, 0.82));
          border-radius: 28px;
          padding: 18px;
        }
        .studio-sidebar {
          display: grid;
          gap: 16px;
          align-content: start;
        }
        .studio-card {
          padding: 18px;
          display: grid;
          gap: 14px;
        }
        .studio-card h2 {
          margin: 0;
          font-size: 1.02rem;
          color: #311b1a;
        }
        .studio-tabs-card {
          gap: 16px;
        }
        .studio-tabs {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          background: #fff6f1;
          border: 1px solid rgba(127, 42, 31, 0.08);
          border-radius: 18px;
          padding: 8px;
        }
        .studio-tab {
          border: none;
          border-radius: 14px;
          background: transparent;
          color: #7a5e58;
          padding: 10px 12px;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }
        .studio-tab.active {
          background: #fff;
          color: #7f2a1f;
          box-shadow: 0 8px 20px rgba(127, 42, 31, 0.08);
        }
        .studio-tab-panel {
          display: grid;
          gap: 14px;
        }
        .studio-tab-panel--stack {
          gap: 18px;
        }
        .studio-section-block {
          display: grid;
          gap: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(127, 42, 31, 0.08);
        }
        .studio-accordion-trigger {
          width: 100%;
          border: 1px solid rgba(127, 42, 31, 0.08);
          border-radius: 16px;
          background: #fff8f4;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          text-align: right;
          font: inherit;
          color: #4f312d;
          cursor: pointer;
        }
        .studio-accordion-trigger.open {
          background: #fff1eb;
          border-color: rgba(127, 42, 31, 0.16);
        }
        .studio-accordion-trigger span {
          font-size: 0.95rem;
          font-weight: 700;
        }
        .studio-accordion-trigger strong {
          font-size: 1.1rem;
          color: #7f2a1f;
        }
        .studio-accordion-body {
          padding-inline: 4px;
        }
        .studio-empty {
          margin: 0;
          color: #7d6662;
          line-height: 1.7;
        }
        .studio-stack,
        .studio-form {
          display: grid;
          gap: 14px;
        }
        .studio-field {
          display: grid;
          gap: 8px;
        }
        .studio-field span {
          font-size: 0.88rem;
          font-weight: 700;
          color: #311b1a;
        }
        .studio-field input,
        .studio-field textarea,
        .studio-field select {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(127, 42, 31, 0.12);
          background: #fffaf8;
          padding: 12px 14px;
          font: inherit;
          color: #2f2523;
        }
        .studio-field textarea {
          resize: vertical;
          min-height: 88px;
        }
        .studio-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .studio-dual,
        .studio-inline-row,
        .studio-schedule-grid,
        .studio-stack-list {
          display: grid;
          gap: 10px;
        }
        .studio-inline-row {
          grid-template-columns: minmax(0, 1fr) auto;
        }
        .studio-schedule-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          align-items: center;
        }
        .studio-list {
          display: grid;
          gap: 8px;
          max-height: 320px;
          overflow: auto;
        }
        .studio-list-item {
          border: 1px solid rgba(127, 42, 31, 0.1);
          border-radius: 16px;
          background: #fffaf8;
          padding: 12px;
          text-align: right;
          display: grid;
          gap: 4px;
          color: #3c2d2b;
          font: inherit;
        }
        .studio-list-item.active {
          border-color: rgba(127, 42, 31, 0.34);
          background: #fff2ed;
        }
        .studio-list-item strong {
          font-size: 0.94rem;
        }
        .studio-list-item span {
          color: #7b6661;
          font-size: 0.85rem;
        }
        .studio-toggle {
          display: flex;
          gap: 10px;
          align-items: center;
          color: #3c2d2b;
        }
        .studio-toggle--top {
          margin-top: 14px;
          width: fit-content;
        }
        .studio-meta {
          display: grid;
          gap: 4px;
        }
        .studio-meta strong {
          color: #311b1a;
        }
        .studio-meta span {
          color: #806864;
          font-size: 0.86rem;
        }
        .studio-notice {
          border-radius: 18px;
          border: 1px solid rgba(127, 42, 31, 0.14);
          background: #fff5f2;
          padding: 14px 16px;
          color: #7f2a1f;
        }
        :global(.btn-primary),
        :global(.mini-btn) {
          border-radius: 999px;
          border: 1px solid rgba(127, 42, 31, 0.16);
          background: #fff7f4;
          color: #7f2a1f;
          padding: 10px 14px;
          font: inherit;
          cursor: pointer;
        }
        :global(.btn-primary) {
          background: linear-gradient(135deg, #7f2a1f, #c07d52);
          color: #fff;
          border-color: transparent;
        }
        :global(.mini-btn.active) {
          background: #fff0ea;
          border-color: rgba(127, 42, 31, 0.34);
        }
        :global(.mini-btn.danger) {
          background: #fff0f0;
          color: #8b2222;
        }
        @media (max-width: 1280px) {
          .studio-layout {
            grid-template-columns: 1fr;
          }
          .studio-preview {
            position: static;
          }
        }
        @media (max-width: 640px) {
          .studio-tabs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
