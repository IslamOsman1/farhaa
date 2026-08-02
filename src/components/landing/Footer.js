import Image from 'next/image';
import Link from 'next/link';

export default function Footer({ settings }) {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <Image src="/assets/logo.png" alt="FARHA logo" width={94} height={94} />
        <div>
          <Link href="/" className="footer-logo">
            فرحة
          </Link>
          <p className="footer-tagline">دعوات رقمية بطابع رومانسي راقٍ</p>
        </div>
      </div>

      <div className="footer-links">
        <Link href="#templates">القوالب</Link>
        <Link href="#features">المميزات</Link>
        <Link href="#packages">الباقات</Link>
        <Link href="#how-it-works">كيف نعمل</Link>
      </div>

      {(settings?.instagram || settings?.facebook || settings?.contactPhone || settings?.contactEmail) && (
        <div className="footer-social">
          {settings.instagram && (
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer">
              انستجرام
            </a>
          )}
          {settings.facebook && (
            <a href={settings.facebook} target="_blank" rel="noopener noreferrer">
              فيسبوك
            </a>
          )}
          {settings.contactPhone && <a href={`tel:${settings.contactPhone}`}>اتصل بنا</a>}
          {settings.contactEmail && <a href={`mailto:${settings.contactEmail}`}>البريد</a>}
        </div>
      )}

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} فرحة FARHA. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}
