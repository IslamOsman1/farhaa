'use client';

import { useEffect, useState } from 'react';

function AssetThumb({ asset }) {
  if (asset.fileType === 'image') {
    return <img src={asset.url} alt={asset.altText || asset.fileName || 'asset'} />;
  }

  if (asset.fileType === 'video') {
    return <video src={asset.url} muted playsInline />;
  }

  return <div className="picker-placeholder">{asset.fileType === 'audio' ? 'صوت' : 'ملف'}</div>;
}

export default function MediaPicker({
  label = 'اختيار ملف',
  value = '',
  accept = 'image',
  folder = 'picker',
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    let ignore = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const type = accept === 'all' ? 'all' : accept;
        const response = await fetch(`/api/media?type=${type}&search=${encodeURIComponent(search)}&pageSize=24`);
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || payload.error || 'تعذر تحميل الوسائط.');
        }

        if (!ignore) {
          setItems(payload.data.items || []);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message || 'تعذر تحميل الوسائط.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, [open, search, accept]);

  async function uploadAndSelect(file) {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('folder', folder);
      formData.append('files', file);

      const response = await fetch('/api/media', { method: 'POST', body: formData });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || payload.error || 'تعذر رفع الملف.');
      }

      const selectedAsset = payload.data?.created?.[0] || payload.data?.duplicates?.[0];
      if (!selectedAsset?.url) {
        throw new Error('لم يتم إرجاع رابط الملف بعد الرفع.');
      }

      onChange(selectedAsset.url);
      setItems((current) => {
        if (current.some((item) => item.id === selectedAsset.id)) {
          return current;
        }

        return [selectedAsset, ...current];
      });
      setOpen(false);
    } catch (uploadError) {
      setError(uploadError.message || 'تعذر رفع الملف.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <div className="media-picker-field">
        <input
          type="url"
          dir="ltr"
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://..."
        />
        <button type="button" className="mini-btn" onClick={() => setOpen(true)}>
          {label}
        </button>
      </div>

      {open ? (
        <div className="picker-backdrop" onClick={() => setOpen(false)}>
          <div className="picker-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="picker-header">
              <strong>{label}</strong>
              <button type="button" className="mini-btn" onClick={() => setOpen(false)}>إغلاق</button>
            </div>

            <div className="picker-toolbar">
              <input
                type="search"
                placeholder="بحث"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <label className="mini-btn">
                {uploading ? 'جارٍ الرفع...' : 'رفع جديد'}
                <input
                  type="file"
                  hidden
                  accept={accept === 'image' ? 'image/*' : accept === 'audio' ? 'audio/*' : accept === 'video' ? 'video/*' : undefined}
                  onChange={(event) => void uploadAndSelect(event.target.files?.[0])}
                />
              </label>
            </div>

            {error ? <div className="picker-error">{error}</div> : null}
            {loading ? <div className="picker-empty">جارٍ التحميل...</div> : null}
            {!loading && items.length === 0 ? <div className="picker-empty">لا توجد ملفات مطابقة.</div> : null}
            {!loading && items.length > 0 ? (
              <div className="picker-grid">
                {items.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    className="picker-card"
                    onClick={() => {
                      onChange(asset.url);
                      setOpen(false);
                    }}
                  >
                    <div className="picker-thumb">
                      <AssetThumb asset={asset} />
                    </div>
                    <span>{asset.fileName || asset.originalName}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .media-picker-field {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 8px;
        }
        .media-picker-field input {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(127, 42, 31, .12);
          background: #fffaf9;
          padding: 12px 14px;
          font: inherit;
        }
        .picker-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(23, 18, 18, 0.45);
          display: grid;
          place-items: center;
          z-index: 90;
          padding: 20px;
        }
        .picker-dialog {
          width: min(920px, 100%);
          max-height: 85vh;
          overflow: auto;
          background: #fff;
          border-radius: 24px;
          padding: 20px;
          display: grid;
          gap: 16px;
        }
        .picker-header,
        .picker-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .picker-toolbar input {
          flex: 1;
          border-radius: 14px;
          border: 1px solid rgba(127, 42, 31, .12);
          padding: 12px 14px;
          font: inherit;
        }
        .picker-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
        }
        .picker-error {
          border-radius: 14px;
          border: 1px solid rgba(127, 42, 31, .16);
          background: #fff3f1;
          color: #9f3428;
          padding: 10px 12px;
          font-size: 0.92rem;
        }
        .picker-card {
          border: 1px solid rgba(127, 42, 31, .08);
          border-radius: 16px;
          background: #fffaf9;
          padding: 10px;
          display: grid;
          gap: 8px;
          font: inherit;
          color: #4b4149;
          text-align: right;
        }
        .picker-thumb {
          height: 120px;
          border-radius: 12px;
          overflow: hidden;
          background: #f3ebe7;
        }
        .picker-thumb :global(img),
        .picker-thumb :global(video) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .picker-placeholder,
        .picker-empty {
          display: grid;
          place-items: center;
          color: #7f2a1f;
          min-height: 120px;
        }
      `}</style>
    </>
  );
}
