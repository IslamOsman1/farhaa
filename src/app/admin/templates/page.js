import Image from 'next/image';
import prisma from '@/lib/prisma';
import { getAllTemplateManifests } from '@/lib/template-system';
import { getAllTemplateDiagnostics } from '@/lib/template-diagnostics';

export const dynamic = 'force-dynamic';

export default async function AdminTemplatesPage() {
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
  const diagnosticsMap = new Map(diagnostics.map((item) => [item.slug, item]));

  const items = getAllTemplateManifests().map((manifest) => {
    const dbItem = templateMap.get(manifest.slug);
    const diagnostic = diagnosticsMap.get(manifest.slug);
    return {
      ...manifest,
      id: dbItem?.id || manifest.slug,
      invitationsCount: dbItem?.invitations?.length || 0,
      status: dbItem?.status || 'ACTIVE',
      validationStatus: diagnostic?.status || 'ok',
      diagnostics: diagnostic?.issues || [],
    };
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>إدارة القوالب</h2>
          <p>سجل القوالب أصبح يعتمد على manifests وتشخيصات واضحة بدل ربط يدوي داخل المحرر.</p>
        </div>
      </div>

      <div className="admin-grid-cards">
        {items.map((template) => (
          <article key={template.slug} className="admin-card card-pad">
            <div className="template-thumb">
              {template.previewImage ? (
                <Image
                  src={template.previewImage}
                  alt={template.nameAr}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              ) : null}
            </div>
            <div className="stack-sm">
              <div className={`badge ${template.validationStatus === 'error' ? 'badge-danger' : template.validationStatus === 'warning' ? 'badge-warning' : 'badge-success'}`}>
                {template.validationStatus === 'error' ? 'فيه أخطاء' : template.validationStatus === 'warning' ? 'يحتاج Adapter' : 'سليم'}
              </div>
              <h3>{template.nameAr}</h3>
              <p>{template.description}</p>
              <div className="meta-pair"><strong>Slug:</strong><span dir="ltr">{template.slug}</span></div>
              <div className="meta-pair"><strong>النوع:</strong><span>{template.sourceType}</span></div>
              <div className="meta-pair"><strong>الاستخدام:</strong><span>{template.invitationsCount} دعوة</span></div>
              <div className="meta-pair"><strong>الافتتاحيات:</strong><span>{template.openingCompatibility.join('، ')}</span></div>
              {template.diagnostics.slice(0, 2).map((issue, index) => (
                <div key={`${template.slug}-${index}`} className="inline-issue">
                  {issue.message}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
