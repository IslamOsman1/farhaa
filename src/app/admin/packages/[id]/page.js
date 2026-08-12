'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { parsePackageAddons, stringifyPackageAddons } from '@/lib/packages';

const EMPTY_ADDON = {
  nameAr: '',
  name: '',
  price: '',
  currency: 'EGP',
  descriptionAr: '',
  description: '',
  isActive: true,
};

function parseFeaturesText(value) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyFeaturesList(rawValue) {
  if (typeof rawValue !== 'string') return '';

  try {
    const parsed = JSON.parse(rawValue);
    if (Array.isArray(parsed)) {
      return parsed.join('\n');
    }
  } catch {}

  return rawValue;
}

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [packages, setPackages] = useState([]);
  const [addonForm, setAddonForm] = useState(EMPTY_ADDON);
  const [editingAddonId, setEditingAddonId] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    price: '',
    currency: 'EGP',
    features: '',
    featuresAr: '',
    isPopular: false,
    isActive: true,
    sortOrder: 0,
    addons: [],
  });

  const currentPackage = useMemo(
    () => packages.find((item) => item.id === packageId) || null,
    [packages, packageId],
  );

  async function loadPackageData() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/packages');
      const payload = await res.json();
      setPackages(payload?.data?.packages || []);
    } catch (fetchError) {
      console.error(fetchError);
      setError('تعذر تحميل بيانات الباقة.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPackageData();
  }, []);

  useEffect(() => {
    if (!currentPackage) return;

    setFormData({
      name: currentPackage.name || '',
      nameAr: currentPackage.nameAr || '',
      price: currentPackage.price ?? '',
      currency: currentPackage.currency || 'EGP',
      features: stringifyFeaturesList(currentPackage.features || '[]'),
      featuresAr: stringifyFeaturesList(currentPackage.featuresAr || '[]'),
      isPopular: Boolean(currentPackage.isPopular),
      isActive: currentPackage.isActive !== false,
      sortOrder: currentPackage.sortOrder ?? 0,
      addons: parsePackageAddons(currentPackage.addons || '[]'),
    });
  }, [currentPackage]);

  function handleChange(event) {
    const { name, type, checked, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleAddonChange(event) {
    const { name, type, checked, value } = event.target;
    setAddonForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function resetAddonForm() {
    setEditingAddonId('');
    setAddonForm(EMPTY_ADDON);
  }

  function beginEditAddon(addon) {
    setEditingAddonId(addon.id);
    setAddonForm({
      nameAr: addon.nameAr || '',
      name: addon.name || '',
      price: addon.price ?? '',
      currency: addon.currency || 'EGP',
      descriptionAr: addon.descriptionAr || '',
      description: addon.description || '',
      isActive: addon.isActive !== false,
    });
  }

  function saveAddonLocally(event) {
    event.preventDefault();
    const nextAddon = {
      id: editingAddonId || `addon-${Date.now().toString(36)}`,
      nameAr: addonForm.nameAr.trim(),
      name: addonForm.name.trim(),
      price: parseFloat(addonForm.price) || 0,
      currency: addonForm.currency || 'EGP',
      descriptionAr: addonForm.descriptionAr || '',
      description: addonForm.description || '',
      isActive: addonForm.isActive !== false,
      sortOrder: editingAddonId
        ? formData.addons.find((item) => item.id === editingAddonId)?.sortOrder ?? formData.addons.length
        : formData.addons.length,
    };

    setFormData((prev) => {
      const existingIndex = prev.addons.findIndex((item) => item.id === nextAddon.id);
      if (existingIndex === -1) {
        return {
          ...prev,
          addons: [...prev.addons, nextAddon],
        };
      }

      const nextAddons = [...prev.addons];
      nextAddons[existingIndex] = nextAddon;
      return {
        ...prev,
        addons: nextAddons,
      };
    });

    setNotice(editingAddonId ? 'تم تحديث الإضافة داخل الباقة.' : 'تمت إضافة إضافة جديدة للباقة.');
    setError('');
    resetAddonForm();
  }

  function deleteAddonLocally(id) {
    if (!window.confirm('هل تريد حذف هذه الإضافة من الباقة؟')) return;

    setFormData((prev) => ({
      ...prev,
      addons: prev.addons.filter((item) => item.id !== id),
    }));

    if (editingAddonId === id) {
      resetAddonForm();
    }

    setNotice('تم حذف الإضافة من الباقة.');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!packageId) return;

    setSaving(true);
    setNotice('');
    setError('');

    try {
      const res = await fetch(`/api/admin/packages/${packageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          sortOrder: Number(formData.sortOrder) || 0,
          features: JSON.stringify(parseFeaturesText(formData.features)),
          featuresAr: JSON.stringify(parseFeaturesText(formData.featuresAr)),
          addons: stringifyPackageAddons(formData.addons),
        }),
      });

      const payload = await res.json();

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || 'تعذر تحديث الباقة.');
      }

      setNotice('تم حفظ تعديلات الباقة وإضافاتها.');
      await loadPackageData();
    } catch (submitError) {
      console.error(submitError);
      setError(submitError.message || 'تعذر تحديث الباقة.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack-lg">
      <div className="admin-page-header">
        <div>
          <h2>تعديل الباقة</h2>
          <p>كل باقة هنا لها إضافاتها الخاصة فقط، ولن تظهر لأي باقة أخرى.</p>
        </div>
        <div className="inline-actions">
          <Link href="/admin/packages" className="btn btn-outline">رجوع للباقات</Link>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.push('/admin/packages/new')}
          >
            + باقة جديدة
          </button>
        </div>
      </div>

      {notice ? <div className="admin-alert success">{notice}</div> : null}
      {error ? <div className="admin-alert error">{error}</div> : null}

      <div className="admin-grid-2 admin-packages-editor-grid">
        <section className="admin-card card-pad">
          {loading ? (
            <p>جارٍ تحميل بيانات الباقة...</p>
          ) : !currentPackage ? (
            <div className="admin-empty-state">
              <p>لم يتم العثور على الباقة المطلوبة.</p>
            </div>
          ) : (
            <form className="stack-md" onSubmit={handleSubmit}>
              <div>
                <h3 className="admin-section-title">بيانات الباقة</h3>
                <p className="admin-section-subtitle">عدّل بيانات الباقة الأساسية ومميزاتها، ثم احفظ من نفس الصفحة.</p>
              </div>

              <div className="admin-grid-2">
                <label className="admin-field-card">
                  <span>الاسم بالعربي</span>
                  <input className="form-control" name="nameAr" value={formData.nameAr} onChange={handleChange} required />
                </label>
                <label className="admin-field-card">
                  <span>الاسم بالإنجليزي</span>
                  <input className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                </label>
              </div>

              <div className="admin-grid-2">
                <label className="admin-field-card">
                  <span>السعر</span>
                  <input className="form-control" type="number" min="0" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
                </label>
                <label className="admin-field-card">
                  <span>العملة</span>
                  <select className="form-control" name="currency" value={formData.currency} onChange={handleChange}>
                    <option value="EGP">EGP</option>
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                  </select>
                </label>
              </div>

              <div className="admin-grid-2">
                <label className="admin-field-card">
                  <span>الترتيب</span>
                  <input className="form-control" type="number" min="0" step="1" name="sortOrder" value={formData.sortOrder} onChange={handleChange} />
                </label>
                <div className="admin-field-card admin-field-card--toggles">
                  <label className="admin-checkbox-row">
                    <input type="checkbox" name="isPopular" checked={formData.isPopular} onChange={handleChange} />
                    <span>إظهارها كباقة مميزة</span>
                  </label>
                  <label className="admin-checkbox-row">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                    <span>الباقة مفعلة</span>
                  </label>
                </div>
              </div>

              <label className="admin-field-card">
                <span>المميزات بالعربي</span>
                <textarea className="form-control" name="featuresAr" value={formData.featuresAr} onChange={handleChange} rows={7} />
              </label>

              <label className="admin-field-card">
                <span>المميزات بالإنجليزي</span>
                <textarea className="form-control" name="features" value={formData.features} onChange={handleChange} rows={7} />
              </label>

              <button type="submit" className="btn btn-primary admin-full-width-btn" disabled={saving}>
                {saving ? 'جارٍ الحفظ...' : 'حفظ الباقة والإضافات'}
              </button>
            </form>
          )}
        </section>

        <section className="admin-card card-pad stack-md">
          <div>
            <h3 className="admin-section-title">إضافات هذه الباقة</h3>
            <p className="admin-section-subtitle">هذه الإضافات تخص هذه الباقة فقط، ولن تظهر مع أي باقة أخرى في الموقع أو الطلب.</p>
          </div>

          <form className="stack-md" onSubmit={saveAddonLocally}>
            <div className="admin-grid-2">
              <label className="admin-field-card">
                <span>اسم الإضافة بالعربي</span>
                <input className="form-control" name="nameAr" value={addonForm.nameAr} onChange={handleAddonChange} required />
              </label>
              <label className="admin-field-card">
                <span>اسم الإضافة بالإنجليزي</span>
                <input className="form-control" name="name" value={addonForm.name} onChange={handleAddonChange} required />
              </label>
            </div>

            <div className="admin-grid-2">
              <label className="admin-field-card">
                <span>سعر الإضافة</span>
                <input className="form-control" type="number" min="0" step="0.01" name="price" value={addonForm.price} onChange={handleAddonChange} required />
              </label>
              <label className="admin-field-card">
                <span>العملة</span>
                <select className="form-control" name="currency" value={addonForm.currency} onChange={handleAddonChange}>
                  <option value="EGP">EGP</option>
                  <option value="SAR">SAR</option>
                  <option value="USD">USD</option>
                </select>
              </label>
            </div>

            <label className="admin-field-card">
              <span>وصف بالعربي</span>
              <textarea className="form-control" name="descriptionAr" value={addonForm.descriptionAr} onChange={handleAddonChange} rows={3} />
            </label>

            <label className="admin-field-card">
              <span>وصف بالإنجليزي</span>
              <textarea className="form-control" name="description" value={addonForm.description} onChange={handleAddonChange} rows={3} />
            </label>

            <label className="admin-checkbox-row">
              <input type="checkbox" name="isActive" checked={addonForm.isActive} onChange={handleAddonChange} />
              <span>الإضافة مفعلة</span>
            </label>

            <div className="inline-actions">
              <button type="submit" className="btn btn-primary">
                {editingAddonId ? 'حفظ تعديل الإضافة' : 'إضافة جديدة'}
              </button>
              {editingAddonId ? (
                <button type="button" className="btn btn-outline" onClick={resetAddonForm}>
                  إلغاء التعديل
                </button>
              ) : null}
            </div>
          </form>

          <div className="stack-sm">
            <h4 className="admin-section-title admin-section-title--sm">الإضافات الحالية</h4>
            {loading ? (
              <p>جارٍ تحميل الإضافات...</p>
            ) : formData.addons.length === 0 ? (
              <div className="admin-empty-state">
                <p>لا توجد إضافات مضافة لهذه الباقة بعد.</p>
              </div>
            ) : (
              formData.addons.map((addon) => (
                <article key={addon.id} className="admin-addon-card">
                  <div className="admin-addon-card__head">
                    <div>
                      <strong>{addon.nameAr}</strong>
                      <span>{addon.name}</span>
                    </div>
                    <span className={`badge ${addon.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {addon.isActive ? 'مفعلة' : 'معطلة'}
                    </span>
                  </div>

                  <div className="admin-addon-card__price">
                    {addon.price} {addon.currency}
                  </div>

                  {addon.descriptionAr ? <p>{addon.descriptionAr}</p> : null}

                  <div className="inline-actions">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => beginEditAddon(addon)}>
                      تعديل
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ background: '#ff4d4f', color: '#fff' }}
                      onClick={() => deleteAddonLocally(addon.id)}
                    >
                      حذف
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
