'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { stringifyPackageAddons } from '@/lib/packages';

const emptyAddon = {
  id: '',
  nameAr: '',
  name: '',
  descriptionAr: '',
  description: '',
  price: '',
  currency: 'EGP',
  isActive: true,
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid #ddd',
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '130px',
  resize: 'vertical',
};

const checkWrapStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontWeight: 'bold',
  minHeight: '44px',
};

const addonsBoxStyle = {
  marginTop: '12px',
  padding: '18px',
  borderRadius: '18px',
  border: '1px solid #eadfcb',
  background: '#fcfaf6',
};

const emptyStyle = {
  padding: '18px',
  textAlign: 'center',
  borderRadius: '14px',
  background: '#fff',
  border: '1px dashed #d7c4a2',
  color: '#6b7280',
};

export default function NewPackage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    price: '',
    currency: 'EGP',
    featuresAr: '',
    features: '',
    isPopular: false,
    isActive: true,
    sortOrder: 0,
    addons: [],
  });
  const [addonDraft, setAddonDraft] = useState(emptyAddon);

  const featuresArList = useMemo(
    () => formData.featuresAr.split('\n').map((item) => item.trim()).filter(Boolean),
    [formData.featuresAr],
  );

  const featuresEnList = useMemo(
    () => formData.features.split('\n').map((item) => item.trim()).filter(Boolean),
    [formData.features],
  );

  function handleChange(event) {
    const { name, type, checked, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleAddonDraftChange(event) {
    const { name, type, checked, value } = event.target;
    setAddonDraft((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function addAddon() {
    if (!addonDraft.nameAr.trim() && !addonDraft.name.trim()) {
      window.alert('أدخل اسم الإضافة بالعربي أو الإنجليزي أولاً.');
      return;
    }

    const nextAddon = {
      ...addonDraft,
      id: `addon-${Date.now()}`,
      price: addonDraft.price === '' ? 0 : Number(addonDraft.price) || 0,
      sortOrder: formData.addons.length,
    };

    setFormData((prev) => ({
      ...prev,
      addons: [...prev.addons, nextAddon],
    }));
    setAddonDraft(emptyAddon);
  }

  function removeAddon(id) {
    setFormData((prev) => ({
      ...prev,
      addons: prev.addons.filter((addon) => addon.id !== id),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price) || 0,
          sortOrder: Number(formData.sortOrder) || 0,
          featuresAr: JSON.stringify(featuresArList),
          features: JSON.stringify(featuresEnList),
          addons: stringifyPackageAddons(formData.addons),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'تعذر حفظ الباقة');
      }

      router.push('/admin/packages');
    } catch (error) {
      console.error(error);
      window.alert(error.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="admin-form-container"
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        background: '#fff',
        padding: '30px',
        borderRadius: '18px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>إضافة باقة جديدة</h2>
          <p style={{ margin: '8px 0 0', color: '#6b7280' }}>
            أنشئ الباقة وحدد إضافاتها الخاصة التي ستظهر فقط معها.
          </p>
        </div>
        <Link href="/admin/packages" className="btn btn-sm">
          رجوع
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '15px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>اسم الباقة (عربي)</label>
            <input type="text" name="nameAr" required value={formData.nameAr} onChange={handleChange} className="form-control" style={inputStyle} />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>اسم الباقة (إنجليزي)</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="form-control" style={inputStyle} />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>السعر</label>
            <input type="number" name="price" required value={formData.price} onChange={handleChange} className="form-control" style={inputStyle} />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>العملة</label>
            <select name="currency" value={formData.currency} onChange={handleChange} className="form-control" style={inputStyle}>
              <option value="EGP">جنيه مصري (EGP)</option>
              <option value="SAR">ريال سعودي (SAR)</option>
              <option value="USD">دولار أمريكي (USD)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '18px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>ترتيب الظهور</label>
            <input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleChange} className="form-control" style={inputStyle} />
          </div>
          <label style={checkWrapStyle}>
            <input type="checkbox" name="isPopular" checked={formData.isPopular} onChange={handleChange} />
            <span>تمييز كأكثر طلبًا</span>
          </label>
          <label style={checkWrapStyle}>
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
            <span>الباقة مفعلة</span>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>المميزات بالعربي</label>
            <textarea name="featuresAr" value={formData.featuresAr} onChange={handleChange} className="form-control" style={textareaStyle} placeholder="ميزة في كل سطر" />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Features in English</label>
            <textarea name="features" value={formData.features} onChange={handleChange} className="form-control" style={textareaStyle} placeholder="One feature per line" />
          </div>
        </div>

        <div style={addonsBoxStyle}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>إضافات هذه الباقة</h3>
            <p style={{ margin: '8px 0 0', color: '#6b7280' }}>
              هذه الإضافات ستظهر فقط عند اختيار هذه الباقة في الصفحة الرئيسية وصفحة الطلب.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <input type="text" name="nameAr" value={addonDraft.nameAr} onChange={handleAddonDraftChange} placeholder="اسم الإضافة بالعربي" style={inputStyle} />
            <input type="text" name="name" value={addonDraft.name} onChange={handleAddonDraftChange} placeholder="Addon name in English" style={inputStyle} />
            <input type="number" name="price" value={addonDraft.price} onChange={handleAddonDraftChange} placeholder="السعر" style={inputStyle} />
            <select name="currency" value={addonDraft.currency} onChange={handleAddonDraftChange} style={inputStyle}>
              <option value="EGP">EGP</option>
              <option value="SAR">SAR</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <input type="text" name="descriptionAr" value={addonDraft.descriptionAr} onChange={handleAddonDraftChange} placeholder="وصف الإضافة بالعربي" style={inputStyle} />
            <input type="text" name="description" value={addonDraft.description} onChange={handleAddonDraftChange} placeholder="Addon description in English" style={inputStyle} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <label style={checkWrapStyle}>
              <input type="checkbox" name="isActive" checked={addonDraft.isActive} onChange={handleAddonDraftChange} />
              <span>الإضافة مفعلة</span>
            </label>
            <button type="button" className="btn btn-primary" onClick={addAddon}>
              إضافة
            </button>
          </div>

          {formData.addons.length === 0 ? (
            <div style={emptyStyle}>لا توجد إضافات لهذه الباقة حتى الآن.</div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {formData.addons.map((addon) => (
                <div
                  key={addon.id}
                  style={{
                    border: '1px solid #eadfcb',
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    background: '#fff',
                  }}
                >
                  <div>
                    <strong>{addon.nameAr || addon.name}</strong>
                    <div style={{ color: '#6b7280', marginTop: '4px' }}>
                      {addon.descriptionAr || addon.description || 'بدون وصف'}
                    </div>
                    <div style={{ color: '#9f7a38', marginTop: '6px', fontWeight: 700 }}>
                      {addon.price} {addon.currency}
                    </div>
                  </div>
                  <button type="button" className="btn btn-sm" style={{ background: '#ef4444', color: '#fff' }} onClick={() => removeAddon(addon.id)}>
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontWeight: 'bold', marginTop: '24px' }} disabled={saving}>
          {saving ? 'جارٍ الإضافة...' : 'إضافة الباقة'}
        </button>
      </form>
    </div>
  );
}
