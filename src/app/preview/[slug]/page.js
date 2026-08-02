import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { findTemplateById } from '@/lib/templateCatalog';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

function formatPrice(price, currency) {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    return '';
  }

  const currencyLabel = currency === 'EGP' ? 'ج.م' : currency || '';
  return `${price} ${currencyLabel}`.trim();
}

function buildPreviewBar({ templateName, templateSlug, whatsappNumber, minPackagePrice }) {
  const safeName = templateName || 'هذا القالب';
  const orderUrl = `/order?tpl=${templateSlug}`;
  const whatsappText = encodeURIComponent(`مرحباً، أعجبني قالب «${safeName}» وأرغب في طلبه من FARHA.`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;
  const priceLine = minPackagePrice ? `تبدأ من ${minPackagePrice} — ` : '';

  const style = `
    <style>
      #farha-preview-bar{
        position:fixed;top:0;left:0;right:0;z-index:9999;direction:rtl;
        font-family:"Tajawal",system-ui,sans-serif;
        background:rgba(255,252,249,.96);
        border-bottom:1px solid rgba(127,42,31,.1);
        box-shadow:0 14px 34px rgba(83,38,31,.08);
        backdrop-filter:blur(14px);
      }
      #farha-preview-bar .fpb-wrap{
        display:flex;align-items:center;justify-content:space-between;gap:18px;
        padding:16px 26px;max-width:100%;box-sizing:border-box;
      }
      #farha-preview-bar .fpb-copy{display:flex;flex-direction:column;gap:4px;text-align:right}
      #farha-preview-bar .fpb-title{margin:0;color:#2f2430;font-size:1.05rem;font-weight:900}
      #farha-preview-bar .fpb-sub{margin:0;color:#756774;font-size:.95rem;line-height:1.75}
      #farha-preview-bar .fpb-note{margin:0;color:#8f7f78;font-size:.86rem;line-height:1.6}
      #farha-preview-bar .fpb-actions{display:flex;align-items:center;gap:12px;flex-shrink:0}
      #farha-preview-bar .fpb-close{
        width:38px;height:38px;border:none;border-radius:999px;background:transparent;color:#a396aa;
        cursor:pointer;font-size:28px;line-height:1;display:grid;place-items:center;
      }
      #farha-preview-bar .fpb-wa{
        width:62px;height:62px;border-radius:50%;display:grid;place-items:center;
        background:linear-gradient(135deg,#25d366,#128c43);color:#fff;text-decoration:none;
        box-shadow:0 14px 28px rgba(18,140,67,.24);
      }
      #farha-preview-bar .fpb-order{
        display:inline-flex;align-items:center;justify-content:center;padding:0 28px;height:58px;border-radius:999px;
        background:linear-gradient(135deg,#ff4d7d,#ff6f8f);color:#fff;text-decoration:none;
        font-weight:900;font-size:1.05rem;box-shadow:0 16px 30px rgba(255,77,125,.24);
      }
      body{padding-top:108px !important;box-sizing:border-box}
      @media (max-width: 820px){
        #farha-preview-bar .fpb-wrap{padding:12px 14px;gap:12px}
        #farha-preview-bar .fpb-title{font-size:.98rem}
        #farha-preview-bar .fpb-sub{font-size:.84rem;line-height:1.65}
        #farha-preview-bar .fpb-note{font-size:.76rem}
        #farha-preview-bar .fpb-order{height:52px;padding:0 22px;font-size:.98rem}
        #farha-preview-bar .fpb-wa{width:52px;height:52px}
        body{padding-top:122px !important}
      }
      @media (max-width: 620px){
        #farha-preview-bar .fpb-wrap{flex-wrap:wrap}
        #farha-preview-bar .fpb-copy{order:2;width:100%}
        #farha-preview-bar .fpb-actions{order:1;width:100%;justify-content:flex-start}
        #farha-preview-bar .fpb-close{margin-inline-end:auto}
        body{padding-top:156px !important}
      }
    </style>
  `;

  const markup = `
    <div id="farha-preview-bar" dir="rtl">
      <div class="fpb-wrap">
        <div class="fpb-copy">
          <p class="fpb-title">أعجبك قالب «${safeName}»؟</p>
          <p class="fpb-sub">${priceLine}اطلبه الآن من FARHA ليصبح مناسبًا لمناسبتكم خلال وقت قصير</p>
          <p class="fpb-note">هذا الشريط للمعاينة فقط — دعوتكم النهائية تصلكم نظيفة بدونه</p>
        </div>
        <div class="fpb-actions">
          <button class="fpb-close" type="button" aria-label="إغلاق الشريط" onclick="document.getElementById('farha-preview-bar').style.display='none';document.body.style.paddingTop='0px';">×</button>
          <a class="fpb-wa" href="${whatsappUrl}" target="_blank" rel="noopener" aria-label="اطلب عبر واتساب">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          </a>
          <a class="fpb-order" href="${orderUrl}" target="_top" rel="noopener">اطلبه 🎉</a>
        </div>
      </div>
    </div>
  `;

  return { style, markup };
}

export default async function TemplatePreviewPage({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const templateMeta = findTemplateById(slug);

  if (!templateMeta) {
    return notFound();
  }

  const templatePath = path.join(process.cwd(), 'public', slug, 'index.html');

  if (!fs.existsSync(templatePath)) {
    return notFound();
  }

  let settings = null;
  let cheapestPackage = null;

  try {
    settings = await prisma.siteSettings.findFirst();
    cheapestPackage = await prisma.package.findFirst({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  } catch (error) {
    console.error('Failed to load preview metadata:', error);
  }

  const whatsappNumber = (settings?.whatsapp || '201001473345').replace(/[^0-9]/g, '');
  const minPackagePrice = cheapestPackage ? formatPrice(cheapestPackage.price, cheapestPackage.currency) : '';

  let html = fs.readFileSync(templatePath, 'utf-8');

  html = html.replace(/(href|src)="assets\//g, `$1="/${slug}/assets/`);
  html = html.replace(/(href|src)="styles\.css"/g, `$1="/${slug}/styles.css"`);
  html = html.replace(/(href|src)="style\.css"/g, `$1="/${slug}/style.css"`);
  html = html.replace(/(href|src)="app\.js"/g, `$1="/${slug}/app.js"`);
  html = html.replace(/(href|src)="script\.js"/g, `$1="/${slug}/script.js"`);

  const { style, markup } = buildPreviewBar({
    templateName: templateMeta.arabicName,
    templateSlug: slug,
    whatsappNumber,
    minPackagePrice,
  });

  html = html.replace(
    '</head>',
    `${style}<style>#da3wa-democta,#farha-democta,#da3wa-credit{display:none !important;}</style></head>`
  );
  html = html.replace('</body>', `${markup}</body>`);

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        srcDoc={html}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title={templateMeta.arabicName}
      />
    </div>
  );
}
