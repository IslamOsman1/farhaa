'use client';

import { useEffect, useState } from 'react';

function buildAbsoluteUrl(path) {
  if (typeof window === 'undefined') {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}

export default function OwnerPortalLinkActions({
  overviewPath,
  entryPassesPath = '',
  title = 'رابط متابعة صاحب الدعوة',
  description = 'أرسل هذا الرابط لصاحب الدعوة ليتابع الحضور والردود من صفحة آمنة للقراءة فقط.',
}) {
  const [copied, setCopied] = useState('');
  const [displayUrl, setDisplayUrl] = useState(overviewPath);

  useEffect(() => {
    setDisplayUrl(buildAbsoluteUrl(overviewPath));
  }, [overviewPath]);

  async function handleCopy(path, kind) {
    try {
      const absoluteUrl = buildAbsoluteUrl(path);
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(kind);
      window.setTimeout(() => setCopied(''), 1800);
    } catch (error) {
      console.error(error);
      setCopied('');
      window.alert('تعذر نسخ الرابط.');
    }
  }

  function handleOpen(path) {
    window.open(buildAbsoluteUrl(path), '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="admin-card" style={{ marginBottom: '20px', padding: '20px 24px' }}>
      <div style={{ display: 'grid', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, marginBottom: '6px' }}>{title}</h3>
          <p style={{ margin: 0, color: '#64748b' }}>{description}</p>
        </div>

        <input
          type="text"
          readOnly
          value={displayUrl}
          onFocus={(event) => event.target.select()}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1px solid #dbe3ef',
            background: '#f8fafc',
            direction: 'ltr',
            textAlign: 'left',
          }}
        />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => handleOpen(overviewPath)}>
            فتح رابط المتابعة
          </button>
          <button type="button" className="btn btn-outline" onClick={() => handleCopy(overviewPath, 'overview')}>
            {copied === 'overview' ? 'تم النسخ' : 'نسخ الرابط'}
          </button>

          {entryPassesPath ? (
            <>
              <button type="button" className="btn btn-outline" onClick={() => handleOpen(entryPassesPath)}>
                صفحة التصاريح
              </button>
              <button type="button" className="btn btn-outline" onClick={() => handleCopy(entryPassesPath, 'entry-passes')}>
                {copied === 'entry-passes' ? 'تم نسخ رابط التصاريح' : 'نسخ رابط التصاريح'}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
