'use client';
import { useState, useEffect } from 'react';

export default function RsvpPage({ params }) {
  const [rsvps, setRsvps] = useState([]);
  
  useEffect(() => {
    setRsvps([
      { id: 1, name: 'فهد عبدالله', phone: '050000000', status: 'confirmed', companions: 2, message: 'ألف مبروك' },
      { id: 2, name: 'سعد محمد', phone: '051111111', status: 'declined', companions: 0, message: 'أعتذر لظروف السفر' }
    ]);
  }, []);

  return (
    <div>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-title">حضور مؤكد</div>
          <div className="stat-card-value">1</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">إعتذار</div>
          <div className="stat-card-value">1</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">المرافقين</div>
          <div className="stat-card-value">2</div>
        </div>
      </div>
      
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 style={{margin:0}}>إدارة الردود</h3>
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
            {rsvps.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.phone}</td>
                <td>
                  <span className={`badge badge-${r.status === 'confirmed' ? 'success' : 'danger'}`}>
                    {r.status === 'confirmed' ? 'مؤكد' : 'معتذر'}
                  </span>
                </td>
                <td>{r.companions}</td>
                <td>{r.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
