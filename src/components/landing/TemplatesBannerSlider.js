'use client';

import { useEffect, useState } from 'react';

const slides = ['/assets/baner1.png', '/assets/baner2.png'];

export default function TemplatesBannerSlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="templates-banner__slider" aria-label="بنر القوالب">
      {slides.map((slide, index) => (
        <div
          key={slide}
          className={`templates-banner__slide ${index === activeSlide ? 'is-active' : ''}`}
          style={{ backgroundImage: `url('${slide}')` }}
        />
      ))}
    </div>
  );
}
