import { z } from 'zod';
import {
  buildInvitationRenderConfig,
  getOpeningBySlug,
  normalizeInvitationData,
} from '@/lib/template-system';

const studioRecordSchema = z.record(z.any());
const customElementDeviceOverrideSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  fontSize: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  opacity: z.number().optional(),
  rotation: z.number().optional(),
  cropX: z.number().optional(),
  cropY: z.number().optional(),
});
const nativeElementOverrideSchema = z.object({
  label: z.string().optional(),
  selector: z.string().optional(),
  kind: z.string().optional(),
  textContent: z.string().optional(),
  mediaUrl: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  scale: z.number().optional(),
  rotation: z.number().optional(),
  opacity: z.number().optional(),
  zIndex: z.number().optional(),
  cropX: z.number().optional(),
  cropY: z.number().optional(),
  color: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  fontStyle: z.string().optional(),
  lineHeight: z.string().optional(),
  letterSpacing: z.string().optional(),
  textAlign: z.string().optional(),
  textTransform: z.string().optional(),
  textDecoration: z.string().optional(),
  direction: z.string().optional(),
  textShadow: z.string().optional(),
  backgroundColor: z.string().optional(),
  borderRadius: z.string().optional(),
  borderWidth: z.string().optional(),
  borderColor: z.string().optional(),
  boxShadow: z.string().optional(),
  objectFit: z.string().optional(),
  hidden: z.boolean().optional(),
  locked: z.boolean().optional(),
});

export const studioDraftSchema = z.object({
  templateSlug: z.string().min(1),
  openingSlug: z.string().min(1).default('native-template'),
  contentConfig: studioRecordSchema.default({}),
  themeConfig: studioRecordSchema.default({}),
  sectionConfig: z.record(z.boolean()).default({}),
  openingConfig: studioRecordSchema.default({}),
  customElements: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'image', 'icon']),
    content: z.string(),
    x: z.number(),
    y: z.number(),
    name: z.string().optional(),
    fontSize: z.string().optional(),
    color: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    fontFamily: z.string().optional(),
    opacity: z.number().optional(),
    rotation: z.number().optional(),
    zIndex: z.number().optional(),
    cropX: z.number().optional(),
    cropY: z.number().optional(),
    hidden: z.boolean().optional(),
    locked: z.boolean().optional(),
    deviceOverrides: z.object({
      mobile: customElementDeviceOverrideSchema.optional(),
      tablet: customElementDeviceOverrideSchema.optional(),
      desktop: customElementDeviceOverrideSchema.optional(),
    }).optional(),
  })).default([]),
  nativeElementOverrides: z.record(nativeElementOverrideSchema).default({}),
  textOverrides: z.record(z.string()).default({}),
  uiConfig: studioRecordSchema.default({ bilingualEnabled: false, defaultLocale: 'ar' }),
  devicePreview: studioRecordSchema.default({ mode: 'mobile', width: 390, height: 844 }),
});

export const studioSessionCreateSchema = z.object({
  templateSlug: z.string().trim().min(1),
  name: z.string().trim().min(1).max(120).optional(),
});

export const studioSessionUpdateSchema = studioDraftSchema.extend({
  name: z.string().trim().min(1).max(120).optional(),
  status: z.enum(['DRAFT', 'READY', 'ARCHIVED']).optional(),
});

export const studioVariantSchema = z.object({
  name: z.string().trim().min(1).max(120),
  nameAr: z.string().trim().max(120).optional().or(z.literal('')),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(140).optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
});

export const studioInvitationSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).min(1).max(140),
  title: z.string().trim().max(160).optional().or(z.literal('')),
  clientName: z.string().trim().min(1).max(120),
  clientPhone: z.string().trim().max(40).optional().or(z.literal('')),
});

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function splitMediaFields(manifest, contentConfig = {}) {
  const mediaFieldTypes = new Set(['image', 'video', 'audio', 'gallery']);
  const fieldMap = new Map((manifest?.editableFields || []).map((field) => [field.key, field]));

  return Object.entries(contentConfig).reduce((accumulator, [key, value]) => {
    if (value == null || value === '') {
      return accumulator;
    }

    const field = fieldMap.get(key);
    if (field && mediaFieldTypes.has(field.type)) {
      accumulator.assets[key] = value;
    } else {
      accumulator.content[key] = value;
    }

    return accumulator;
  }, { content: {}, assets: {} });
}

export function createStudioDraftFromManifest(manifest, seed = {}) {
  const defaults = manifest?.defaultValues || {};
  const defaultTheme = defaults.theme || {};
  const defaultSections = defaults.sections || {};

  return studioDraftSchema.parse({
    templateSlug: manifest.slug,
    openingSlug: seed.openingSlug || 'native-template',
    contentConfig: {
      ...defaults,
      ...seed.contentConfig,
      galleryImages: arrayValue(seed.contentConfig?.galleryImages || defaults.galleryImages),
      program: arrayValue(seed.contentConfig?.program || defaults.program),
      notes: arrayValue(seed.contentConfig?.notes || defaults.notes),
    },
    themeConfig: {
      ...defaultTheme,
      ...seed.themeConfig,
    },
    sectionConfig: {
      ...defaultSections,
      ...seed.sectionConfig,
    },
    openingConfig: {
      allowSkip: true,
      ...seed.openingConfig,
    },
    customElements: Array.isArray(seed.customElements) ? seed.customElements : [],
    nativeElementOverrides:
      seed.nativeElementOverrides && typeof seed.nativeElementOverrides === 'object' && !Array.isArray(seed.nativeElementOverrides)
        ? seed.nativeElementOverrides
        : {},
    textOverrides: seed.textOverrides && typeof seed.textOverrides === 'object' ? seed.textOverrides : {},
    uiConfig: {
      bilingualEnabled: false,
      defaultLocale: 'ar',
      ...seed.uiConfig,
    },
    devicePreview: {
      mode: 'mobile',
      width: 390,
      height: 844,
      ...seed.devicePreview,
    },
  });
}

