'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getPackageDisplayAddons } from '@/lib/packages';

const templates = [
  { id: 'classic', name: 'Classic', arabicName: 'كلاسيك', image: '/classic/assets/preloader-poster.jpg' },
  { id: 'bab', name: 'Bab', arabicName: 'باب الفرح', image: '/bab/assets/door-poster.jpg' },
  { id: 'reverie', name: 'Reverie', arabicName: 'حُلم وردي', image: '/reverie/assets/envelope-poster.jpg' },
  { id: 'ring', name: 'Ring', arabicName: 'الخاتم', image: '/ring/assets/video-poster.jpg' },
  { id: 'letter', name: 'Letter', arabicName: 'رسالة', image: '/letter/assets/letter-open.jpg' },
  { id: 'disney', name: 'Disney', arabicName: 'ديزني', image: '/disney/assets/door-poster.jpg' },
  { id: 'rozana', name: 'Rozana', arabicName: 'روزنة', image: '/rozana/assets/poster.jpg' },
  { id: 'hadeel', name: 'Hadeel', arabicName: 'هديل', image: '/hadeel/assets/poster.jpg' },
  { id: 'wisal', name: 'Wisal', arabicName: 'وِصال', image: '/wisal/assets/poster.jpg' },
  { id: 'vangogh', name: 'Vangogh', arabicName: 'ليلة النجوم', image: '/vangogh/assets/preloader-poster.jpg' },
  { id: 'blush', name: 'Blush', arabicName: 'وردة', image: '/blush/assets/share.jpg' },
];

const occasions = ['زفاف', 'حنة', 'عقد قران', 'خطوبة', 'عيد ميلاد', 'مولود جديد'];

function formatPackagePrice(price, currency) {
  const amount = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(Number(price) || 0);
  const labels = { EGP: 'ج.م', SAR: 'ر.س', USD: 'دولار' };
  return `${amount} ${labels[currency] || currency || ''}`.trim();
}

