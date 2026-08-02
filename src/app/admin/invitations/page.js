'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishModal, setPublishModal] = useState({ show: false, invId: null, startDate: '', endDate: '' });
  const [qrModal, setQrModal] = useState({ show: false, url: '' });

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/admin/invitations');
      const data = await res.json();
      setInvitations(data.invitations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, dates = null) => {
    try {
      const payload = { status };
      if (dates) {
        payload.publishStartDate = dates.startDate;
        payload.publishEndDate = dates.endDate;
      }
      await fetch(`/api/admin/invitations/${id}/status`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      fetchInvitations();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishSubmit = (e) => {
    e.preventDefault();
    updateStatus(publishModal.invId, 'PUBLISHED', {
      startDate: publishModal.startDate,
      endDate: publishModal.endDate
    });
    setPublishModal({ show: false, invId: null, startDate: '', endDate: '' });
  };

  const deleteInvitation = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الدعوة؟')) return;
    try {
      await fetch(`/api/admin/invitations/${id}`, { method: 'DELETE' });
      fetchInvitations();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>إدارة الدعوات</h2>
        <Link href="/admin/invitations/new" className="btn btn-primary">+ دعوة جديدة</Link>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>العريس والعروس</th>
              <th>العميل</th>
              <th>القالب</th>
              <th>الحالة</th>
              <th>الردود</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {invitations.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>لا توجد دعوات حالياً</td></tr>
            ) : invitations.map(inv => (
              <tr key={inv.id}>
                <td>{inv.groomName} و {inv.brideName}</td>
                <td>{inv.clientName || '-'} <br/><small>{inv.clientPhone}</small></td>
                <td>{inv.template?.name || '-'}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', display: 'inline-block', marginBottom: '5px',
                    background: inv.status === 'PUBLISHED' ? '#e6f4ea' : (inv.status === 'PENDING' ? '#fef7e0' : '#fce8e6'),
                    color: inv.status === 'PUBLISHED' ? '#137333' : (inv.status === 'PENDING' ? '#b06000' : '#c5221f')
                  }}>
                    {inv.status === 'PUBLISHED' ? 'منشورة' : (inv.status === 'PENDING' ? 'بانتظار الموافقة' : 'مرفوضة')}
                  </span>
                  {inv.status === 'PUBLISHED' && inv.publishEndDate && (
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      ينتهي: {new Date(inv.publishEndDate).toLocaleDateString('ar-EG')}
                    </div>
                  )}
                </td>
                <td>{inv._count?.rsvps || 0}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {inv.status === 'PENDING' && (
                      <>
                        <button onClick={() => setPublishModal({ show: true, invId: inv.id, startDate: new Date().toISOString().split('T')[0], endDate: '' })} className="btn btn-sm" style={{background: '#137333', color: '#fff'}}>نشر</button>
                        <button onClick={() => updateStatus(inv.id, 'REJECTED')} className="btn btn-sm" style={{background: '#c5221f', color: '#fff'}}>رفض</button>
                      </>
                    )}
                    
                    {inv.status === 'PUBLISHED' && (
                      <>
                        <button onClick={() => setQrModal({ show: true, url: `${window.location.origin}/invite/${inv.slug}` })} className="btn btn-sm" style={{background: '#1a73e8', color: '#fff'}}>QR Code</button>
                        <a href={`/api/admin/invitations/${inv.id}/rsvps`} className="btn btn-sm" style={{background: '#fbbc04', color: '#000', textDecoration: 'none'}}>تنزيل الردود</a>
                      </>
                    )}

                    <Link href={`/invite/${inv.slug}`} target="_blank" className="btn btn-sm">عرض</Link>
                    <Link href={`/edit/${inv.slug}`} className="btn btn-sm">تعديل</Link>
                    <button onClick={() => deleteInvitation(inv.id)} className="btn btn-sm" style={{background: '#ff4d4f', color: '#fff'}}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Publish Modal */}
      {publishModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>إعدادات نشر الدعوة</h3>
            <form onSubmit={handlePublishSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>تاريخ بدء النشر</label>
                <input type="date" required value={publishModal.startDate} onChange={e => setPublishModal({...publishModal, startDate: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>تاريخ انتهاء النشر</label>
                <input type="date" required value={publishModal.endDate} onChange={e => setPublishModal({...publishModal, endDate: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>تأكيد ونشر</button>
                <button type="button" onClick={() => setPublishModal({ show: false, invId: null, startDate: '', endDate: '' })} className="btn" style={{ flex: 1, padding: '10px', background: '#e0e0e0', color: '#333' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '350px', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>QR Code للدعوة</h3>
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', display: 'inline-block', marginBottom: '20px' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrModal.url)}`} alt="QR Code" style={{ width: '200px', height: '200px' }} />
            </div>
            <p style={{ wordBreak: 'break-all', fontSize: '0.9rem', color: '#666', marginBottom: '20px' }} dir="ltr">{qrModal.url}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrModal.url)}`} download="qrcode.png" target="_blank" className="btn btn-primary" style={{ flex: 1, padding: '10px', textDecoration: 'none' }}>تحميل الصورة</a>
              <button type="button" onClick={() => setQrModal({ show: false, url: '' })} className="btn" style={{ flex: 1, padding: '10px', background: '#e0e0e0', color: '#333' }}>إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
