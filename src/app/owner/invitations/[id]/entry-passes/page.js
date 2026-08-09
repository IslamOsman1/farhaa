import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  getEntryPassDerivedStatus,
  getEntryPassPublicLink,
  getEntryPassQrRoute,
  getEntryPassRemaining,
} from '@/lib/entry-pass';
import { buildInvitationOwnerPortalPath, hasInvitationOwnerPortalAccess } from '@/lib/owner-portal';

export const dynamic = 'force-dynamic';

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-card-title">{label}</div>
      <div className="stat-card-value">{value}</div>
    </div>
  );
}

function serializePass(invitation, entryPass) {
  const remainingEntries = getEntryPassRemaining(entryPass);
  return {
    id: entryPass.id,
    passCode: entryPass.passCode,
    passType: entryPass.passType,
    guestName: entryPass.guestName || '',
    phone: entryPass.phone || '',
    tableNumber: entryPass.tableNumber || '',
    notes: entryPass.notes || '',
    allowedEntries: entryPass.allowedEntries || 0,
    usedEntries: entryPass.usedEntries || 0,
    remainingEntries,
    status: getEntryPassDerivedStatus(entryPass),
    publicLink: getEntryPassPublicLink({ invitation, entryPass }),
    qrCodeViewUrl: getEntryPassQrRoute(entryPass.id),
    qrCodeDownloadUrl: getEntryPassQrRoute(entryPass.id, true),
    createdAt: entryPass.createdAt,
  };
}

function serializeCheckInLog(log) {
  return {
    id: log.id,
    checkedInCount: log.checkedInCount || 0,
    remainingAfter: log.remainingAfter || 0,
    gateLabel: log.gateLabel || '',
    staffName: log.staffName || '',
    staffCode: log.staffCode || '',
    createdAt: log.createdAt,
    entryPass: log.entryPass
      ? {
          id: log.entryPass.id,
          passCode: log.entryPass.passCode,
          guestName: log.entryPass.guestName || '',
        }
      : null,
  };
}

