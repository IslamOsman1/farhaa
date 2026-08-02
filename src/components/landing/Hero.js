'use client';

import { useEffect, useState } from 'react';

const heroSlides = [
  '/images/hero-bg.jpg',
  '/imperial/preview.jpg',
  '/toscana/preview.jpg',
];

export default function Hero({ whatsapp }) {
  const cleanWhatsapp = whatsapp ? whatsapp.replace(/[^0-9]/g, '') : '201001473345';
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="hero">
      <div className="hero-slides" aria-hidden="true">
        {heroSlides.map((slide, index) => (
          <div
            key={slide}
            className={`hero-slide ${index === activeSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url('${slide}')` }}
          />
        ))}
      </div>

      <div className="hero-overlay" />

      <div className="hero-shell">
        <div className="hero-copy">
          <div className="hero-kicker">دعوات رقمية فاخرة بتوقيع FARHA</div>

          <h1 className="hero-title">
            دعوة أنيقة
            <span> تليق بمناسبتك</span>
            <br />
            وتبهر ضيوفك من أول لحظة
          </h1>

          <p className="hero-subtitle">
            نصمم لك صفحة دعوة زفاف راقية، سهلة المشاركة، ومتوافقة مع الجوال
            لتظهر تفاصيل يومكم الكبير بأسلوب فاخر وواضح.
          </p>

          <div className="hero-cta">
            <a href="#templates" className="btn-primary">
              تصفح القوالب
            </a>
            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline hero-outline"
            >
              اطلب عبر واتساب
            </a>
          </div>

          <div className="hero-dots" aria-label="شرائح الهيرو">
            {heroSlides.map((slide, index) => (
              <span
                key={slide}
                className={`hero-dot ${index === activeSlide ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
