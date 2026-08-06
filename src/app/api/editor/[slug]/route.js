import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { requireAdminSession } from '@/lib/admin-session';
import {
  buildInvitationRenderConfig,
  getOpeningBySlug,
  getTemplateManifest,
  normalizeInvitationData,
} from '@/lib/template-system';
import { writeAuditLog } from '@/lib/admin-security';

export const dynamic = 'force-dynamic';

const savePayloadSchema = z.object({
  templateSlug: z.string().min(1),
  openingSlug: z.string().min(1),
  contentConfig: z.record(z.any()),
  themeConfig: z.record(z.any()).default({}),
  sectionConfig: z.record(z.boolean()).default({}),
  openingConfig: z.record(z.any()).default({}),
  status: z.string().optional(),
  action: z.enum(['save', 'publish', 'unpublish']).optional(),
});

function buildLegacyStory(contentConfig) {
  return {
    verseText: contentConfig.verseText || '',
    invitationText: contentConfig.invitationText || '',
    groomParentsLabel: contentConfig.groomParentsLabel || '',
    groomParents: contentConfig.groomParents || '',
    brideParentsLabel: contentConfig.brideParentsLabel || '',
    brideParents: contentConfig.brideParents || '',
    closingNote: contentConfig.closingNote || '',
    closingHashtag: contentConfig.closingHashtag || '',
    closingFamilies: contentConfig.closingFamilies || '',
    locationLink: contentConfig.locationLink || '',
    program: Array.isArray(contentConfig.program) ? contentConfig.program : [],
    notes: Array.isArray(contentConfig.notes) ? contentConfig.notes : [],
    contactLabel: contentConfig.contactLabel || '',
    contactName: contentConfig.contactName || '',
    contactPhone: contentConfig.contactPhone || '',
    venueImage: contentConfig.venueImage || '',
    galleryImages: Array.isArray(contentConfig.galleryImages) ? contentConfig.galleryImages : [],
  };
}

async function ensureTemplateBySlug(slug) {
  const manifest = getTemplateManifest(slug);
  if (!manifest) {
    throw new Error(`Unknown template slug: ${slug}`);
  }

  return prisma.template.upsert({
    where: { slug },
    update: {
      name: manifest.name,
      nameAr: manifest.nameAr,
      description: manifest.description,
      previewImage: manifest.previewImage,
      manifest,
      capabilities: manifest.capabilities,
      defaultConfig: manifest.defaultValues,
      defaultThemeConfig: manifest.defaultValues.theme,
      defaultSectionConfig: manifest.defaultValues.sections,
      compatibleOpenings: manifest.openingCompatibility,
      validationStatus: manifest.capabilities.requiresNativeAdapter ? 'NEEDS_NATIVE_ADAPTER' : 'VALIDATED',
    },
    create: {
      name: manifest.name,
      nameAr: manifest.nameAr,
      slug: manifest.slug,
      description: manifest.description,
      descriptionAr: manifest.descriptionAr,
      previewImage: manifest.previewImage,
      thumbnail: manifest.thumbnail,
      manifest,
      capabilities: manifest.capabilities,
      defaultConfig: manifest.defaultValues,
      defaultThemeConfig: manifest.defaultValues.theme,
      defaultSectionConfig: manifest.defaultValues.sections,
      compatibleOpenings: manifest.openingCompatibility,
      validationStatus: manifest.capabilities.requiresNativeAdapter ? 'NEEDS_NATIVE_ADAPTER' : 'VALIDATED',
    },
  });
}

async function ensureOpeningBySlug(slug) {
  const opening = getOpeningBySlug(slug);

  return prisma.opening.upsert({
    where: { slug: opening.slug },
    update: {
      name: opening.name,
      nameAr: opening.nameAr,
      description: opening.description,
      descriptionAr: opening.descriptionAr,
      type: opening.type,
      thumbnail: opening.thumbnail,
      defaultConfig: opening.defaultConfig,
      compatibilityRules: opening.compatibilityRules,
      isActive: opening.isActive,
      sortOrder: opening.sortOrder,
      status: 'ACTIVE',
    },
    create: {
      slug: opening.slug,
      name: opening.name,
      nameAr: opening.nameAr,
      description: opening.description,
      descriptionAr: opening.descriptionAr,
      type: opening.type,
      thumbnail: opening.thumbnail,
      defaultConfig: opening.defaultConfig,
      compatibilityRules: opening.compatibilityRules,
      isActive: opening.isActive,
      sortOrder: opening.sortOrder,
      status: 'ACTIVE',
    },
  });
}

async function createRevision(invitationId, snapshot, actorId, status, changeSummary) {
  const latest = await prisma.invitationRevision.findFirst({
    where: { invitationId },
    orderBy: { revisionNumber: 'desc' },
  });

  const revisionNumber = latest ? latest.revisionNumber + 1 : 1;
  await prisma.invitationRevision.create({
    data: {
      invitationId,
      revisionNumber,
      snapshot,
      status,
      createdBy: actorId,
      changeSummary,
    },
  });

  return revisionNumber;
}

