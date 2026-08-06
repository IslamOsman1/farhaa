import prisma from '@/lib/prisma';

function containsMediaReference(value, targetUrl) {
  if (!value) return false;

  if (typeof value === 'string') {
    return value === targetUrl;
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsMediaReference(item, targetUrl));
  }

  if (typeof value === 'object') {
    return Object.values(value).some((item) => containsMediaReference(item, targetUrl));
  }

  return false;
}

export async function findMediaUsage(url) {
  const [invitations, openings, templates, settings] = await Promise.all([
    prisma.invitation.findMany({
      select: {
        id: true,
        slug: true,
        coverImage: true,
        coverVideo: true,
        musicUrl: true,
        contentConfig: true,
        themeConfig: true,
        openingConfig: true,
        shareConfig: true,
      },
    }),
    prisma.opening.findMany({
      select: {
        id: true,
        slug: true,
        thumbnail: true,
        previewMediaUrl: true,
        previewImage: true,
        previewVideo: true,
        defaultConfig: true,
        background: true,
      },
    }),
    prisma.template.findMany({
      select: {
        id: true,
        slug: true,
        thumbnail: true,
        previewImage: true,
        previewVideo: true,
        defaultConfig: true,
        defaultThemeConfig: true,
      },
    }),
    prisma.siteSettings.findFirst(),
  ]);

  const usages = [];

  invitations.forEach((invitation) => {
    const matched =
      containsMediaReference(invitation.coverImage, url) ||
      containsMediaReference(invitation.coverVideo, url) ||
      containsMediaReference(invitation.musicUrl, url) ||
      containsMediaReference(invitation.contentConfig, url) ||
      containsMediaReference(invitation.themeConfig, url) ||
      containsMediaReference(invitation.openingConfig, url) ||
      containsMediaReference(invitation.shareConfig, url);

    if (matched) {
      usages.push({
        entityType: 'invitation',
        entityId: invitation.id,
        entityLabel: invitation.slug,
      });
    }
  });

  openings.forEach((opening) => {
    const matched =
      containsMediaReference(opening.thumbnail, url) ||
      containsMediaReference(opening.previewMediaUrl, url) ||
      containsMediaReference(opening.previewImage, url) ||
      containsMediaReference(opening.previewVideo, url) ||
      containsMediaReference(opening.defaultConfig, url) ||
      containsMediaReference(opening.background, url);

    if (matched) {
      usages.push({
        entityType: 'opening',
        entityId: opening.id,
        entityLabel: opening.slug,
      });
    }
  });

  templates.forEach((template) => {
    const matched =
      containsMediaReference(template.thumbnail, url) ||
      containsMediaReference(template.previewImage, url) ||
      containsMediaReference(template.previewVideo, url) ||
      containsMediaReference(template.defaultConfig, url) ||
      containsMediaReference(template.defaultThemeConfig, url);

    if (matched) {
      usages.push({
        entityType: 'template',
        entityId: template.id,
        entityLabel: template.slug,
      });
    }
  });

  if (settings) {
    const matched =
      containsMediaReference(settings.logoUrl, url) ||
      containsMediaReference(settings.defaultShareImage, url) ||
      containsMediaReference(settings.footerConfig, url) ||
      containsMediaReference(settings.promoBarSettings, url);

    if (matched) {
      usages.push({
        entityType: 'site-settings',
        entityId: settings.id,
        entityLabel: 'site-settings',
      });
    }
  }

  return usages;
}
