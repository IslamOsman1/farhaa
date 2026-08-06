import Link from 'next/link';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/admin-session';
import { OPENING_LIBRARY, getAllTemplateManifests } from '@/lib/template-system';

export const dynamic = 'force-dynamic';

export default async function AdminOpeningsPage() {
  await requirePermission('openings.view');

  const [stored, invitations] = await Promise.all([
    prisma.opening.findMany({
      orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }],
    }),
    prisma.invitation.groupBy({
      by: ['openingId'],
      _count: { openingId: true },
      where: { openingId: { not: null } },
    }),
  ]);

  const usageMap = invitations.reduce((map, invitation) => {
    map.set(invitation.openingId, invitation._count.openingId);
    return map;
  }, new Map());

  const storedMap = new Map(stored.map((opening) => [opening.slug, opening]));
  const templateManifests = getAllTemplateManifests();

  const openings = [
    ...OPENING_LIBRARY.map((opening) => {
      const dbItem = storedMap.get(opening.slug);
      return {
        ...opening,
        id: dbItem?.id || opening.slug,
        isActive: dbItem?.isActive ?? opening.isActive,
        isDefault: dbItem?.isDefault ?? false,
        sortOrder: dbItem?.sortOrder ?? opening.sortOrder,
        compatibleTemplates: dbItem?.compatibleTemplates || opening.compatibilityRules?.allowedTemplateSlugs || [],
        usageCount: usageMap.get(dbItem?.id) || 0,
      };
    }),
    ...stored.filter((opening) => !OPENING_LIBRARY.some((item) => item.slug === opening.slug)).map((opening) => ({
      ...opening,
      usageCount: usageMap.get(opening.id) || 0,
    })),
  ];

  return (
    <div className="stack-lg">
      <div className="admin-page-header">
        <div>
          <h2>مكتبة الافتتاحيات</h2>
          <p>إدارة جميع الافتتاحيات المستقلة وربطها بالدعوات والقوالب مع تتبع التوافق والاستخدام.</p>
        </div>
        <Link href="/admin/openings/new" className="btn-primary">
          إضافة افتتاحية
        </Link>
      </div>

      <div className="admin-grid-cards">
        {openings.map((opening) => (
          <article key={`${opening.id}-${opening.slug}`} className="admin-card card-pad">
            <div className="stack-sm">
              <div className="badge-row">
                <span className="badge badge-info">{opening.type}</span>
                {opening.isDefault ? <span className="badge badge-success">افتراضية</span> : null}
              </div>
              <h3>{opening.nameAr}</h3>
              <p>{opening.descriptionAr || opening.description || 'بدون وصف.'}</p>
              <div className="meta-pair"><strong>الحالة:</strong><span>{opening.isActive ? 'نشطة' : 'معطلة'}</span></div>
              <div className="meta-pair"><strong>مرتبطة بـ:</strong><span>{opening.usageCount} دعوة</span></div>
              <div className="meta-pair"><strong>القوالب المتوافقة:</strong><span>{opening.compatibleTemplates?.length || templateManifests.length}</span></div>
              <div className="card-actions">
                {storedMap.get(opening.slug)?.id ? (
                  <Link href={`/admin/openings/${storedMap.get(opening.slug).id}/edit`} className="mini-btn">
                    تعديل
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
