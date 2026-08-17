'use client';

import { startTransition, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudioTemplateChooser({ templates, inventory }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [busySlug, setBusySlug] = useState('');
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return templates;
    return templates.filter((template) =>
      [template.name, template.nameAr, template.slug, template.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [search, templates]);

  async function createSession(template) {
    setBusySlug(template.slug);
    setError('');
    try {
      const response = await fetch('/api/studio/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateSlug: template.slug,
          name: `جلسة ${template.nameAr}`,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'تعذر إنشاء الجلسة.');
      }

      startTransition(() => {
        router.push(`/admin/studio/${payload.data.id}`);
      });
    } catch (requestError) {
      setError(requestError.message || 'تعذر إنشاء الجلسة.');
    } finally {
      setBusySlug('');
    }
  }

  return (
    <div className="stack-lg">
      <div className="admin-page-header">
        <div>
          <h2>استوديو الدعوات</h2>
          <p>اختر قالبًا أساسيًا ليتم إنشاء نسخة عمل مستقلة يمكن تعديلها دون المساس بالأصل.</p>
        </div>
      </div>

      <div className="admin-card card-pad studio-chooser-toolbar">
        <input
          type="search"
          placeholder="ابحث باسم القالب أو الـ slug"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="studio-inline-metrics">
          <span>{inventory.summary.templates} قالب</span>
          <span>{inventory.summary.images} صورة</span>
          <span>{inventory.summary.videos} فيديو</span>
          <span>{inventory.summary.audio} صوت</span>
        </div>
      </div>

      {error ? <div className="admin-alert error">{error}</div> : null}

      <div className="admin-grid-cards">
        {filtered.map((template) => (
          <article
            key={template.slug}
            className="admin-card card-pad studio-template-card"
            data-testid={`studio-template-card-${template.slug}`}
          >
            <div className="template-thumb">
              {template.previewImage ? <img src={template.previewImage} alt={template.nameAr} /> : null}
            </div>
            <div className="stack-sm">
              <h3>{template.nameAr}</h3>
              <p>{template.description}</p>
              <div className="meta-pair"><strong>Slug:</strong><span dir="ltr">{template.slug}</span></div>
              <div className="meta-pair"><strong>الأقسام:</strong><span>{template.sections.length}</span></div>
              <div className="meta-pair"><strong>الحقول القابلة للتعديل:</strong><span>{template.editableFields.length}</span></div>
              <div className="meta-pair"><strong>الافتتاحيات:</strong><span>{template.openingCompatibility.length}</span></div>
            </div>
            <button
              type="button"
              className="btn-primary"
              data-testid={`studio-template-create-${template.slug}`}
              onClick={() => void createSession(template)}
              disabled={busySlug === template.slug}
            >
              {busySlug === template.slug ? 'جارٍ الإنشاء...' : 'استخدام هذا القالب'}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
