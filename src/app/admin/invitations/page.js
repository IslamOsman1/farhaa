'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

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
    case 'PENDING':
      return { label: 'بانتظار الموافقة', background: '#fef7e0', color: '#b06000' };
    case 'REJECTED':
      return { label: 'مرفوضة', background: '#fce8e6', color: '#c5221f' };
    default:
      return { label: 'مسودة', background: '#eef2ff', color: '#4338ca' };
  }
}

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishModal, setPublishModal] = useState(emptyPublishModal);
  const [qrModal, setQrModal] = useState(emptyQrModal);

  async function fetchInvitations() {
    try {
      const response = await fetch('/api/admin/invitations', { cache: 'no-store' });
      const result = await response.json();
      setInvitations(result?.data?.invitations || result?.invitations || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchInvitations();
  }, []);

  async function updateStatus(id, status, dates = null) {
    try {
      const payload = { status };
      if (dates) {
        payload.publishStartDate = dates.startDate;
        payload.publishEndDate = dates.endDate;
      }

      await fetch(`/api/admin/invitations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      await fetchInvitations();
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteInvitation(id) {
    if (!window.confirm('هل أنت متأكد من حذف هذه الدعوة؟')) {
      return;
    }

    try {
      await fetch(`/api/admin/invitations/${id}`, { method: 'DELETE' });
      await fetchInvitations();
    } catch (error) {
      console.error(error);
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

  if (loading) {
    return <div>جارٍ تحميل الدعوات...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>إدارة الدعوات</h2>
          <div style={{ color: '#64748b' }}>كل الدعوات المنشورة والمسودات في مكان واحد</div>
        </div>
        <Link href="/admin/invitations/new" className="btn btn-primary">
          + دعوة جديدة
        </Link>
      </div>

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
                <td colSpan="7" style={{ textAlign: 'center' }}>لا توجد دعوات حاليًا.</td>
              </tr>
            ) : invitations.map((invitation) => {
              const status = getStatusPresentation(invitation.status);
              const publicInviteUrl =
                typeof window === 'undefined'
                  ? `/invite/${invitation.slug}`
                  : `${window.location.origin}/invite/${invitation.slug}`;

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
                    {invitation.status === 'PUBLISHED' && invitation.publishEndDate ? (
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
                      {invitation.status === 'PENDING' ? (
                        <>
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
                          >
                            نشر
                          </button>
                          <button
                            type="button"
                            onClick={() => { void updateStatus(invitation.id, 'REJECTED'); }}
                            className="btn btn-sm"
                            style={{ background: '#c5221f', color: '#fff' }}
                          >
                            رفض
                          </button>
                        </>
                      ) : null}

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
                  required
                  value={publishModal.endDate}
                  onChange={(event) => setPublishModal((current) => ({ ...current, endDate: event.target.value }))}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #dbe3ef' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>تأكيد النشر</button>
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
