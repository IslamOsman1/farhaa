import Link from 'next/link';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/admin-session';
import { getEntryPassQrRoute } from '@/lib/entry-pass';
import { getRsvpQrRoute } from '@/lib/rsvp-qr';

export const dynamic = 'force-dynamic';

function getStatusLabel(status) {
  switch (status) {
    case 'declined':
      return 'اعتذار';
    case 'pending':
      return 'معلّق';
    default:
      return 'مؤكد';
  }
}

function getStatusBadge(status) {
  switch (status) {
    case 'declined':
      return { background: '#fce8e6', color: '#c5221f' };
    case 'pending':
      return { background: '#fef7e0', color: '#b06000' };
    default:
      return { background: '#e6f4ea', color: '#137333' };
  }
}

export default async function InvitationRsvpPage({ params }) {
  await requirePermission('rsvps.manage');
  const { id } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      groomName: true,
      brideName: true,
      clientName: true,
      _count: {
        select: {
          rsvps: true,
          entryPasses: true,
        },
      },
      rsvps: {
        orderBy: { createdAt: 'desc' },
        include: {
          entryPass: {
            select: {
              id: true,
              passCode: true,
              allowedEntries: true,
              usedEntries: true,
            },
          },
        },
      },
    },
  });

  if (!invitation) {
    return <div className="admin-card">الدعوة غير موجودة.</div>;
  }

  const confirmed = invitation.rsvps.filter((item) => item.status !== 'declined').length;
  const declined = invitation.rsvps.filter((item) => item.status === 'declined').length;
  const companions = invitation.rsvps.reduce((sum, item) => sum + (item.companions || 0), 0);
  const commentsCount = invitation.rsvps.filter((item) => item.message && String(item.message).trim()).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>إدارة الحضور والردود</h2>
          <div style={{ color: '#64748b' }}>
            {invitation.groomName} و {invitation.brideName}
            {invitation.clientName ? ` - ${invitation.clientName}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href={`/api/admin/invitations/${invitation.id}/rsvps`} className="btn btn-outline">
            تنزيل الردود + التعليقات
          </a>
          <a href={`/api/admin/invitations/${invitation.id}/rsvps?format=comments`} className="btn btn-outline">
            تنزيل التعليقات فقط
          </a>
          <a href={`/api/admin/invitations/${invitation.id}/rsvps?format=qr-html`} className="btn btn-primary">
            تنزيل QR الردود
          </a>
          <Link href={`/admin/invitations/${invitation.id}/entry-passes`} className="btn btn-primary">
            تصاريح الدخول
          </Link>
          <a href={`/check-in/${invitation.slug}`} target="_blank" rel="noreferrer" className="btn btn-outline">
            بوابة الفحص
          </a>
          <Link href="/admin/invitations" className="btn btn-outline">
            رجوع للدعوات
          </Link>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-title">حضور مؤكد</div>
          <div className="stat-card-value">{confirmed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">اعتذارات</div>
          <div className="stat-card-value">{declined}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">المرافقون</div>
          <div className="stat-card-value">{companions}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">التعليقات</div>
          <div className="stat-card-value">{commentsCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">تصاريح الدخول</div>
          <div className="stat-card-value">{invitation._count?.entryPasses || 0}</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 style={{ margin: 0 }}>كل الردود</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الحالة</th>
              <th>المرافقون</th>
              <th>الهاتف</th>
              <th>بطاقة الدخول</th>
              <th>التعليق</th>
              <th>QR</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {invitation.rsvps.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>لا توجد ردود حتى الآن.</td>
              </tr>
            ) : invitation.rsvps.map((rsvp) => {
              const badge = getStatusBadge(rsvp.status);
              const qrViewUrl = rsvp.entryPass?.id
                ? getEntryPassQrRoute(rsvp.entryPass.id)
                : getRsvpQrRoute(rsvp.id);
              const qrDownloadUrl = rsvp.entryPass?.id
                ? getEntryPassQrRoute(rsvp.entryPass.id, true)
                : getRsvpQrRoute(rsvp.id, true);

              return (
                <tr key={rsvp.id}>
                  <td>{rsvp.guestName}</td>
                  <td>
                    <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '0.85rem', ...badge }}>
                      {getStatusLabel(rsvp.status)}
                    </span>
                  </td>
                  <td>{rsvp.companions || 0}</td>
                  <td>{rsvp.phone || '-'}</td>
                  <td>
                    {rsvp.entryPass ? (
                      <div>
                        <div style={{ fontWeight: 800 }}>{rsvp.entryPass.passCode}</div>
                        <small style={{ color: '#64748b' }}>
                          {rsvp.entryPass.usedEntries} / {rsvp.entryPass.allowedEntries}
                        </small>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={{ maxWidth: '320px', whiteSpace: 'pre-wrap' }}>{rsvp.message || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <a href={qrViewUrl} target="_blank" rel="noreferrer" className="btn btn-sm">
                        عرض
                      </a>
                      <a href={qrDownloadUrl} className="btn btn-sm" style={{ background: '#1a73e8', color: '#fff' }}>
                        تحميل
                      </a>
                    </div>
                  </td>
                  <td>{new Date(rsvp.createdAt).toLocaleString('ar-EG')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
