'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { publicTemplateCatalog } from '@/lib/template-catalog';
import { landingCopy } from '@/lib/landing-copy';

export default function TemplatesShowcase({ language = 'ar' }) {
  const sectionRef = useRef(null);
  const templates = publicTemplateCatalog.slice(0, 10);
  const copy = landingCopy[language].templates;

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

    const cards = sectionRef.current?.querySelectorAll('.reveal') || [];
    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, []);

  return (
    <section id="templates" className="section templates-section" ref={sectionRef}>
      <div className="templates-head reveal">
        <div>
          <h2 className="section-title">{copy.title}</h2>
          <p className="section-subtitle">{copy.subtitle}</p>
        </div>
      </div>

      <div className="templates-scroll" aria-label={copy.title}>
        {templates.map((tpl, index) => (
          <Link
            href={`/${tpl.id}/index.html`}
            target="_blank"
            rel="noopener noreferrer"
            key={tpl.id}
            className="template-card template-card--scroll reveal"
            style={{ transitionDelay: `${index * 0.08}s` }}
          >
            <div className="template-image-wrapper">
              <span className="template-badge">{language === 'ar' ? tpl.badge : tpl.badgeEn}</span>
              <span className="template-category">{language === 'ar' ? tpl.category : tpl.categoryEn}</span>
              <img src={tpl.image} alt={language === 'ar' ? tpl.arabicName : tpl.name} className="template-image" />
            </div>
            <div className="template-info">
              <h3>{language === 'ar' ? tpl.arabicName : tpl.name}</h3>
              <p>{language === 'ar' ? tpl.desc : tpl.descEn}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="templates-more reveal">
        <Link href="/templates" className="templates-more-link">
          {copy.more}
        </Link>
      </div>
    </section>
  );
}
