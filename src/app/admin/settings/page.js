'use client';
import { useState, useEffect } from 'react';
import { getSiteSettings, updateSiteSettings } from '@/actions/admin';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    contactPhone: '',
    contactEmail: '',
    whatsapp: '',
    instagram: '',
    facebook: ''
  });

  useEffect(() => {
    setLoading(true);
    getSiteSettings().then(data => {
      if (data) {
        setFormData({
          contactPhone: data.contactPhone || '',
          contactEmail: data.contactEmail || '',
          whatsapp: data.whatsapp || '',
          instagram: data.instagram || '',
          facebook: data.facebook || ''
        });
      }
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSiteSettings(formData);
      alert('تم حفظ الإعدادات بنجاح!');
    } catch (err) {
      alert('حدث خطأ: ' + err.message);
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}>جاري التحميل...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>إعدادات الموقع</h2>
      
      <form onSubmit={handleSubmit} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>رقم الهاتف للتواصل</label>
          <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} dir="ltr" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'right' }} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>البريد الإلكتروني</label>
          <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} dir="ltr" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'right' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>رقم الواتساب (مع رمز الدولة)</label>
          <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} dir="ltr" placeholder="مثال: 201xxxxxxxxx" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'right' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>رابط انستجرام</label>
          <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} dir="ltr" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'right' }} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>رابط فيسبوك</label>
          <input type="url" name="facebook" value={formData.facebook} onChange={handleChange} dir="ltr" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'right' }} />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px', fontSize: '1rem', marginTop: '16px' }}>
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>

      </form>
    </div>
  );
}
