'use client';
import { useEffect, useRef } from 'react';

export default function HowItWorks() {
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

    const elements = sectionRef.current.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const steps = [
    { num: '1', title: 'اختر الباقة والقالب', desc: 'تصفح قوالبنا وباقاتنا واختر ما يناسبك' },
    { num: '2', title: 'أرسل التفاصيل', desc: 'تواصل معنا عبر الواتساب وزودنا بتفاصيل الزفاف' },
    { num: '3', title: 'استلم دعوتك', desc: 'سنقوم بتجهيز دعوتك وإرسال الرابط لك لمشاركته' },
  ];

  return (
    <section id="how-it-works" className="section" ref={sectionRef}>
      <h2 className="section-title reveal">كيف تعمل منصة فرحة؟</h2>
      <p className="section-subtitle reveal">خطوات بسيطة للحصول على دعوتك الرقمية المميزة</p>
      
      <div className="steps-container">
        {steps.map((step, idx) => (
          <div key={idx} className="step reveal" style={{ transitionDelay: `${idx * 0.2}s` }}>
            <div className="step-number">{step.num}</div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
