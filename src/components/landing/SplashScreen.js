'use client';

import Image from 'next/image';
import { landingCopy } from '@/lib/landing-copy';

export default function SplashScreen({ visible, language = 'ar' }) {
  const copy = landingCopy[language].splash;

  return (
    <div className={`splash-screen ${visible ? 'is-visible' : 'is-hidden'}`} aria-hidden={!visible}>
      <div className="splash-screen-inner">
        <div className="splash-screen-logo-wrap">
          <Image
            src="/assets/logo.png"
            alt="FARHA"
            width={140}
            height={140}
            className="splash-screen-logo"
            priority
          />
        </div>
        <div className="splash-screen-brand">FARHA</div>
        <p className="splash-screen-text">{copy.tagline}</p>
        <div className="splash-screen-loader">
          <span />
        </div>
      </div>
    </div>
  );
}
