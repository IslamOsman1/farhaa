'use client';

import { startTransition, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RenderFrame from '@/components/invitation/RenderFrame';
import MediaPicker from '@/components/admin/MediaPicker';
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
const RESPONSIVE_ELEMENT_KEYS = new Set(['x', 'y', 'width', 'height', 'fontSize', 'opacity', 'rotation', 'cropX', 'cropY']);
const RESPONSIVE_NUMERIC_KEYS = new Set(['x', 'y', 'opacity', 'rotation', 'cropX', 'cropY']);
const DEVICE_MODES = ['mobile', 'tablet', 'desktop'];
const TEXT_ALIGN_OPTIONS = ['right', 'center', 'left', 'justify'];
const TEXT_TRANSFORM_OPTIONS = ['none', 'uppercase', 'lowercase', 'capitalize'];
const TEXT_DECORATION_OPTIONS = ['none', 'underline', 'line-through', 'overline'];
const FONT_STYLE_OPTIONS = ['normal', 'italic'];
const FONT_WEIGHT_OPTIONS = ['300', '400', '500', '600', '700', '800'];
const DIRECTION_OPTIONS = ['rtl', 'ltr'];
const OBJECT_FIT_OPTIONS = ['cover', 'contain', 'fill'];
const SHARED_STYLE_KEYS = ['opacity', 'rotation'];
const NATIVE_SHARED_STYLE_KEYS = [
  'opacity',
  'rotation',
  'width',
  'height',
  'zIndex',
  'backgroundColor',
  'borderRadius',
  'borderWidth',
  'borderColor',
  'boxShadow',
];
const NATIVE_TEXT_STYLE_KEYS = [
  'color',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'lineHeight',
  'letterSpacing',
  'textAlign',
  'textTransform',
  'textDecoration',
  'direction',
  'textShadow',
];
const NATIVE_MEDIA_STYLE_KEYS = ['objectFit', 'cropX', 'cropY'];
const NATIVE_TEXT_STYLE_OVERRIDE_KEYS = [...NATIVE_TEXT_STYLE_KEYS];

const SECTION_META = {
  'custom-elements': { icon: '✚', label: 'العناصر الحرة', description: 'إضافة نصوص وصور متحركة فوق القالب' },
  layers: { icon: '🗂', label: 'الطبقات', description: 'إدارة العناصر الحرة وترتيبها والتحكم بها' },
  'template-elements': { icon: '🪄', label: 'عناصر القالب', description: 'تحريك وتثبيت العناصر الأصلية والزخارف داخل القالب نفسه' },
  'template-text': { icon: '🔤', label: 'نص القالب', description: 'العنصر النصي المحدد من داخل المعاينة المباشرة' },
  history: { icon: '🕘', label: 'السجل', description: 'ملخص مرئي لآخر التعديلات والإصدارات المصغرة' },
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

function clampValue(value, min, max) {
  if (!Number.isFinite(value)) {
    return min;
  }

  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function normalizeHexColor(value, fallback = '#7f2a1f') {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) {
    return fallback;
  }

  const shortHexMatch = raw.match(/^#([0-9a-f]{3})$/i);
  if (shortHexMatch) {
    return `#${shortHexMatch[1].split('').map((part) => `${part}${part}`).join('')}`.toLowerCase();
  }

  if (/^#([0-9a-f]{6})$/i.test(raw)) {
    return raw.toLowerCase();
  }

  const rgbMatch = raw.match(/^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})/i);
  if (rgbMatch) {
    return `#${rgbMatch
      .slice(1, 4)
      .map((channel) => Math.max(0, Math.min(255, Number(channel))).toString(16).padStart(2, '0'))
      .join('')}`;
  }

  return fallback;
}

function getCustomElementLabel(element, index) {
  if (element?.name) {
    return element.name;
  }

  const baseLabel = element?.type === 'text' ? 'نص حر' : element?.type === 'image' ? 'صورة حرة' : 'عنصر حر';
  return `${baseLabel} ${index + 1}`;
}

function normalizeDeviceOverrideValue(key, value) {
  if (value == null || value === '') {
    return undefined;
  }

  if (RESPONSIVE_NUMERIC_KEYS.has(key)) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return String(value);
}

function normalizeCustomElementDeviceOverrides(deviceOverrides = {}) {
  return DEVICE_MODES.reduce((accumulator, mode) => {
    const rawModeOverrides = deviceOverrides?.[mode];
    if (!rawModeOverrides || typeof rawModeOverrides !== 'object' || Array.isArray(rawModeOverrides)) {
      return accumulator;
    }

    const normalizedModeOverrides = Object.entries(rawModeOverrides).reduce((nextOverrides, [key, value]) => {
      if (!RESPONSIVE_ELEMENT_KEYS.has(key)) {
        return nextOverrides;
      }

      const normalizedValue = normalizeDeviceOverrideValue(key, value);
      if (normalizedValue !== undefined) {
        nextOverrides[key] = normalizedValue;
      }
      return nextOverrides;
    }, {});

    if (Object.keys(normalizedModeOverrides).length) {
      accumulator[mode] = normalizedModeOverrides;
    }

    return accumulator;
  }, {});
}

function resolveCustomElementForDevice(element, deviceMode) {
  if (!element || !deviceMode) {
    return element;
  }

  const modeOverrides = element.deviceOverrides?.[deviceMode];
  if (!modeOverrides) {
    return element;
  }

  return {
    ...element,
    ...modeOverrides,
    deviceOverrides: element.deviceOverrides,
  };
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
    deviceOverrides: normalizeCustomElementDeviceOverrides(element?.deviceOverrides),
  }));
}

function buildDefaultNativeElementOverride(seed = {}) {
  return {
    label: '',
    selector: '',
    kind: 'native',
    textContent: '',
    mediaUrl: '',
    cropX: 50,
    cropY: 50,
    x: 0,
    y: 0,
    width: '',
    height: '',
    scale: 1,
    rotation: 0,
    opacity: 1,
    zIndex: undefined,
    color: '',
    fontFamily: '',
    fontSize: '',
    fontWeight: '',
    fontStyle: '',
    lineHeight: '',
    letterSpacing: '',
    textAlign: '',
    textTransform: '',
    textDecoration: '',
    direction: '',
    textShadow: '',
    backgroundColor: '',
    borderRadius: '',
    borderWidth: '',
    borderColor: '',
    boxShadow: '',
    objectFit: '',
    hidden: false,
    locked: false,
    ...seed,
  };
}

function normalizeNativeElementOverrides(overrides) {
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) {
    return {};
  }

  return Object.entries(overrides).reduce((accumulator, [key, value]) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return accumulator;
    }

    accumulator[key] = buildDefaultNativeElementOverride({
      ...value,
      textContent: value.textContent == null ? '' : String(value.textContent),
      mediaUrl: value.mediaUrl ? String(value.mediaUrl) : '',
      cropX: toFiniteNumber(value.cropX, 50),
      cropY: toFiniteNumber(value.cropY, 50),
      x: toFiniteNumber(value.x, 0),
      y: toFiniteNumber(value.y, 0),
      width: value.width == null ? '' : String(value.width),
      height: value.height == null ? '' : String(value.height),
      scale: Math.max(0.1, toFiniteNumber(value.scale, 1)),
      rotation: toFiniteNumber(value.rotation, 0),
      opacity: Math.min(1, Math.max(0.05, toFiniteNumber(value.opacity, 1))),
      zIndex: Number.isFinite(Number(value.zIndex)) ? Number(value.zIndex) : undefined,
      color: value.color == null ? '' : String(value.color),
      fontFamily: value.fontFamily == null ? '' : String(value.fontFamily),
      fontSize: value.fontSize == null ? '' : String(value.fontSize),
      fontWeight: value.fontWeight == null ? '' : String(value.fontWeight),
      fontStyle: value.fontStyle == null ? '' : String(value.fontStyle),
      lineHeight: value.lineHeight == null ? '' : String(value.lineHeight),
      letterSpacing: value.letterSpacing == null ? '' : String(value.letterSpacing),
      textAlign: value.textAlign == null ? '' : String(value.textAlign),
      textTransform: value.textTransform == null ? '' : String(value.textTransform),
      textDecoration: value.textDecoration == null ? '' : String(value.textDecoration),
      direction: value.direction == null ? '' : String(value.direction),
      textShadow: value.textShadow == null ? '' : String(value.textShadow),
      backgroundColor: value.backgroundColor == null ? '' : String(value.backgroundColor),
      borderRadius: value.borderRadius == null ? '' : String(value.borderRadius),
      borderWidth: value.borderWidth == null ? '' : String(value.borderWidth),
      borderColor: value.borderColor == null ? '' : String(value.borderColor),
      boxShadow: value.boxShadow == null ? '' : String(value.boxShadow),
      objectFit: value.objectFit == null ? '' : String(value.objectFit),
      hidden: Boolean(value.hidden),
      locked: Boolean(value.locked),
    });
    return accumulator;
  }, {});
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
    deviceOverrides: {},
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

function getCustomElementClipboardPayload(element) {
  if (!element) {
    return null;
  }

  const elementType = element.type === 'image' ? 'image' : 'text';
  const base = {
    type: elementType,
    content: element.content == null ? '' : String(element.content),
    x: toFiniteNumber(element.x, 40),
    y: toFiniteNumber(element.y, 40),
    opacity: toFiniteNumber(element.opacity, 1),
    rotation: toFiniteNumber(element.rotation, 0),
  };

  if (elementType === 'text') {
    return {
      source: 'custom',
      label: element.name || getCustomElementLabel(element, 0),
      element: {
        ...base,
        fontSize: element.fontSize || '24px',
        color: element.color || '#1f2937',
        fontFamily: element.fontFamily || '',
      },
    };
  }

  return {
    source: 'custom',
    label: element.name || getCustomElementLabel(element, 0),
    element: {
      ...base,
      width: element.width || '150px',
      height: element.height || element.width || '150px',
      cropX: toFiniteNumber(element.cropX, 50),
      cropY: toFiniteNumber(element.cropY, 50),
    },
  };
}

