import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardStats, getRecentInvitations } from '@/actions/admin';
import { requirePermission } from '@/lib/admin-session';

export default async function DashboardPage() {
  try {
    await requirePermission('dashboard.view');
  } catch {
    redirect('/admin/login');
  }

  const stats = await getDashboardStats();
  const recent = await getRecentInvitations();

  return (
    <div>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-title">إجمالي الدعوات</div>
          <div className="stat-card-value">{stats.totalInvitations}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">الدعوات المعلقة</div>
          <div className="stat-card-value">{stats.pendingInvitations}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">إجمالي الردود</div>
          <div className="stat-card-value">{stats.totalRsvps}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">إجمالي الزيارات</div>
          <div className="stat-card-value">{stats.totalVisits}</div>
        </div>
      </div>

      <div className="admin-card mt-6" style={{ padding: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>إجراءات سريعة</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <Link href="/admin/invitations/new" className="btn btn-primary" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>💌</span> إنشاء دعوة جديدة
          </Link>
          <Link href="/admin/packages" className="btn btn-outline" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>📦</span> إدارة الباقات
          </Link>
          <Link href="/admin/templates" className="btn btn-outline" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🎨</span> إدارة القوالب
          </Link>
          <Link href="/admin/settings" className="btn btn-outline" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>⚙️</span> إعدادات الموقع
          </Link>
        </div>
      </div>

      <div className="admin-card mt-6">
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{margin:0}}>أحدث الدعوات</h3>
          <Link href="/admin/invitations" className="btn btn-outline">عرض الكل</Link>
        </div>
        <table className="admin-table" style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '12px 8px' }}>الرابط (Slug)</th>
              <th style={{ padding: '12px 8px' }}>العروسين</th>
              <th style={{ padding: '12px 8px' }}>الحالة</th>
              <th style={{ padding: '12px 8px' }}>تاريخ الإنشاء</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 8px' }} dir="ltr">{item.slug}</td>
                <td style={{ padding: '12px 8px' }}>{item.groomName} & {item.brideName}</td>
                <td style={{ padding: '12px 8px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.85rem',
                    background: item.status === 'PUBLISHED' ? '#e6f4ea' : (item.status === 'PENDING' ? '#fef7e0' : '#fce8e6'),
                    color: item.status === 'PUBLISHED' ? '#137333' : (item.status === 'PENDING' ? '#b06000' : '#c5221f')
                  }}>
                    {item.status === 'PUBLISHED' ? 'منشورة' : (item.status === 'PENDING' ? 'بانتظار الموافقة' : 'مرفوضة')}
                  </span>
                </td>
                <td style={{ padding: '12px 8px' }}>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>لا توجد دعوات حتى الآن.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
