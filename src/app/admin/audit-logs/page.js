import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage({ searchParams }) {
  await requirePermission('auditLogs.view');
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams.page || 1);
  const pageSize = 20;
  const where = {
    ...(resolvedSearchParams.action ? { action: resolvedSearchParams.action } : {}),
    ...(resolvedSearchParams.entityType ? { entityType: resolvedSearchParams.entityType } : {}),
    ...(resolvedSearchParams.actorId ? { actorId: resolvedSearchParams.actorId } : {}),
    ...(resolvedSearchParams.search
      ? {
          OR: [
            { summary: { contains: resolvedSearchParams.search, mode: 'insensitive' } },
            { entityId: { contains: resolvedSearchParams.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return (
    <div className="stack-lg">
      <div className="admin-page-header">
        <div>
          <h2>سجل العمليات</h2>
          <p>متابعة التعديلات الحساسة داخل لوحة التحكم مع إخفاء البيانات السرية تلقائيًا.</p>
        </div>
      </div>

      <form className="admin-card card-pad audit-filters">
        <input name="search" placeholder="بحث" defaultValue={resolvedSearchParams.search || ''} />
        <input name="action" placeholder="العملية" defaultValue={resolvedSearchParams.action || ''} />
        <input name="entityType" placeholder="الكيان" defaultValue={resolvedSearchParams.entityType || ''} />
        <input name="actorId" placeholder="المستخدم" defaultValue={resolvedSearchParams.actorId || ''} />
        <button type="submit" className="mini-btn">تصفية</button>
      </form>

      <div className="stack-md">
        {logs.map((log) => (
          <article key={log.id} className="admin-card card-pad stack-sm">
            <div className="badge-row">
              <span className="badge badge-info">{log.action}</span>
              <span className="badge">{log.entityType}</span>
            </div>
            <strong>{log.summary || 'بدون ملخص'}</strong>
            <div className="meta-pair"><strong>المستخدم:</strong><span>{log.actorId || 'غير محدد'}</span></div>
            <div className="meta-pair"><strong>الكيان:</strong><span>{log.entityId || '—'}</span></div>
            <div className="meta-pair"><strong>الوقت:</strong><span>{new Date(log.createdAt).toLocaleString('ar-EG')}</span></div>
            {log.details ? (
              <details>
                <summary>عرض التفاصيل</summary>
                <pre className="code-block">{JSON.stringify(log.details, null, 2)}</pre>
              </details>
            ) : null}
          </article>
        ))}
      </div>

      <div className="media-pagination">
        <span>إجمالي السجلات: {total}</span>
        <div className="inline-actions">
          {page > 1 ? <a className="mini-btn" href={`?page=${page - 1}`}>السابق</a> : null}
          {page * pageSize < total ? <a className="mini-btn" href={`?page=${page + 1}`}>التالي</a> : null}
        </div>
      </div>
    </div>
  );
}
