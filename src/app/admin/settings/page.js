'use client';

import { useEffect, useState } from 'react';
import { createEmptyFaqItem, defaultFaqItems } from '@/lib/site-settings';
import { getSiteSettings, updateSiteSettings } from '@/actions/admin';

const formCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '20px',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d6dcea',
  borderRadius: '12px',
  textAlign: 'right',
  background: '#fff',
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '96px',
  resize: 'vertical',
};

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
    faqItems: defaultFaqItems,
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
          faqItems: data.faqItems?.length ? data.faqItems : defaultFaqItems,
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
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleFaqChange(index, field, value) {
    setFormData((current) => ({
      ...current,
      faqItems: current.faqItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function addFaqItem() {
    setFormData((current) => ({
      ...current,
      faqItems: [...current.faqItems, createEmptyFaqItem()],
    }));
  }

  function removeFaqItem(index) {
    setFormData((current) => {
      const nextItems = current.faqItems.filter((_, itemIndex) => itemIndex !== index);

      return {
        ...current,
        faqItems: nextItems.length ? nextItems : [createEmptyFaqItem()],
      };
    });
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
    <div style={{ maxWidth: '920px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>إعدادات الموقع</h2>

      {message ? <div className="inline-issue" style={{ marginBottom: '16px' }}>{message}</div> : null}

      <form onSubmit={handleSubmit} className="admin-card" style={formCardStyle}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>رقم الهاتف للتواصل</label>
          <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} dir="ltr" style={inputStyle} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>البريد الإلكتروني</label>
          <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} dir="ltr" style={inputStyle} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>رقم الواتساب</label>
          <input
            type="text"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            dir="ltr"
            placeholder="مثال: 201001234567"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>رابط إنستجرام</label>
          <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} dir="ltr" style={inputStyle} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px' }}>رابط فيسبوك</label>
          <input type="url" name="facebook" value={formData.facebook} onChange={handleChange} dir="ltr" style={inputStyle} />
        </div>

        <section
          style={{
            marginTop: '8px',
            padding: '18px',
            borderRadius: '18px',
            border: '1px solid #e6dcc7',
            background: '#fffaf1',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '18px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: '#9f7a38' }}>الأسئلة الشائعة في الصفحة الرئيسية</h3>
              <p style={{ margin: '6px 0 0', color: '#7b6b4c' }}>
                أضف سؤالًا، وعند الضغط عليه في الرئيسية سيظهر الجواب.
              </p>
            </div>

            <button type="button" className="btn btn-outline" onClick={addFaqItem}>
              + إضافة سؤال
            </button>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {formData.faqItems.map((item, index) => (
              <div
                key={`faq-item-${index}`}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid #eadfca',
                  background: '#fff',
                  boxShadow: '0 10px 24px rgba(159, 122, 56, 0.06)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <strong>سؤال #{index + 1}</strong>
                  <button type="button" className="btn btn-sm" onClick={() => removeFaqItem(index)}>
                    حذف
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>السؤال بالعربية</label>
                    <input
                      type="text"
                      value={item.questionAr}
                      onChange={(event) => handleFaqChange(index, 'questionAr', event.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>الإجابة بالعربية</label>
                    <textarea
                      value={item.answerAr}
                      onChange={(event) => handleFaqChange(index, 'answerAr', event.target.value)}
                      style={textareaStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>السؤال بالإنجليزية (اختياري)</label>
                    <input
                      type="text"
                      value={item.questionEn}
                      onChange={(event) => handleFaqChange(index, 'questionEn', event.target.value)}
                      dir="ltr"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px' }}>الإجابة بالإنجليزية (اختياري)</label>
                    <textarea
                      value={item.answerEn}
                      onChange={(event) => handleFaqChange(index, 'answerEn', event.target.value)}
                      dir="ltr"
                      style={{ ...textareaStyle, textAlign: 'left' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px', fontSize: '1rem', marginTop: '16px' }}>
          {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </form>
    </div>
  );
}
