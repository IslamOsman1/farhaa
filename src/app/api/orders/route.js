import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getOpeningBySlug, getTemplateManifest } from '@/lib/template-system';

const orderSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  countryCode: z.string().trim().optional().default(''),
  occasion: z.string().trim().optional().default('زفاف'),
  templateId: z.string().trim().min(1),
});

async function ensureTemplate(slug) {
  const manifest = getTemplateManifest(slug);
  if (!manifest) {
    throw new Error('Unknown template');
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
      compatibleOpenings: manifest.openingCompatibility,
    },
    create: {
      slug: manifest.slug,
      name: manifest.name,
      nameAr: manifest.nameAr,
      description: manifest.description,
      descriptionAr: manifest.descriptionAr,
      previewImage: manifest.previewImage,
      manifest,
      capabilities: manifest.capabilities,
      defaultConfig: manifest.defaultValues,
      compatibleOpenings: manifest.openingCompatibility,
    },
  });
}

async function ensureOpening() {
  const opening = getOpeningBySlug('native-template');
  return prisma.opening.upsert({
    where: { slug: opening.slug },
    update: {
      name: opening.name,
      nameAr: opening.nameAr,
      type: opening.type,
      thumbnail: opening.thumbnail,
      defaultConfig: opening.defaultConfig,
      compatibilityRules: opening.compatibilityRules,
      status: 'ACTIVE',
    },
    create: {
      slug: opening.slug,
      name: opening.name,
      nameAr: opening.nameAr,
      type: opening.type,
      thumbnail: opening.thumbnail,
      defaultConfig: opening.defaultConfig,
      compatibilityRules: opening.compatibilityRules,
      status: 'ACTIVE',
    },
  });
}

export async function POST(request) {
  try {
    const payload = orderSchema.parse(await request.json());
    const template = await ensureTemplate(payload.templateId);
    const opening = await ensureOpening();
    const slug = crypto.randomBytes(6).toString('hex');
    const fullPhone = `${payload.countryCode || ''}${payload.phone}`.replace(/\s+/g, '');

    let client = await prisma.client.findFirst({
      where: { phone: fullPhone },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: payload.name,
          phone: fullPhone,
          status: 'ACTIVE',
        },
      });
    }

    const orderRequest = await prisma.orderRequest.create({
      data: {
        name: payload.name,
        phone: fullPhone,
        countryCode: payload.countryCode,
        occasion: payload.occasion,
        templateSlug: template.slug,
        invitationSlug: slug,
        status: 'NEW',
      },
    });

    const invitation = await prisma.invitation.create({
      data: {
        slug,
        title: `${payload.name} - ${payload.occasion}`,
        clientId: client.id,
        clientName: payload.name,
        clientPhone: fullPhone,
        templateId: template.id,
        openingId: opening.id,
        orderRequestId: orderRequest.id,
        groomName: payload.occasion === 'زفاف' ? 'العريس' : payload.name,
        brideName: payload.occasion === 'زفاف' ? 'العروس' : '',
        status: 'DRAFT',
        eventType: payload.occasion,
        contentConfig: {
          welcomeMessage: 'يتشرّفان بدعوتكم لمشاركتهما فرحة العمر',
          galleryImages: [],
          program: [],
          notes: [],
        },
        themeConfig: template.defaultThemeConfig || {},
        sectionConfig: template.defaultSectionConfig || {
          hero: true,
          details: true,
          timeline: true,
          gallery: true,
          rsvp: true,
          calendar: true,
        },
        openingConfig: opening.defaultConfig || {},
      },
    });

    return NextResponse.json({ success: true, slug: invitation.slug }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}
