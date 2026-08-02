import './globals.css';

export const metadata = {
  title: 'فرحة | FARHA — دعوات زفاف رقمية',
  description: 'فرحة — منصة دعوات الزفاف الرقمية الأنيقة. صمم دعوة زفافك الخاصة بسهولة مع عداد تنازلي، معرض صور، تأكيد حضور، ومشاركة عبر واتساب.',
  keywords: 'دعوة زفاف, wedding invitation, دعوات رقمية, فرحة, FARHA',
  openGraph: {
    title: 'فرحة | FARHA — دعوات زفاف رقمية',
    description: 'صمم دعوة زفافك الرقمية الخاصة بأناقة واحترافية',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
