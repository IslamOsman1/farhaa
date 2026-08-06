'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchPackages() {
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      setPackages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchPackages();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function deletePackage(id) {
    if (!confirm('هل أنت متأكد؟')) return;

    try {
      await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' });
      fetchPackages();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>إدارة الباقات</h2>
        <Link href="/admin/packages/new" className="btn btn-primary">+ باقة جديدة</Link>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الاسم (عربي)</th>
              <th>الاسم (إنجليزي)</th>
              <th>السعر</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>جارٍ التحميل...</td></tr>
            ) : packages.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>لا توجد باقات</td></tr>
            ) : packages.map((pkg) => (
              <tr key={pkg.id}>
                <td>{pkg.nameAr}</td>
                <td>{pkg.name}</td>
                <td>{pkg.price} {pkg.currency}</td>
                <td>{pkg.isActive ? 'مفعلة' : 'معطلة'}</td>
                <td>
                  <button onClick={() => deletePackage(pkg.id)} className="btn btn-sm" style={{ background: '#ff4d4f', color: '#fff' }}>
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
