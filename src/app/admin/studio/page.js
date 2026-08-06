import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/admin-session';
import { scanTemplateStudioInventory } from '@/lib/studio-inventory';

export const dynamic = 'force-dynamic';

export default async function AdminStudioPage() {
  try {
    await requirePermission('studio.view');
  } catch (error) {
    redirect('/admin/login');
  }

  const [sessions, inventory] = await Promise.all([
    prisma.studioSession.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        baseTemplate: true,
        templateVariant: true,
      },
      take: 24,
    }),
    Promise.resolve(scanTemplateStudioInventory()),
  ]);

  return (
    <div className="stack-lg">
      <div className="admin-page-header">
        <div>
          <h2>استوديو الدعوات</h2>
          <p>بيئة تحرير مستقلة لإنشاء تصميمات جديدة من القوالب الحالية دون تعديل الملفات الأصلية.</p>
        </div>
        <Link className="btn-primary" href="/admin/studio/new">
          جلسة جديدة
        </Link>
      </div>

      <div className="studio-dashboard-grid">
        <article className="admin-card card-pad">
          <h3>إحصاءات الجرد</h3>
          <div className="studio-metrics">
            <div><strong>{inventory.summary.templates}</strong><span>قالب</span></div>
            <div><strong>{inventory.summary.images}</strong><span>صورة</span></div>
            <div><strong>{inventory.summary.videos}</strong><span>فيديو</span></div>
            <div><strong>{inventory.summary.audio}</strong><span>صوت</span></div>
          </div>
        </article>
        <article className="admin-card card-pad">
          <h3>جلساتك الأخيرة</h3>
          <div className="studio-metrics">
            <div><strong>{sessions.length}</strong><span>جلسة</span></div>
            <div><strong>{sessions.filter((item) => item.templateVariantId).length}</strong><span>نسخة داخلية</span></div>
            <div><strong>{sessions.filter((item) => item.invitationId).length}</strong><span>دعوة منشأة</span></div>
          </div>
        </article>
      </div>

      <div className="admin-grid-cards">
        {sessions.map((session) => (
          <article key={session.id} className="admin-card card-pad studio-session-card">
            <div className="stack-sm">
              <div className="badge badge-warning">{session.status}</div>
              <h3>{session.name}</h3>
              <p>{session.baseTemplate?.nameAr || session.baseTemplate?.name || 'قالب غير معروف'}</p>
              <div className="meta-pair"><strong>آخر تحديث:</strong><span>{new Date(session.updatedAt || session.createdAt).toLocaleString('ar-EG')}</span></div>
              <div className="meta-pair"><strong>النسخة الداخلية:</strong><span>{session.templateVariant?.name || 'لا توجد'}</span></div>
            </div>
            <div className="studio-card-actions">
              <Link className="btn-primary" href={`/admin/studio/${session.id}`}>فتح الجلسة</Link>
              <Link className="btn-secondary" href={`/admin/studio/${session.id}/preview`} target="_blank">معاينة</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
