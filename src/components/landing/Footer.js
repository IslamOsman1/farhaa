import Image from 'next/image';
import Link from 'next/link';
import { landingCopy } from '@/lib/landing-copy';

export default function Footer({ settings, language = 'ar' }) {
  const copy = landingCopy[language].footer;

  return (
    <footer className="footer">
      <div className="footer-brand">
        <Image src="/assets/logo.png" alt="FARHA logo" width={94} height={94} />
        <div>
          <Link href="/" className="footer-logo">
            {copy.title}
          </Link>
          <p className="footer-tagline">{copy.tagline}</p>
        </div>
      </div>

      <div className="footer-links">
        <Link href="#templates">{copy.templates}</Link>
        <Link href="#features">{copy.features}</Link>
        <Link href="#packages">{copy.packages}</Link>
        <Link href="#how-it-works">{copy.howItWorks}</Link>
        <Link href="#faq">{copy.faq}</Link>
      </div>

      {(settings?.instagram || settings?.facebook || settings?.contactPhone || settings?.contactEmail) && (
        <div className="footer-social">
          {settings.instagram && (
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer">
              {copy.instagram}
            </a>
          )}
          {settings.facebook && (
            <a href={settings.facebook} target="_blank" rel="noopener noreferrer">
              {copy.facebook}
            </a>
          )}
          {settings.contactPhone && <a href={`tel:${settings.contactPhone}`}>{copy.call}</a>}
          {settings.contactEmail && <a href={`mailto:${settings.contactEmail}`}>{copy.email}</a>}
        </div>
      )}

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} FARHA. {copy.copyright}</p>
      </div>
    </footer>
  );
}
