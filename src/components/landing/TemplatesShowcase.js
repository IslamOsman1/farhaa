'use client';
import { useEffect, useRef } from 'react';
import { templateCatalog } from '@/lib/templateCatalog';

export default function TemplatesShowcase() {
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

  return (
    <section id="templates" className="section templates-section" ref={sectionRef}>
      <h2 className="section-title reveal">قوالب تناسب ذوقك</h2>
      <p className="section-subtitle reveal">اختر من بين مجموعة متنوعة من التصاميم المصممة بعناية لتناسب يومك الخاص</p>

      <div className="templates-grid">
        {templateCatalog.map((tpl, index) => (
          <a
            href={`/preview/${tpl.id}`}
            target="_blank"
            rel="noopener noreferrer"
            key={tpl.id}
            className="template-card reveal"
            style={{ transitionDelay: `${index * 0.2}s`, display: 'block', textDecoration: 'none', color: 'inherit' }}
          >
            <div className="template-image-wrapper">
              <img src={tpl.image} alt={tpl.arabicName} className="template-image" />
            </div>
            <div className="template-info">
              <h3>{tpl.arabicName}</h3>
              <p>{tpl.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
