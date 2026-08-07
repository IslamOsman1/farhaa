'use client';

import { useEffect, useRef } from 'react';
import { landingCopy } from '@/lib/landing-copy';

export default function HowItWorks({ language = 'ar' }) {
  const sectionRef = useRef(null);
  const copy = landingCopy[language].how;

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

    const elements = sectionRef.current.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section id="how-it-works" className="section" ref={sectionRef}>
      <h2 className="section-title reveal">{copy.title}</h2>
      <p className="section-subtitle reveal">{copy.subtitle}</p>

      <div className="steps-container">
        {copy.steps.map((step, idx) => (
          <div key={idx} className="step reveal" style={{ transitionDelay: `${idx * 0.2}s` }}>
            <div className="step-number">{step[0]}</div>
            <h3>{step[1]}</h3>
            <p>{step[2]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
