'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MediaPicker from '@/components/admin/MediaPicker';

function toJsonString(value) {
  return JSON.stringify(value || {}, null, 2);
}

function parseJson(text, fallback = {}) {
  if (!text?.trim()) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('أحد حقول JSON غير صالح.');
  }
}

export default function OpeningForm({ mode = 'create', opening = null, templateOptions = [] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: opening?.name || '',
    nameAr: opening?.nameAr || '',
    slug: opening?.slug || '',
    description: opening?.description || '',
    descriptionAr: opening?.descriptionAr || '',
    type: opening?.type || 'minimal-fade',
    thumbnail: opening?.thumbnail || '',
    previewImage: opening?.previewImage || '',
    previewVideo: opening?.previewVideo || '',
    previewMediaUrl: opening?.previewMediaUrl || '',
    isActive: opening?.isActive ?? true,
    isDefault: opening?.isDefault ?? false,
    sortOrder: opening?.sortOrder || 0,
    compatibleTemplates: opening?.compatibleTemplates || opening?.compatibilityRules?.allowedTemplateSlugs || [],
    defaultConfig: toJsonString(opening?.defaultConfig),
    textConfig: toJsonString(opening?.textConfig),
    mediaConfig: toJsonString(opening?.mediaConfig),
    themeConfig: toJsonString(opening?.themeConfig),
    durationMs: opening?.durationMs || 2000,
    transition: opening?.transition || 'fade',
    autoplay: opening?.autoplay ?? false,
    requiresUserInteraction: opening?.requiresUserInteraction ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder || 0),
        durationMs: form.durationMs ? Number(form.durationMs) : null,
        defaultConfig: parseJson(form.defaultConfig),
        textConfig: parseJson(form.textConfig),
        mediaConfig: parseJson(form.mediaConfig),
        themeConfig: parseJson(form.themeConfig),
      };

      const url = mode === 'edit' ? `/api/openings/${opening.id}` : '/api/openings';
      const method = mode === 'edit' ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'تعذر حفظ الافتتاحية.');
      }

      router.push('/admin/openings');
      router.refresh();
    } catch (requestError) {
      setError(requestError.message || 'تعذر حفظ الافتتاحية.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="stack-lg" onSubmit={submitForm}>
      <div className="admin-page-header">
        <div>
          <h2>{mode === 'edit' ? 'تعديل الافتتاحية' : 'إضافة افتتاحية'}</h2>
          <p>إدارة النصوص والصور والتوافق والإعدادات الافتراضية لواجهة الافتتاح.</p>
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'جارٍ الحفظ...' : mode === 'edit' ? 'حفظ التعديلات' : 'إنشاء الافتتاحية'}
        </button>
      </div>

      {error ? <div className="admin-alert error">{error}</div> : null}

      <div className="admin-grid-2">
        <section className="admin-card card-pad stack-md">
          <h3>إعدادات عامة</h3>
          <label className="field-block">
            <span>الاسم</span>
            <input value={form.name} onChange={(event) => updateField('name', event.target.value)} />
          </label>
          <label className="field-block">
            <span>الاسم العربي</span>
            <input value={form.nameAr} onChange={(event) => updateField('nameAr', event.target.value)} />
          </label>
          <label className="field-block">
            <span>Slug</span>
            <input dir="ltr" value={form.slug} onChange={(event) => updateField('slug', event.target.value)} />
          </label>
          <label className="field-block">
            <span>النوع</span>
            <select value={form.type} onChange={(event) => updateField('type', event.target.value)}>
              <option value="native-template">Native Template</option>
              <option value="minimal-fade">Minimal Fade</option>
              <option value="floral-reveal">Floral Reveal</option>
              <option value="photo-reveal">Photo Reveal</option>
              <option value="no-opening">No Opening</option>
            </select>
          </label>
          <label className="field-block">
            <span>الوصف</span>
            <textarea rows={3} value={form.description} onChange={(event) => updateField('description', event.target.value)} />
          </label>
          <label className="field-block">
            <span>الوصف العربي</span>
            <textarea rows={3} value={form.descriptionAr} onChange={(event) => updateField('descriptionAr', event.target.value)} />
          </label>
        </section>

        <section className="admin-card card-pad stack-md">
          <h3>الوسائط والمظهر</h3>
          <label className="field-block">
            <span>الصورة المصغرة</span>
            <MediaPicker value={form.thumbnail} accept="image" folder="openings" onChange={(value) => updateField('thumbnail', value)} />
          </label>
          <label className="field-block">
            <span>صورة المعاينة</span>
            <MediaPicker value={form.previewImage} accept="image" folder="openings" onChange={(value) => updateField('previewImage', value)} />
          </label>
          <label className="field-block">
            <span>فيديو المعاينة</span>
            <MediaPicker value={form.previewVideo} accept="video" folder="openings" onChange={(value) => updateField('previewVideo', value)} />
          </label>
          <label className="field-block">
            <span>رابط وسائط إضافي</span>
            <input dir="ltr" value={form.previewMediaUrl} onChange={(event) => updateField('previewMediaUrl', event.target.value)} />
          </label>
          <label className="field-block">
            <span>المدة بالمللي ثانية</span>
            <input type="number" value={form.durationMs} onChange={(event) => updateField('durationMs', event.target.value)} />
          </label>
          <label className="field-block">
            <span>الانتقال</span>
            <input value={form.transition} onChange={(event) => updateField('transition', event.target.value)} />
          </label>
        </section>
      </div>

      <div className="admin-grid-2">
        <section className="admin-card card-pad stack-md">
          <h3>التوافق</h3>
          <div className="admin-checkbox-list">
            {templateOptions.map((template) => (
              <label key={template.slug} className="toggle-row">
                <span>{template.nameAr}</span>
                <input
                  type="checkbox"
                  checked={form.compatibleTemplates.includes(template.slug)}
                  onChange={(event) =>
                    updateField(
                      'compatibleTemplates',
                      event.target.checked
                        ? [...form.compatibleTemplates, template.slug]
                        : form.compatibleTemplates.filter((slug) => slug !== template.slug),
                    )
                  }
                />
              </label>
            ))}
          </div>
        </section>

        <section className="admin-card card-pad stack-md">
          <h3>السلوك</h3>
          <label className="toggle-row">
            <span>نشطة</span>
            <input type="checkbox" checked={form.isActive} onChange={(event) => updateField('isActive', event.target.checked)} />
          </label>
          <label className="toggle-row">
            <span>افتراضية</span>
            <input type="checkbox" checked={form.isDefault} onChange={(event) => updateField('isDefault', event.target.checked)} />
          </label>
          <label className="toggle-row">
            <span>تشغيل تلقائي</span>
            <input type="checkbox" checked={form.autoplay} onChange={(event) => updateField('autoplay', event.target.checked)} />
          </label>
          <label className="toggle-row">
            <span>تتطلب تفاعل المستخدم</span>
            <input
              type="checkbox"
              checked={form.requiresUserInteraction}
              onChange={(event) => updateField('requiresUserInteraction', event.target.checked)}
            />
          </label>
          <label className="field-block">
            <span>الترتيب</span>
            <input type="number" value={form.sortOrder} onChange={(event) => updateField('sortOrder', event.target.value)} />
          </label>
        </section>
      </div>

      <div className="admin-grid-2">
        <section className="admin-card card-pad stack-md">
          <h3>Default Config</h3>
          <textarea rows={10} dir="ltr" value={form.defaultConfig} onChange={(event) => updateField('defaultConfig', event.target.value)} />
        </section>
        <section className="admin-card card-pad stack-md">
          <h3>Text Config</h3>
          <textarea rows={10} dir="ltr" value={form.textConfig} onChange={(event) => updateField('textConfig', event.target.value)} />
        </section>
        <section className="admin-card card-pad stack-md">
          <h3>Media Config</h3>
          <textarea rows={10} dir="ltr" value={form.mediaConfig} onChange={(event) => updateField('mediaConfig', event.target.value)} />
        </section>
        <section className="admin-card card-pad stack-md">
          <h3>Theme Config</h3>
          <textarea rows={10} dir="ltr" value={form.themeConfig} onChange={(event) => updateField('themeConfig', event.target.value)} />
        </section>
      </div>
    </form>
  );
}