export async function GET(_request, { params }) {
  try {
    await requireAdminSession('manageInvitations');
    const resolvedParams = await params;

    const invitation = await prisma.invitation.findUnique({
      where: { slug: resolvedParams.slug },
      include: {
        template: true,
        opening: true,
        revisions: {
          orderBy: { revisionNumber: 'desc' },
          take: 20,
        },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const manifest = getTemplateManifest(invitation.template.slug);
    const renderConfig = buildInvitationRenderConfig({
      invitation,
      manifest,
      opening: invitation.opening || getOpeningBySlug('native-template'),
      preview: true,
    });

    return NextResponse.json({
      invitation,
      manifest,
      normalized: normalizeInvitationData(invitation),
      renderConfig,
    });
  } catch (error) {
    const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to fetch invitation' }, { status });
  }
}

export async function PUT(request, { params }) {
  try {
    const actor = await requireAdminSession('manageInvitations');
    const resolvedParams = await params;
    const body = await request.json();
    const parsed = savePayloadSchema.parse(body);

    const invitation = await prisma.invitation.findUnique({
      where: { slug: resolvedParams.slug },
      include: {
        template: true,
        opening: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const template = await ensureTemplateBySlug(parsed.templateSlug);
    const opening = await ensureOpeningBySlug(parsed.openingSlug);
    const legacyStory = buildLegacyStory(parsed.contentConfig);
    const nextStatus =
      parsed.action === 'publish'
        ? 'PUBLISHED'
        : parsed.action === 'unpublish'
          ? 'DRAFT'
          : parsed.status || invitation.status || 'DRAFT';

    const updated = await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        templateId: template.id,
        openingId: opening.id,
        status: nextStatus,
        publishedAt: parsed.action === 'publish' ? new Date() : nextStatus === 'PUBLISHED' ? invitation.publishedAt || new Date() : null,
        groomName: parsed.contentConfig.groomName || invitation.groomName,
        brideName: parsed.contentConfig.brideName || invitation.brideName,
        weddingDate: parsed.contentConfig.weddingDate ? new Date(parsed.contentConfig.weddingDate) : invitation.weddingDate,
        venueName: parsed.contentConfig.venueName || invitation.venueName,
        venueAddress: parsed.contentConfig.venueAddress || invitation.venueAddress,
        welcomeMessage: parsed.contentConfig.welcomeMessage || invitation.welcomeMessage,
        musicUrl: parsed.contentConfig.musicUrl || invitation.musicUrl,
        contentConfig: parsed.contentConfig,
        themeConfig: parsed.themeConfig,
        sectionConfig: parsed.sectionConfig,
        openingConfig: parsed.openingConfig,
        coupleStory: JSON.stringify(legacyStory),
        customColors: JSON.stringify(parsed.themeConfig || {}),
        customFonts: JSON.stringify(parsed.themeConfig || {}),
        sections: JSON.stringify(parsed.sectionConfig || {}),
        legacyConfig: invitation.legacyConfig || normalizeInvitationData(invitation).legacyConfig,
        updatedBy: actor.id,
      },
      include: {
        template: true,
        opening: true,
      },
    });

    const manifest = getTemplateManifest(template.slug);
    const renderConfig = buildInvitationRenderConfig({
      invitation: updated,
      manifest,
      opening,
      preview: true,
    });

    const revisionNumber = await createRevision(
      updated.id,
      {
        templateSlug: template.slug,
        openingSlug: opening.slug,
        contentConfig: parsed.contentConfig,
        themeConfig: parsed.themeConfig,
        sectionConfig: parsed.sectionConfig,
        openingConfig: parsed.openingConfig,
        renderConfig,
      },
      actor.id,
      nextStatus,
      parsed.action === 'publish' ? 'Publish invitation' : 'Save invitation draft',
    );

    await prisma.invitation.update({
      where: { id: updated.id },
      data: {
        draftVersion: revisionNumber,
        publishedVersion: nextStatus === 'PUBLISHED' ? revisionNumber : updated.publishedVersion,
      },
    });

    await writeAuditLog({
      action: parsed.action === 'publish' ? 'publish' : 'save',
      entityType: 'invitation',
      entityId: updated.id,
      actorId: actor.id,
      summary: `Updated invitation ${updated.slug}`,
      details: {
        templateSlug: template.slug,
        openingSlug: opening.slug,
        revisionNumber,
      },
    });

    return NextResponse.json({
      success: true,
      invitation: updated,
      renderConfig,
      revisionNumber,
      status: nextStatus,
    });
  } catch (error) {
    const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
    console.error('Editor save error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update invitation' }, { status });
  }
}