function normalizeElementClipboardPayload(payload) {
  if (!payload || typeof payload !== 'object' || !payload.element || typeof payload.element !== 'object') {
    return null;
  }

  const rawElement = payload.element;
  const elementType = rawElement.type === 'image' ? 'image' : 'text';
  const normalizedElement = {
    ...buildDefaultCustomElement(elementType, {}),
    ...rawElement,
    type: elementType,
    content: rawElement.content == null ? '' : String(rawElement.content),
    x: toFiniteNumber(rawElement.x, 40),
    y: toFiniteNumber(rawElement.y, 40),
    opacity: Math.min(1, Math.max(0.05, toFiniteNumber(rawElement.opacity, 1))),
    rotation: toFiniteNumber(rawElement.rotation, 0),
    hidden: false,
    locked: false,
    deviceOverrides: {},
  };

  if (elementType === 'text') {
    normalizedElement.fontSize = rawElement.fontSize == null ? '24px' : String(rawElement.fontSize);
    normalizedElement.color = rawElement.color == null ? '#1f2937' : String(rawElement.color);
    normalizedElement.fontFamily = rawElement.fontFamily == null ? '' : String(rawElement.fontFamily);
    delete normalizedElement.width;
    delete normalizedElement.height;
    delete normalizedElement.cropX;
    delete normalizedElement.cropY;
  } else {
    normalizedElement.width = rawElement.width == null ? '150px' : String(rawElement.width);
    normalizedElement.height = rawElement.height == null ? normalizedElement.width : String(rawElement.height);
    normalizedElement.cropX = toFiniteNumber(rawElement.cropX, 50);
    normalizedElement.cropY = toFiniteNumber(rawElement.cropY, 50);
  }

  return {
    source: payload.source || 'custom',
    label: payload.label || (elementType === 'text' ? 'نص حر' : 'صورة حرة'),
    element: normalizedElement,
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

function pickStyleSubset(source, keys) {
  return keys.reduce((accumulator, key) => {
    if (source?.[key] !== undefined) {
      accumulator[key] = source[key];
    }
    return accumulator;
  }, {});
}

function getNativeElementStyleClipboardPayload(element) {
  if (!element) {
    return null;
  }

  const common = pickStyleSubset(element, NATIVE_SHARED_STYLE_KEYS);
  common.opacity = toFiniteNumber(element.opacity, 1);
  common.rotation = toFiniteNumber(element.rotation, 0);

  if (element.kind === 'text') {
    return {
      type: 'text',
      source: 'native',
      styles: {
        ...common,
        ...pickStyleSubset(element, NATIVE_TEXT_STYLE_KEYS),
      },
    };
  }

  if (element.kind === 'media') {
    return {
      type: 'image',
      source: 'native',
      styles: {
        ...common,
        ...pickStyleSubset(element, NATIVE_MEDIA_STYLE_KEYS),
      },
    };
  }

  return {
    type: 'native',
    source: 'native',
    styles: common,
  };
}

function normalizeDraftState(input) {
  const safe = input || {};
  const safeTextLocks =
    safe.uiConfig?.textLocks && typeof safe.uiConfig.textLocks === 'object' && !Array.isArray(safe.uiConfig.textLocks)
      ? safe.uiConfig.textLocks
      : {};

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
      textLocks: safeTextLocks,
    },
    devicePreview: {
      mode: 'mobile',
      width: 390,
      height: 844,
      ...(safe.devicePreview || {}),
    },
    customElements: normalizeCustomElements(safe.customElements || []),
    nativeElementOverrides: normalizeNativeElementOverrides(safe.nativeElementOverrides),
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
    },
    customElements: draft.customElements || [],
    nativeElementOverrides: draft.nativeElementOverrides || {},
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

function MediaCropModal({ request, onClose, onApply }) {
  const frameRef = useRef(null);
  const dragRef = useRef(null);
  const [localSrc, setLocalSrc] = useState(request?.initialSrc || request?.previewUrl || '');
  const [localCropX, setLocalCropX] = useState(toFiniteNumber(request?.cropX, 50));
  const [localCropY, setLocalCropY] = useState(toFiniteNumber(request?.cropY, 50));

  useEffect(() => {
    if (!request) {
      return;
    }

    setLocalSrc(request.initialSrc || request.previewUrl || '');
    setLocalCropX(toFiniteNumber(request.cropX, 50));
    setLocalCropY(toFiniteNumber(request.cropY, 50));
  }, [request]);

  if (!request) {
    return null;
  }

  const normalizedAspectRatio = Math.min(2.2, Math.max(0.35, toFiniteNumber(request.aspectRatio, 390 / 844)));
  const folder = request.scope === 'custom' ? 'studio-free-elements' : 'studio-native-elements';

  function handlePointerDown(event) {
    if (!localSrc) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startCropX: localCropX,
      startCropY: localCropY,
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    const nextCropX = Math.min(100, Math.max(0, dragRef.current.startCropX - ((dx / Math.max(rect.width, 1)) * 100)));
    const nextCropY = Math.min(100, Math.max(0, dragRef.current.startCropY - ((dy / Math.max(rect.height, 1)) * 100)));
    setLocalCropX(nextCropX);
    setLocalCropY(nextCropY);
  }

  function handlePointerEnd(event) {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }

  return (
    <>
      <div className="studio-crop-modal" onClick={onClose}>
        <div className="studio-crop-modal__dialog" onClick={(event) => event.stopPropagation()}>
          <div className="studio-crop-modal__header">
            <div>
              <strong>{'\u0642\u0635 \u0627\u0644\u0635\u0648\u0631\u0629'}</strong>
              <small>{request.label || '\u0639\u0646\u0635\u0631 \u0635\u0648\u0631\u064A'}</small>
            </div>
            <button type="button" className="mini-btn" onClick={onClose}>
              {'\u0625\u063A\u0644\u0627\u0642'}
            </button>
          </div>

          <div className="studio-crop-modal__toolbar">
            <MediaPicker
              label={'\u0627\u0633\u062A\u0628\u062F\u0627\u0644'}
              value={localSrc}
              accept="image"
              folder={folder}
              onChange={(url) => {
                if (url) {
                  setLocalSrc(url);
                }
              }}
            />
            <button
              type="button"
              className="mini-btn"
              onClick={() => {
                setLocalSrc(request.initialSrc || request.previewUrl || '');
                setLocalCropX(toFiniteNumber(request.cropX, 50));
                setLocalCropY(toFiniteNumber(request.cropY, 50));
              }}
            >
              {'\u0625\u0639\u0627\u062F\u0629'}
            </button>
          </div>

          <div className="studio-crop-modal__canvas">
            <div
              ref={frameRef}
              className="studio-crop-modal__frame"
              style={{ aspectRatio: String(normalizedAspectRatio) }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onLostPointerCapture={handlePointerEnd}
            >
              {localSrc ? (
                <>
                  <img
                    src={localSrc}
                    alt=""
                    draggable={false}
                    className="studio-crop-modal__image"
                    style={{ objectPosition: `${localCropX}% ${localCropY}%` }}
                  />
                  <span className="studio-crop-modal__handle studio-crop-modal__handle--tl" />
                  <span className="studio-crop-modal__handle studio-crop-modal__handle--tr" />
                  <span className="studio-crop-modal__handle studio-crop-modal__handle--bl" />
                  <span className="studio-crop-modal__handle studio-crop-modal__handle--br" />
                  <span className="studio-crop-modal__crosshair studio-crop-modal__crosshair--x" />
                  <span className="studio-crop-modal__crosshair studio-crop-modal__crosshair--y" />
                </>
              ) : (
                <div className="studio-crop-modal__empty">
                  {'\u0627\u062E\u062A\u0631 \u0635\u0648\u0631\u0629 \u0644\u0628\u062F\u0621 \u0627\u0644\u0642\u0635'}
                </div>
              )}
            </div>
          </div>

          <div className="studio-crop-modal__controls">
            <label className="studio-crop-modal__slider">
              <span>{'\u0642\u0635 \u0623\u0641\u0642\u064A'}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(localCropX)}
                onChange={(event) => setLocalCropX(toFiniteNumber(event.target.value, 50))}
              />
              <strong>{Math.round(localCropX)}%</strong>
            </label>
            <label className="studio-crop-modal__slider">
              <span>{'\u0642\u0635 \u0631\u0623\u0633\u064A'}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(localCropY)}
                onChange={(event) => setLocalCropY(toFiniteNumber(event.target.value, 50))}
              />
              <strong>{Math.round(localCropY)}%</strong>
            </label>
          </div>

          <p className="studio-crop-modal__hint">
            {'\u0627\u0633\u062D\u0628 \u0627\u0644\u0635\u0648\u0631\u0629 \u062F\u0627\u062E\u0644 \u0627\u0644\u0625\u0637\u0627\u0631 \u0623\u0648 \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u0632\u0644\u0642\u064A\u0646 \u0644\u0636\u0628\u0637 \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0642\u0635 \u0628\u062F\u0642\u0629.'}
          </p>

          <div className="studio-crop-modal__footer">
            <button type="button" className="mini-btn" onClick={onClose}>
              {'\u0625\u0644\u063A\u0627\u0621'}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => onApply({ src: localSrc, cropX: localCropX, cropY: localCropY })}
            >
              {'\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0642\u0635'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .studio-crop-modal {
          position: fixed;
          inset: 0;
          z-index: 80;
          background: rgba(15, 23, 42, 0.54);
          display: grid;
          place-items: center;
          padding: 20px;
        }
        .studio-crop-modal__dialog {
          width: min(960px, 100%);
          max-height: calc(100vh - 40px);
          overflow: auto;
          background: #fffefb;
          border-radius: 28px;
          padding: 22px;
          display: grid;
          gap: 18px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);
        }
        .studio-crop-modal__header,
        .studio-crop-modal__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .studio-crop-modal__header strong {
          display: block;
          color: #172554;
          font-size: 1.15rem;
        }
        .studio-crop-modal__header small {
          color: #6b7280;
        }
        .studio-crop-modal__toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .studio-crop-modal__canvas {
          display: grid;
          place-items: center;
        }
        .studio-crop-modal__frame {
          position: relative;
          width: min(100%, 540px);
          min-height: 260px;
          overflow: hidden;
          border-radius: 28px;
          border: 2px solid rgba(127, 42, 31, 0.18);
          background:
            linear-gradient(135deg, rgba(205, 169, 95, 0.08), rgba(255, 255, 255, 0.96)),
            repeating-linear-gradient(
              0deg,
              rgba(127, 42, 31, 0.04) 0,
              rgba(127, 42, 31, 0.04) 1px,
              transparent 1px,
              transparent 32px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(127, 42, 31, 0.04) 0,
              rgba(127, 42, 31, 0.04) 1px,
              transparent 1px,
              transparent 32px
            );
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.72), 0 18px 48px rgba(205, 169, 95, 0.16);
          touch-action: none;
          cursor: grab;
        }
        .studio-crop-modal__frame:active {
          cursor: grabbing;
        }
        .studio-crop-modal__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          user-select: none;
          pointer-events: none;
          display: block;
        }
        .studio-crop-modal__handle {
          position: absolute;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: #fff;
          border: 3px solid #7f2a1f;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18);
        }
        .studio-crop-modal__handle--tl { top: 12px; left: 12px; }
        .studio-crop-modal__handle--tr { top: 12px; right: 12px; }
        .studio-crop-modal__handle--bl { bottom: 12px; left: 12px; }
        .studio-crop-modal__handle--br { bottom: 12px; right: 12px; }
        .studio-crop-modal__crosshair {
          position: absolute;
          background: rgba(255,255,255,.72);
          box-shadow: 0 0 0 1px rgba(127, 42, 31, 0.12);
        }
        .studio-crop-modal__crosshair--x {
          top: 50%;
          left: 18px;
          right: 18px;
          height: 1px;
          transform: translateY(-50%);
        }
        .studio-crop-modal__crosshair--y {
          left: 50%;
          top: 18px;
          bottom: 18px;
          width: 1px;
          transform: translateX(-50%);
        }
        .studio-crop-modal__empty {
          height: 100%;
          display: grid;
          place-items: center;
          color: #7f2a1f;
          padding: 24px;
          text-align: center;
          font-weight: 700;
        }
        .studio-crop-modal__controls {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .studio-crop-modal__slider {
          display: grid;
          gap: 8px;
          padding: 14px;
          border-radius: 18px;
          border: 1px solid rgba(127, 42, 31, 0.12);
          background: #fff;
        }
        .studio-crop-modal__slider span {
          color: #7f2a1f;
          font-weight: 700;
        }
        .studio-crop-modal__slider input {
          width: 100%;
        }
        .studio-crop-modal__slider strong {
          color: #172554;
        }
        .studio-crop-modal__hint {
          margin: 0;
          color: #6b7280;
          font-size: .95rem;
          text-align: center;
        }
        @media (max-width: 720px) {
          .studio-crop-modal {
            padding: 12px;
          }
          .studio-crop-modal__dialog {
            padding: 16px;
            border-radius: 22px;
          }
          .studio-crop-modal__controls {
            grid-template-columns: 1fr;
          }
          .studio-crop-modal__frame {
            width: 100%;
            min-height: 220px;
          }
        }
      `}</style>
    </>
  );
}

const QUICK_MEDIA_KEYS = new Set([
  'venueImage',
  'images.hero',
  'images.background',
  'images.venue',
  'musicUrl',
]);

export default function StudioClient({ session, manifests, openings, inventory, existingInvitation = null, mode = 'studio' }) {
  const router = useRouter();
  const isInvitationEditing = mode === 'invitation' && Boolean(existingInvitation?.slug);
  const initialDraft = useMemo(() => normalizeDraftState(session.draft), [session.draft]);
  const [draft, setDraft] = useState(initialDraft);
  const [openSection, setOpenSection] = useState('basic');
  const [showAllSections, setShowAllSections] = useState(true);
  const [saveState, setSaveState] = useState('saved');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [previewReloadToken, setPreviewReloadToken] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewBridgeMessage, setPreviewBridgeMessage] = useState(null);
  const [canvasClickMenu, setCanvasClickMenu] = useState(null);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [selectedNativeElementId, setSelectedNativeElementId] = useState(null);
  const [selectedNativeElementLabel, setSelectedNativeElementLabel] = useState('');
  const [selectedNativeElementMeta, setSelectedNativeElementMeta] = useState(null);
  const [selectedNativeElementPreviewUrl, setSelectedNativeElementPreviewUrl] = useState('');
  const [selectedNativeElementBasePreviewUrl, setSelectedNativeElementBasePreviewUrl] = useState('');
  const [selectedNativeElementAspectRatio, setSelectedNativeElementAspectRatio] = useState(390 / 844);
  const [nativeElementCatalog, setNativeElementCatalog] = useState([]);
  const [selectedTemplateTextPath, setSelectedTemplateTextPath] = useState(null);
  const [selectedTemplateTextLabel, setSelectedTemplateTextLabel] = useState('');
  const [selectedTemplateTextValue, setSelectedTemplateTextValue] = useState('');
  const [templateTextCatalog, setTemplateTextCatalog] = useState([]);
  const [replaceMediaRequest, setReplaceMediaRequest] = useState(null);
  const [cropMediaRequest, setCropMediaRequest] = useState(null);
  const [styleClipboard, setStyleClipboard] = useState(null);
  const [elementClipboard, setElementClipboard] = useState(null);
  const [historyMeta, setHistoryMeta] = useState({ canUndo: false, canRedo: false, pastCount: 0, futureCount: 0 });
  const [activityLog, setActivityLog] = useState([]);
  const [versionTrail, setVersionTrail] = useState([]);
  const [fontLibrary, setFontLibrary] = useState(BUILTIN_FONT_LIBRARY);
  const [invitationStatus, setInvitationStatus] = useState(existingInvitation?.status || 'DRAFT');
  const autosaveRef = useRef(null);
  const lastSavedRef = useRef(JSON.stringify(initialDraft));
  const historyRef = useRef({ current: null, past: [], future: [] });
  const suppressHistoryRef = useRef(false);
  const activityCounterRef = useRef(0);
  const versionCounterRef = useRef(0);
  const phoneShellRef = useRef(null);
  const canvasMenuRef = useRef(null);

  const currentManifest = useMemo(
    () => manifests.find((item) => item.slug === draft.templateSlug) || manifests[0],
    [draft.templateSlug, manifests],
  );
  const currentDeviceMode = draft.devicePreview?.mode || 'mobile';
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
  const hasClipboardElement = Boolean(normalizeElementClipboardPayload(elementClipboard));

  function buildCanvasClickMenuState(payload) {
    const shellNode = phoneShellRef.current;
    const shellRect = shellNode?.getBoundingClientRect();
    const contentX = Math.max(0, Math.round(toFiniteNumber(payload?.x, 0)));
    const contentY = Math.max(0, Math.round(toFiniteNumber(payload?.y, 0)));
    const rawVisualX = toFiniteNumber(payload?.visualX, contentX);
    const rawVisualY = toFiniteNumber(payload?.visualY, contentY);
    const forceImage = Boolean(payload?.forceImage);
    const expanded = Boolean(payload?.expanded || forceImage);

    if (!shellRect) {
      return {
        x: contentX,
        y: contentY,
        visualX: rawVisualX,
        visualY: rawVisualY,
        token: Date.now(),
        forceImage,
        expanded,
      };
    }

    const menuWidth = expanded ? (hasClipboardElement ? 272 : 188) : 58;
    const menuHeight = expanded ? 56 : 58;
    const padding = 18;
    const visualX = clampValue(rawVisualX + 24, padding, Math.max(padding, shellRect.width - padding));
    const visualY = clampValue(rawVisualY - 16, padding, Math.max(padding, shellRect.height - padding));
    const positionedX = clampValue(
      visualX,
      padding + menuWidth / 2,
      Math.max(padding + menuWidth / 2, shellRect.width - padding - menuWidth / 2),
    );
    const positionedY = clampValue(
      visualY,
      padding + menuHeight / 2,
      Math.max(padding + menuHeight / 2, shellRect.height - padding - menuHeight / 2),
    );

    return {
      x: contentX,
      y: contentY,
      visualX: positionedX,
      visualY: positionedY,
      token: Date.now(),
      forceImage,
      expanded,
    };
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 1180) {
      setEditorOpen(true);
    }
  }, []);

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
    let ignore = false;

    async function loadFontLibrary() {
      try {
        const response = await fetch('/api/public/font-library', { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'تعذر تحميل مكتبة الخطوط.');
        }

        if (!ignore && Array.isArray(payload.data?.all) && payload.data.all.length) {
          setFontLibrary(payload.data.all);
        }
      } catch (_error) {
        if (!ignore) {
          setFontLibrary(BUILTIN_FONT_LIBRARY);
        }
      }
    }

    void loadFontLibrary();

    return () => {
      ignore = true;
    };
  }, []);
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

  useEffect(() => {
    setPreviewBridgeMessage({
      type: 'FARHA_RENDER_CONFIG',
      version: '1.0.0',
      manifest: currentManifest,
      renderConfig,
      token: `render-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    });
  }, [currentManifest, renderConfig]);

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
  const editableFieldMap = useMemo(
    () => new Map(currentManifest.editableFields.map((field) => [field.key, field])),
    [currentManifest],
  );
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
  const normalizedCustomElements = useMemo(
    () => normalizeCustomElements(draft.customElements || []),
    [draft.customElements],
  );
  const responsiveCustomElements = useMemo(
    () => normalizedCustomElements.map((element) => resolveCustomElementForDevice(element, currentDeviceMode)),
    [currentDeviceMode, normalizedCustomElements],
  );
  const orderedLayerElements = useMemo(
    () => [...responsiveCustomElements].sort((left, right) => (left.zIndex || 0) - (right.zIndex || 0)),
    [responsiveCustomElements],
  );
  const layerElementsForPanel = useMemo(
    () => [...orderedLayerElements].reverse(),
    [orderedLayerElements],
  );
  const selectedCustomElementBase = useMemo(
    () => normalizedCustomElements.find((item) => item.id === selectedElementId) || null,
    [normalizedCustomElements, selectedElementId],
  );
  const selectedCustomElement = useMemo(
    () => orderedLayerElements.find((item) => item.id === selectedElementId) || null,
    [orderedLayerElements, selectedElementId],
  );
  const selectedCustomElementDeviceOverride = useMemo(() => {
    const overrides = selectedCustomElementBase?.deviceOverrides;
    return overrides && typeof overrides === 'object' ? (overrides[currentDeviceMode] || null) : null;
  }, [currentDeviceMode, selectedCustomElementBase]);
  const nativeElementOverrides = useMemo(
    () => normalizeNativeElementOverrides(draft.nativeElementOverrides),
    [draft.nativeElementOverrides],
  );
  const selectedNativeElement = useMemo(() => {
    if (!selectedNativeElementId) {
      return null;
    }

    const currentOverride = nativeElementOverrides[selectedNativeElementId] || {};
    const currentMeta =
      selectedNativeElementMeta && selectedNativeElementMeta.id === selectedNativeElementId
        ? selectedNativeElementMeta
        : {};
    return buildDefaultNativeElementOverride({
      ...currentMeta,
      ...currentOverride,
      label: currentOverride.label || currentMeta.label || selectedNativeElementLabel || selectedNativeElementId,
      selector: currentOverride.selector || currentMeta.selector || '',
      kind: currentOverride.kind || currentMeta.kind || 'native',
    });
  }, [nativeElementOverrides, selectedNativeElementId, selectedNativeElementLabel, selectedNativeElementMeta]);
  const templateTextLocks = useMemo(() => {
    const value = draft.uiConfig?.textLocks;
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }, [draft.uiConfig?.textLocks]);
  const fallbackTemplateTextCatalog = useMemo(() => {
    const bindings = currentManifest.runtimeBindings?.fieldBindings || {};
    return Object.entries(bindings)
      .filter(([, binding]) => binding?.method === 'text')
      .map(([path, binding]) => ({
        path,
        label: editableFieldMap.get(path)?.labelAr || path,
        selector: binding?.selector || path,
        locked: Boolean(templateTextLocks[path]),
        text: draft.contentConfig?.[path] == null ? '' : String(draft.contentConfig[path]),
      }));
  }, [currentManifest, draft.contentConfig, editableFieldMap, templateTextLocks]);
  const availableTemplateTexts = useMemo(
    () => (templateTextCatalog.length ? templateTextCatalog : fallbackTemplateTextCatalog),
    [fallbackTemplateTextCatalog, templateTextCatalog],
  );
  const availableNativeElements = useMemo(
    () => nativeElementCatalog.filter((item) => item && item.id),
    [nativeElementCatalog],
  );
  const selectedTemplateText = useMemo(() => {
    if (!selectedTemplateTextPath) {
      return null;
    }

    const field = editableFieldMap.get(selectedTemplateTextPath);
    const textOverrides = draft.textOverrides || {};
    const resolvedText = Object.prototype.hasOwnProperty.call(textOverrides, selectedTemplateTextPath)
      ? textOverrides[selectedTemplateTextPath]
      : (draft.contentConfig?.[selectedTemplateTextPath] ?? selectedTemplateTextValue ?? '');

    return {
      path: selectedTemplateTextPath,
      label: field?.labelAr || selectedTemplateTextLabel || selectedTemplateTextPath,
      text: resolvedText == null ? '' : String(resolvedText),
      locked: Boolean(templateTextLocks[selectedTemplateTextPath]),
    };
  }, [draft.contentConfig, draft.textOverrides, editableFieldMap, selectedTemplateTextLabel, selectedTemplateTextPath, selectedTemplateTextValue, templateTextLocks]);
  const selectedTemplateTextStyleTarget = useMemo(() => {
    if (!selectedTemplateTextPath || !selectedNativeElement || selectedNativeElement.kind !== 'text') {
      return null;
    }

    if (selectedNativeElement.textPath && selectedNativeElement.textPath !== selectedTemplateTextPath) {
      return null;
    }

    return selectedNativeElement;
  }, [selectedNativeElement, selectedTemplateTextPath]);

  function recordActivity(title, detail = '') {
    const entry = {
      id: `activity-${Date.now()}-${activityCounterRef.current}`,
      title,
      detail,
      time: new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      version: historyRef.current.past.length + 1,
    };
    activityCounterRef.current += 1;
    setActivityLog((current) => [entry, ...current].slice(0, 18));
  }

  function appendVersionSnapshot(snapshot, label = 'نسخة تلقائية') {
    const entry = {
      id: `version-${Date.now()}-${versionCounterRef.current}`,
      snapshot,
      label,
      time: new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      version: versionCounterRef.current + 1,
      isCurrent: true,
    };
    versionCounterRef.current += 1;
    setVersionTrail((current) => {
      if (current[0]?.snapshot === snapshot) {
        return current;
      }

      return [
        entry,
        ...current.map((item) => ({ ...item, isCurrent: false })),
      ].slice(0, 12);
    });
  }

  function syncHistoryMeta() {
    setHistoryMeta({
      canUndo: historyRef.current.past.length > 0,
      canRedo: historyRef.current.future.length > 0,
      pastCount: historyRef.current.past.length,
      futureCount: historyRef.current.future.length,
    });
  }

  function getTextFieldLabel(path, fallbackLabel = '') {
    return editableFieldMap.get(path)?.labelAr || fallbackLabel || path;
  }

  function setTemplateTextLock(path, locked) {
    if (!path) {
      return;
    }

    setDraft((current) => {
      const nextLocks = {
        ...((current.uiConfig?.textLocks && typeof current.uiConfig.textLocks === 'object') ? current.uiConfig.textLocks : {}),
      };
      if (locked) {
        nextLocks[path] = true;
      } else {
        delete nextLocks[path];
      }

      return {
        ...current,
        uiConfig: {
          ...(current.uiConfig || {}),
          textLocks: nextLocks,
        },
      };
    });
    setNotice(locked ? `تم قفل النص: ${getTextFieldLabel(path)}` : `تم فتح النص: ${getTextFieldLabel(path)}`);
    recordActivity(locked ? 'قفل نص من القالب' : 'فتح نص من القالب', getTextFieldLabel(path));
  }

  function resetTemplateText(path) {
    if (!path) {
      return;
    }

    setDraft((current) => {
      const nextOverrides = { ...(current.textOverrides || {}) };
      const nextLocks = {
        ...((current.uiConfig?.textLocks && typeof current.uiConfig.textLocks === 'object') ? current.uiConfig.textLocks : {}),
      };
      delete nextOverrides[path];
      delete nextLocks[path];

      return {
        ...current,
        textOverrides: nextOverrides,
        uiConfig: {
          ...(current.uiConfig || {}),
          textLocks: nextLocks,
        },
      };
    });
    setNotice(`تمت إعادة النص إلى القيمة الأصلية: ${getTextFieldLabel(path)}`);
    recordActivity('إعادة ضبط نص من القالب', getTextFieldLabel(path));
  }

  function restoreVersionSnapshot(snapshot, label) {
    const currentSerialized = historyRef.current.current;
    if (!snapshot || !currentSerialized || snapshot === currentSerialized) {
      return;
    }

    suppressHistoryRef.current = true;
    historyRef.current.past.push(currentSerialized);
    historyRef.current.past = historyRef.current.past.slice(-50);
    historyRef.current.future = [];
    historyRef.current.current = snapshot;
    syncHistoryMeta();
    setDraft(normalizeDraftState(JSON.parse(snapshot)));
    setNotice(`تمت استعادة النسخة: ${label}`);
    recordActivity('استعادة نسخة', label);
    appendVersionSnapshot(snapshot, `استعادة ${label}`);
  }

  function updateTemplateTextOverride(path, value) {
    if (!path) {
      return;
    }

    setSelectedTemplateTextValue(value);
    setDraft((current) => ({
      ...current,
      textOverrides: {
        ...(current.textOverrides || {}),
        [path]: value,
      },
    }));
    sendPreviewBridgeMessage({
      type: 'FARHA_TEXT_OVERRIDE',
      payload: {
        path,
        text: value,
        label: getTextFieldLabel(path),
        preserveNativeSelection: true,
      },
    });
  }

  function resetTemplate() {
    const preferredOpening =
      availableOpenings.find(
        (opening) =>
          opening.slug === 'native-template'
          && currentManifest.openingCompatibility?.includes(opening.slug),
      )
      || availableOpenings.find((opening) => currentManifest.openingCompatibility?.includes(opening.slug))
      || availableOpenings[0]
      || currentOpening;

    const defaults = cloneValue(currentManifest.defaultValues || {});
    const nextContentConfig = {
      ...defaults,
      galleryImages: arrayValue(defaults.galleryImages),
      program: arrayValue(defaults.program),
      notes: arrayValue(defaults.notes),
    };

    currentManifest.editableFields.forEach((field) => {
      nextContentConfig[field.key] = defaultFieldValueFromManifest(currentManifest, field.key, field.type);
      if (isTranslatableField(field)) {
        const englishKey = getEnglishKey(field.key);
        nextContentConfig[englishKey] = defaultFieldValueFromManifest(currentManifest, englishKey, field.type);
      }
    });

    setDraft((current) => ({
      ...current,
      openingSlug: preferredOpening?.slug || 'native-template',
      contentConfig: nextContentConfig,
      themeConfig: cloneValue(currentManifest.defaultValues?.theme || {}),
      sectionConfig: cloneValue(currentManifest.defaultValues?.sections || {}),
      openingConfig: {
        allowSkip: true,
        ...(preferredOpening?.defaultConfig || {}),
      },
      customElements: [],
      nativeElementOverrides: {},
      textOverrides: {},
      uiConfig: {
        ...(current.uiConfig || {}),
        textLocks: {},
      },
    }));
    setSelectedElementId(null);
    setSelectedNativeElementId(null);
    setSelectedNativeElementLabel('');
    setSelectedTemplateTextPath(null);
    setSelectedTemplateTextLabel('');
    setPreviewReloadToken((value) => value + 1);
    setNotice('تمت إعادة القالب بالكامل إلى حالته الأصلية.');
    recordActivity('Reset Template', currentManifest.nameAr);
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
    recordActivity(direction === 'undo' ? 'Undo' : 'Redo', direction === 'undo' ? 'الرجوع إلى النسخة السابقة' : 'استعادة النسخة التالية');
    appendVersionSnapshot(serializedSnapshot, direction === 'undo' ? 'نسخة بعد التراجع' : 'نسخة بعد الإعادة');
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

  function sendPreviewBridgeMessage(message) {
    if (!message || typeof message !== 'object') {
      return;
    }

    setPreviewBridgeMessage({
      ...message,
      token: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    });
  }

  function requestStudioCatalogs() {
    sendPreviewBridgeMessage({
      type: 'FARHA_REQUEST_STUDIO_CATALOGS',
      payload: {
        requestedAt: Date.now(),
      },
    });
  }

  useEffect(() => {
    sendPreviewBridgeMessage({
      type: 'FARHA_EDITOR_ADD_MODE',
      payload: {
        mode: draft.ui?.addCustomElementMode || '',
      },
    });
  }, [draft.ui?.addCustomElementMode]);

  useEffect(() => {
    if (!canvasClickMenu || typeof document === 'undefined') {
      return undefined;
    }

    function handlePointerDown(event) {
      const menuNode = canvasMenuRef.current;
      if (!menuNode) {
        setCanvasClickMenu(null);
        return;
      }

      const target = event.target;
      if (target instanceof Node && menuNode.contains(target)) {
        return;
      }

      setCanvasClickMenu(null);
    }

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [canvasClickMenu]);

  function requestNativeElementSelection(item) {
    if (!item?.id) {
      return;
    }

    setSelectedElementId(null);
    setSelectedTemplateTextPath(null);
    setSelectedTemplateTextLabel('');
    setSelectedTemplateTextValue('');
    setSelectedNativeElementId(item.id);
    setSelectedNativeElementLabel(item.label || '');
    setSelectedNativeElementMeta(item);
    setSelectedNativeElementPreviewUrl(item.previewUrl || '');
    setSelectedNativeElementBasePreviewUrl(item.basePreviewUrl || item.previewUrl || '');
    setSelectedNativeElementAspectRatio(toFiniteNumber(item.aspectRatio, 390 / 844));
    setOpenSection('template-elements');
    setEditorOpen(true);
    sendPreviewBridgeMessage({
      type: 'FARHA_SELECT_NATIVE_ELEMENT',
      payload: {
        id: item.id,
      },
    });
  }

  function requestTemplateTextSelection(item) {
    if (!item?.path) {
      return;
    }

    setSelectedElementId(null);
    setSelectedNativeElementId(null);
    setSelectedNativeElementLabel('');
    setSelectedNativeElementMeta(null);
    setSelectedNativeElementPreviewUrl('');
    setSelectedNativeElementBasePreviewUrl('');
    setSelectedNativeElementAspectRatio(390 / 844);
    setSelectedTemplateTextPath(item.path);
    setSelectedTemplateTextLabel(item.label || item.path);
    setSelectedTemplateTextValue(item.text || '');
    setOpenSection('template-text');
    setEditorOpen(true);
    sendPreviewBridgeMessage({
      type: 'FARHA_SELECT_TEMPLATE_TEXT',
      payload: {
        path: item.path,
      },
    });
  }

  const activeSections = useMemo(() => {
    const fieldSections = Object.keys(groupedFields).filter((key) => SECTION_META[key]);
    return Array.from(new Set([
      ...fieldSections,
      'custom-elements',
      'layers',
      'template-elements',
      'template-text',
      'history',
      'opening',
      'design',
      'sections',
      'advanced',
    ]));
  }, [groupedFields]);

  function buildElementPatchWithResponsiveSupport(element, updates, options = {}) {
    const nextUpdates = typeof updates === 'function' ? updates(element) : updates;
    if (!nextUpdates || typeof nextUpdates !== 'object') {
      return element;
    }

    const nextElement = { ...element };
    const nextDeviceMode = options.deviceMode || currentDeviceMode;
    const nextModeOverrides = {
      ...((element.deviceOverrides && typeof element.deviceOverrides === 'object') ? element.deviceOverrides : {}),
    };
    const scopedOverrides = {
      ...((nextModeOverrides[nextDeviceMode] && typeof nextModeOverrides[nextDeviceMode] === 'object') ? nextModeOverrides[nextDeviceMode] : {}),
    };

    Object.entries(nextUpdates).forEach(([key, rawValue]) => {
      if (RESPONSIVE_ELEMENT_KEYS.has(key) && !options.forceGlobal) {
        const normalizedValue = normalizeDeviceOverrideValue(key, rawValue);
        const baseValue = normalizeDeviceOverrideValue(key, nextElement[key]);

        if (normalizedValue === undefined || normalizedValue === baseValue) {
          delete scopedOverrides[key];
        } else {
          scopedOverrides[key] = normalizedValue;
        }
        return;
      }

      nextElement[key] = rawValue;
    });

    if (Object.keys(scopedOverrides).length) {
      nextModeOverrides[nextDeviceMode] = scopedOverrides;
    } else {
      delete nextModeOverrides[nextDeviceMode];
    }

    nextElement.deviceOverrides = normalizeCustomElementDeviceOverrides(nextModeOverrides);
    return nextElement;
  }

  function updateCustomElements(updater) {
    let nextCustomElements = null;
    setDraft((current) => {
      nextCustomElements = normalizeCustomElements(updater(current.customElements || []));
      return {
        ...current,
        customElements: nextCustomElements,
      };
    });

    if (nextCustomElements) {
      sendPreviewBridgeMessage({
        type: 'FARHA_CUSTOM_ELEMENTS_SYNC',
        payload: {
          elements: nextCustomElements,
        },
      });
    }
  }

  function patchCustomElement(id, updates, options = {}) {
    updateCustomElements((elements) =>
      elements.map((element) =>
        element.id === id
          ? buildElementPatchWithResponsiveSupport(element, updates, options)
          : element,
      ),
    );
  }

  function patchNativeElement(id, updates) {
    if (!id) {
      return;
    }

    let bridgePayload = null;
    setDraft((current) => {
      const currentOverrides = normalizeNativeElementOverrides(current.nativeElementOverrides);
      const fallbackMeta = id === selectedNativeElementId
        ? {
            label: selectedNativeElementLabel || selectedNativeElement?.label || '',
            selector: selectedNativeElement?.selector || '',
            kind: selectedNativeElement?.kind || 'native',
            textPath: selectedNativeElement?.textPath || '',
          }
        : {};
      const currentValue = buildDefaultNativeElementOverride({
        ...fallbackMeta,
        ...(currentOverrides[id] || {}),
      });
      const nextUpdates = typeof updates === 'function' ? updates(currentValue) : updates;
      if (!nextUpdates || typeof nextUpdates !== 'object') {
        return current;
      }

      const nextOverride = buildDefaultNativeElementOverride({
        ...currentValue,
        ...nextUpdates,
      });
      bridgePayload = {
        id,
        label: nextOverride.label || fallbackMeta.label || id,
        selector: nextOverride.selector || fallbackMeta.selector || '',
        kind: nextOverride.kind || fallbackMeta.kind || 'native',
        updates: nextUpdates,
      };

      const nextTextPath = nextOverride.textPath || fallbackMeta.textPath || '';
      const nextTextStylePatch = nextTextPath
        ? Object.fromEntries(
          Object.entries(nextUpdates).filter(([key, value]) => (
            NATIVE_TEXT_STYLE_OVERRIDE_KEYS.includes(key)
            && value != null
          )),
        )
        : null;

      return {
        ...current,
        uiConfig:
          nextTextPath && nextTextStylePatch && Object.keys(nextTextStylePatch).length
            ? {
                ...(current.uiConfig || {}),
                textStyleOverrides: {
                  ...((current.uiConfig?.textStyleOverrides && typeof current.uiConfig.textStyleOverrides === 'object')
                    ? current.uiConfig.textStyleOverrides
                    : {}),
                  [nextTextPath]: {
                    ...((((current.uiConfig?.textStyleOverrides && typeof current.uiConfig.textStyleOverrides === 'object')
                      ? current.uiConfig.textStyleOverrides[nextTextPath]
                      : null) || {})),
                    ...nextTextStylePatch,
                  },
                },
              }
            : current.uiConfig,
        nativeElementOverrides: {
          ...currentOverrides,
          [id]: nextOverride,
        },
      };
    });

    if (bridgePayload) {
      sendPreviewBridgeMessage({
        type: 'FARHA_NATIVE_ELEMENT_UPDATE',
        payload: bridgePayload,
      });
    }
  }

  function setNativeElementNumber(id, key, value, fallback = 0) {
    const numeric = Number(value);
    patchNativeElement(id, {
      [key]: Number.isFinite(numeric) ? numeric : fallback,
    });
  }

  function setNativeElementDimension(id, key, value, fallback = '') {
    const normalizedValue = String(value || '').trim();
    if (!normalizedValue) {
      patchNativeElement(id, { [key]: fallback });
      return;
    }

    if (/^\d+(\.\d+)?$/.test(normalizedValue)) {
      patchNativeElement(id, { [key]: `${normalizedValue}px` });
      return;
    }

    patchNativeElement(id, { [key]: normalizedValue });
  }

  function openCropEditor(request) {
    if (!request?.id) {
      return;
    }

    setCropMediaRequest({
      ...request,
      initialSrc: request.initialSrc || request.previewUrl || '',
      previewUrl: request.previewUrl || request.initialSrc || '',
      basePreviewUrl: request.basePreviewUrl || request.previewUrl || request.initialSrc || '',
      cropX: toFiniteNumber(request.cropX, 50),
      cropY: toFiniteNumber(request.cropY, 50),
      aspectRatio: toFiniteNumber(request.aspectRatio, 390 / 844),
      token: Date.now(),
    });
    setEditorOpen(true);
  }

  function openSelectedCustomCropEditor() {
    if (!selectedCustomElement || selectedCustomElement.type !== 'image') {
      return;
    }

    openCropEditor({
      scope: 'custom',
      id: selectedCustomElement.id,
      label: selectedCustomElement.name || '\u0635\u0648\u0631\u0629 \u062D\u0631\u0629',
      initialSrc: selectedCustomElement.content || '',
      previewUrl: selectedCustomElement.content || '',
      basePreviewUrl: selectedCustomElement.content || '',
      cropX: toFiniteNumber(selectedCustomElement.cropX, 50),
      cropY: toFiniteNumber(selectedCustomElement.cropY, 50),
      aspectRatio: Math.max(0.35, parseFloat(selectedCustomElement.width || '150') / Math.max(parseFloat(selectedCustomElement.height || '150'), 1)),
    });
  }

  function openSelectedNativeCropEditor() {
    if (!selectedNativeElementId || !selectedNativeElement) {
      return;
    }

    const persistedUrl = selectedNativeElement.mediaUrl ? String(selectedNativeElement.mediaUrl).trim() : '';
    const basePreviewUrl = selectedNativeElementBasePreviewUrl || selectedNativeElementPreviewUrl || persistedUrl;
    const previewUrl = persistedUrl || selectedNativeElementPreviewUrl || basePreviewUrl;

    openCropEditor({
      scope: 'native',
      id: selectedNativeElementId,
      label: selectedNativeElement.label || selectedNativeElementLabel || selectedNativeElementId,
      initialSrc: previewUrl,
      previewUrl,
      basePreviewUrl,
      persistedUrl,
      cropX: toFiniteNumber(selectedNativeElement.cropX, 50),
      cropY: toFiniteNumber(selectedNativeElement.cropY, 50),
      aspectRatio: toFiniteNumber(selectedNativeElementAspectRatio, 390 / 844),
    });
  }

  function applyMediaReplacement(url) {
    if (!url || !replaceMediaRequest?.id) {
      setReplaceMediaRequest(null);
      return;
    }

    if (replaceMediaRequest.scope === 'custom') {
      patchCustomElement(replaceMediaRequest.id, { content: url });
      setSelectedElementId(replaceMediaRequest.id);
      setSelectedNativeElementId(null);
      setSelectedNativeElementLabel('');
      setNotice(`تم استبدال صورة العنصر: ${replaceMediaRequest.label || 'صورة حرة'}`);
      recordActivity('استبدال صورة عنصر حر', replaceMediaRequest.label || replaceMediaRequest.id);
      setOpenSection('layers');
    } else if (replaceMediaRequest.scope === 'native') {
      patchNativeElement(replaceMediaRequest.id, { mediaUrl: url, hidden: false });
      setSelectedNativeElementId(replaceMediaRequest.id);
      setSelectedNativeElementLabel(replaceMediaRequest.label || '');
      setSelectedNativeElementPreviewUrl(url);
      setSelectedElementId(null);
      setNotice(`تم استبدال صورة العنصر الأصلي: ${replaceMediaRequest.label || 'عنصر صوري'}`);
      recordActivity('استبدال صورة عنصر قالب', replaceMediaRequest.label || replaceMediaRequest.id);
      setOpenSection('template-elements');
    }

    setReplaceMediaRequest(null);
  }

  function applyMediaCropChanges(payload) {
    if (!cropMediaRequest?.id) {
      setCropMediaRequest(null);
      return;
    }

    const nextCropX = toFiniteNumber(payload?.cropX, 50);
    const nextCropY = toFiniteNumber(payload?.cropY, 50);
    const nextSrc = String(payload?.src || '').trim();

    if (cropMediaRequest.scope === 'custom') {
      patchCustomElement(cropMediaRequest.id, {
        content: nextSrc,
        cropX: nextCropX,
        cropY: nextCropY,
      });
      setSelectedElementId(cropMediaRequest.id);
      setSelectedNativeElementId(null);
      setSelectedNativeElementLabel('');
      setNotice(`\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0642\u0635 \u0627\u0644\u0635\u0648\u0631\u0629: ${cropMediaRequest.label || '\u0635\u0648\u0631\u0629 \u062D\u0631\u0629'}`);
      recordActivity('\u062A\u062D\u062F\u064A\u062B \u0642\u0635 \u0635\u0648\u0631\u0629 \u062D\u0631\u0629', cropMediaRequest.label || cropMediaRequest.id);
      setOpenSection('layers');
    } else {
      const basePreviewUrl = String(cropMediaRequest.basePreviewUrl || '').trim();
      const nextMediaUrl = basePreviewUrl && nextSrc === basePreviewUrl ? '' : nextSrc;

      patchNativeElement(cropMediaRequest.id, {
        mediaUrl: nextMediaUrl,
        cropX: nextCropX,
        cropY: nextCropY,
        hidden: false,
      });
      setSelectedNativeElementId(cropMediaRequest.id);
      setSelectedNativeElementLabel(cropMediaRequest.label || '');
      setSelectedElementId(null);
      setSelectedNativeElementPreviewUrl(nextSrc || basePreviewUrl);
      if (basePreviewUrl) {
        setSelectedNativeElementBasePreviewUrl(basePreviewUrl);
      }
      setNotice(`\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0642\u0635 \u0639\u0646\u0635\u0631 \u0627\u0644\u0642\u0627\u0644\u0628: ${cropMediaRequest.label || '\u0639\u0646\u0635\u0631 \u0635\u0648\u0631\u064A'}`);
      recordActivity('\u062A\u062D\u062F\u064A\u062B \u0642\u0635 \u0639\u0646\u0635\u0631 \u0642\u0627\u0644\u0628', cropMediaRequest.label || cropMediaRequest.id);
      setOpenSection('template-elements');
    }

    setCropMediaRequest(null);
  }

  function openSelectedNativeReplacePicker() {
    if (!selectedNativeElementId || !selectedNativeElement) {
      return;
    }

    setSelectedElementId(null);
    setSelectedNativeElementId(selectedNativeElementId);
    setSelectedNativeElementLabel(selectedNativeElement.label || selectedNativeElementLabel || '');
    setOpenSection('template-elements');
    setEditorOpen(true);
    setReplaceMediaRequest({
      scope: 'native',
      id: selectedNativeElementId,
      label: selectedNativeElement.label || selectedNativeElementLabel || selectedNativeElementId,
      token: Date.now(),
    });
  }

  function removeSelectedNativeElement() {
    if (!selectedNativeElementId || !selectedNativeElement) {
      return;
    }

    patchNativeElement(selectedNativeElementId, { hidden: true });
    setNotice(`تم إخفاء عنصر القالب: ${selectedNativeElement.label || selectedNativeElementId}`);
    recordActivity('إخفاء عنصر قالب', selectedNativeElement.label || selectedNativeElementId || 'عنصر قالب');
  }

  function resetSelectedNativeElement() {
    if (!selectedNativeElementId) {
      return;
    }

    setDraft((current) => {
      const nextOverrides = {
        ...normalizeNativeElementOverrides(current.nativeElementOverrides),
      };
      delete nextOverrides[selectedNativeElementId];
      return {
        ...current,
        nativeElementOverrides: nextOverrides,
      };
    });
    setSelectedNativeElementPreviewUrl(selectedNativeElementBasePreviewUrl || '');
    setNotice(`تمت إعادة ضبط عنصر القالب: ${selectedNativeElement?.label || selectedNativeElementLabel || selectedNativeElementId}`);
    recordActivity('إعادة ضبط عنصر قالب', selectedNativeElement?.label || selectedNativeElementLabel || selectedNativeElementId);
  }

  function resetNativeElementById(id, label = '') {
    if (!id) {
      return;
    }

    setDraft((current) => {
      const nextOverrides = {
        ...normalizeNativeElementOverrides(current.nativeElementOverrides),
      };
      delete nextOverrides[id];
      return {
        ...current,
        nativeElementOverrides: nextOverrides,
      };
    });
    if (id === selectedNativeElementId) {
      setSelectedNativeElementPreviewUrl(selectedNativeElementBasePreviewUrl || '');
    }
    const resolvedLabel =
      label
      || (id === selectedNativeElementId ? selectedNativeElement?.label || selectedNativeElementLabel || id : id);
    setNotice(`تمت إعادة ضبط عنصر القالب: ${resolvedLabel}`);
    recordActivity('إعادة ضبط عنصر قالب', resolvedLabel);
  }

  function clearDeviceOverride(id, deviceMode = currentDeviceMode) {
    const label = DEVICE_PRESETS[deviceMode]?.label || deviceMode;
    updateCustomElements((elements) =>
      elements.map((element) => {
        if (element.id !== id) {
          return element;
        }

        const nextDeviceOverrides = {
          ...((element.deviceOverrides && typeof element.deviceOverrides === 'object') ? element.deviceOverrides : {}),
        };
        delete nextDeviceOverrides[deviceMode];
        return {
          ...element,
          deviceOverrides: normalizeCustomElementDeviceOverrides(nextDeviceOverrides),
        };
      }),
    );
    setNotice(`تم حذف تخصيص ${label} من العنصر المحدد.`);
    recordActivity('حذف تخصيص جهاز', label);
  }

  function removeCustomElement(id) {
    const removedElement = orderedLayerElements.find((element) => element.id === id);
    updateCustomElements((elements) => elements.filter((element) => element.id !== id));
    setSelectedElementId((current) => (current === id ? null : current));
    if (removedElement) {
      setNotice(`تم حذف العنصر: ${removedElement.name}`);
      recordActivity('حذف عنصر حر', removedElement.name);
    }
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
    recordActivity(direction > 0 ? 'رفع طبقة' : 'خفض طبقة', orderedLayerElements.find((element) => element.id === id)?.name || 'عنصر حر');
  }

  function duplicateCustomElement(id) {
    const source = normalizedCustomElements.find((element) => element.id === id);
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
    setSelectedNativeElementId(null);
    setSelectedNativeElementLabel('');
    setOpenSection('layers');
    setSelectedTemplateTextPath(null);
    setSelectedTemplateTextLabel('');
    recordActivity('نسخ عنصر حر', source.name || 'عنصر حر');
  }

  function setElementClipboardPayload(payload, options = {}) {
    const normalized = normalizeElementClipboardPayload(payload);
    const fallbackLabel = options.label || payload?.label || 'العنصر';
    if (!normalized) {
      if (!options.silent) {
        setNotice(options.errorNotice || `لا يمكن نسخ ${fallbackLabel} كعنصر حر بصري الآن.`);
        recordActivity('تعذر نسخ عنصر', fallbackLabel);
      }
      return null;
    }

    setElementClipboard(normalized);
    if (!options.silent) {
      setNotice(options.notice || `تم نسخ العنصر: ${normalized.label}`);
      recordActivity(options.activity || 'نسخ عنصر', normalized.label);
    }
    return normalized;
  }

  function pasteElementClipboardAt(position = null, clipboardSource = elementClipboard, options = {}) {
    const normalized = normalizeElementClipboardPayload(clipboardSource);
    if (!normalized) {
      if (!options.silent) {
        setNotice('لا يوجد عنصر منسوخ للصقه داخل القالب.');
      }
      return null;
    }

    const nextId = `custom-${Math.random().toString(36).slice(2, 11)}`;
    const nextLabelBase = String(options.label || normalized.label || (normalized.element.type === 'text' ? 'نص حر' : 'صورة حرة')).trim();
    const fallbackX = Math.max(12, Math.round(toFiniteNumber(normalized.element.x, 40) + 18));
    const fallbackY = Math.max(12, Math.round(toFiniteNumber(normalized.element.y, 40) + 18));
    const resolvedPosition = {
      x: Math.max(12, Math.round(position?.x ?? fallbackX)),
      y: Math.max(12, Math.round(position?.y ?? fallbackY)),
    };

    setDraft((current) => {
      const elements = current.customElements || [];
      const nextElement = {
        ...buildDefaultCustomElement(normalized.element.type, {}),
        ...cloneValue(normalized.element),
        id: nextId,
        name: options.name || `${nextLabelBase} (نسخة)`,
        x: resolvedPosition.x,
        y: resolvedPosition.y,
        zIndex: elements.length + 1,
        hidden: false,
        locked: false,
        deviceOverrides: {},
      };

      return {
        ...current,
        customElements: normalizeCustomElements([...elements, nextElement]),
      };
    });

    setSelectedElementId(nextId);
    setSelectedNativeElementId(null);
    setSelectedNativeElementLabel('');
    setSelectedNativeElementMeta(null);
    setSelectedTemplateTextPath(null);
    setSelectedTemplateTextLabel('');
    setSelectedTemplateTextValue('');
    setOpenSection('layers');
    setEditorOpen(true);

    if (!options.silent) {
      setNotice(options.notice || `تمت إضافة نسخة جديدة من: ${nextLabelBase}`);
      recordActivity(options.activity || 'لصق عنصر حر', nextLabelBase);
    }

    return nextId;
  }

  function copyCustomElementToClipboardById(id, options = {}) {
    const source =
      responsiveCustomElements.find((element) => element.id === id)
      || normalizedCustomElements.find((element) => element.id === id);
    if (!source) {
      return null;
    }

    return setElementClipboardPayload(getCustomElementClipboardPayload(source), {
      notice: options.notice || `تم نسخ العنصر الحر: ${source.name}`,
      activity: options.activity || 'نسخ عنصر حر',
      label: source.name,
      silent: options.silent,
    });
  }

  function buildSelectedNativeElementClipboardPayload() {
    if (!selectedNativeElement) {
      return null;
    }

    const label = selectedNativeElement.label || selectedNativeElementId || 'عنصر من القالب';
    const previewUrl = selectedNativeElementPreviewUrl || selectedNativeElement.mediaUrl || '';
    const resolvedKind =
      selectedNativeElement.kind === 'native'
        ? (previewUrl ? 'media' : (selectedNativeElement.textContent ? 'text' : 'native'))
        : selectedNativeElement.kind;

    const baseX = toFiniteNumber(selectedNativeElement.canvasX, toFiniteNumber(selectedNativeElement.x, 40));
    const baseY = toFiniteNumber(selectedNativeElement.canvasY, toFiniteNumber(selectedNativeElement.y, 40));

    if (resolvedKind === 'text') {
      return {
        source: 'native',
        label,
        element: {
          type: 'text',
          content: selectedNativeElement.textContent || '',
          x: baseX,
          y: baseY,
          fontSize: selectedNativeElement.fontSize || '24px',
          color: selectedNativeElement.color || '#1f2937',
          fontFamily: selectedNativeElement.fontFamily || '',
          opacity: toFiniteNumber(selectedNativeElement.opacity, 1),
          rotation: toFiniteNumber(selectedNativeElement.rotation, 0),
        },
      };
    }

    if (resolvedKind === 'media' && previewUrl) {
      return {
        source: 'native',
        label,
        element: {
          type: 'image',
          content: previewUrl,
          x: baseX,
          y: baseY,
          width: selectedNativeElement.renderWidth || selectedNativeElement.width || '160px',
          height: selectedNativeElement.renderHeight || selectedNativeElement.height || selectedNativeElement.renderWidth || selectedNativeElement.width || '160px',
          cropX: toFiniteNumber(selectedNativeElement.cropX, 50),
          cropY: toFiniteNumber(selectedNativeElement.cropY, 50),
          opacity: toFiniteNumber(selectedNativeElement.opacity, 1),
          rotation: toFiniteNumber(selectedNativeElement.rotation, 0),
        },
      };
    }

    return null;
  }

  function copySelectedNativeElementToClipboard() {
    const payload = buildSelectedNativeElementClipboardPayload();
    return setElementClipboardPayload(payload, {
      notice: `تم نسخ عنصر القالب: ${selectedNativeElement?.label || selectedNativeElementId || 'عنصر من القالب'}`,
      activity: 'نسخ عنصر قالب',
      label: selectedNativeElement?.label || selectedNativeElementId || 'عنصر من القالب',
      errorNotice: 'هذا العنصر لا يمكن تحويله الآن إلى عنصر حر قابل للصق.',
    });
  }

  function duplicateSelectedNativeElementAsCustom(position = null, clipboardPayload = null, label = '') {
    const payload = clipboardPayload || buildSelectedNativeElementClipboardPayload();
    const normalized = setElementClipboardPayload(payload, {
      silent: true,
      label: label || selectedNativeElement?.label || selectedNativeElementId || 'عنصر من القالب',
    });
    if (!normalized) {
      setNotice('هذا العنصر لا يمكن تحويله الآن إلى نسخة حرة داخل القالب.');
      return;
    }

    pasteElementClipboardAt(position, normalized, {
      notice: `تم إنشاء نسخة حرة من: ${normalized.label}`,
      activity: 'إنشاء نسخة حرة من عنصر قالب',
      label: normalized.label,
    });
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
    setSelectedNativeElementId(null);
    setSelectedNativeElementLabel('');
    setOpenSection('layers');
    setSelectedTemplateTextPath(null);
    setSelectedTemplateTextLabel('');
    recordActivity(type === 'text' ? 'إضافة نص حر' : 'إضافة صورة حرة', getCustomElementLabel({ type }, orderedLayerElements.length));
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
    recordActivity('فتح الاستوديو', session.name);
  }, [session.name]);

  useEffect(() => {
    const serialized = JSON.stringify(draft);
    if (historyRef.current.current == null) {
      historyRef.current.current = serialized;
      syncHistoryMeta();
      appendVersionSnapshot(serialized, 'بداية الجلسة');
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
    appendVersionSnapshot(serialized, 'تحديث داخل الاستوديو');
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
    setNativeElementCatalog([]);
    setTemplateTextCatalog([]);
    requestStudioCatalogs();
  }, [draft.templateSlug, previewReloadToken]);

  useEffect(() => {
    function handleMessage(event) {
      const shouldRevealEditor = typeof window !== 'undefined' && window.innerWidth <= 1180;
      if (event.data?.type === 'FARHA_NATIVE_ELEMENT_CATALOG') {
        setNativeElementCatalog(Array.isArray(event.data.payload?.items) ? event.data.payload.items : []);
      } else if (event.data?.type === 'FARHA_TEMPLATE_TEXT_CATALOG') {
        setTemplateTextCatalog(Array.isArray(event.data.payload?.items) ? event.data.payload.items : []);
      } else if (event.data?.type === 'FARHA_CUSTOM_ELEMENT_UPDATE') {
        patchCustomElement(
          event.data.payload.id,
          event.data.payload.updates,
          { deviceMode: event.data.payload.deviceMode || currentDeviceMode },
        );
      } else if (event.data?.type === 'FARHA_CUSTOM_ELEMENT_DELETE') {
        removeCustomElement(event.data.payload.id);
      } else if (event.data?.type === 'FARHA_CUSTOM_ELEMENT_SELECT') {
        setSelectedElementId(event.data.payload?.id || null);
        setSelectedNativeElementId(null);
        setSelectedNativeElementLabel('');
        setSelectedNativeElementMeta(null);
        setSelectedNativeElementPreviewUrl('');
        setSelectedNativeElementBasePreviewUrl('');
        setSelectedNativeElementAspectRatio(390 / 844);
        setSelectedTemplateTextPath(null);
        setSelectedTemplateTextLabel('');
        setSelectedTemplateTextValue('');
        setOpenSection('layers');
        if (shouldRevealEditor) {
          setEditorOpen(true);
        }
      } else if (event.data?.type === 'FARHA_NATIVE_ELEMENT_SELECT') {
        const nextId = event.data.payload?.id || null;
        setSelectedNativeElementId(nextId);
        setSelectedNativeElementLabel(event.data.payload?.label || '');
        setSelectedNativeElementMeta(nextId ? { ...event.data.payload } : null);
        setSelectedNativeElementPreviewUrl(event.data.payload?.previewUrl || '');
        setSelectedNativeElementBasePreviewUrl(event.data.payload?.basePreviewUrl || event.data.payload?.previewUrl || '');
        setSelectedNativeElementAspectRatio(toFiniteNumber(event.data.payload?.aspectRatio, 390 / 844));
        setSelectedElementId(null);
        setSelectedTemplateTextPath(null);
        setSelectedTemplateTextLabel('');
        setSelectedTemplateTextValue('');
        if (nextId) {
          setOpenSection('template-elements');
          if (shouldRevealEditor) {
            setEditorOpen(true);
          }
        }
      } else if (event.data?.type === 'FARHA_ELEMENT_COPY_REQUEST') {
        const scope = event.data.payload?.scope;
        if (scope === 'custom') {
          copyCustomElementToClipboardById(event.data.payload?.id || null);
        } else if (scope === 'native') {
          setElementClipboardPayload(event.data.payload?.clipboard, {
            notice: `تم نسخ عنصر القالب: ${event.data.payload?.label || 'عنصر من القالب'}`,
            activity: 'نسخ عنصر قالب',
            label: event.data.payload?.label || 'عنصر من القالب',
            errorNotice: 'هذا العنصر لا يمكن تحويله الآن إلى عنصر حر قابل للصق.',
          });
        }
      } else if (event.data?.type === 'FARHA_ELEMENT_DUPLICATE_REQUEST') {
        const scope = event.data.payload?.scope;
        if (scope === 'custom') {
          duplicateCustomElement(event.data.payload?.id || null);
        } else if (scope === 'native') {
          duplicateSelectedNativeElementAsCustom(
            event.data.payload?.position || null,
            event.data.payload?.clipboard || null,
            event.data.payload?.label || '',
          );
        }
      } else if (event.data?.type === 'FARHA_ELEMENT_PASTE_REQUEST') {
        pasteElementClipboardAt(event.data.payload?.position || null);
      } else if (event.data?.type === 'FARHA_TEMPLATE_TEXT_SELECT') {
        const nextPath = event.data.payload?.path || null;
        const preserveNativeSelection = Boolean(event.data.payload?.preserveNativeSelection);
        setSelectedTemplateTextPath(nextPath);
        setSelectedTemplateTextLabel(event.data.payload?.label || '');
        setSelectedTemplateTextValue(event.data.payload?.text || '');
        if (nextPath) {
          setSelectedElementId(null);
          if (!preserveNativeSelection) {
            setSelectedNativeElementId(null);
            setSelectedNativeElementLabel('');
            setSelectedNativeElementMeta(null);
          }
          setOpenSection('template-text');
          if (shouldRevealEditor) {
            setEditorOpen(true);
          }
        }
      } else if (event.data?.type === 'FARHA_MEDIA_REPLACE_REQUEST') {
        const scope = event.data.payload?.scope;
        const nextId = event.data.payload?.id || null;
        const nextLabel = event.data.payload?.label || '';
        if (!nextId || (scope !== 'custom' && scope !== 'native')) {
          return;
        }

        if (scope === 'custom') {
          setSelectedElementId(nextId);
          setSelectedNativeElementId(null);
          setSelectedNativeElementLabel('');
          setSelectedNativeElementMeta(null);
          setOpenSection('layers');
        } else {
          setSelectedNativeElementId(nextId);
          setSelectedNativeElementLabel(nextLabel);
          setSelectedNativeElementMeta({ ...(event.data.payload || {}), id: nextId, label: nextLabel });
          setSelectedElementId(null);
          setOpenSection('template-elements');
        }

        setEditorOpen(true);
        setReplaceMediaRequest({
          scope,
          id: nextId,
          label: nextLabel,
          token: Date.now(),
        });
      } else if (event.data?.type === 'FARHA_MEDIA_CROP_REQUEST') {
        const scope = event.data.payload?.scope;
        const nextId = event.data.payload?.id || null;
        if (!nextId || (scope !== 'custom' && scope !== 'native')) {
          return;
        }

        if (scope === 'custom') {
          setSelectedElementId(nextId);
          setSelectedNativeElementId(null);
          setSelectedNativeElementLabel('');
          setSelectedNativeElementMeta(null);
          setSelectedNativeElementPreviewUrl('');
          setSelectedNativeElementBasePreviewUrl('');
          setSelectedNativeElementAspectRatio(390 / 844);
          setOpenSection('layers');
        } else {
          setSelectedNativeElementId(nextId);
          setSelectedNativeElementLabel(event.data.payload?.label || '');
          setSelectedNativeElementMeta(nextId ? { ...event.data.payload } : null);
          setSelectedNativeElementPreviewUrl(event.data.payload?.previewUrl || '');
          setSelectedNativeElementBasePreviewUrl(event.data.payload?.basePreviewUrl || event.data.payload?.previewUrl || '');
          setSelectedNativeElementAspectRatio(toFiniteNumber(event.data.payload?.aspectRatio, 390 / 844));
          setSelectedElementId(null);
          setOpenSection('template-elements');
        }

        openCropEditor({
          scope,
          id: nextId,
          label: event.data.payload?.label || '',
          initialSrc: event.data.payload?.previewUrl || '',
          previewUrl: event.data.payload?.previewUrl || '',
          basePreviewUrl: event.data.payload?.basePreviewUrl || event.data.payload?.previewUrl || '',
          persistedUrl: event.data.payload?.persistedUrl || '',
          cropX: toFiniteNumber(event.data.payload?.cropX, 50),
          cropY: toFiniteNumber(event.data.payload?.cropY, 50),
          aspectRatio: toFiniteNumber(event.data.payload?.aspectRatio, 390 / 844),
        });
        if (shouldRevealEditor) {
          setEditorOpen(true);
        }
      } else if (event.data?.type === 'FARHA_NATIVE_ELEMENT_UPDATE') {
        const nextId = event.data.payload?.id || null;
        if (!nextId) {
          return;
        }
        setSelectedNativeElementId(nextId);
        setSelectedNativeElementLabel(event.data.payload?.label || '');
        setSelectedNativeElementMeta(nextId ? { ...event.data.payload } : null);
        setSelectedNativeElementPreviewUrl(event.data.payload?.previewUrl || '');
        setSelectedNativeElementBasePreviewUrl(event.data.payload?.basePreviewUrl || event.data.payload?.previewUrl || '');
        setSelectedNativeElementAspectRatio(toFiniteNumber(event.data.payload?.aspectRatio, 390 / 844));
        patchNativeElement(nextId, {
          label: event.data.payload?.label || '',
          selector: event.data.payload?.selector || '',
          kind: event.data.payload?.kind || 'native',
          ...(event.data.payload?.updates || {}),
        });
        setOpenSection('template-elements');
        recordActivity('تحريك عنصر من القالب', event.data.payload?.label || nextId);
      } else if (event.data?.type === 'FARHA_NATIVE_ELEMENT_RESET') {
        const nextId = event.data.payload?.id || null;
        if (!nextId) {
          return;
        }
        setSelectedNativeElementId(nextId);
        setSelectedNativeElementLabel(event.data.payload?.label || '');
        setSelectedNativeElementMeta(nextId ? { ...event.data.payload } : null);
        setSelectedNativeElementPreviewUrl(event.data.payload?.basePreviewUrl || '');
        setSelectedNativeElementBasePreviewUrl(event.data.payload?.basePreviewUrl || '');
        setSelectedNativeElementAspectRatio(toFiniteNumber(event.data.payload?.aspectRatio, 390 / 844));
        resetNativeElementById(nextId, event.data.payload?.label || nextId);
        setOpenSection('template-elements');
      } else if (event.data?.type === 'FARHA_TEXT_OVERRIDE') {
        const { path, text, label } = event.data.payload;
        setDraft(current => ({
          ...current,
          textOverrides: {
            ...(current.textOverrides || {}),
            [path]: text
          }
        }));
        if (path) {
          setSelectedTemplateTextPath(path);
          setSelectedTemplateTextLabel(label || '');
          setSelectedTemplateTextValue(text || '');
          setSelectedNativeElementId(null);
          setSelectedNativeElementLabel('');
          setSelectedNativeElementMeta(null);
          setOpenSection('template-text');
          recordActivity('تعديل نص من المعاينة', label || path);
        }
      } else if (event.data?.type === 'FARHA_EMULATOR_TOOL_ACTION') {
        const action = event.data.payload?.action || '';
        if (action === 'add-text') {
          setDraft((current) => ({
            ...current,
            ui: {
              ...(current.ui || {}),
              addCustomElementMode: 'text',
            },
          }));
          setCanvasClickMenu(null);
          setOpenSection('custom-elements');
          setNotice('وضع إضافة النص مفعل. اضغط داخل المحاكي لتثبيت النص الجديد.');
          setEditorOpen(true);
          return;
        }
        if (action === 'add-image') {
          setDraft((current) => ({
            ...current,
            ui: {
              ...(current.ui || {}),
              addCustomElementMode: 'image',
            },
          }));
          setCanvasClickMenu(null);
          setOpenSection('custom-elements');
          setNotice('وضع إضافة الصورة مفعل. اضغط داخل المحاكي لاختيار الصورة وموضعها.');
          setEditorOpen(true);
          return;
        }
        if (action === 'cancel-add') {
          setDraft((current) => ({
            ...current,
            ui: {
              ...(current.ui || {}),
              addCustomElementMode: '',
            },
          }));
          setCanvasClickMenu(null);
          setNotice('تم إلغاء وضع الإضافة من المحاكي.');
          return;
        }
        if (action === 'paste-element') {
          pasteElementClipboardAt();
          return;
        }
        if (action === 'open-layers') {
          setOpenSection(selectedElementId ? 'layers' : 'custom-elements');
          setEditorOpen(true);
          return;
        }
      } else if (event.data?.type === 'FARHA_CANVAS_DISMISS_MENU') {
        setCanvasClickMenu(null);
      } else if (event.data?.type === 'FARHA_CANVAS_CLICK') {
        const { x, y } = event.data.payload;
        if (draft.ui?.addCustomElementMode === 'text') {
          addCustomElement('text', { x, y }, 'نص جديد');
          setCanvasClickMenu(null);
          return;
        }
        if (draft.ui?.addCustomElementMode === 'image') {
          setCanvasClickMenu(buildCanvasClickMenuState({ ...event.data.payload, forceImage: true }));
          return;
        }
        setSelectedNativeElementId(null);
        setSelectedNativeElementLabel('');
        setSelectedTemplateTextPath(null);
        setSelectedTemplateTextLabel('');
        setSelectedTemplateTextValue('');
        setCanvasClickMenu(buildCanvasClickMenuState(event.data.payload));
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [
    currentDeviceMode,
    draft.ui?.addCustomElementMode,
    elementClipboard,
    normalizedCustomElements,
    selectedElementId,
    selectedNativeElement,
    selectedNativeElementBasePreviewUrl,
    selectedNativeElementId,
    selectedNativeElementLabel,
    selectedNativeElementPreviewUrl,
  ]);

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
    let nextThemeConfig = null;
    setDraft((current) => {
      nextThemeConfig = {
        ...current.themeConfig,
        [key]: value,
      };
      return {
        ...current,
        themeConfig: nextThemeConfig,
      };
    });

    if (nextThemeConfig) {
      sendPreviewBridgeMessage({
        type: 'FARHA_THEME_UPDATE',
        payload: {
          theme: nextThemeConfig,
        },
      });
    }
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
    recordActivity('إعادة ضبط عنصر حر', selectedCustomElement.name);
  }

  function copySelectedElementStyles() {
    if (!selectedCustomElement) {
      return;
    }

    const payload = getElementStyleClipboardPayload(selectedCustomElement);
    setStyleClipboard(payload);
    setNotice(`تم نسخ تنسيق العنصر: ${selectedCustomElement.name}`);
    recordActivity('نسخ تنسيق عنصر', selectedCustomElement.name);
  }

  function pasteStylesToSelectedElement() {
    if (!selectedCustomElement || !styleClipboard) {
      return;
    }

    if (styleClipboard.type !== selectedCustomElement.type) {
      patchCustomElement(selectedCustomElement.id, pickStyleSubset(styleClipboard.styles, SHARED_STYLE_KEYS));
      setNotice('تم لصق التنسيق المشترك فقط لأن نوع العنصر مختلف.');
      recordActivity('لصق تنسيق مشترك', selectedCustomElement.name);
      return;
    }

    const nextStyles =
      selectedCustomElement.type === 'text'
        ? pickStyleSubset(styleClipboard.styles, ['opacity', 'rotation', 'fontSize', 'color', 'fontFamily'])
        : pickStyleSubset(styleClipboard.styles, ['opacity', 'rotation', 'width', 'height', 'cropX', 'cropY']);

    patchCustomElement(selectedCustomElement.id, nextStyles);
    setNotice(`تم لصق التنسيق على: ${selectedCustomElement.name}`);
    recordActivity('لصق تنسيق عنصر', selectedCustomElement.name);
  }

  function copySelectedNativeElementStyles() {
    if (!selectedNativeElement) {
      return;
    }

    const payload = getNativeElementStyleClipboardPayload(selectedNativeElement);
    setStyleClipboard(payload);
    setNotice(`تم نسخ تنسيق عنصر القالب: ${selectedNativeElement.label || selectedNativeElementId}`);
    recordActivity('نسخ تنسيق عنصر قالب', selectedNativeElement.label || selectedNativeElementId || 'عنصر قالب');
  }

  function pasteStylesToSelectedNativeElement() {
    if (!selectedNativeElement || !selectedNativeElementId || !styleClipboard) {
      return;
    }

    const commonStyles = {
      ...pickStyleSubset(styleClipboard.styles, NATIVE_SHARED_STYLE_KEYS),
      ...pickStyleSubset(styleClipboard.styles, SHARED_STYLE_KEYS),
    };
    let nextStyles = commonStyles;

    if (selectedNativeElement.kind === 'text' && styleClipboard.type === 'text') {
      nextStyles = {
        ...nextStyles,
        ...pickStyleSubset(styleClipboard.styles, NATIVE_TEXT_STYLE_KEYS),
      };
    }

    if (selectedNativeElement.kind === 'media' && styleClipboard.type === 'image') {
      nextStyles = {
        ...nextStyles,
        ...pickStyleSubset(styleClipboard.styles, NATIVE_MEDIA_STYLE_KEYS),
      };
    }

    patchNativeElement(selectedNativeElementId, nextStyles);
    setNotice(`تم لصق التنسيق على عنصر القالب: ${selectedNativeElement.label || selectedNativeElementId}`);
    recordActivity('لصق تنسيق عنصر قالب', selectedNativeElement.label || selectedNativeElementId || 'عنصر قالب');
  }

  function canResetSection(sectionKey) {
    return !['advanced', 'history'].includes(sectionKey);
  }

  function resetSection(sectionKey) {
    if (sectionKey === 'design') {
      setDraft((current) => ({
        ...current,
        themeConfig: cloneValue(currentManifest.defaultValues?.theme || {}),
      }));
      setNotice('تمت إعادة ضبط إعدادات التصميم.');
      recordActivity('إعادة ضبط قسم', 'التصميم');
      return;
    }

    if (sectionKey === 'sections') {
      setDraft((current) => ({
        ...current,
        sectionConfig: cloneValue(currentManifest.defaultValues?.sections || {}),
      }));
      setNotice('تمت إعادة ضبط إعدادات الأقسام.');
      recordActivity('إعادة ضبط قسم', 'الأقسام');
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
      recordActivity('إعادة ضبط قسم', 'الافتتاحية');
      return;
    }

    if (sectionKey === 'custom-elements') {
      setDraft((current) => ({
        ...current,
        customElements: [],
      }));
      setSelectedElementId(null);
      setNotice('تم حذف جميع العناصر الحرة من هذه الجلسة.');
      recordActivity('إعادة ضبط قسم', 'العناصر الحرة');
      return;
    }

    if (sectionKey === 'layers') {
      if (selectedCustomElement) {
        resetSelectedCustomElement();
      }
      return;
    }

    if (sectionKey === 'template-elements') {
      resetSelectedNativeElement();
      return;
    }

    if (sectionKey === 'template-text') {
      if (selectedTemplateText) {
        resetTemplateText(selectedTemplateText.path);
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
    recordActivity('إعادة ضبط قسم', SECTION_META[sectionKey]?.label || sectionKey);
  }

  function handleOpenSection(sectionKey) {
    if (showAllSections) {
      setShowAllSections(false);
      setOpenSection(sectionKey);
      return;
    }

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
    const isOpen = showAllSections || openSection === sectionKey;
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
                  disabled={
                    (sectionKey === 'layers' && !selectedCustomElement)
                    || (sectionKey === 'template-elements' && !selectedNativeElement)
                    || (sectionKey === 'template-text' && !selectedTemplateText)
                  }
                >
                  {sectionKey === 'layers'
                    ? 'Reset Element'
                    : sectionKey === 'template-elements'
                      ? 'Reset Native'
                    : sectionKey === 'template-text'
                      ? 'Reset Text'
                      : 'Reset Section'}
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
                            setSelectedNativeElementId(null);
                            setSelectedNativeElementLabel('');
                            setSelectedTemplateTextPath(null);
                            setSelectedTemplateTextLabel('');
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
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={() => copyCustomElementToClipboardById(selectedCustomElement.id)}
                        >
                          نسخ العنصر
                        </button>
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={() =>
                            pasteElementClipboardAt({
                              x: Math.round(toFiniteNumber(selectedCustomElement.x, 40) + 24),
                              y: Math.round(toFiniteNumber(selectedCustomElement.y, 40) + 24),
                            })
                          }
                          disabled={!elementClipboard}
                        >
                          لصق عنصر
                        </button>
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
                          تكرار
                        </button>
                        <button type="button" className="mini-btn danger" onClick={() => removeCustomElement(selectedCustomElement.id)}>
                          حذف
                        </button>
                      </div>
                    </div>

                    <div className="studio-element-summary-grid">
                      <div className="studio-element-summary-card">
                        <span>الجهاز الحالي</span>
                        <strong>{DEVICE_PRESETS[currentDeviceMode]?.label || currentDeviceMode}</strong>
                      </div>
                      <div className="studio-element-summary-card">
                        <span>تخصيص هذا الجهاز</span>
                        <strong>{selectedCustomElementDeviceOverride ? 'مفعل' : 'يستخدم الإعداد العام'}</strong>
                      </div>
                    </div>

                    <div className="studio-inline-actions">
                      <button
                        type="button"
                        className="mini-btn"
                        disabled={!selectedCustomElementDeviceOverride}
                        onClick={() => clearDeviceOverride(selectedCustomElement.id, currentDeviceMode)}
                      >
                        إزالة تخصيص {DEVICE_PRESETS[currentDeviceMode]?.label || currentDeviceMode}
                      </button>
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
                              onInput={(event) => patchCustomElement(selectedCustomElement.id, { color: event.target.value })}
                              onChange={(event) => patchCustomElement(selectedCustomElement.id, { color: event.target.value })}
                            />
                          </label>
                          
                            <label className="studio-field">
                              <span>وزن الخط</span>
                              <select
                                value={selectedCustomElement.fontWeight || ''}
                                onChange={(event) => patchCustomElement(selectedCustomElement.id, { fontWeight: event.target.value })}
                              >
                                <option value="">افتراضي</option>
                                <option value="300">خفيف (300)</option>
                                <option value="400">عادي (400)</option>
                                <option value="500">متوسط (500)</option>
                                <option value="600">شبه غامق (600)</option>
                                <option value="700">غامق (700)</option>
                                <option value="800">عريض (800)</option>
                                <option value="900">أسود (900)</option>
                              </select>
                            </label>
                            <label className="studio-field">
                              <span>محاذاة النص</span>
                              <select
                                value={selectedCustomElement.textAlign || ''}
                                onChange={(event) => patchCustomElement(selectedCustomElement.id, { textAlign: event.target.value })}
                              >
                                <option value="">افتراضي</option>
                                <option value="right">يمين</option>
                                <option value="center">وسط</option>
                                <option value="left">يسار</option>
                                <option value="justify">ضبط</option>
                              </select>
                            </label>
                            <label className="studio-field">
                              <span>تباعد الأحرف</span>
                              <input
                                type="text"
                                value={selectedCustomElement.letterSpacing || ''}
                                placeholder="0px"
                                onChange={(event) => patchCustomElement(selectedCustomElement.id, { letterSpacing: event.target.value })}
                              />
                            </label>
                            <label className="studio-field">
                              <span>ارتفاع السطر</span>
                              <input
                                type="text"
                                value={selectedCustomElement.lineHeight || ''}
                                placeholder="1.5"
                                onChange={(event) => patchCustomElement(selectedCustomElement.id, { lineHeight: event.target.value })}
                              />
                            </label>

                            <label className="studio-field studio-field--full">
                              <span>Font Family</span>
                            <input
                              type="text"
                              dir="ltr"
                              value={selectedCustomElement.fontFamily || ''}
                              placeholder="مثال: Tajawal, serif"
                              onInput={(event) => patchCustomElement(selectedCustomElement.id, { fontFamily: event.target.value })}
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
                          <div className="studio-field studio-field--full">
                            <button type="button" className="mini-btn" onClick={openSelectedCustomCropEditor}>
                              {'\u0641\u062A\u062D \u0646\u0627\u0641\u0630\u0629 \u0627\u0644\u0642\u0635 \u0627\u0644\u0628\u0635\u0631\u064A'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {sectionKey === 'template-elements' ? (
              <div className="studio-stack">
                <div className="studio-text-inspector">
                  <div className="studio-text-inspector__meta">
                    <strong>عناصر القالب المتاحة</strong>
                    <small>اختر من هنا أي عنصر أصلي ليتم تحديده داخل المعاينة مباشرة.</small>
                  </div>
                  <div className="studio-version-list">
                    {availableNativeElements.length ? availableNativeElements.map((item) => (
                      <div key={item.id} className={`studio-version-item ${selectedNativeElementId === item.id ? 'current' : ''}`}>
                        <div className="studio-version-item__meta">
                          <strong>{item.label || item.id}</strong>
                          <small>{item.kind === 'media' ? 'وسائط/زخرفة' : item.kind === 'text' ? 'عنصر نصي' : 'عنصر قالب'}</small>
                        </div>
                        <button type="button" className="mini-btn" onClick={() => requestNativeElementSelection(item)}>
                          {selectedNativeElementId === item.id ? 'محدد' : 'تحديد'}
                        </button>
                      </div>
                    )) : (
                      <p className="studio-layer-empty">لم يتم فهرسة عناصر القالب بعد. اضغط تحديث الأدوات أو اختر عنصرًا من المعاينة.</p>
                    )}
                  </div>
                </div>
                {selectedNativeElement ? (
                  <>
                    <div className="studio-text-inspector">
                      <div className="studio-text-inspector__meta">
                        <strong>{selectedNativeElement.label}</strong>
                        <small>{selectedNativeElement.kind === 'media' ? 'عنصر وسائط أصلي' : 'عنصر أصلي من القالب'}</small>
                      </div>
                      <div className="studio-inline-actions">
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={copySelectedNativeElementToClipboard}
                        >
                          نسخ العنصر
                        </button>
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={() =>
                            duplicateSelectedNativeElementAsCustom({
                              x: Math.round(toFiniteNumber(selectedNativeElement.canvasX, toFiniteNumber(selectedNativeElement.x, 40)) + 24),
                              y: Math.round(toFiniteNumber(selectedNativeElement.canvasY, toFiniteNumber(selectedNativeElement.y, 40)) + 24),
                            })
                          }
                        >
                          إنشاء نسخة حرة
                        </button>
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={() =>
                            pasteElementClipboardAt({
                              x: Math.round(toFiniteNumber(selectedNativeElement.canvasX, toFiniteNumber(selectedNativeElement.x, 40)) + 24),
                              y: Math.round(toFiniteNumber(selectedNativeElement.canvasY, toFiniteNumber(selectedNativeElement.y, 40)) + 24),
                            })
                          }
                          disabled={!elementClipboard}
                        >
                          لصق عنصر
                        </button>
                        <button
                          type="button"
                          className={`mini-btn ${selectedNativeElement.locked ? 'active' : ''}`}
                          onClick={() =>
                            patchNativeElement(selectedNativeElementId, {
                              locked: !selectedNativeElement.locked,
                            })
                          }
                        >
                          {selectedNativeElement.locked ? 'فتح الحركة' : 'قفل الحركة'}
                        </button>
                        <button
                          type="button"
                          className={`mini-btn ${selectedNativeElement.hidden ? 'active' : ''}`}
                          onClick={() =>
                            patchNativeElement(selectedNativeElementId, {
                              hidden: !selectedNativeElement.hidden,
                            })
                          }
                        >
                          {selectedNativeElement.hidden ? 'إظهار' : 'إخفاء'}
                        </button>
                        {selectedNativeElement.kind === 'media' ? (
                          <button
                            type="button"
                            className="mini-btn"
                            onClick={openSelectedNativeReplacePicker}
                          >
                            استبدال
                          </button>
                        ) : null}
                        {selectedNativeElement.kind === 'media' ? (
                          <button
                            type="button"
                            className="mini-btn"
                            onClick={openSelectedNativeCropEditor}
                          >
                            قص
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="mini-btn danger"
                          onClick={removeSelectedNativeElement}
                        >
                          حذف
                        </button>
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={resetSelectedNativeElement}
                        >
                          إعادة الأصل
                        </button>
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={copySelectedNativeElementStyles}
                        >
                          نسخ التنسيق
                        </button>
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={pasteStylesToSelectedNativeElement}
                          disabled={!styleClipboard}
                        >
                          لصق التنسيق
                        </button>
                      </div>
                    </div>

                    <div className="studio-element-summary-grid">
                      <div className="studio-element-summary-card">
                        <span>الموضع</span>
                        <strong>{Math.round(selectedNativeElement.x)} / {Math.round(selectedNativeElement.y)}</strong>
                      </div>
                      <div className="studio-element-summary-card">
                        <span>الحالة</span>
                        <strong>{selectedNativeElement.locked ? 'مقفول' : 'قابل للتحريك'}</strong>
                      </div>
                    </div>

                    <datalist id="studio-font-options">
                      {fontLibraryOptions.map((font) => (
                        <option key={font.id || font.family} value={font.family} />
                      ))}
                    </datalist>

                    <div className="studio-form-grid">
                      <label className="studio-field">
                        <span>العنوان</span>
                        <input
                          type="text"
                          value={selectedNativeElement.label || ''}
                          onChange={(event) => {
                            setSelectedNativeElementLabel(event.target.value);
                            patchNativeElement(selectedNativeElementId, { label: event.target.value });
                          }}
                        />
                      </label>
                      <label className="studio-field">
                        <span>النوع</span>
                        <input
                          type="text"
                          value={selectedNativeElement.kind === 'media' ? 'وسائط/زخرفة' : 'عنصر أصلي'}
                          readOnly
                        />
                      </label>
                      <label className="studio-field">
                        <span>الموضع الأفقي X</span>
                        <input
                          type="number"
                          value={Math.round(toFiniteNumber(selectedNativeElement.x, 0))}
                          onChange={(event) => setNativeElementNumber(selectedNativeElementId, 'x', event.target.value)}
                        />
                      </label>
                      <label className="studio-field">
                        <span>الموضع الرأسي Y</span>
                        <input
                          type="number"
                          value={Math.round(toFiniteNumber(selectedNativeElement.y, 0))}
                          onChange={(event) => setNativeElementNumber(selectedNativeElementId, 'y', event.target.value)}
                        />
                      </label>
                      <label className="studio-field">
                        <span>التكبير %</span>
                        <input
                          type="number"
                          min="10"
                          max="400"
                          value={Math.round(toFiniteNumber(selectedNativeElement.scale, 1) * 100)}
                          onChange={(event) =>
                            patchNativeElement(selectedNativeElementId, {
                              scale: Math.max(0.1, toFiniteNumber(event.target.value, 100) / 100),
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
                          value={Math.round(toFiniteNumber(selectedNativeElement.rotation, 0))}
                          onChange={(event) => setNativeElementNumber(selectedNativeElementId, 'rotation', event.target.value)}
                        />
                      </label>
                      <label className="studio-field">
                        <span>الشفافية %</span>
                        <input
                          type="number"
                          min="5"
                          max="100"
                          value={Math.round(toFiniteNumber(selectedNativeElement.opacity, 1) * 100)}
                          onChange={(event) =>
                            patchNativeElement(selectedNativeElementId, {
                              opacity: Math.min(1, Math.max(0.05, toFiniteNumber(event.target.value, 100) / 100)),
                            })
                          }
                        />
                      </label>
                      <label className="studio-field">
                        <span>العرض</span>
                        <input
                          type="text"
                          value={selectedNativeElement.width || ''}
                          placeholder="auto / 240px"
                          onChange={(event) => setNativeElementDimension(selectedNativeElementId, 'width', event.target.value)}
                        />
                      </label>
                      <label className="studio-field">
                        <span>الارتفاع</span>
                        <input
                          type="text"
                          value={selectedNativeElement.height || ''}
                          placeholder="auto / 240px"
                          onChange={(event) => setNativeElementDimension(selectedNativeElementId, 'height', event.target.value)}
                        />
                      </label>
                      <label className="studio-field">
                        <span>Z-Index</span>
                        <input
                          type="number"
                          value={selectedNativeElement.zIndex ?? ''}
                          onChange={(event) => {
                            const raw = String(event.target.value || '').trim();
                            patchNativeElement(selectedNativeElementId, {
                              zIndex: raw ? toFiniteNumber(raw, 0) : undefined,
                            });
                          }}
                        />
                      </label>
                      <label className="studio-field">
                        <span>لون الخلفية</span>
                        <input
                          type="text"
                          value={selectedNativeElement.backgroundColor || ''}
                          placeholder="transparent / #ffffff"
                          onChange={(event) => patchNativeElement(selectedNativeElementId, { backgroundColor: event.target.value })}
                        />
                      </label>
                      <label className="studio-field">
                        <span>استدارة الحواف</span>
                        <input
                          type="text"
                          value={selectedNativeElement.borderRadius || ''}
                          placeholder="0px / 24px"
                          onChange={(event) => setNativeElementDimension(selectedNativeElementId, 'borderRadius', event.target.value)}
                        />
                      </label>
                      <label className="studio-field">
                        <span>سمك الإطار</span>
                        <input
                          type="text"
                          value={selectedNativeElement.borderWidth || ''}
                          placeholder="0px / 2px"
                          onChange={(event) => setNativeElementDimension(selectedNativeElementId, 'borderWidth', event.target.value)}
                        />
                      </label>
                      <label className="studio-field">
                        <span>لون الإطار</span>
                        <input
                          type="text"
                          value={selectedNativeElement.borderColor || ''}
                          placeholder="#d1d5db"
                          onChange={(event) => patchNativeElement(selectedNativeElementId, { borderColor: event.target.value })}
                        />
                      </label>
                      <label className="studio-field studio-field--full">
                        <span>الظل</span>
                        <input
                          type="text"
                          value={selectedNativeElement.boxShadow || ''}
                          placeholder="0 16px 36px rgba(15,23,42,.18)"
                          onChange={(event) => patchNativeElement(selectedNativeElementId, { boxShadow: event.target.value })}
                        />
                      </label>
                      <label className="studio-field studio-field--full">
                        <span>المعرّف/المسار</span>
                        <input type="text" dir="ltr" value={selectedNativeElement.selector || selectedNativeElementId || ''} readOnly />
                      </label>
                      {selectedNativeElement.kind === 'text' ? (
                        <>
                          <label className="studio-field studio-field--full">
                            <span>النص داخل عنصر القالب</span>
                            <textarea
                              rows={4}
                              value={selectedNativeElement.textContent || ''}
                              onChange={(event) =>
                                patchNativeElement(selectedNativeElementId, {
                                  textContent: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="studio-field">
                            <span>الخط</span>
                            <input
                              type="text"
                              list="studio-font-options"
                              value={selectedNativeElement.fontFamily || ''}
                              placeholder="Tajawal"
                              onInput={(event) => patchNativeElement(selectedNativeElementId, { fontFamily: event.target.value })}
                              onChange={(event) => patchNativeElement(selectedNativeElementId, { fontFamily: event.target.value })}
                            />
                          </label>
                          <label className="studio-field">
                            <span>حجم الخط</span>
                            <input
                              type="text"
                              value={selectedNativeElement.fontSize || ''}
                              placeholder="24px"
                              onChange={(event) => setNativeElementDimension(selectedNativeElementId, 'fontSize', event.target.value)}
                            />
                          </label>
                          <label className="studio-field">
                            <span>وزن الخط</span>
                            <select
                              value={selectedNativeElement.fontWeight || ''}
                              onChange={(event) => patchNativeElement(selectedNativeElementId, { fontWeight: event.target.value })}
                            >
                              <option value="">افتراضي</option>
                              {FONT_WEIGHT_OPTIONS.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </label>
                          <label className="studio-field">
                            <span>نمط الخط</span>
                            <select
                              value={selectedNativeElement.fontStyle || ''}
                              onChange={(event) => patchNativeElement(selectedNativeElementId, { fontStyle: event.target.value })}
                            >
                              <option value="">افتراضي</option>
                              {FONT_STYLE_OPTIONS.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </label>
                          <label className="studio-field">
                            <span>لون النص</span>
                            <input
                              type="text"
                              value={selectedNativeElement.color || ''}
                              placeholder="#7f2a1f"
                              onInput={(event) => patchNativeElement(selectedNativeElementId, { color: event.target.value })}
                              onChange={(event) => patchNativeElement(selectedNativeElementId, { color: event.target.value })}
                            />
                          </label>
                          <label className="studio-field">
                            <span>ارتفاع السطر</span>
                            <input
                              type="text"
                              value={selectedNativeElement.lineHeight || ''}
                              placeholder="1.6 / 32px"
                              onChange={(event) => setNativeElementDimension(selectedNativeElementId, 'lineHeight', event.target.value)}
                            />
                          </label>
                          <label className="studio-field">
                            <span>تباعد الحروف</span>
                            <input
                              type="text"
                              value={selectedNativeElement.letterSpacing || ''}
                              placeholder="0px / .08em"
                              onChange={(event) => setNativeElementDimension(selectedNativeElementId, 'letterSpacing', event.target.value)}
                            />
                          </label>
                          <label className="studio-field">
                            <span>محاذاة النص</span>
                            <select
                              value={selectedNativeElement.textAlign || ''}
                              onChange={(event) => patchNativeElement(selectedNativeElementId, { textAlign: event.target.value })}
                            >
                              <option value="">افتراضي</option>
                              {TEXT_ALIGN_OPTIONS.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </label>
                          <label className="studio-field">
                            <span>اتجاه النص</span>
                            <select
                              value={selectedNativeElement.direction || ''}
                              onChange={(event) => patchNativeElement(selectedNativeElementId, { direction: event.target.value })}
                            >
                              <option value="">افتراضي</option>
                              {DIRECTION_OPTIONS.map((option) => (
                                <option key={option} value={option}>{option.toUpperCase()}</option>
                              ))}
                            </select>
                          </label>
                          <label className="studio-field">
                            <span>تحويل النص</span>
                            <select
                              value={selectedNativeElement.textTransform || ''}
                              onChange={(event) => patchNativeElement(selectedNativeElementId, { textTransform: event.target.value })}
                            >
                              <option value="">افتراضي</option>
                              {TEXT_TRANSFORM_OPTIONS.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </label>
                          <label className="studio-field">
                            <span>زخرفة النص</span>
                            <select
                              value={selectedNativeElement.textDecoration || ''}
                              onChange={(event) => patchNativeElement(selectedNativeElementId, { textDecoration: event.target.value })}
                            >
                              <option value="">افتراضي</option>
                              {TEXT_DECORATION_OPTIONS.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </label>
                          <label className="studio-field studio-field--full">
                            <span>ظل النص</span>
                            <input
                              type="text"
                              value={selectedNativeElement.textShadow || ''}
                              placeholder="0 8px 20px rgba(15,23,42,.18)"
                              onChange={(event) => patchNativeElement(selectedNativeElementId, { textShadow: event.target.value })}
                            />
                          </label>
                        </>
                      ) : null}
                      {selectedNativeElement.kind === 'media' ? (
                        <>
                          <label className="studio-field studio-field--full">
                            <span>{'\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0623\u0635\u0644\u064A\u0629'}</span>
                            <MediaPicker
                              label={'\u0627\u062E\u062A\u064A\u0627\u0631 \u0635\u0648\u0631\u0629'}
                              value={selectedNativeElement.mediaUrl || selectedNativeElementPreviewUrl || ''}
                              accept="image"
                              folder="studio-native-elements"
                              onChange={(url) => {
                                if (!url) {
                                  return;
                                }
                                patchNativeElement(selectedNativeElementId, { mediaUrl: url, hidden: false });
                                setNotice(`\u062A\u0645 \u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0646\u0635\u0631 \u0627\u0644\u0623\u0635\u0644\u064A: ${selectedNativeElement.label || '\u0639\u0646\u0635\u0631 \u0635\u0648\u0631\u064A'}`);
                                recordActivity('\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u0635\u0648\u0631\u0629 \u0639\u0646\u0635\u0631 \u0642\u0627\u0644\u0628', selectedNativeElement.label || selectedNativeElementId);
                              }}
                            />
                          </label>
                          <label className="studio-field">
                            <span>{'\u0642\u0635 \u0623\u0641\u0642\u064A'}</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={Math.round(toFiniteNumber(selectedNativeElement.cropX, 50))}
                              onChange={(event) => setNativeElementNumber(selectedNativeElementId, 'cropX', event.target.value, 50)}
                            />
                          </label>
                          <label className="studio-field">
                            <span>{'\u0642\u0635 \u0631\u0623\u0633\u064A'}</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={Math.round(toFiniteNumber(selectedNativeElement.cropY, 50))}
                              onChange={(event) => setNativeElementNumber(selectedNativeElementId, 'cropY', event.target.value, 50)}
                            />
                          </label>
                          <label className="studio-field">
                            <span>Object Fit</span>
                            <select
                              value={selectedNativeElement.objectFit || ''}
                              onChange={(event) => patchNativeElement(selectedNativeElementId, { objectFit: event.target.value })}
                            >
                              <option value="">افتراضي</option>
                              {OBJECT_FIT_OPTIONS.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </label>
                          <div className="studio-field studio-field--full">
                            <button type="button" className="mini-btn" onClick={openSelectedNativeCropEditor}>
                              {'\u0641\u062A\u062D \u0646\u0627\u0641\u0630\u0629 \u0627\u0644\u0642\u0635 \u0627\u0644\u0628\u0635\u0631\u064A'}
                            </button>
                          </div>
                        </>
                      ) : null}
                    </div>

                    {selectedTemplateTextStyleTarget ? (
                      <div className="studio-form-grid">
                        <label className="studio-field">
                          <span>لون النص</span>
                          <input
                            type="color"
                            value={normalizeHexColor(selectedTemplateTextStyleTarget.color, '#7f2a1f')}
                            onInput={(event) =>
                              patchNativeElement(selectedNativeElementId, {
                                color: event.target.value,
                              })
                            }
                            onChange={(event) =>
                              patchNativeElement(selectedNativeElementId, {
                                color: event.target.value,
                              })
                            }
                          />
                        </label>
                        <label className="studio-field">
                          <span>نوع الخط</span>
                          <select
                            value={selectedTemplateTextStyleTarget.fontFamily || ''}
                            onInput={(event) =>
                              patchNativeElement(selectedNativeElementId, {
                                fontFamily: event.target.value,
                              })
                            }
                            onChange={(event) =>
                              patchNativeElement(selectedNativeElementId, {
                                fontFamily: event.target.value,
                              })
                            }
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
                    ) : null}
                    <p className="studio-help-text">
                      اضغط على العنصر الزخرفي أو الصورة الأصلية داخل المحاكي لتحديدها، ثم اسحبها مباشرة. ويمكنك أيضًا فتح نافذة القص البصري لضبط الصورة داخل إطار مخصص بدل الاعتماد على السحب داخل المعاينة فقط.
                    </p>
                  </>
                ) : (
                  <div className="studio-empty-panel">
                    <strong>لا يوجد عنصر قالب محدد بعد</strong>
                    <p>اضغط على أي صورة أصلية أو زخرفة أو عنصر بصري داخل المعاينة المباشرة، ثم اسحبه أو عدّل خصائصه من هذا القسم.</p>
                  </div>
                )}
              </div>
            ) : null}

            {sectionKey === 'template-text' ? (
              <div className="studio-stack">
                <div className="studio-text-inspector">
                  <div className="studio-text-inspector__meta">
                    <strong>كل النصوص القابلة للتحرير</strong>
                    <small>اختر النص من هذه القائمة ليتم تحديده وفتحه داخل المعاينة مباشرة.</small>
                  </div>
                  <div className="studio-version-list">
                    {availableTemplateTexts.length ? availableTemplateTexts.map((item) => (
                      <div key={item.path} className={`studio-version-item ${selectedTemplateTextPath === item.path ? 'current' : ''}`}>
                        <div className="studio-version-item__meta">
                          <strong>{item.label || item.path}</strong>
                          <small>{item.text ? item.text.slice(0, 72) : item.selector || item.path}</small>
                        </div>
                        <button type="button" className="mini-btn" onClick={() => requestTemplateTextSelection(item)}>
                          {selectedTemplateTextPath === item.path ? 'محدد' : 'تحديد'}
                        </button>
                      </div>
                    )) : (
                      <p className="studio-layer-empty">لا توجد نصوص مفهرسة بعد. اضغط تحديث الأدوات أو انقر على نص من المعاينة.</p>
                    )}
                  </div>
                </div>
                {selectedTemplateText ? (
                  <>
                    <div className="studio-text-inspector">
                      <div className="studio-text-inspector__meta">
                        <strong>{selectedTemplateText.label}</strong>
                        <small>{selectedTemplateText.path}</small>
                      </div>
                      <div className="studio-inline-actions">
                        <button
                          type="button"
                          className={`mini-btn ${selectedTemplateText.locked ? 'active' : ''}`}
                          onClick={() => setTemplateTextLock(selectedTemplateText.path, !selectedTemplateText.locked)}
                        >
                          {selectedTemplateText.locked ? 'فتح النص' : 'قفل النص'}
                        </button>
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={() => resetTemplateText(selectedTemplateText.path)}
                        >
                          إعادة النص الأصلي
                        </button>
                      </div>
                    </div>

                    <div className="studio-element-summary-grid">
                      <div className="studio-element-summary-card">
                        <span>الحالة</span>
                        <strong>{selectedTemplateText.locked ? 'مقفول' : 'مفتوح'}</strong>
                      </div>
                      <div className="studio-element-summary-card">
                        <span>التحرير المباشر</span>
                        <strong>{selectedTemplateText.locked ? 'متوقف' : 'مفعل'}</strong>
                      </div>
                    </div>

                    <label className="studio-field studio-field--full">
                      <span>النص الظاهر داخل القالب</span>
                      <textarea
                        rows={4}
                        value={selectedTemplateText.text}
                        disabled={selectedTemplateText.locked}
                        onChange={(event) => updateTemplateTextOverride(selectedTemplateText.path, event.target.value)}
                        onBlur={() => {
                          if (!selectedTemplateText.locked) {
                            recordActivity('تعديل نص من الاستوديو', selectedTemplateText.label);
                          }
                        }}
                      />
                    </label>
                    <p className="studio-help-text">
                      اضغط على أي نص داخل المعاينة ليظهر هنا. عند قفل النص سيتوقف التحرير المباشر من داخل القالب حتى تقوم بفتحه مرة أخرى.
                    </p>
                  </>
                ) : (
                  <div className="studio-empty-panel">
                    <strong>لا يوجد نص محدد بعد</strong>
                    <p>اضغط على أي عنوان أو فقرة داخل المعاينة المباشرة حتى تتمكن من قفلها أو تعديلها من هذا القسم.</p>
                  </div>
                )}
              </div>
            ) : null}

            {sectionKey === 'history' ? (
              <div className="studio-stack">
                <div className="studio-version-grid">
                  <div className="studio-version-card">
                    <span>الإصدار الحالي</span>
                    <strong>V{historyMeta.pastCount + 1}</strong>
                  </div>
                  <div className="studio-version-card">
                    <span>إمكانية التراجع</span>
                    <strong>{historyMeta.pastCount}</strong>
                  </div>
                  <div className="studio-version-card">
                    <span>إمكانية الإعادة</span>
                    <strong>{historyMeta.futureCount}</strong>
                  </div>
                  <div className="studio-version-card">
                    <span>الحفظ الحالي</span>
                    <strong>{saveState === 'saved' ? 'محفوظ' : saveState === 'saving' ? 'يحفظ الآن' : saveState === 'error' ? 'خطأ' : 'بانتظار الحفظ'}</strong>
                  </div>
                </div>

                <div className="studio-text-inspector">
                  <div className="studio-text-inspector__meta">
                    <strong>نسخ قابلة للاستعادة</strong>
                    <small>آخر اللقطات المحفوظة داخل الجلسة الحالية. يمكنك العودة لأي نسخة مصغرة مباشرة.</small>
                  </div>
                  <div className="studio-version-list">
                    {versionTrail.length ? versionTrail.map((item) => (
                      <div key={item.id} className={`studio-version-item ${item.isCurrent ? 'current' : ''}`}>
                        <div className="studio-version-item__meta">
                          <strong>{item.label}</strong>
                          <small>{item.time} · V{item.version}</small>
                        </div>
                        <button
                          type="button"
                          className="mini-btn"
                          disabled={item.isCurrent}
                          onClick={() => restoreVersionSnapshot(item.snapshot, item.label)}
                        >
                          {item.isCurrent ? 'الحالية' : 'استعادة'}
                        </button>
                      </div>
                    )) : (
                      <p className="studio-layer-empty">لا توجد نسخ مرئية بعد.</p>
                    )}
                  </div>
                </div>

                <div className="studio-history-list">
                  {activityLog.length ? activityLog.map((item) => (
                    <div key={item.id} className="studio-history-item">
                      <div className="studio-history-item__meta">
                        <strong>{item.title}</strong>
                        <small>{item.detail || 'تعديل داخل الاستوديو'}</small>
                      </div>
                      <div className="studio-history-item__side">
                        <span>V{item.version}</span>
                        <small>{item.time}</small>
                      </div>
                    </div>
                  )) : (
                    <div className="studio-empty-panel">
                      <strong>السجل فارغ حاليًا</strong>
                      <p>سيظهر هنا كل ما تقوم به مثل التراجع، إعادة التعديل، قفل النصوص، وإدارة العناصر الحرة.</p>
                    </div>
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
  const studioMetaLine = isInvitationEditing
    ? `${existingInvitation.slug} · ${currentOpening.nameAr}`
    : `${session.name} \u00B7 ${currentOpening.nameAr}`;

  async function persistInvitationDraft(action = 'save') {
    if (!isInvitationEditing || !existingInvitation?.slug) {
      return;
    }

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
            __customElements: draft.customElements || [],
            __nativeElementOverrides: draft.nativeElementOverrides || {},
            __textOverrides: draft.textOverrides || {},
            __uiConfig: draft.uiConfig || {},
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

      const nextStatus =
        payload.status
        || (action === 'publish' ? 'PUBLISHED' : action === 'unpublish' ? 'DRAFT' : invitationStatus);
      setInvitationStatus(nextStatus);
      setNotice(
        action === 'publish'
          ? 'تم نشر الدعوة بنجاح.'
          : action === 'unpublish'
            ? 'تم إلغاء نشر الدعوة.'
            : 'تم حفظ تغييرات الدعوة.'
      );
      recordActivity(
        action === 'publish'
          ? 'نشر الدعوة'
          : action === 'unpublish'
            ? 'إلغاء نشر الدعوة'
            : 'حفظ الدعوة',
        existingInvitation.slug,
      );
      router.refresh();
    } catch (error) {
      setNotice(error.message || 'تعذر حفظ الدعوة.');
    } finally {
      setBusy(false);
    }
  }

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
                  onClick={() => {
                    setDraft((current) => ({
                      ...current,
                      devicePreview: { mode: key, ...preset },
                    }));
                    recordActivity('تبديل جهاز المعاينة', preset.label);
                  }}
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
              <button
                type="button"
                className="mini-btn"
                onClick={resetTemplate}
                title="إعادة كل إعدادات الدعوة إلى الأصل"
              >
                Reset Template
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
            <div className="studio-phone-shell" ref={phoneShellRef}>
              <RenderFrame
                  key={`${draft.devicePreview.mode}-${previewReloadToken}`}
                  templateSlug={currentManifest.slug}
                  renderConfig={renderConfig}
                  manifest={currentManifest}
                  bridgeMessage={previewBridgeMessage}
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
                  ref={canvasMenuRef}
                  className={`studio-canvas-menu${canvasClickMenu.expanded ? ' is-expanded' : ' is-collapsed'}`}
                  style={{
                    top: `${canvasClickMenu.visualY ?? canvasClickMenu.y}px`,
                    left: `${canvasClickMenu.visualX ?? canvasClickMenu.x}px`,
                  }}
                >
                  <button
                    type="button"
                    className="mini-btn studio-canvas-menu__plus"
                    onClick={() => {
                      setCanvasClickMenu((current) => (
                        current
                          ? buildCanvasClickMenuState({
                            ...current,
                            expanded: !current.expanded,
                          })
                          : current
                      ));
                    }}
                    title={canvasClickMenu.expanded ? 'إغلاق خيارات الإضافة' : 'إضافة عنصر'}
                    aria-label={canvasClickMenu.expanded ? 'إغلاق خيارات الإضافة' : 'إضافة عنصر'}
                  >
                    +
                  </button>
                  {canvasClickMenu.expanded ? (
                    <>
                      <button
                        type="button"
                        className="mini-btn studio-canvas-menu__action"
                        onClick={() => {
                          addCustomElement('text', { x: canvasClickMenu.x, y: canvasClickMenu.y }, 'نص جديد');
                          setCanvasClickMenu(null);
                        }}
                        title="إضافة نص"
                      >
                        نص
                      </button>
                      <MediaPicker
                        label="صورة"
                        value=""
                        accept="image"
                        folder="studio-free-elements"
                        autoOpenToken={canvasClickMenu.forceImage ? canvasClickMenu.token : undefined}
                        onOpenChange={(open) => {
                          if (!open && canvasClickMenu.forceImage) {
                            setCanvasClickMenu(null);
                          }
                        }}
                        onChange={(url) => {
                          if (url) {
                            addCustomElement('image', { x: canvasClickMenu.x, y: canvasClickMenu.y }, url);
                            setCanvasClickMenu(null);
                          }
                        }}
                        trigger={(
                          <button
                            type="button"
                            className="mini-btn studio-canvas-menu__action studio-canvas-menu__image-trigger"
                            title="إضافة صورة"
                          >
                            صورة
                          </button>
                        )}
                      />
                      {hasClipboardElement ? (
                        <button
                          type="button"
                          className="mini-btn studio-canvas-menu__action studio-canvas-menu__paste-trigger"
                          onClick={() => {
                            pasteElementClipboardAt({ x: canvasClickMenu.x, y: canvasClickMenu.y });
                            setCanvasClickMenu(null);
                          }}
                          title="لصق العنصر المنسوخ"
                        >
                          لصق
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="mini-btn studio-canvas-menu__close"
                        onClick={() => setCanvasClickMenu(null)}
                        title="إغلاق"
                      >
                        ×
                      </button>
                    </>
                  ) : null}
                </div>
              ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="studio-canvas__tips" aria-label="تلميحات المحاكي">
          <div className="studio-canvas__tip">
            <strong>حدد ثم اسحب</strong>
            <span>اضغط على النص أو العنصر مرة واحدة، ثم اسحبه مباشرة داخل القالب.</span>
          </div>
          <div className="studio-canvas__tip">
            <strong>اضغط مرتين للكتابة</strong>
            <span>الضغط المزدوج يفتح تحرير النص من نفس مكانه داخل المعاينة.</span>
          </div>
          <div className="studio-canvas__tip">
            <strong>اضغط في مكان فارغ</strong>
            <span>سيظهر لك مربع سريع لإضافة نص أو صورة أو لصق عنصر منسوخ.</span>
          </div>
          <div className="studio-canvas__tip">
            <strong>كل شيء مباشر</strong>
            <span>النص واللون والخط والتحريك يظهرون داخل المحاكي في نفس اللحظة.</span>
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
              <span>{isInvitationEditing ? 'الدعوة' : 'الجلسة'}</span>
              <strong>{isInvitationEditing ? existingInvitation.slug : session.name}</strong>
            </div>
            <div>
              <span>القالب</span>
              <strong>{currentManifest.nameAr}</strong>
            </div>
            <div>
              <span>المعاينة</span>
              <strong>{currentDeviceLabel}</strong>
            </div>
            {isInvitationEditing ? (
              <div>
                <span>الحالة</span>
                <strong>{invitationStatus}</strong>
              </div>
            ) : null}
          </div>

          {notice ? <div className="admin-alert info">{notice}</div> : null}
          <div className="studio-inline-actions" style={{ padding: '0 16px', flexWrap: 'wrap' }}>
            <button type="button" className={`mini-btn ${showAllSections ? 'active' : ''}`} onClick={() => setShowAllSections((current) => !current)}>
              {showAllSections ? 'إظهار قسم واحد' : 'إظهار كل الميزات'}
            </button>
            <button type="button" className="mini-btn" onClick={requestStudioCatalogs}>مزامنة الأدوات</button>
            {['custom-elements', 'layers', 'template-elements', 'template-text', 'opening', 'design', 'history'].map((sectionKey) => (
              <button
                key={sectionKey}
                type="button"
                className={`mini-btn ${!showAllSections && openSection === sectionKey ? 'active' : ''}`}
                onClick={() => {
                  setShowAllSections(false);
                  setOpenSection(sectionKey);
                  setEditorOpen(true);
                }}
              >
                {SECTION_META[sectionKey]?.label || sectionKey}
              </button>
            ))}
          </div>
          {replaceMediaRequest ? (
            <div className="admin-alert info">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <span>
                  استبدال صورة:
                  {' '}
                  <strong>{replaceMediaRequest.label || (replaceMediaRequest.scope === 'custom' ? 'صورة حرة' : 'عنصر صوري')}</strong>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button type="button" className="mini-btn" onClick={() => setReplaceMediaRequest(null)}>إلغاء</button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="studio-editor__sections">
            {activeSections.map((sectionKey) => renderAccordionSection(sectionKey))}
          </div>

          <div className="studio-editor__footer">
            <button type="button" className="mini-btn" onClick={() => setEditorOpen(false)}>إلغاء</button>
            {isInvitationEditing ? (
              <>
                <button type="button" className="mini-btn" onClick={() => void persistInvitationDraft('save')} disabled={busy}>
                  حفظ الدعوة
                </button>
                <button type="button" className="mini-btn" onClick={() => void persistInvitationDraft('unpublish')} disabled={busy}>
                  إلغاء النشر
                </button>
                <Link className="mini-btn" href={`/invite/${existingInvitation.slug}`} target="_blank">فتح الدعوة</Link>
                <button type="button" className="btn-primary studio-primary-action" onClick={() => void persistInvitationDraft('publish')} disabled={busy}>
                  نشر التعديلات
                </button>
              </>
            ) : (
              <>
                <button type="button" className="mini-btn" onClick={() => void saveVariant()} disabled={busy}>حفظ كمسودة</button>
                <Link className="mini-btn" href={`/admin/studio/${session.id}/preview`} target="_blank">معاينة كاملة</Link>
                <button type="button" className="btn-primary studio-primary-action" onClick={() => void createInvitation()} disabled={busy}>
                  إنشاء الدعوة
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
      {replaceMediaRequest ? (
        <MediaPicker
          key={`${replaceMediaRequest.scope}-${replaceMediaRequest.id}-${replaceMediaRequest.token}`}
          label="اختيار صورة جديدة"
          value=""
          accept="image"
          folder={replaceMediaRequest.scope === 'custom' ? 'studio-free-elements' : 'studio-native-elements'}
          autoOpenToken={replaceMediaRequest.token}
          onOpenChange={(open) => {
            if (!open) {
              setReplaceMediaRequest((current) => (current?.token === replaceMediaRequest.token ? null : current));
            }
          }}
          onChange={(url) => applyMediaReplacement(url)}
          trigger={<button type="button" style={{ display: 'none' }} aria-hidden="true" tabIndex={-1}>open</button>}
        />
      ) : null}
      <MediaCropModal
        request={cropMediaRequest}
        onClose={() => setCropMediaRequest(null)}
        onApply={applyMediaCropChanges}
      />
    </div>
  );
}
