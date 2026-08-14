import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/admin-session';
import { scanTemplateStudioInventory } from '@/lib/studio-inventory';
import { getMergedOpenings } from '@/lib/template-records';
import StudioSessionsGrid from './StudioSessionsGrid';

export const dynamic = 'force-dynamic';

export default async function AdminStudioPage() {
  try {
    await requirePermission('studio.view');
  } catch (_error) {
    redirect('/admin/login');
  }

  const [sessions, openings] = await Promise.all([
    prisma.studioSession.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        baseTemplate: true,
        templateVariant: true,
      },
      take: 24,
    }),
    getMergedOpenings(),
  ]);
  const inventory = scanTemplateStudioInventory({ openings });

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

      <StudioSessionsGrid initialSessions={JSON.parse(JSON.stringify(sessions))} />
    </div>
  );
}
