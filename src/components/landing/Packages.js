'use client';

import { useEffect, useRef } from 'react';
import { landingCopy } from '@/lib/landing-copy';

export default function Packages({ language = 'ar', whatsapp }) {
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

  const packages = [
    {
      id: 'basic',
      name: copy.list.basic,
      price: '299',
      features: copy.features.basic.map((name, index) => ({ name, available: index < 4 })),
      popular: false,
    },
    {
      id: 'premium',
      name: copy.list.premium,
      price: '599',
      features: copy.features.premium.map((name) => ({ name, available: true })),
      popular: true,
    },
    {
      id: 'vip',
      name: copy.list.vip,
      price: '999',
      features: copy.features.vip.map((name) => ({ name, available: true })),
      popular: false,
    },
  ];

  return (
    <section id="packages" className="section" ref={sectionRef}>
      <h2 className="section-title reveal">{copy.title}</h2>
      <p className="section-subtitle reveal">{copy.subtitle}</p>

      <div className="packages-grid">
        {packages.map((pkg, idx) => (
          <div key={pkg.id} className={`package-card reveal ${pkg.popular ? 'popular' : ''}`} style={{ transitionDelay: `${idx * 0.2}s` }}>
            {pkg.popular && <div className="popular-badge">{copy.popular}</div>}
            <h3 className="package-name">{pkg.name}</h3>
            <div className="package-price">
              {pkg.price} <span>{copy.currency}</span>
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
