'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewPackage() {
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    price: '',
    currency: 'EGP',
    featuresAr: '',
    isPopular: false
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Convert features string (comma separated or lines) to JSON array
    const featuresList = formData.featuresAr.split('\n').filter(f => f.trim() !== '');

    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          price: parseFloat(formData.price),
          featuresAr: JSON.stringify(featuresList) 
        })
      });
      if (res.ok) {
        router.push('/admin/packages');
      } else {
        alert('حدث خطأ');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ في الاتصال');
    }
    setSaving(false);
  };

  return (
    <div className="admin-form-container" style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>إضافة باقة جديدة</h2>
        <Link href="/admin/packages" className="btn btn-sm">رجوع</Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>اسم الباقة (عربي)</label>
            <input type="text" name="nameAr" required className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={formData.nameAr} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>اسم الباقة (انجليزي)</label>
            <input type="text" name="name" required className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={formData.name} onChange={handleChange} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>السعر</label>
            <input type="number" name="price" required className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={formData.price} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>العملة</label>
            <select name="currency" className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} value={formData.currency} onChange={handleChange}>
              <option value="EGP">جنيه مصري (EGP)</option>
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="USD">دولار أمريكي (USD)</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>المميزات (ميزة في كل سطر)</label>
          <textarea name="featuresAr" required className="form-control" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '100px' }} value={formData.featuresAr} onChange={handleChange} placeholder="- تصميم احترافي&#10;- بدون إعلانات"></textarea>
        </div>

        <div className="form-group" style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" name="isPopular" id="isPopular" checked={formData.isPopular} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
          <label htmlFor="isPopular" style={{ fontWeight: 'bold' }}>تمييز كباقة مفضلة (أكثر طلباً)</label>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontWeight: 'bold' }} disabled={saving}>
          {saving ? 'جاري الإضافة...' : 'إضافة الباقة'}
        </button>
      </form>
    </div>
  );
}
