'use client';

import Image from 'next/image';

export default function SplashScreen({ visible }) {
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
        <p className="splash-screen-text">دعوات زفاف رقمية فاخرة</p>
        <div className="splash-screen-loader">
          <span />
        </div>
      </div>
    </div>
  );
}
