import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminTemplatesPage() {
  const templates = await prisma.template.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      invitations: true
    }
  });

  return (
    <div>
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{margin:0}}>إدارة القوالب</h2>
        <button className="btn btn-primary" disabled>إضافة قالب جديد (قريباً)</button>
      </div>

      <div className="admin-card mt-6">
        <table className="admin-table" style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '12px 8px' }}>المعرف (Slug)</th>
              <th style={{ padding: '12px 8px' }}>الاسم (انجليزي)</th>
              <th style={{ padding: '12px 8px' }}>الاسم (عربي)</th>
              <th style={{ padding: '12px 8px' }}>عدد الاستخدامات</th>
              <th style={{ padding: '12px 8px' }}>حالة القالب</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(tpl => (
              <tr key={tpl.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 8px' }} dir="ltr">{tpl.slug}</td>
                <td style={{ padding: '12px 8px' }}>{tpl.name}</td>
                <td style={{ padding: '12px 8px' }}>{tpl.nameAr}</td>
                <td style={{ padding: '12px 8px' }}>{tpl.invitations.length} دعوة</td>
                <td style={{ padding: '12px 8px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem',
                    background: '#e6f4ea',
                    color: '#137333'
                  }}>
                    نشط
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
