import '@/styles/landing.css';
import { publicTemplateCatalog } from '@/lib/template-catalog';
import TemplatesBannerSlider from '@/components/landing/TemplatesBannerSlider';

export const metadata = {
  title: 'القوالب | FARHA',
  description: 'استعرض جميع قوالب FARHA الرقمية بتصنيفات واضحة ولمسات فاخرة.',
};

export default function PublicTemplatesPage() {
  return (
    <div className="landing-page templates-page">
      <main className="templates-page-shell">
        <section className="templates-banner">
          <div className="templates-banner__glow templates-banner__glow--one" aria-hidden="true" />
          <div className="templates-banner__glow templates-banner__glow--two" aria-hidden="true" />
          <TemplatesBannerSlider />
        </section>

        <section id="all-templates" className="section templates-page-section">
          <div className="templates-page-grid">
            {publicTemplateCatalog.map((tpl) => (
              <a
                key={tpl.id}
                href={`/${tpl.id}/index.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="template-card template-card--page"
              >
                <div className="template-image-wrapper">
                  <span className="template-badge">{tpl.badge}</span>
                  <span className="template-category">{tpl.category}</span>
                  <img src={tpl.image} alt={tpl.arabicName} className="template-image" />
                </div>

                <div className="template-info">
                  <h3>{tpl.arabicName}</h3>
                  <p>{tpl.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