export default async function OwnerInvitationEntryPassesPage({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const accessToken = typeof resolvedSearchParams?.token === 'string' ? resolvedSearchParams.token : '';

  const invitation = await prisma.invitation.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      groomName: true,
      brideName: true,
      shareConfig: true,
      entryPasses: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!invitation) {
    return <div className="admin-card card-pad">الدعوة غير موجودة.</div>;
  }

  if (!hasInvitationOwnerPortalAccess(invitation, accessToken)) {
    return (
      <div className="admin-card card-pad" style={{ maxWidth: '760px', margin: '0 auto' }}>
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>الرابط غير صالح</h3>
        <p style={{ margin: 0, color: '#64748b' }}>
          هذا الرابط غير صالح أو لا يملك صلاحية الوصول إلى بيانات هذه الدعوة.
        </p>
      </div>
    );
  }

  const recentLogs = await prisma.entryCheckInLog.findMany({
    where: { invitationId: invitation.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      entryPass: {
        select: {
          id: true,
          passCode: true,
          guestName: true,
        },
      },
    },
  });

  const passes = invitation.entryPasses.map((entryPass) => serializePass(invitation, entryPass));
  const summary = {
    totalPasses: passes.length,
    namedPasses: passes.filter((item) => item.passType === 'NAMED').length,
    anonymousPasses: passes.filter((item) => item.passType === 'ANONYMOUS').length,
    totalAllowedEntries: passes.reduce((sum, item) => sum + item.allowedEntries, 0),
    totalUsedEntries: passes.reduce((sum, item) => sum + item.usedEntries, 0),
    remainingEntries: passes.reduce((sum, item) => sum + item.remainingEntries, 0),
    totalCheckInEvents: recentLogs.length,
    totalCheckedInGuests: recentLogs.reduce((sum, item) => sum + Number(item.checkedInCount || 0), 0),
  };
  const overviewPath = buildInvitationOwnerPortalPath({
    invitationId: invitation.id,
    token: accessToken,
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>تصاريح الدخول</h2>
          <div style={{ color: '#64748b' }}>
            {invitation.groomName} و {invitation.brideName}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href={overviewPath} className="btn btn-outline">
            الرجوع للحضور
          </Link>
          <a href={`/invite/${invitation.slug}`} target="_blank" rel="noreferrer" className="btn btn-primary">
            عرض الدعوة
          </a>
        </div>
      </div>

      <div className="stat-cards">
        <StatCard label="إجمالي التصاريح" value={summary.totalPasses || 0} />
        <StatCard label="تصاريح مسماة" value={summary.namedPasses || 0} />
        <StatCard label="تصاريح مجهولة" value={summary.anonymousPasses || 0} />
        <StatCard label="إجمالي الدخولات" value={summary.totalAllowedEntries || 0} />
        <StatCard label="الدخولات المستخدمة" value={summary.totalUsedEntries || 0} />
        <StatCard label="المتبقي" value={summary.remainingEntries || 0} />
        <StatCard label="عمليات الفحص" value={summary.totalCheckInEvents || 0} />
        <StatCard label="ضيوف تم إدخالهم" value={summary.totalCheckedInGuests || 0} />
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 style={{ margin: 0 }}>كل التصاريح</h3>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>الكود</th>
              <th>النوع</th>
              <th>الضيف</th>
              <th>الدخول</th>
              <th>الحالة</th>
              <th>الرابط الفردي</th>
              <th>QR</th>
            </tr>
          </thead>
          <tbody>
            {passes.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>لا توجد تصاريح دخول بعد.</td>
              </tr>
            ) : passes.map((entryPass) => (
              <tr key={entryPass.id}>
                <td>{entryPass.passCode}</td>
                <td>{entryPass.passType === 'ANONYMOUS' ? 'مجهول' : 'مسمى'}</td>
                <td>
                  <div>{entryPass.guestName || '-'}</div>
                  <small style={{ color: '#64748b' }}>{entryPass.phone || entryPass.tableNumber || ''}</small>
                </td>
                <td>
                  {entryPass.usedEntries} / {entryPass.allowedEntries}
                  <div style={{ color: '#64748b', fontSize: '0.82rem' }}>المتبقي: {entryPass.remainingEntries}</div>
                </td>
                <td>{entryPass.status}</td>
                <td style={{ maxWidth: '280px' }}>
                  <a href={entryPass.publicLink} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-all' }}>
                    {entryPass.publicLink}
                  </a>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <a href={entryPass.qrCodeViewUrl} target="_blank" rel="noreferrer" className="btn btn-sm">
                      عرض
                    </a>
                    <a href={entryPass.qrCodeDownloadUrl} className="btn btn-sm" style={{ background: '#1a73e8', color: '#fff' }}>
                      تحميل
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-card" style={{ marginTop: '20px' }}>
        <div className="admin-card-header">
          <h3 style={{ margin: 0 }}>آخر عمليات الفحص</h3>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>الوقت</th>
              <th>الكود</th>
              <th>الضيف</th>
              <th>العدد</th>
              <th>المتبقي</th>
              <th>البوابة</th>
              <th>الموظف</th>
            </tr>
          </thead>
          <tbody>
            {recentLogs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>لا توجد عمليات فحص بعد.</td>
              </tr>
            ) : recentLogs.map((log) => {
              const item = serializeCheckInLog(log);
              return (
                <tr key={item.id}>
                  <td>{new Date(item.createdAt).toLocaleString('ar-EG')}</td>
                  <td>{item.entryPass?.passCode || '-'}</td>
                  <td>{item.entryPass?.guestName || '-'}</td>
                  <td>{item.checkedInCount}</td>
                  <td>{item.remainingAfter}</td>
                  <td>{item.gateLabel || '-'}</td>
                  <td>{item.staffName || item.staffCode || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
