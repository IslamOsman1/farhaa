'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import TemplatesShowcase from '@/components/landing/TemplatesShowcase';
import Features from '@/components/landing/Features';
import Packages from '@/components/landing/Packages';
import HowItWorks from '@/components/landing/HowItWorks';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';
import SplashScreen from '@/components/landing/SplashScreen';

export default function LandingExperience({ settings, whatsappNumber }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 2400);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <SplashScreen visible={showSplash} />

      <div className={`landing-page ${showSplash ? 'landing-page-loading' : 'landing-page-ready'}`}>
        <Navbar whatsapp={whatsappNumber} />
        <main>
          <Hero whatsapp={whatsappNumber} />
          <TemplatesShowcase />
          <Features />
          <Packages />
          <HowItWorks />
          <Contact whatsapp={whatsappNumber} />
        </main>
        <Footer settings={settings} />
      </div>
    </>
  );
}