function OrderForm() {
  const searchParams = useSearchParams();
  const tplParam = searchParams.get('tpl');
  const [loading, setLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    countryCode: '+20',
    occasion: 'زفاف',
    templateId: tplParam || 'classic',
    packageId: '',
    selectedAddons: [],
  });

  useEffect(() => {
    let mounted = true;

    async function loadPackages() {
      try {
        const response = await fetch('/api/packages');
        const data = await response.json();
        if (!mounted) return;
        const nextPackages = Array.isArray(data) ? data : [];
        setPackages(nextPackages);
        if (nextPackages.length) {
          setFormData((prev) => ({
            ...prev,
            packageId: prev.packageId || nextPackages[0].id,
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setPackagesLoading(false);
      }
    }

    void loadPackages();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedPackage = useMemo(
    () => packages.find((pkg) => pkg.id === formData.packageId) || null,
    [packages, formData.packageId],
  );

  const selectedPackageAddons = useMemo(
    () => (selectedPackage ? getPackageDisplayAddons(selectedPackage, 'ar') : []),
    [selectedPackage],
  );

  function toggleAddon(addonId) {
    setFormData((prev) => ({
      ...prev,
      selectedAddons: prev.selectedAddons.includes(addonId)
        ? prev.selectedAddons.filter((id) => id !== addonId)
        : [...prev.selectedAddons, addonId],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.slug) {
        window.location.href = `/edit/${data.slug}`;
        return;
      }

      window.alert(data.error || 'حدث خطأ أثناء الإنشاء');
    } catch (error) {
      console.error(error);
      window.alert('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="order-container">
      <div className="order-header">
        <Link href="/" className="logo-text">FARHA</Link>
        <h1 className="title">اطلب دعوتك</h1>
        <p className="subtitle">اختر القالب والباقه والإضافات المناسبة، ثم ابدأ التعديل فورًا.</p>
      </div>

      <div className="order-card">
        <div className="badge-offer">ابدأ الآن وعدّل قبل الدفع ✨</div>

        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-group">
            <label>اسمك</label>
            <input type="text" placeholder="مثلاً: كرار محمد" required value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} />
          </div>

          <div className="form-group">
            <label>رقم واتسابك</label>
            <div className="phone-input-group">
              <select value={formData.countryCode} onChange={(e) => setFormData((prev) => ({ ...prev, countryCode: e.target.value }))}>
                <option value="+20">EG +20</option>
                <option value="+966">SA +966</option>
                <option value="+971">AE +971</option>
                <option value="+964">IQ +964</option>
                <option value="+965">KW +965</option>
                <option value="+974">QA +974</option>
                <option value="+968">OM +968</option>
                <option value="+973">BH +973</option>
                <option value="+962">JO +962</option>
              </select>
              <input type="tel" placeholder="100 123 4567" required value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
          </div>

          <div className="form-group">
            <label>ما هي مناسبتك؟</label>
            <div className="occasions-grid">
              {occasions.map((occasion) => (
                <button
                  type="button"
                  key={occasion}
                  className={`occ-btn ${formData.occasion === occasion ? 'active' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, occasion }))}
                >
                  {occasion}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>اختر الباقة</label>
            {packagesLoading ? (
              <div className="loading-box">جارٍ تحميل الباقات...</div>
            ) : (
              <div className="package-picker-grid">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    className={`package-picker-card ${formData.packageId === pkg.id ? 'active' : ''}`}
                    onClick={() => setFormData((prev) => ({ ...prev, packageId: pkg.id, selectedAddons: [] }))}
                  >
                    <strong>{pkg.nameAr || pkg.name}</strong>
                    <span>{formatPackagePrice(pkg.price, pkg.currency)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedPackageAddons.length ? (
            <div className="form-group">
              <label>إضافات الباقة المختارة</label>
              <div className="addons-grid">
                {selectedPackageAddons.map((addon) => (
                  <button
                    key={addon.id}
                    type="button"
                    className={`addon-card ${formData.selectedAddons.includes(addon.id) ? 'active' : ''}`}
                    onClick={() => toggleAddon(addon.id)}
                  >
                    <strong>{addon.label}</strong>
                    {addon.descriptionLabel ? <small>{addon.descriptionLabel}</small> : null}
                    <b>{formatPackagePrice(addon.price, addon.currency)}</b>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="form-group">
            <label>اختر شكل دعوتك</label>
            <div className="templates-scroll">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className={`tpl-card ${formData.templateId === tpl.id ? 'active' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, templateId: tpl.id }))}
                >
                  <img src={tpl.image} alt={tpl.arabicName} />
                  <span>{formData.templateId === tpl.id ? '✓ ' : ''}{tpl.arabicName}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'جارٍ الإنشاء...' : 'أنشئ دعوتي الآن'}
          </button>

          <p className="footer-note">
            ستحصل على رابط تعديل مباشر، مع الباقة المختارة والإضافات التي قمت بتحديدها.
          </p>
        </form>
      </div>

      <style jsx>{`
        .order-container {
          min-height: 100vh;
          background-color: #fdfaf6;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: var(--font-arabic), sans-serif;
          direction: rtl;
        }
        .order-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo-text {
          font-family: Georgia, serif;
          font-size: 2rem;
          font-weight: bold;
          color: #c49a45;
          text-decoration: none;
          letter-spacing: 2px;
          display: inline-block;
          margin-bottom: 20px;
          text-shadow: 0px 2px 4px rgba(0,0,0,0.3);
        }
        .title {
          color: #1a1a1a;
          font-size: 2.5rem;
          margin: 0 0 10px 0;
          font-weight: 800;
        }
        .subtitle {
          color: #666;
          font-size: 1.1rem;
          margin: 0;
        }
        .order-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          width: 100%;
          max-width: 760px;
          padding: 40px;
          position: relative;
        }
        .badge-offer {
          background: linear-gradient(135deg, #a855f7, #ec4899);
          color: white;
          padding: 8px 24px;
          border-radius: 999px;
          font-weight: bold;
          display: inline-block;
          margin: 0 auto 20px;
          position: relative;
          left: 50%;
          transform: translateX(-50%);
        }
        .form-group {
          margin-bottom: 25px;
          text-align: right;
        }
        .form-group label {
          display: block;
          font-weight: bold;
          margin-bottom: 10px;
          color: #2a2140;
        }
        input[type="text"], input[type="tel"], select {
          width: 100%;
          padding: 14px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 1rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }
        input:focus, select:focus {
          border-color: #ec4899;
        }
        .phone-input-group {
          display: flex;
          gap: 10px;
          flex-direction: row-reverse;
        }
        .phone-input-group select {
          width: 120px;
          direction: ltr;
        }
        .phone-input-group input {
          flex: 1;
          direction: ltr;
          text-align: right;
        }
        .occasions-grid,
        .package-picker-grid,
        .addons-grid {
          display: grid;
          gap: 10px;
        }
        .occasions-grid {
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        }
        .package-picker-grid,
        .addons-grid {
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        }
        .occ-btn,
        .package-picker-card,
        .addon-card {
          border: 1px solid #e5e7eb;
          background: #fff;
          border-radius: 18px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .occ-btn {
          padding: 10px 20px;
          font-weight: 500;
          color: #4b5563;
        }
        .package-picker-card,
        .addon-card {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: right;
        }
        .package-picker-card strong,
        .addon-card strong {
          color: #2a2140;
          font-size: 1rem;
        }
        .package-picker-card span,
        .addon-card b,
        .addon-card small {
          color: #6b7280;
        }
        .addon-card b {
          color: #c49a45;
        }
        .occ-btn.active,
        .package-picker-card.active,
        .addon-card.active {
          background: #fff7ed;
          border-color: #e11d48;
          box-shadow: 0 8px 20px rgba(225, 29, 72, 0.08);
        }
        .templates-scroll {
          display: flex;
          gap: 15px;
          overflow-x: auto;
          padding-bottom: 15px;
          direction: rtl;
        }
        .tpl-card {
          min-width: 120px;
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .tpl-card img {
          width: 100%;
          height: 160px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 8px;
        }
        .tpl-card span {
          display: block;
          font-weight: 600;
          font-size: 0.9rem;
          color: #4b5563;
        }
        .tpl-card.active {
          border-color: #e11d48;
          background: #fff1f2;
        }
        .tpl-card.active span {
          color: #e11d48;
        }
        .submit-btn {
          width: 100%;
          padding: 16px;
          background: #ff4d7d;
          color: white;
          border: none;
          border-radius: 999px;
          font-size: 1.2rem;
          font-weight: bold;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(255, 77, 125, 0.3);
          transition: transform 0.2s;
          margin-top: 10px;
        }
        .submit-btn:hover {
          transform: translateY(-2px);
        }
        .footer-note,
        .loading-box {
          text-align: center;
          color: #9ca3af;
          font-size: 0.9rem;
          margin-top: 20px;
        }
        .loading-box {
          padding: 16px;
          border-radius: 14px;
          background: #faf7f1;
          margin-top: 0;
        }
        @media (max-width: 600px) {
          .order-card {
            padding: 25px;
          }
          .title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div style={{ padding: '50px', textAlign: 'center' }}>جارٍ التحميل...</div>}>
      <OrderForm />
    </Suspense>
  );
}
