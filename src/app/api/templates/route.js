import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAllTemplateManifests } from '@/lib/template-system';
import { getAllTemplateDiagnostics } from '@/lib/template-diagnostics';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [templates, diagnostics] = await Promise.all([
      prisma.template.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
          invitations: {
            select: { id: true },
          },
        },
      }),
      Promise.resolve(getAllTemplateDiagnostics()),
    ]);

    const templateMap = new Map(templates.map((template) => [template.slug, template]));
    const diagnosticMap = new Map(diagnostics.map((item) => [item.slug, item]));

    const merged = getAllTemplateManifests().map((manifest) => {
      const stored = templateMap.get(manifest.slug);
      const diagnostic = diagnosticMap.get(manifest.slug);

      return {
        id: stored?.id || manifest.slug,
        slug: manifest.slug,
        name: stored?.name || manifest.name,
        nameAr: stored?.nameAr || manifest.nameAr,
        description: stored?.description || manifest.description,
        previewImage: stored?.previewImage || manifest.previewImage,
        status: stored?.status || 'ACTIVE',
        isActive: stored?.isActive ?? true,
        sourceType: manifest.sourceType,
        validationStatus: diagnostic?.status || stored?.validationStatus || 'PENDING',
        diagnostics: diagnostic?.issues || [],
        invitationsCount: stored?.invitations?.length || 0,
        openingCompatibility: manifest.openingCompatibility,
      };
    }).filter((template) => template.validationStatus === 'ok');

    return NextResponse.json(merged);
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}
