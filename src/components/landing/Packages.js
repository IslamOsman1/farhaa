'use client';
import { useEffect, useRef } from 'react';

export default function Packages() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
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
      name: 'الأساسية',
      price: '299',
      features: [
        { name: 'تصميم دعوة رقمية', available: true },
        { name: 'عداد تنازلي', available: true },
        { name: 'خرائط جوجل', available: true },
        { name: 'معرض صور (5 صور)', available: true },
        { name: 'تأكيد حضور RSVP', available: false },
        { name: 'موسيقى خلفية', available: false },
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'المميزة',
      price: '599',
      features: [
        { name: 'تصميم دعوة رقمية', available: true },
        { name: 'عداد تنازلي', available: true },
        { name: 'خرائط جوجل', available: true },
        { name: 'معرض صور (15 صورة)', available: true },
        { name: 'تأكيد حضور RSVP', available: true },
        { name: 'موسيقى خلفية', available: true },
      ],
      popular: true
    },
    {
      id: 'vip',
      name: 'الملكية',
      price: '999',
      features: [
        { name: 'تصميم دعوة رقمية مخصصة', available: true },
        { name: 'عداد تنازلي', available: true },
        { name: 'خرائط جوجل', available: true },
        { name: 'معرض صور مفتوح', available: true },
        { name: 'تأكيد حضور RSVP (مع رسائل SMS)', available: true },
        { name: 'موسيقى خلفية', available: true },
      ],
      popular: false
    }
  ];

  return (
    <section id="packages" className="section" ref={sectionRef}>
      <h2 className="section-title reveal">باقات وأسعار فرحة</h2>
      <p className="section-subtitle reveal">اختر الباقة التي تناسب احتياجاتك وميزانيتك</p>
      
      <div className="packages-grid">
        {packages.map((pkg, idx) => (
          <div key={pkg.id} className={`package-card reveal ${pkg.popular ? 'popular' : ''}`} style={{ transitionDelay: `${idx * 0.2}s` }}>
            {pkg.popular && <div className="popular-badge">الأكثر طلباً</div>}
            <h3 className="package-name">{pkg.name}</h3>
            <div className="package-price">
              {pkg.price} <span>ج.م</span>
            </div>
            <ul className="package-features">
              {pkg.features.map((feat, i) => (
                <li key={i} className={feat.available ? '' : 'disabled'}>
                  {feat.name}
                </li>
              ))}
            </ul>
            <a href="https://wa.me/201001473345" target="_blank" rel="noopener noreferrer" className="btn-outline">
              اطلب الآن
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
