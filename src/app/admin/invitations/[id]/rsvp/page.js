'use client';

const mockRsvps = [
  { id: 1, name: 'فهد عبدالله', phone: '050000000', status: 'confirmed', companions: 2, message: 'ألف مبروك' },
  { id: 2, name: 'سعد محمد', phone: '051111111', status: 'declined', companions: 0, message: 'أعتذر لظروف السفر' },
];

export default function RsvpPage() {
  const rsvps = mockRsvps;

  return (
    <div>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-title">حضور مؤكد</div>
          <div className="stat-card-value">1</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">اعتذار</div>
          <div className="stat-card-value">1</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">المرافقين</div>
          <div className="stat-card-value">2</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 style={{ margin: 0 }}>إدارة الردود</h3>
          <button className="btn btn-outline">تصدير CSV</button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الهاتف</th>
              <th>الحالة</th>
              <th>المرافقين</th>
              <th>الرسالة</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.map((rsvp) => (
              <tr key={rsvp.id}>
                <td>{rsvp.name}</td>
                <td>{rsvp.phone}</td>
                <td>
                  <span className={`badge badge-${rsvp.status === 'confirmed' ? 'success' : 'danger'}`}>
                    {rsvp.status === 'confirmed' ? 'مؤكد' : 'معتذر'}
                  </span>
                </td>
                <td>{rsvp.companions}</td>
                <td>{rsvp.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
