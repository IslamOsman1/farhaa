'use client';

import { useEffect, useState } from 'react';
import { landingCopy } from '@/lib/landing-copy';

const heroSlides = ['/images/hero-bg.jpg', '/imperial/preview.jpg', '/toscana/preview.jpg'];

export default function Hero({ whatsapp, language = 'ar' }) {
  const cleanWhatsapp = whatsapp ? whatsapp.replace(/[^0-9]/g, '') : '201001473345';
  const [activeSlide, setActiveSlide] = useState(0);
  const copy = landingCopy[language].hero;

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
          <div className="hero-kicker">{copy.kicker}</div>

          <h1 className="hero-title">
            {copy.titleTop}
            <span> {copy.titleAccent}</span>
            <br />
            {copy.titleBottom}
          </h1>

          <p className="hero-subtitle">{copy.subtitle}</p>

          <div className="hero-cta">
            <a href="#templates" className="btn-primary">
              {copy.browse}
            </a>
            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline hero-outline"
            >
              {copy.order}
            </a>
          </div>

          <div className="hero-dots" aria-label={copy.dots}>
            {heroSlides.map((slide, index) => (
              <span key={slide} className={`hero-dot ${index === activeSlide ? 'active' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
