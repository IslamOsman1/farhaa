import { z } from 'zod';
import {
  buildInvitationRenderConfig,
  getOpeningBySlug,
  normalizeInvitationData,
} from '@/lib/template-system';

const studioRecordSchema = z.record(z.any());

export const studioDraftSchema = z.object({
  templateSlug: z.string().min(1),
  openingSlug: z.string().min(1).default('native-template'),
  contentConfig: studioRecordSchema.default({}),
  themeConfig: studioRecordSchema.default({}),
  sectionConfig: z.record(z.boolean()).default({}),
  openingConfig: studioRecordSchema.default({}),
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
  const fields = manifest?.editableFields || [];

  return fields.reduce(
    (accumulator, field) => {
      const value = contentConfig[field.key];
      if (value == null || value === '') {
        return accumulator;
      }

      if (mediaFieldTypes.has(field.type)) {
        accumulator.assets[field.key] = value;
      } else {
        accumulator.content[field.key] = value;
      }

      return accumulator;
    },
    { content: {}, assets: {} },
  );
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
  });
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
  };

  return {
    draft,
    renderConfig: buildInvitationRenderConfig({
      invitation: previewInvitation,
      manifest,
      opening: selectedOpening,
      preview: true,
    }),
  };
}
