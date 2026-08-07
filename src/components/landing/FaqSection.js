'use client';

import { useMemo, useState } from 'react';
import { landingCopy } from '@/lib/landing-copy';

export default function FaqSection({ items = [], language = 'ar' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const copy = landingCopy[language].faq;

  const localizedItems = useMemo(
    () =>
      items
        .map((item) => ({
          question: language === 'en' ? item.questionEn || item.questionAr : item.questionAr,
          answer: language === 'en' ? item.answerEn || item.answerAr : item.answerAr,
        }))
        .filter((item) => item.question && item.answer),
    [items, language],
  );

  if (!localizedItems.length) {
    return null;
  }

  return (
    <section id="faq" className="section faq-section">
      <div className="faq-shell reveal active">
        <div className="faq-head">
          <span className="faq-kicker">{copy.kicker}</span>
          <h2 className="section-title faq-title">{copy.title}</h2>
          <p className="section-subtitle faq-subtitle">{copy.subtitle}</p>
        </div>

        <div className="faq-list" role="list">
          {localizedItems.map((item, index) => {
            const isOpen = activeIndex === index;

            return (
              <article key={`${item.question}-${index}`} className={`faq-item ${isOpen ? 'open' : ''}`} role="listitem">
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setActiveIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <span className="faq-icon" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                <div className="faq-answer-wrap" hidden={!isOpen}>
                  <p className="faq-answer">{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
