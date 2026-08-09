'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

const defaultFilters = {
  q: '',
  status: 'ALL',
  templateId: '',
  dateFrom: '',
  dateTo: '',
};

const emptyPublishModal = {
  show: false,
  invId: null,
  startDate: '',
  endDate: '',
};

const emptyQrModal = {
  show: false,
  url: '',
  title: '',
};

function getStatusPresentation(status) {
  switch (status) {
    case 'PUBLISHED':
      return { label: 'منشورة', background: '#e6f4ea', color: '#137333' };
    case 'EXPIRED':
      return { label: 'منتهية', background: '#fef3c7', color: '#92400e' };
    case 'PENDING':
      return { label: 'بانتظار الموافقة', background: '#fef7e0', color: '#b06000' };
    case 'ARCHIVED':
      return { label: 'مؤرشفة', background: '#e5e7eb', color: '#374151' };
    case 'REJECTED':
      return { label: 'مرفوضة', background: '#fce8e6', color: '#c5221f' };
    default:
      return { label: 'مسودة', background: '#eef2ff', color: '#4338ca' };
  }
}

function buildQueryString(filters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value != null && String(value).trim() !== '' && value !== 'ALL') {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState('');
  const [flash, setFlash] = useState({ type: '', message: '' });
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [publishModal, setPublishModal] = useState(emptyPublishModal);
  const [qrModal, setQrModal] = useState(emptyQrModal);

  async function fetchInvitations(filters = appliedFilters) {
    setLoading(true);
    try {
      const query = buildQueryString(filters);
      const response = await fetch(`/api/admin/invitations${query ? `?${query}` : ''}`, {
        cache: 'no-store',
      });
      const result = await response.json();
      setInvitations(result?.data?.invitations || []);
      setTemplates(result?.data?.templates || []);
    } catch (error) {
      console.error(error);
      setFlash({ type: 'error', message: 'تعذر تحميل الدعوات.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchInvitations(defaultFilters);
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(id, status, dates = null) {
    setBusyKey(`status:${id}`);
    setFlash({ type: '', message: '' });

    try {
      const payload = { status };
      if (dates) {
        payload.publishStartDate = dates.startDate;
        payload.publishEndDate = dates.endDate;
      }

      const response = await fetch(`/api/admin/invitations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'تعذر تحديث حالة الدعوة.');
      }

      setFlash({ type: 'success', message: result?.message || 'تم تحديث حالة الدعوة.' });
      await fetchInvitations(appliedFilters);
    } catch (error) {
      console.error(error);
      setFlash({ type: 'error', message: error.message || 'تعذر تحديث حالة الدعوة.' });
    } finally {
      setBusyKey('');
    }
  }

  async function duplicateInvitation(id) {
    setBusyKey(`duplicate:${id}`);
    setFlash({ type: '', message: '' });

    try {
      const response = await fetch(`/api/admin/invitations/${id}/duplicate`, {
        method: 'POST',
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'تعذر نسخ الدعوة.');
      }

      setFlash({ type: 'success', message: result?.message || 'تم إنشاء نسخة مستقلة من الدعوة.' });
      await fetchInvitations(appliedFilters);

      if (window.confirm('تم إنشاء النسخة بنجاح. هل تريد فتحها الآن للتعديل؟')) {
        window.location.href = result.data?.editUrl || `/edit/${result.data?.invitation?.slug}`;
      }
    } catch (error) {
      console.error(error);
      setFlash({ type: 'error', message: error.message || 'تعذر نسخ الدعوة.' });
    } finally {
      setBusyKey('');
    }
  }

  async function deleteInvitation(id) {
    if (!window.confirm('هل أنت متأكد من حذف هذه الدعوة؟')) {
      return;
    }

    setBusyKey(`delete:${id}`);
    setFlash({ type: '', message: '' });

    try {
      const response = await fetch(`/api/admin/invitations/${id}`, { method: 'DELETE' });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'تعذر حذف الدعوة.');
      }

      setFlash({ type: 'success', message: result?.message || 'تم حذف الدعوة.' });
      await fetchInvitations(appliedFilters);
    } catch (error) {
      console.error(error);
      setFlash({ type: 'error', message: error.message || 'تعذر حذف الدعوة.' });
    } finally {
      setBusyKey('');
    }
  }

  function handlePublishSubmit(event) {
    event.preventDefault();
    void updateStatus(publishModal.invId, 'PUBLISHED', {
      startDate: publishModal.startDate,
      endDate: publishModal.endDate,
    });
    setPublishModal(emptyPublishModal);
  }

  function handleApplyFilters(event) {
    event.preventDefault();
    setAppliedFilters(draftFilters);
    void fetchInvitations(draftFilters);
  }

  function resetFilters() {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    void fetchInvitations(defaultFilters);
  }

  const statusOptions = useMemo(() => ([
    { value: 'ALL', label: 'كل الحالات' },
    { value: 'DRAFT', label: 'مسودات' },
    { value: 'PENDING', label: 'بانتظار الموافقة' },
    { value: 'PUBLISHED', label: 'منشورة' },
    { value: 'EXPIRED', label: 'منتهية' },
    { value: 'ARCHIVED', label: 'مؤرشفة' },
    { value: 'REJECTED', label: 'مرفوضة' },
  ]), []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>إدارة الدعوات</h2>
          <div style={{ color: '#64748b' }}>
            بحث، فلترة، نسخ، نشر، أرشفة وإدارة كل الدعوات من مكان واحد.
          </div>
        </div>
        <Link href="/admin/invitations/new" className="btn btn-primary">
          + دعوة جديدة
        </Link>
      </div>

      {flash.message ? (
        <div
          style={{
            marginBottom: '18px',
            padding: '14px 16px',
            borderRadius: '14px',
            background: flash.type === 'error' ? '#fef2f2' : '#ecfdf5',
            color: flash.type === 'error' ? '#b91c1c' : '#065f46',
            border: `1px solid ${flash.type === 'error' ? 'rgba(185,28,28,0.18)' : 'rgba(6,95,70,0.18)'}`,
            fontWeight: 700,
          }}
        >
          {flash.message}
        </div>
      ) : null}

      <form
        onSubmit={handleApplyFilters}
        className="admin-card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <input
          type="text"
          value={draftFilters.q}
          onChange={(event) => setDraftFilters((current) => ({ ...current, q: event.target.value }))}
          placeholder="ابحث بالاسم أو الرابط أو الهاتف"
          style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #dbe3ef' }}
        />

        <select
          value={draftFilters.status}
          onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value }))}
          style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #dbe3ef' }}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select
          value={draftFilters.templateId}
          onChange={(event) => setDraftFilters((current) => ({ ...current, templateId: event.target.value }))}
          style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #dbe3ef' }}
        >
          <option value="">كل القوالب</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.nameAr || template.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={draftFilters.dateFrom}
          onChange={(event) => setDraftFilters((current) => ({ ...current, dateFrom: event.target.value }))}
          style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #dbe3ef' }}
        />

        <input
          type="date"
          value={draftFilters.dateTo}
          onChange={(event) => setDraftFilters((current) => ({ ...current, dateTo: event.target.value }))}
          style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #dbe3ef' }}
        />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            تطبيق
          </button>
          <button type="button" className="btn btn-outline" onClick={resetFilters}>
            إعادة ضبط
          </button>
        </div>
      </form>

      <div style={{ marginBottom: '14px', color: '#64748b', fontWeight: 700 }}>
        النتائج الحالية: {invitations.length}
      </div>

      {loading ? (
        <div>جارٍ تحميل الدعوات...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>العروسان</th>
                <th>العميل</th>
                <th>القالب</th>
                <th>الحالة</th>
                <th>الردود</th>
                <th>تصاريح الدخول</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>لا توجد دعوات مطابقة للفلاتر الحالية.</td>
                </tr>
              ) : invitations.map((invitation) => {
                const status = getStatusPresentation(invitation.effectiveStatus || invitation.status);
                const publicInviteUrl = `${window.location.origin}/invite/${invitation.slug}`;

                return (
                  <tr key={invitation.id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{invitation.groomName} و {invitation.brideName}</div>
                      <small style={{ color: '#64748b' }}>{invitation.slug}</small>
                    </td>
                    <td>
                      <div>{invitation.clientName || '-'}</div>
                      <small style={{ color: '#64748b' }}>{invitation.clientPhone || '-'}</small>
                    </td>
                    <td>{invitation.template?.nameAr || invitation.template?.name || '-'}</td>
                    <td>
                      <span
                        style={{
                          padding: '5px 10px',
                          borderRadius: '999px',
                          fontSize: '0.85rem',
                          display: 'inline-block',
                          marginBottom: '6px',
                          background: status.background,
                          color: status.color,
                          fontWeight: 700,
                        }}
                      >
                        {status.label}
                      </span>
                      {invitation.publishEndDate ? (
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          ينتهي: {new Date(invitation.publishEndDate).toLocaleDateString('ar-EG')}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{invitation._count?.rsvps || 0}</div>
                      <small style={{ color: '#64748b' }}>رد</small>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{invitation._count?.entryPasses || 0}</div>
                      <small style={{ color: '#64748b' }}>بطاقة</small>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {invitation.status !== 'PUBLISHED' ? (
                          <button
                            type="button"
                            onClick={() => setPublishModal({
                              show: true,
                              invId: invitation.id,
                              startDate: new Date().toISOString().split('T')[0],
                              endDate: '',
                            })}
                            className="btn btn-sm"
                            style={{ background: '#137333', color: '#fff' }}
                            disabled={busyKey === `status:${invitation.id}`}
                          >
                            نشر
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { void updateStatus(invitation.id, 'DRAFT'); }}
                            className="btn btn-sm"
                            style={{ background: '#7c3aed', color: '#fff' }}
                            disabled={busyKey === `status:${invitation.id}`}
                          >
                            إيقاف النشر
                          </button>
                        )}

                        {invitation.status === 'ARCHIVED' ? (
                          <button
                            type="button"
                            onClick={() => { void updateStatus(invitation.id, 'DRAFT'); }}
                            className="btn btn-sm"
                            style={{ background: '#475569', color: '#fff' }}
                            disabled={busyKey === `status:${invitation.id}`}
                          >
                            استعادة
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { void updateStatus(invitation.id, 'ARCHIVED'); }}
                            className="btn btn-sm"
                            style={{ background: '#334155', color: '#fff' }}
                            disabled={busyKey === `status:${invitation.id}`}
                          >
                            أرشفة
                          </button>
                        )}

                        {invitation.status === 'PENDING' ? (
                          <button
                            type="button"
                            onClick={() => { void updateStatus(invitation.id, 'REJECTED'); }}
                            className="btn btn-sm"
                            style={{ background: '#c5221f', color: '#fff' }}
                            disabled={busyKey === `status:${invitation.id}`}
                          >
                            رفض
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => { void duplicateInvitation(invitation.id); }}
                          className="btn btn-sm"
                          style={{ background: '#0f766e', color: '#fff' }}
                          disabled={busyKey === `duplicate:${invitation.id}`}
                        >
                          نسخ الدعوة
                        </button>

                        {invitation.status === 'PUBLISHED' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setQrModal({
                                show: true,
                                url: publicInviteUrl,
                                title: `${invitation.groomName} و ${invitation.brideName}`,
                              })}
                              className="btn btn-sm"
                              style={{ background: '#1a73e8', color: '#fff' }}
                            >
                              QR الدعوة
                            </button>
                            <Link href={`/admin/invitations/${invitation.id}/rsvp`} className="btn btn-sm" style={{ background: '#7f2a1f', color: '#fff' }}>
                              إدارة الحضور
                            </Link>
                            <Link href={`/admin/invitations/${invitation.id}/entry-passes`} className="btn btn-sm" style={{ background: '#0f766e', color: '#fff' }}>
                              تصاريح الدخول
                            </Link>
                            <a href={`/check-in/${invitation.slug}`} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#111827', color: '#fff', textDecoration: 'none' }}>
                              بوابة الفحص
                            </a>
                          </>
                        ) : null}

                        <Link href={`/invite/${invitation.slug}`} target="_blank" className="btn btn-sm">
                          عرض
                        </Link>
                        <Link href={`/edit/${invitation.slug}`} className="btn btn-sm">
                          تعديل
                        </Link>
                        <button
                          type="button"
                          onClick={() => { void deleteInvitation(invitation.id); }}
                          className="btn btn-sm"
                          style={{ background: '#ff4d4f', color: '#fff' }}
                          disabled={busyKey === `delete:${invitation.id}`}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {publishModal.show ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', padding: '28px', borderRadius: '18px', width: '100%', maxWidth: '420px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>إعدادات نشر الدعوة</h3>
            <form onSubmit={handlePublishSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700 }}>تاريخ بدء النشر</label>
                <input
                  type="date"
                  required
                  value={publishModal.startDate}
                  onChange={(event) => setPublishModal((current) => ({ ...current, startDate: event.target.value }))}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #dbe3ef' }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700 }}>تاريخ انتهاء النشر</label>
                <input
                  type="date"
                  value={publishModal.endDate}
                  onChange={(event) => setPublishModal((current) => ({ ...current, endDate: event.target.value }))}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #dbe3ef' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  تأكيد النشر
                </button>
                <button type="button" onClick={() => setPublishModal(emptyPublishModal)} className="btn" style={{ flex: 1, background: '#e5e7eb', color: '#111827' }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {qrModal.show ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', padding: '28px', borderRadius: '18px', width: '100%', maxWidth: '380px', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0, marginBottom: '6px' }}>QR الدعوة</h3>
            <div style={{ color: '#64748b', marginBottom: '18px' }}>{qrModal.title}</div>

            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '18px', display: 'inline-flex', marginBottom: '18px' }}>
              <QRCodeSVG value={qrModal.url} size={220} bgColor="#ffffff" fgColor="#111827" includeMargin />
            </div>

            <p style={{ wordBreak: 'break-all', fontSize: '0.9rem', color: '#64748b', marginBottom: '18px' }} dir="ltr">
              {qrModal.url}
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a href={qrModal.url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: 1, textDecoration: 'none' }}>
                فتح الدعوة
              </a>
              <button type="button" onClick={() => setQrModal(emptyQrModal)} className="btn" style={{ flex: 1, background: '#e5e7eb', color: '#111827' }}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
