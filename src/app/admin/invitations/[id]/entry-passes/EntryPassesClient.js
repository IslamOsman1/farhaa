'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import OwnerPortalLinkActions from '@/components/admin/OwnerPortalLinkActions';

const initialForm = {
  count: 10,
  allowedEntries: 1,
  tableNumber: '',
  notes: '',
};

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-card-title">{label}</div>
      <div className="stat-card-value">{value}</div>
    </div>
  );
}

export default function EntryPassesClient({
  invitationId,
  ownerOverviewPath = '',
  ownerEntryPassesPath = '',
}) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [payload, setPayload] = useState(null);
  const [form, setForm] = useState(initialForm);

  async function fetchData() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/invitations/${invitationId}/entry-passes`, {
        cache: 'no-store',
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'تعذر تحميل تصاريح الدخول.');
      }

      setPayload(result.data);
    } catch (fetchError) {
      setError(fetchError.message || 'تعذر تحميل تصاريح الدخول.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchData();
  }, [invitationId]);

  const invitation = payload?.invitation || null;
  const checkInUrl = payload?.checkInUrl || '';
  const summary = payload?.summary || {};
  const entryPasses = payload?.entryPasses || [];
  const recentLogs = payload?.recentLogs || [];

  const pageTitle = useMemo(() => {
    if (!invitation) return 'تصاريح الدخول';
    return `تصاريح الدخول - ${invitation.groomName || ''} و ${invitation.brideName || ''}`;
  }, [invitation]);

  async function handleCreate(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/invitations/${invitationId}/entry-passes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'تعذر إنشاء التصاريح.');
      }

      setSuccess(result?.message || 'تم إنشاء التصاريح بنجاح.');
      setForm(initialForm);
      await fetchData();
    } catch (submitError) {
      setError(submitError.message || 'تعذر إنشاء التصاريح.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="admin-card">جارٍ تحميل تصاريح الدخول...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>{pageTitle}</h2>
          <div style={{ color: '#64748b' }}>
            {invitation ? `/invite/${invitation.slug}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {checkInUrl ? (
            <a href={checkInUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
              فتح بوابة الفحص
            </a>
          ) : null}
          <a href={`/api/admin/invitations/${invitationId}/entry-passes?format=csv`} className="btn btn-outline">
            تنزيل CSV
          </a>
          <a href={`/api/admin/invitations/${invitationId}/entry-passes?format=logs-csv`} className="btn btn-outline">
            تنزيل لوجات الدخول
          </a>
          <a href={`/api/admin/invitations/${invitationId}/entry-passes?format=qr-html`} className="btn btn-primary">
            تنزيل كل QR
          </a>
          <Link href={`/admin/invitations/${invitationId}/rsvp`} className="btn btn-outline">
            الرجوع للحضور
          </Link>
        </div>
      </div>

      {ownerOverviewPath ? (
        <OwnerPortalLinkActions
          overviewPath={ownerOverviewPath}
          entryPassesPath={ownerEntryPassesPath}
          description="هذا الرابط مخصص لصاحب الدعوة لمتابعة الردود والتصاريح من بوابة قراءة فقط."
        />
      ) : null}

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

      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <div className="admin-card-header">
          <h3 style={{ margin: 0 }}>إنشاء أكواد مجهولة Bulk</h3>
        </div>

        {error ? (
          <div style={{ marginBottom: '12px', color: '#c5221f' }}>{error}</div>
        ) : null}
        {success ? (
          <div style={{ marginBottom: '12px', color: '#137333' }}>{success}</div>
        ) : null}

        <form onSubmit={handleCreate} style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <label>
            <div style={{ marginBottom: '6px', fontWeight: 700 }}>عدد الأكواد</div>
            <input
              type="number"
              min="1"
              max="500"
              value={form.count}
              onChange={(event) => setForm((current) => ({ ...current, count: Number(event.target.value || 1) }))}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #dbe3ef' }}
            />
          </label>

          <label>
            <div style={{ marginBottom: '6px', fontWeight: 700 }}>عدد الأشخاص لكل QR</div>
            <input
              type="number"
              min="1"
              max="50"
              value={form.allowedEntries}
              onChange={(event) => setForm((current) => ({ ...current, allowedEntries: Number(event.target.value || 1) }))}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #dbe3ef' }}
            />
          </label>

          <label>
            <div style={{ marginBottom: '6px', fontWeight: 700 }}>رقم الطاولة</div>
            <input
              type="text"
              value={form.tableNumber}
              onChange={(event) => setForm((current) => ({ ...current, tableNumber: event.target.value }))}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #dbe3ef' }}
            />
          </label>

          <label style={{ gridColumn: '1 / -1' }}>
            <div style={{ marginBottom: '6px', fontWeight: 700 }}>ملاحظات</div>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #dbe3ef', resize: 'vertical' }}
            />
          </label>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-start' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'جارٍ الإنشاء...' : 'إنشاء الدفعة'}
            </button>
          </div>
        </form>
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
            {entryPasses.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>لا توجد تصاريح دخول بعد.</td>
              </tr>
            ) : entryPasses.map((entryPass) => (
              <tr key={entryPass.id}>
                <td>{entryPass.passCode}</td>
                <td>{entryPass.passType === 'ANONYMOUS' ? 'مجهول' : 'مسمي'}</td>
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
            ) : recentLogs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString('ar-EG')}</td>
                <td>{log.entryPass?.passCode || '-'}</td>
                <td>{log.entryPass?.guestName || '-'}</td>
                <td>{log.checkedInCount}</td>
                <td>{log.remainingAfter}</td>
                <td>{log.gateLabel || '-'}</td>
                <td>{log.staffName || log.staffCode || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
