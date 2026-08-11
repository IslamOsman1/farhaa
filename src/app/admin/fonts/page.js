'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  FONT_UPLOAD_ACCEPT,
  PUBLIC_FONT_LIBRARY_STYLESHEET_PATH,
} from '@/lib/font-library';

const cardStyle = {
  background: '#fff',
  border: '1px solid rgba(159, 122, 56, 0.14)',
  borderRadius: '24px',
  boxShadow: '0 18px 48px rgba(159, 122, 56, 0.08)',
};

const fieldStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid #eadfca',
  background: '#fffdf8',
  font: 'inherit',
};

const buttonStyle = {
  borderRadius: '14px',
  padding: '12px 16px',
  border: '1px solid rgba(127, 42, 31, 0.14)',
  background: '#fff',
  color: '#7f2a1f',
  font: '600 15px Tajawal, sans-serif',
  cursor: 'pointer',
};

export default function FontLibraryPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [fonts, setFonts] = useState({ builtins: [], uploaded: [], all: [] });
  const [form, setForm] = useState({
    family: '',
    nameAr: '',
    nameEn: '',
    url: '',
    file: null,
  });

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    if (!document.querySelector('link[data-farha-font-library-styles="true"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = PUBLIC_FONT_LIBRARY_STYLESHEET_PATH;
      link.dataset.farhaFontLibraryStyles = 'true';
      document.head.appendChild(link);
    }
  }, []);

  async function loadFonts() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/font-library', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'تعذر تحميل مكتبة الخطوط.');
      }
      setFonts(payload.data || { builtins: [], uploaded: [], all: [] });
    } catch (error) {
      setMessage(error.message || 'تعذر تحميل مكتبة الخطوط.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFonts();
  }, []);

  const totalFonts = useMemo(() => (fonts.all || []).length, [fonts.all]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const requestBody = new FormData();
      requestBody.append('family', form.family);
      requestBody.append('nameAr', form.nameAr);
      requestBody.append('nameEn', form.nameEn);
      requestBody.append('url', form.url);
      if (form.file) {
        requestBody.append('file', form.file);
      }

      const response = await fetch('/api/admin/font-library', {
        method: 'POST',
        body: requestBody,
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'تعذر إضافة الخط.');
      }

      setFonts(payload.data || { builtins: [], uploaded: [], all: [] });
      setForm({
        family: '',
        nameAr: '',
        nameEn: '',
        url: '',
        file: null,
      });
      setMessage(payload.message || 'تمت إضافة الخط بنجاح.');
    } catch (error) {
      setMessage(error.message || 'تعذر إضافة الخط.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setMessage('');
    try {
      const response = await fetch('/api/admin/font-library', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'تعذر حذف الخط.');
      }
      setFonts(payload.data || { builtins: [], uploaded: [], all: [] });
      setMessage(payload.message || 'تم حذف الخط.');
    } catch (error) {
      setMessage(error.message || 'تعذر حذف الخط.');
    }
  }

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <section className="admin-card" style={{ ...cardStyle, padding: '24px' }}>
        <div style={{ display: 'grid', gap: '12px' }}>
          <span style={{ color: '#9f7a38', fontWeight: 700 }}>مكتبة الخطوط</span>
          <h2 style={{ margin: 0 }}>إدارة خطوط الاستوديو والدعوات</h2>
          <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.8 }}>
            كل خط تضيفه هنا يصبح متاحًا داخل الاستوديو، ويُحمّل تلقائيًا داخل المعاينة والدعوات المنشورة.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginTop: '20px',
          }}
        >
          <div style={{ ...cardStyle, padding: '18px' }}>
            <small style={{ color: '#9f7a38' }}>إجمالي الخطوط</small>
            <strong style={{ display: 'block', marginTop: '10px', fontSize: '36px' }}>{totalFonts}</strong>
          </div>
          <div style={{ ...cardStyle, padding: '18px' }}>
            <small style={{ color: '#9f7a38' }}>خطوط جاهزة</small>
            <strong style={{ display: 'block', marginTop: '10px', fontSize: '36px' }}>{fonts.builtins?.length || 0}</strong>
          </div>
          <div style={{ ...cardStyle, padding: '18px' }}>
            <small style={{ color: '#9f7a38' }}>خطوط مضافة</small>
            <strong style={{ display: 'block', marginTop: '10px', fontSize: '36px' }}>{fonts.uploaded?.length || 0}</strong>
          </div>
        </div>
      </section>

      <section className="admin-card" style={{ ...cardStyle, padding: '24px' }}>
        <div style={{ display: 'grid', gap: '8px', marginBottom: '18px' }}>
          <strong style={{ fontSize: '22px' }}>إضافة خط جديد</strong>
          <p style={{ margin: 0, color: '#6b7280' }}>
            يمكنك رفع ملف خط أو إضافة رابط مباشر لملف الخط. اكتب اسم العائلة كما تريد ظهوره داخل الاستوديو.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <input
              style={fieldStyle}
              placeholder="اسم العائلة - مثال: Marhey"
              value={form.family}
              onChange={(event) => setForm((current) => ({ ...current, family: event.target.value }))}
            />
            <input
              style={fieldStyle}
              placeholder="الاسم العربي"
              value={form.nameAr}
              onChange={(event) => setForm((current) => ({ ...current, nameAr: event.target.value }))}
            />
            <input
              style={fieldStyle}
              placeholder="English name"
              value={form.nameEn}
              onChange={(event) => setForm((current) => ({ ...current, nameEn: event.target.value }))}
            />
          </div>

          <input
            style={fieldStyle}
            dir="ltr"
            placeholder="https://... رابط مباشر لملف الخط (اختياري)"
            value={form.url}
            onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
          />

          <label
            style={{
              ...fieldStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              cursor: 'pointer',
            }}
          >
            <span>{form.file?.name || 'اختر ملف خط بصيغة TTF / OTF / WOFF / WOFF2'}</span>
            <span style={{ ...buttonStyle, padding: '10px 14px' }}>اختيار ملف</span>
            <input
              type="file"
              hidden
              accept={FONT_UPLOAD_ACCEPT}
              onChange={(event) => setForm((current) => ({ ...current, file: event.target.files?.[0] || null }))}
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ color: '#6b7280' }}>بعد الإضافة سيظهر الخط مباشرة داخل الاستوديو والنصوص.</span>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'جارٍ الإضافة...' : 'إضافة الخط'}
            </button>
          </div>
        </form>
      </section>

      {message ? (
        <div className="inline-issue" style={{ marginTop: '-8px' }}>
          {message}
        </div>
      ) : null}

      <section className="admin-card" style={{ ...cardStyle, padding: '24px' }}>
        <div style={{ display: 'grid', gap: '8px', marginBottom: '18px' }}>
          <strong style={{ fontSize: '22px' }}>الخطوط الجاهزة</strong>
          <p style={{ margin: 0, color: '#6b7280' }}>20 خطًا مزخرفًا بالعربية والإنجليزية جاهزة للاستخدام فورًا.</p>
        </div>

        {loading ? <div className="admin-empty-state">جارٍ تحميل الخطوط...</div> : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {(fonts.builtins || []).map((font) => (
            <article key={font.id} style={{ ...cardStyle, padding: '18px', display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                <strong>{font.nameAr}</strong>
                <span style={{ color: '#9f7a38', fontSize: '13px' }}>{font.providerLabel}</span>
              </div>
              <div style={{ color: '#6b7280' }}>{font.nameEn}</div>
              <div style={{ fontFamily: font.cssFamily, fontSize: '28px', color: '#7f2a1f' }}>{font.sampleAr}</div>
              <div style={{ fontFamily: font.cssFamily, fontSize: '20px', color: '#334155' }}>{font.sampleEn}</div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a href={font.downloadUrl} target="_blank" rel="noreferrer" className="btn btn-outline">
                  المصدر
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-card" style={{ ...cardStyle, padding: '24px' }}>
        <div style={{ display: 'grid', gap: '8px', marginBottom: '18px' }}>
          <strong style={{ fontSize: '22px' }}>الخطوط المضافة يدويًا</strong>
          <p style={{ margin: 0, color: '#6b7280' }}>هذه الخطوط من رفعك أو من روابط مباشرة، ويمكن تنزيلها أو حذفها لاحقًا.</p>
        </div>

        {!fonts.uploaded?.length ? (
          <div className="admin-empty-state">لا توجد خطوط مضافة بعد.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {fonts.uploaded.map((font) => (
              <article key={font.id} style={{ ...cardStyle, padding: '18px', display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                  <strong>{font.nameAr}</strong>
                  <span style={{ color: '#9f7a38', fontSize: '13px' }}>{font.providerLabel}</span>
                </div>
                <div style={{ color: '#6b7280' }}>{font.nameEn}</div>
                <div style={{ fontFamily: font.cssFamily, fontSize: '28px', color: '#7f2a1f' }}>{font.sampleAr}</div>
                <div style={{ fontFamily: font.cssFamily, fontSize: '20px', color: '#334155' }}>{font.sampleEn}</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a href={font.downloadUrl} target="_blank" rel="noreferrer" className="btn btn-outline">
                    تنزيل
                  </a>
                  <button type="button" className="btn btn-sm" onClick={() => handleDelete(font.id)}>
                    حذف
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
