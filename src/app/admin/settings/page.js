'use client';

import { useEffect, useState } from 'react';
import { getSiteSettings, updateSiteSettings } from '@/actions/admin';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    contactPhone: '',
    contactEmail: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
  });

  useEffect(() => {
    let mounted = true;

    getSiteSettings()
      .then((data) => {
        if (!mounted || !data) return;
        setFormData({
          contactPhone: data.contactPhone || '',
          contactEmail: data.contactEmail || '',
          whatsapp: data.whatsapp || '',
          instagram: data.instagram || '',
          facebook: data.facebook || '',
        });
      })
      .catch((error) => {
        if (mounted) {
          setMessage(error.message || 'تعذر تحميل الإعدادات.');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  function handleChange(event) {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await updateSiteSettings(formData);
      setMessage('تم حفظ الإعدادات بنجاح.');
    } catch (error) {
      setMessage(error.message || 'حدث خطأ أثناء الحفظ.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>جارٍ التحميل...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>إعدادات الموقع</h2>

      {message ? <div className="inline-issue" style={{ marginBottom: '16px' }}>{message}</div> : null}

      <form onSubmit={handleSubmit} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>رقم الهاتف للتواصل</label>
          <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} dir="ltr" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'right' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>البريد الإلكتروني</label>
          <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} dir="ltr" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'right' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>رقم الواتساب</label>
          <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} dir="ltr" placeholder="مثال: 201xxxxxxxxx" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'right' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>رابط إنستجرام</label>
          <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} dir="ltr" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'right' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>رابط فيسبوك</label>
          <input type="url" name="facebook" value={formData.facebook} onChange={handleChange} dir="ltr" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'right' }} />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px', fontSize: '1rem', marginTop: '16px' }}>
          {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </form>
    </div>
  );
}
