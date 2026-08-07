'use client';

import { useEffect, useRef } from 'react';
import { landingCopy } from '@/lib/landing-copy';
import { getPackageDisplayFeatures } from '@/lib/packages';

function formatPackagePrice(price, currency, language) {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    return { amount: '', currencyLabel: currency || '' };
  }

  const amount = new Intl.NumberFormat(language === 'en' ? 'en-US' : 'ar-EG', {
    maximumFractionDigits: 0,
  }).format(price);

  const currencyLabelMap = {
    EGP: language === 'en' ? 'EGP' : 'ج.م',
    SAR: language === 'en' ? 'SAR' : 'ر.س',
    USD: language === 'en' ? 'USD' : 'دولار',
  };

  return {
    amount,
    currencyLabel: currencyLabelMap[currency] || currency || '',
  };
}

export default function Packages({ language = 'ar', packages = [], whatsapp }) {
  const sectionRef = useRef(null);
  const cleanWhatsapp = whatsapp ? whatsapp.replace(/[^0-9]/g, '') : '201001473345';
  const copy = landingCopy[language].packages;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 },
    );

    const cards = sectionRef.current.querySelectorAll('.reveal');
    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, []);

  const resolvedPackages = packages.length
    ? packages.map((pkg) => ({
        id: pkg.id,
        name: language === 'en' ? pkg.name || pkg.nameAr : pkg.nameAr || pkg.name,
        price: formatPackagePrice(pkg.price, pkg.currency, language),
        features: getPackageDisplayFeatures(pkg, language).map((name) => ({ name, available: true })),
        popular: Boolean(pkg.isPopular),
      }))
    : [
        {
          id: 'basic',
          name: copy.list.basic,
          price: { amount: '299', currencyLabel: copy.currency },
          features: copy.features.basic.map((name, index) => ({ name, available: index < 4 })),
          popular: false,
        },
        {
          id: 'premium',
          name: copy.list.premium,
          price: { amount: '599', currencyLabel: copy.currency },
          features: copy.features.premium.map((name) => ({ name, available: true })),
          popular: true,
        },
        {
          id: 'vip',
          name: copy.list.vip,
          price: { amount: '999', currencyLabel: copy.currency },
          features: copy.features.vip.map((name) => ({ name, available: true })),
          popular: false,
        },
      ];

  return (
    <section id="packages" className="section" ref={sectionRef}>
      <h2 className="section-title reveal">{copy.title}</h2>
      <p className="section-subtitle reveal">{copy.subtitle}</p>

      <div className="packages-grid">
        {resolvedPackages.map((pkg, idx) => (
          <div key={pkg.id} className={`package-card reveal ${pkg.popular ? 'popular' : ''}`} style={{ transitionDelay: `${idx * 0.2}s` }}>
            {pkg.popular && <div className="popular-badge">{copy.popular}</div>}
            <h3 className="package-name">{pkg.name}</h3>
            <div className="package-price">
              {pkg.price.amount} <span>{pkg.price.currencyLabel}</span>
            </div>
            <ul className="package-features">
              {pkg.features.map((feat, i) => (
                <li key={i} className={feat.available ? '' : 'disabled'}>
                  {feat.name}
                </li>
              ))}
            </ul>
            <a href={`https://wa.me/${cleanWhatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-outline">
              {copy.order}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
