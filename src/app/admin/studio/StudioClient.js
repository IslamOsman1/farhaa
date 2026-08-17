'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MediaPicker from '@/components/admin/MediaPicker';
import RenderFrame from '@/components/invitation/RenderFrame';
import {
  BUILTIN_FONT_LIBRARY,
  PUBLIC_FONT_LIBRARY_STYLESHEET_PATH,
} from '@/lib/font-library';
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

const ROOT_SELECTORS = [
  '#allrecords',
  '#invitation-container',
  '#main-content',
  '#invite',
  '#site',
  '.site',
  'main',
  'body',
];

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

function getLocalizedTextValue(doc, draft, key, fallback = '') {
  const bilingualEnabled = Boolean(draft.uiConfig?.bilingualEnabled);
  const preferredLocale = doc?.documentElement?.lang === 'en'
    ? 'en'
    : draft.uiConfig?.defaultLocale === 'en'
      ? 'en'
      : 'ar';

  if (bilingualEnabled && preferredLocale === 'en') {
    const englishValue = draft.contentConfig?.[getEnglishKey(key)];
    if (englishValue != null && englishValue !== '') {
      return englishValue;
    }
  }

  const value = draft.contentConfig?.[key];
  return value != null && value !== '' ? value : fallback;
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

function applyStyleValue(node, property, value) {
  if (!node) return;

  if (value == null || value === '') {
    node.style.removeProperty(property);
    return;
  }

  node.style.setProperty(property, String(value), 'important');
}

function ensureIframeEditorAssets(doc) {
  if (!doc) return;

  if (!doc.querySelector('link[data-farha-react-editor-fonts="true"]')) {
    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = PUBLIC_FONT_LIBRARY_STYLESHEET_PATH;
    link.dataset.farhaReactEditorFonts = 'true';
    doc.head.appendChild(link);
  }

  let styleTag = doc.getElementById('farha-react-studio-style');
  if (!styleTag) {
    styleTag = doc.createElement('style');
    styleTag.id = 'farha-react-studio-style';
    styleTag.textContent = `
      [data-farha-react-text-path] {
        cursor: text !important;
        outline: 1px dashed transparent;
        outline-offset: 3px;
        transition: outline-color 0.18s ease, background-color 0.18s ease;
      }
      [data-farha-react-text-path]:hover {
        outline-color: rgba(127, 42, 31, 0.45);
        background: rgba(255, 250, 246, 0.35);
      }
      [data-farha-react-text-path][data-farha-selected="true"] {
        outline-color: #7f2a1f;
        background: rgba(255, 250, 246, 0.5);
      }
      #farha-react-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 2147481200;
      }
      .farha-react-free {
        position: absolute;
        pointer-events: auto;
        cursor: grab;
        border: 1px dashed transparent;
        border-radius: 14px;
        box-sizing: border-box;
        transition: border-color 0.18s ease, box-shadow 0.18s ease;
      }
      .farha-react-free.is-selected {
        border-color: #7f2a1f;
        box-shadow: 0 0 0 2px rgba(127, 42, 31, 0.15);
      }
      .farha-react-free__text {
        min-width: 80px;
        min-height: 38px;
        white-space: pre-wrap;
        word-break: break-word;
        line-height: 1.4;
        padding: 8px 10px;
      }
      .farha-react-free__image {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 12px;
      }
      .farha-react-free__delete {
        position: absolute;
        top: -12px;
        left: -12px;
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 999px;
        background: #8f2f23;
        color: #fff;
        font: 700 14px/1 sans-serif;
        cursor: pointer;
        display: none;
      }
      .farha-react-free.is-selected .farha-react-free__delete {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    `;
    doc.head.appendChild(styleTag);
  }
}

function resolveEditorRoot(doc) {
  if (!doc) return null;

  for (const selector of ROOT_SELECTORS) {
    const node = doc.querySelector(selector);
    if (node) {
      if (doc.defaultView?.getComputedStyle(node).position === 'static') {
        node.style.position = 'relative';
      }
      return node;
    }
  }

  return doc.body;
}

function getTextBindings(manifest) {
  const bindings = manifest?.runtimeBindings?.fieldBindings || {};
  return Object.entries(bindings).filter(([, binding]) => binding?.method === 'text' && binding?.selector);
}

function getTemplateTextValue(draft, path) {
  if (Object.prototype.hasOwnProperty.call(draft.textOverrides || {}, path)) {
    return draft.textOverrides[path];
  }

  return draft.contentConfig?.[path] ?? '';
}

function getTemplateTextValueForLocale(doc, draft, path) {
  const bilingualEnabled = Boolean(draft.uiConfig?.bilingualEnabled);
  if (bilingualEnabled && doc?.documentElement?.lang === 'en') {
    const englishPath = getEnglishKey(path);
    if (Object.prototype.hasOwnProperty.call(draft.textOverrides || {}, englishPath)) {
      return draft.textOverrides[englishPath];
    }

    const englishValue = draft.contentConfig?.[englishPath];
    if (englishValue != null && englishValue !== '') {
      return englishValue;
    }
  }

  return getTemplateTextValue(draft, path);
}

function toTestIdSuffix(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function applyTemplateTextBindings(doc, manifest, draft) {
  const catalog = [];

  for (const [path, binding] of getTextBindings(manifest)) {
    const nodes = Array.from(doc.querySelectorAll(binding.selector));
    const styleOverride = draft.uiConfig?.textStyleOverrides?.[path] || {};
    const nextText = String(getTemplateTextValueForLocale(doc, draft, path) ?? '');

    nodes.forEach((node) => {
      node.dataset.farhaReactTextPath = path;
      node.dataset.farhaReactTextBound = 'true';
      node.dataset.testid = `iframe-template-text-${toTestIdSuffix(path) || 'item'}`;
      node.textContent = nextText;
      applyStyleValue(node, 'color', styleOverride.color);
      applyStyleValue(node, 'font-family', styleOverride.fontFamily ? `"${String(styleOverride.fontFamily).replace(/"/g, '')}", sans-serif` : '');
      applyStyleValue(node, 'font-size', styleOverride.fontSize);
      applyStyleValue(node, 'font-weight', styleOverride.fontWeight);
      applyStyleValue(node, 'font-style', styleOverride.fontStyle);
      applyStyleValue(node, 'text-align', styleOverride.textAlign);
      applyStyleValue(node, 'line-height', styleOverride.lineHeight);
      applyStyleValue(node, 'letter-spacing', styleOverride.letterSpacing);
    });

    const firstNode = nodes[0];
    catalog.push({
      path,
      label: manifest?.editableFields?.find((field) => field.key === path)?.labelAr || path,
      selector: binding.selector,
      text: firstNode?.textContent || nextText,
    });
  }

  return catalog;
}

function buildTemplateTextCatalog(manifest, draft) {
  return getTextBindings(manifest).map(([path, binding]) => ({
    path,
    label: manifest?.editableFields?.find((field) => field.key === path)?.labelAr || path,
    selector: binding?.selector || path,
    text: String(getTemplateTextValue(draft, path) || ''),
  }));
}

function renderFreeElements({
  root,
  doc,
  elements,
  draft,
  selectedId,
  onSelect,
  onMove,
  onDelete,
}) {
  if (!root || !doc) return () => {};

  let layer = doc.getElementById('farha-react-layer');
  if (!layer) {
    layer = doc.createElement('div');
    layer.id = 'farha-react-layer';
    root.appendChild(layer);
  }

  layer.innerHTML = '';
  const cleanups = [];

  elements.forEach((element) => {
    const wrapper = doc.createElement('div');
    const isSelected = selectedId === element.id;
    wrapper.className = `farha-react-free ${isSelected ? 'is-selected' : ''}`;
    wrapper.dataset.elementId = element.id;
    wrapper.dataset.testid = `iframe-free-element-${toTestIdSuffix(element.id) || 'item'}`;
    wrapper.style.left = `${toFiniteNumber(element.x, 40)}px`;
    wrapper.style.top = `${toFiniteNumber(element.y, 40)}px`;
    wrapper.style.width = element.width || (element.type === 'image' ? '180px' : '220px');
    wrapper.style.height = element.type === 'image' ? (element.height || '180px') : 'auto';
    wrapper.style.opacity = String(toFiniteNumber(element.opacity, 1));
    wrapper.style.transform = `rotate(${toFiniteNumber(element.rotation, 0)}deg)`;
    wrapper.style.zIndex = String(toFiniteNumber(element.zIndex, 10));

    const deleteButton = doc.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'farha-react-free__delete';
    deleteButton.textContent = '×';
    deleteButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onDelete(element.id);
    });
    wrapper.appendChild(deleteButton);

    if (element.type === 'image') {
      const img = doc.createElement('img');
      img.className = 'farha-react-free__image';
      img.dataset.testid = `iframe-free-image-${toTestIdSuffix(element.id) || 'item'}`;
      img.src = element.content || '';
      img.alt = element.name || 'free image';
      wrapper.appendChild(img);
    } else {
      const content = doc.createElement('div');
      content.className = 'farha-react-free__text';
      content.dataset.testid = `iframe-free-text-${toTestIdSuffix(element.id) || 'item'}`;
      content.textContent = getLocalizedTextValue(doc, draft, element.id, element.contentEn || '')
        || element.content
        || element.contentEn
        || 'نص حر';
      content.style.color = element.color || '#1f2937';
      content.style.fontFamily = `"${String(element.fontFamily || 'Tajawal').replace(/"/g, '')}", sans-serif`;
      content.style.fontSize = element.fontSize || '28px';
      wrapper.appendChild(content);
    }

    const handlePointerDown = (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();

      onSelect({
        kind: element.type === 'image' ? 'free-image' : 'free-text',
        key: element.id,
      });

      const startX = event.clientX;
      const startY = event.clientY;
      const originX = toFiniteNumber(element.x, 40);
      const originY = toFiniteNumber(element.y, 40);
      let nextX = originX;
      let nextY = originY;

      const move = (moveEvent) => {
        nextX = Math.max(0, Math.round(originX + (moveEvent.clientX - startX)));
        nextY = Math.max(0, Math.round(originY + (moveEvent.clientY - startY)));
        wrapper.style.left = `${nextX}px`;
        wrapper.style.top = `${nextY}px`;
      };

      const up = () => {
        doc.removeEventListener('pointermove', move, true);
        doc.removeEventListener('pointerup', up, true);
        doc.removeEventListener('pointercancel', up, true);
        onMove(element.id, { x: nextX, y: nextY });
      };

      doc.addEventListener('pointermove', move, true);
      doc.addEventListener('pointerup', up, true);
      doc.addEventListener('pointercancel', up, true);
      cleanups.push(() => {
        doc.removeEventListener('pointermove', move, true);
        doc.removeEventListener('pointerup', up, true);
        doc.removeEventListener('pointercancel', up, true);
      });
    };

    wrapper.addEventListener('pointerdown', handlePointerDown, true);
    cleanups.push(() => wrapper.removeEventListener('pointerdown', handlePointerDown, true));

    wrapper.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onSelect({
        kind: element.type === 'image' ? 'free-image' : 'free-text',
        key: element.id,
      });
    });

    layer.appendChild(wrapper);
  });

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
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
  const [previewNonce, setPreviewNonce] = useState(0);
  const [iframeLoadTick, setIframeLoadTick] = useState(0);
  const frameHostRef = useRef(null);
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

  const fontOptions = BUILTIN_FONT_LIBRARY;
  const selectedFreeElement = useMemo(() => {
    if (!selection?.key || !selection.kind?.startsWith('free-')) return null;
    return draft.customElements.find((item) => item.id === selection.key) || null;
  }, [draft.customElements, selection]);
  const selectedTemplateText = useMemo(() => {
    if (selection?.kind !== 'template-text' || !selection.key) return null;
    return templateTextCatalog.find((item) => item.path === selection.key) || {
      path: selection.key,
      label: currentManifest.editableFields.find((field) => field.key === selection.key)?.labelAr || selection.key,
      text: String(getTemplateTextValue(draft, selection.key) || ''),
    };
  }, [currentManifest, draft, selection, templateTextCatalog]);
  const selectedNativeElement = useMemo(() => {
    if (selection?.kind !== 'native-element' || !selection.key) return null;
    const override = draft.nativeElementOverrides?.[selection.key] || {};
    return {
      ...(nativeSelectionMeta || {}),
      ...override,
      id: selection.key,
    };
  }, [draft.nativeElementOverrides, nativeSelectionMeta, selection]);
  const bridgeMessage = useMemo(() => {
    if (selection?.kind === 'template-text' && selection.key) {
      return {
        type: 'FARHA_SELECT_TEMPLATE_TEXT',
        payload: {
          path: selection.key,
          preserveNativeSelection: true,
        },
      };
    }

    if (selection?.kind === 'native-element' && selection.key) {
      return {
        type: 'FARHA_SELECT_NATIVE_ELEMENT',
        payload: {
          id: selection.key,
        },
      };
    }

    return null;
  }, [selection]);

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

  useEffect(() => {
    function handleFrameMessage(event) {
      if (event.origin !== window.location.origin || !event.data?.type) {
        return;
      }

      const { type, payload } = event.data;

      if (type === 'FARHA_TEMPLATE_TEXT_SELECT') {
        const nextPath = payload?.path;
        if (!nextPath) return;
        setNativeSelectionMeta(null);
        setSelection((current) => (current?.kind === 'template-text' && current?.key === nextPath ? current : { kind: 'template-text', key: nextPath }));
        return;
      }

      if (type === 'FARHA_TEXT_OVERRIDE') {
        const nextPath = payload?.path;
        if (!nextPath) return;

        setNativeSelectionMeta(null);
        setSelection((current) => (current?.kind === 'template-text' && current?.key === nextPath ? current : { kind: 'template-text', key: nextPath }));
        setDraft((current) => {
          const nextOverrides = { ...(current.textOverrides || {}) };
          const baseValue = current.contentConfig?.[nextPath] ?? '';
          const nextText = String(payload?.text ?? '');
          if (nextText === baseValue) {
            delete nextOverrides[nextPath];
          } else {
            nextOverrides[nextPath] = nextText;
          }

          return {
            ...current,
            textOverrides: nextOverrides,
          };
        });
        return;
      }

      if (type === 'FARHA_CUSTOM_ELEMENT_SELECT') {
        const nextId = payload?.id;
        const element = nextId ? draft.customElements.find((item) => item.id === nextId) : null;
        setNativeSelectionMeta(null);
        setSelection((current) => {
          if (!element) {
            return null;
          }
          const nextSelection = { kind: element.type === 'image' ? 'free-image' : 'free-text', key: nextId };
          return current?.kind === nextSelection.kind && current?.key === nextSelection.key ? current : nextSelection;
        });
        return;
      }

      if (type === 'FARHA_CUSTOM_ELEMENT_UPDATE') {
        const nextId = payload?.id;
        const updates = payload?.updates;
        if (!nextId || !updates) return;
        setNativeSelectionMeta(null);
        setSelection((current) => (current?.key === nextId ? current : current));
        setDraft((current) => ({
          ...current,
          customElements: current.customElements.map((item) => (item.id === nextId ? { ...item, ...updates } : item)),
        }));
        return;
      }

      if (type === 'FARHA_CUSTOM_ELEMENT_DELETE') {
        const nextId = payload?.id;
        if (!nextId) return;
        setNativeSelectionMeta(null);
        setDraft((current) => ({
          ...current,
          customElements: current.customElements.filter((item) => item.id !== nextId),
        }));
        setSelection((current) => (current?.key === nextId ? null : current));
        return;
      }

      if (type === 'FARHA_NATIVE_ELEMENT_SELECT') {
        if (!payload?.id) {
          setNativeSelectionMeta(null);
          setSelection((current) => (current ? null : current));
          return;
        }

        setNativeSelectionMeta(payload);
        setSelection((current) => (current?.kind === 'native-element' && current?.key === payload.id ? current : { kind: 'native-element', key: payload.id }));
        return;
      }

      if (type === 'FARHA_NATIVE_ELEMENT_UPDATE') {
        const nextId = payload?.id;
        const updates = payload?.updates;
        if (!nextId || !updates) return;

        setNativeSelectionMeta((current) => (current?.id === nextId ? { ...current, ...payload, ...updates } : current));
        setSelection((current) => (current?.kind === 'native-element' && current?.key === nextId ? current : { kind: 'native-element', key: nextId }));
        setDraft((current) => ({
          ...current,
          nativeElementOverrides: {
            ...(current.nativeElementOverrides || {}),
            [nextId]: {
              ...((current.nativeElementOverrides || {})[nextId] || {}),
              label: payload?.label || (current.nativeElementOverrides || {})[nextId]?.label,
              selector: payload?.selector || (current.nativeElementOverrides || {})[nextId]?.selector,
              kind: payload?.kind || (current.nativeElementOverrides || {})[nextId]?.kind,
              ...updates,
            },
          },
        }));
        return;
      }

      if (type === 'FARHA_NATIVE_ELEMENT_RESET') {
        const nextId = payload?.id;
        if (!nextId) return;
        setNativeSelectionMeta(payload || null);
        setSelection(nextId ? { kind: 'native-element', key: nextId } : null);
        setDraft((current) => {
          const nextOverrides = { ...(current.nativeElementOverrides || {}) };
          delete nextOverrides[nextId];
          return {
            ...current,
            nativeElementOverrides: nextOverrides,
          };
        });
      }
    }

    window.addEventListener('message', handleFrameMessage);
    return () => window.removeEventListener('message', handleFrameMessage);
  }, [draft.customElements]);

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

    setDraft((current) => {
      const nextOverrides = { ...(current.textOverrides || {}) };
      const baseValue = current.contentConfig?.[selectedTemplateText.path] ?? '';
      if (value === baseValue) {
        delete nextOverrides[selectedTemplateText.path];
      } else {
        nextOverrides[selectedTemplateText.path] = value;
      }

      return {
        ...current,
        textOverrides: nextOverrides,
      };
    });
  }

  function updateSelectedTemplateStyle(key, value) {
    if (!selectedTemplateText?.path) return;

    setDraft((current) => {
      const textStyleOverrides = { ...(current.uiConfig?.textStyleOverrides || {}) };
      const nextPathStyles = { ...(textStyleOverrides[selectedTemplateText.path] || {}) };
      if (value == null || value === '') {
        delete nextPathStyles[key];
      } else {
        nextPathStyles[key] = value;
      }

      if (Object.keys(nextPathStyles).length) {
        textStyleOverrides[selectedTemplateText.path] = nextPathStyles;
      } else {
        delete textStyleOverrides[selectedTemplateText.path];
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
    if (!id) return;

    setDraft((current) => ({
      ...current,
      nativeElementOverrides: {
        ...(current.nativeElementOverrides || {}),
        [id]: {
          ...((current.nativeElementOverrides || {})[id] || {}),
          ...updates,
        },
      },
    }));
    setNativeSelectionMeta((current) => (current?.id === id ? { ...current, ...updates } : current));
  }

  function hideNativeElement(id) {
    updateNativeElement(id, { hidden: true });
    setSelection(null);
    setNativeSelectionMeta(null);
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
    setSelection({ kind: 'free-text', key: id });
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
    setSelection({ kind: 'free-image', key: id });
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

  return (
    <div className="studio-shell">
      <div className="studio-topbar">
        <div>
          <span className="studio-kicker">محرر الدعوات الجديد</span>
          <h1>{currentManifest.nameAr}</h1>
          <p>
            تم تبسيط المحرر حول اختيار واحد واضح، وتحريك موحد للعناصر الحرة، وتحرير مباشر للنصوص مع لون وخط موحدين.
          </p>
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
          <button type="button" className="mini-btn" data-testid="studio-refresh-preview" onClick={() => setPreviewNonce((value) => value + 1)}>تحديث المعاينة</button>
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

          <div className={`studio-device studio-device--${draft.devicePreview.mode}`}>
            <div className="studio-frame-host" data-testid="studio-frame-host" ref={frameHostRef}>
              <RenderFrame
                key={`${draft.templateSlug}-${draft.openingSlug}-${previewNonce}-${draft.devicePreview.mode}`}
                templateSlug={currentManifest.slug}
                renderConfig={renderConfig}
                manifest={currentManifest}
                bridgeMessage={bridgeMessage}
                className="studio-frame-wrap"
                frameClassName="studio-frame"
                disablePromoBar
                disableOpening
                onLoad={() => setIframeLoadTick((value) => value + 1)}
              />
            </div>
          </div>
        </section>

        <aside className="studio-sidebar">
          <div className="studio-card">
            <h2>العنصر المحدد</h2>
            {!selection ? (
              <p className="studio-empty">اختر نصًا من المعاينة أو عنصرًا حرًا من فوق القالب ليظهر تحكمه هنا.</p>
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
                  <span>{selectedNativeElement.kind === 'text' ? 'عنصر ثابت نصي' : selectedNativeElement.kind === 'image' ? 'عنصر ثابت صوري' : 'عنصر ثابت'}</span>
                </div>

                {selectedNativeElement.kind === 'text' ? (
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

                <button
                  type="button"
                  className="mini-btn danger"
                  onClick={() => hideNativeElement(selectedNativeElement.id)}
                >
                  حذف / إخفاء العنصر
                </button>
              </div>
            ) : null}
          </div>

          <div className="studio-card">
            <h2>نصوص القالب</h2>
            <div className="studio-list">
              {templateTextCatalog.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  data-testid={`studio-template-text-item-${item.path}`}
                  className={`studio-list-item ${selection?.kind === 'template-text' && selection.key === item.path ? 'active' : ''}`}
                  onClick={() => setSelection({ kind: 'template-text', key: item.path })}
                >
                  <strong>{item.label}</strong>
                  <span>{String(item.text || '').slice(0, 70) || item.path}</span>
                </button>
              ))}
              {!templateTextCatalog.length ? <p className="studio-empty">سيتم فهرسة النصوص بعد اكتمال تحميل المعاينة.</p> : null}
            </div>
          </div>

          <div className="studio-card">
            <h2>القالب والإعدادات</h2>
            <div className="studio-stack">
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
              <label className="studio-toggle">
                <input
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
                <span>دعوة بلغتين</span>
              </label>
            </div>
          </div>

          {TEXT_SECTION_ORDER.filter((sectionKey) => groupedFields[sectionKey]?.length).map((sectionKey) => (
            <div key={sectionKey} className="studio-card">
              <h2>{sectionKey}</h2>
              <div className="studio-form">
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
            </div>
          ))}
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
          max-width: 720px;
          color: #67524f;
          line-height: 1.7;
        }
        .studio-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .studio-save {
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 0.82rem;
          background: #f8ece7;
          color: #8f2f23;
        }
        .studio-save.saved {
          background: #eef8f0;
          color: #25633a;
        }
        .studio-save.error {
          background: #fff1f1;
          color: #8b2222;
        }
        .studio-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(340px, 430px);
          gap: 18px;
          align-items: start;
        }
        .studio-preview,
        .studio-card {
          border: 1px solid rgba(127, 42, 31, 0.1);
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 22px 55px rgba(42, 26, 24, 0.08);
        }
        .studio-preview {
          padding: 18px;
          display: grid;
          gap: 18px;
          position: sticky;
          top: 16px;
        }
        .studio-preview-toolbar {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .studio-preview-toolbar__group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .studio-device {
          width: 100%;
          display: grid;
          justify-content: center;
        }
        .studio-device--mobile .studio-frame-host {
          width: 390px;
          height: 844px;
        }
        .studio-device--tablet .studio-frame-host {
          width: 768px;
          height: 1024px;
          max-width: 100%;
        }
        .studio-device--desktop .studio-frame-host {
          width: 100%;
          height: 860px;
        }
        .studio-frame-host {
          border-radius: 28px;
          overflow: hidden;
          border: 10px solid #141112;
          background: #141112;
          box-shadow: 0 30px 80px rgba(20, 17, 18, 0.18);
        }
        .studio-frame-wrap,
        .studio-frame {
          width: 100%;
          height: 100%;
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
        .studio-empty {
          margin: 0;
          color: #7d6662;
          line-height: 1.7;
          font-size: 0.93rem;
        }
        .studio-stack,
        .studio-form {
          display: grid;
          gap: 12px;
        }
        .studio-field {
          display: grid;
          gap: 7px;
          color: #503d3a;
          font-size: 0.92rem;
        }
        .studio-field > span {
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
        @media (max-width: 820px) {
          .studio-topbar {
            padding: 18px;
            flex-direction: column;
          }
          .studio-frame-host,
          .studio-device--mobile .studio-frame-host,
          .studio-device--tablet .studio-frame-host,
          .studio-device--desktop .studio-frame-host {
            width: 100%;
            height: 78vh;
          }
          .studio-grid,
          .studio-schedule-grid,
          .studio-inline-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
