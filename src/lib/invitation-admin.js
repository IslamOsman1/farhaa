import prisma from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';

function normalizeSlugBase(value) {
  return generateSlug(String(value || '').trim())
    .replace(/^-+|-+$/g, '')
    .slice(0, 110) || 'invitation';
}

export function cloneJsonValue(value) {
  if (value == null) {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
}

export function getInvitationEffectiveStatus(invitation, now = new Date()) {
  if (!invitation) {
    return 'UNKNOWN';
  }

  if (
    invitation.status === 'PUBLISHED'
    && invitation.publishEndDate
    && new Date(invitation.publishEndDate).getTime() < now.getTime()
  ) {
    return 'EXPIRED';
  }

  return invitation.status || 'DRAFT';
}

export async function createUniqueInvitationSlug(baseInput) {
  const baseSlug = normalizeSlugBase(baseInput);
  const existing = await prisma.invitation.findUnique({
    where: { slug: baseSlug },
    select: { id: true },
  });

  if (!existing) {
    return baseSlug;
  }

  for (let index = 2; index <= 99; index += 1) {
    const candidate = `${baseSlug}-${index}`;
    const taken = await prisma.invitation.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!taken) {
      return candidate;
    }
  }

  return `${baseSlug}-${Date.now()}`;
}

export async function duplicateInvitationById(invitationId, actorId) {
  const source = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: {
      gallery: {
        orderBy: { sortOrder: 'asc' },
      },
      schedule: {
        orderBy: { sortOrder: 'asc' },
      },
      template: {
        select: {
          id: true,
          slug: true,
          name: true,
          nameAr: true,
        },
      },
      opening: {
        select: {
          id: true,
          slug: true,
          name: true,
          nameAr: true,
        },
      },
    },
  });

  if (!source) {
    return null;
  }

  const copiedSlug = await createUniqueInvitationSlug(`${source.slug}-copy`);
  const copiedTitle = source.title
    ? `${source.title} - نسخة`
    : `${source.groomName || ''} ${source.brideName || ''}`.trim() || 'نسخة دعوة';

  return prisma.invitation.create({
    data: {
      slug: copiedSlug,
      title: copiedTitle,
      clientName: source.clientName || '',
      clientPhone: source.clientPhone || null,
      clientId: source.clientId || null,
      templateId: source.templateId,
      templateVariantId: source.templateVariantId || null,
      studioSessionId: null,
      openingId: source.openingId || null,
      orderRequestId: null,
      status: 'DRAFT',
      groomName: source.groomName || '',
      groomNameEn: source.groomNameEn || null,
      brideName: source.brideName || '',
      brideNameEn: source.brideNameEn || null,
      weddingDate: source.weddingDate || null,
      venueName: source.venueName || null,
      venueNameEn: source.venueNameEn || null,
      venueAddress: source.venueAddress || null,
      venueAddressEn: source.venueAddressEn || null,
      venueLat: source.venueLat ?? null,
      venueLng: source.venueLng ?? null,
      welcomeMessage: source.welcomeMessage || null,
      welcomeMessageEn: source.welcomeMessageEn || null,
      coupleStory: source.coupleStory || null,
      coupleStoryEn: source.coupleStoryEn || null,
      coverImage: source.coverImage || null,
      coverVideo: source.coverVideo || null,
      musicUrl: source.musicUrl || null,
      customColors: source.customColors || null,
      customFonts: source.customFonts || null,
      contentConfig: cloneJsonValue(source.contentConfig),
      themeConfig: cloneJsonValue(source.themeConfig),
      openingConfig: cloneJsonValue(source.openingConfig),
      sectionConfig: cloneJsonValue(source.sectionConfig),
      seoConfig: cloneJsonValue(source.seoConfig),
      shareConfig: cloneJsonValue(source.shareConfig),
      entryConfig: cloneJsonValue(source.entryConfig),
      legacyConfig: cloneJsonValue(source.legacyConfig),
      migrationState: cloneJsonValue(source.migrationState),
      sections: source.sections,
      draftVersion: 1,
      publishedVersion: null,
      publishedAt: null,
      scheduledPublishAt: null,
      expiresAt: null,
      previewToken: null,
      previewTokenExpiresAt: null,
      updatedBy: actorId || null,
      eventType: source.eventType || null,
      locale: source.locale || 'ar',
      isActive: true,
      publishStartDate: null,
      publishEndDate: null,
      gallery: source.gallery.length > 0
        ? {
            create: source.gallery.map((item) => ({
              type: item.type || 'image',
              url: item.url,
              caption: item.caption || null,
              sortOrder: item.sortOrder || 0,
            })),
          }
        : undefined,
      schedule: source.schedule.length > 0
        ? {
            create: source.schedule.map((item) => ({
              time: item.time,
              title: item.title,
              titleEn: item.titleEn || null,
              description: item.description || null,
              descriptionEn: item.descriptionEn || null,
              icon: item.icon || null,
              sortOrder: item.sortOrder || 0,
            })),
          }
        : undefined,
    },
    include: {
      template: {
        select: {
          id: true,
          slug: true,
          name: true,
          nameAr: true,
        },
      },
      opening: {
        select: {
          id: true,
          slug: true,
          name: true,
          nameAr: true,
        },
      },
      _count: {
        select: {
          rsvps: true,
          visits: true,
          entryPasses: true,
        },
      },
    },
  });
}