export function createStudioDraftFromInvitation({ invitation, manifest }) {
  const normalized = normalizeInvitationData(invitation);

  return createStudioDraftFromManifest(manifest, {
    openingSlug: invitation.opening?.slug || 'native-template',
    contentConfig: {
      ...normalized.contentConfig,
      weddingDate: invitation.weddingDate ? new Date(invitation.weddingDate).toISOString().slice(0, 16) : '',
    },
    themeConfig: normalized.themeConfig,
    sectionConfig: normalized.sectionConfig,
    openingConfig: normalized.openingConfig,
    customElements: Array.isArray(invitation?.contentConfig?.__customElements) ? invitation.contentConfig.__customElements : [],
    nativeElementOverrides:
      invitation?.contentConfig?.__nativeElementOverrides
      && typeof invitation.contentConfig.__nativeElementOverrides === 'object'
      && !Array.isArray(invitation.contentConfig.__nativeElementOverrides)
        ? invitation.contentConfig.__nativeElementOverrides
        : {},
    textOverrides: invitation?.contentConfig?.__textOverrides && typeof invitation.contentConfig.__textOverrides === 'object'
      ? invitation.contentConfig.__textOverrides
      : {},
    uiConfig: invitation?.uiConfig || parseUiConfig(invitation),
  });
}

function parseUiConfig(invitation) {
  const fromContent = invitation?.contentConfig && typeof invitation.contentConfig === 'object'
    ? invitation.contentConfig.__uiConfig
    : undefined;
  return {
    bilingualEnabled: false,
    defaultLocale: invitation?.locale === 'en' ? 'en' : 'ar',
    ...(fromContent && typeof fromContent === 'object' ? fromContent : {}),
  };
}

export function buildStudioDraftFromSession({ session, manifest }) {
  return createStudioDraftFromManifest(manifest, {
    openingSlug:
      session.selectedOpening?.slug ||
      session.selectedOpeningSlug ||
      session.config?.openingSlug ||
      'native-template',
    contentConfig: {
      ...(session.content || {}),
      ...(session.assets || {}),
    },
    themeConfig: session.config?.themeConfig || {},
    sectionConfig: session.config?.sectionConfig || {},
    openingConfig: session.selectedOpeningConfig || session.config?.openingConfig || {},
    customElements: Array.isArray(session.config?.customElements) ? session.config.customElements : [],
    nativeElementOverrides:
      session.config?.nativeElementOverrides
      && typeof session.config.nativeElementOverrides === 'object'
      && !Array.isArray(session.config.nativeElementOverrides)
        ? session.config.nativeElementOverrides
        : {},
    textOverrides: session.config?.textOverrides && typeof session.config.textOverrides === 'object' ? session.config.textOverrides : {},
    uiConfig: session.config?.uiConfig || {},
    devicePreview: session.devicePreview || {},
  });
}

export function buildStudioSessionUpdateData({ manifest, draft, openingId = null, invitationId = null }) {
  const parsed = studioDraftSchema.parse(draft);
  const { content, assets } = splitMediaFields(manifest, parsed.contentConfig);

  return {
    name: draft.name,
    status: draft.status,
    invitationId: invitationId || undefined,
    selectedOpeningId: openingId || null,
    selectedOpeningConfig: parsed.openingConfig,
    devicePreview: parsed.devicePreview,
    config: {
      templateSlug: parsed.templateSlug,
      openingSlug: parsed.openingSlug,
      themeConfig: parsed.themeConfig,
      sectionConfig: parsed.sectionConfig,
      openingConfig: parsed.openingConfig,
      customElements: parsed.customElements,
      nativeElementOverrides: parsed.nativeElementOverrides,
      textOverrides: parsed.textOverrides,
      uiConfig: parsed.uiConfig,
    },
    content,
    assets,
  };
}

export function buildStudioRenderPayload({ session, manifest, opening }) {
  const draft = buildStudioDraftFromSession({ session, manifest });
  const selectedOpening = opening || getOpeningBySlug(draft.openingSlug);
  const contentConfig = {
    ...draft.contentConfig,
    ...(session.assets || {}),
  };

  const previewInvitation = {
    id: session.id,
    slug: `studio-${session.id}`,
    locale: 'ar',
    template: { slug: manifest.slug },
    opening: selectedOpening,
    groomName: contentConfig.groomName || '',
    brideName: contentConfig.brideName || '',
    weddingDate: contentConfig.weddingDate ? new Date(contentConfig.weddingDate) : null,
    venueName: contentConfig.venueName || '',
    venueAddress: contentConfig.venueAddress || '',
    welcomeMessage: contentConfig.welcomeMessage || '',
    musicUrl: contentConfig.musicUrl || '',
    contentConfig,
    themeConfig: draft.themeConfig,
    sectionConfig: draft.sectionConfig,
    openingConfig: draft.openingConfig,
    customElements: draft.customElements,
    nativeElementOverrides: draft.nativeElementOverrides,
    textOverrides: draft.textOverrides,
    uiConfig: {
      ...(draft.uiConfig || {}),
      deviceMode: draft.devicePreview?.mode || 'mobile',
      showPromoBar: false,
    },
  };

  return {
    draft,
    renderConfig: buildInvitationRenderConfig({
      invitation: previewInvitation,
      manifest,
      opening: selectedOpening,
      preview: false,
    }),
  };
}
