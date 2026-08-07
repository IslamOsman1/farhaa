'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import TemplatesShowcase from '@/components/landing/TemplatesShowcase';
import Features from '@/components/landing/Features';
import Packages from '@/components/landing/Packages';
import HowItWorks from '@/components/landing/HowItWorks';
import FaqSection from '@/components/landing/FaqSection';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';
import SplashScreen from '@/components/landing/SplashScreen';
import FloatingWhatsApp from '@/components/landing/FloatingWhatsApp';
import { landingCopy } from '@/lib/landing-copy';
import { extractFaqItems } from '@/lib/site-settings';

export default function LandingExperience({ settings, whatsappNumber }) {
  const [showSplash, setShowSplash] = useState(true);
  const [language, setLanguage] = useState('ar');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 2400);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem('farha-language');
    const savedTheme = window.localStorage.getItem('farha-theme');

    if (savedLanguage === 'en' || savedLanguage === 'ar') {
      setLanguage(savedLanguage);
    }

    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('farha-language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = landingCopy[language].dir;
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem('farha-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleLanguage = () => setLanguage((current) => (current === 'ar' ? 'en' : 'ar'));
  const toggleDarkMode = () => setDarkMode((current) => !current);
  const copy = landingCopy[language];
  const faqItems = extractFaqItems(settings);

  return (
    <>
      <SplashScreen visible={showSplash} language={language} />

      <div
        className={`landing-page ${showSplash ? 'landing-page-loading' : 'landing-page-ready'} ${darkMode ? 'theme-dark' : 'theme-light'}`}
        dir={copy.dir}
      >
        <Navbar
          whatsapp={whatsappNumber}
          language={language}
          darkMode={darkMode}
          onToggleLanguage={toggleLanguage}
          onToggleDarkMode={toggleDarkMode}
        />
        <main>
          <Hero whatsapp={whatsappNumber} language={language} />
          <TemplatesShowcase language={language} />
          <Features language={language} />
          <Packages language={language} whatsapp={whatsappNumber} />
          <HowItWorks language={language} />
          <FaqSection items={faqItems} language={language} />
          <Contact whatsapp={whatsappNumber} language={language} />
        </main>
        <Footer settings={settings} language={language} />
        <FloatingWhatsApp whatsapp={whatsappNumber} />
      </div>
    </>
  );
}
