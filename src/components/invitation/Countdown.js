'use client';

import { useState, useEffect } from 'react';

export default function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Convert to Arabic numerals
  const toArabic = (num) => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

  return (
    <section className="inv-section">
      <h2 className="inv-title">باقي على الفرحة</h2>
      <div className="countdown-container">
        <div className="countdown-box">
          <div className="countdown-num">{toArabic(timeLeft.days)}</div>
          <div className="countdown-label">يوم</div>
        </div>
        <div className="countdown-box">
          <div className="countdown-num">{toArabic(timeLeft.hours)}</div>
          <div className="countdown-label">ساعة</div>
        </div>
        <div className="countdown-box">
          <div className="countdown-num">{toArabic(timeLeft.minutes)}</div>
          <div className="countdown-label">دقيقة</div>
        </div>
        <div className="countdown-box">
          <div className="countdown-num">{toArabic(timeLeft.seconds)}</div>
          <div className="countdown-label">ثانية</div>
        </div>
      </div>
    </section>
  );
}
