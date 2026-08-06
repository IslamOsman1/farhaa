'use client';

import { useEffect, useRef, useState } from 'react';

const DEFAULT_QUERY = {
  page: 1,
  pageSize: 18,
  search: '',
  type: 'all',
  sort: 'newest',
  view: 'grid',
};

function formatBytes(bytes) {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function PreviewAsset({ asset }) {
  if (asset.fileType === 'image') {
    return <img src={asset.url} alt={asset.altText || asset.fileName || 'asset'} />;
  }

  if (asset.fileType === 'video') {
    return <video src={asset.url} muted playsInline />;
  }

  if (asset.fileType === 'audio') {
    return <div className="media-audio-tile">ملف صوتي</div>;
  }

  return <div className="media-file-tile">ملف</div>;
}

export default function MediaLibraryClient() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editForm, setEditForm] = useState({ fileName: '', altText: '', description: '' });
  const [notice, setNotice] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams(
          Object.entries(query).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {}),
        );
        const response = await fetch(`/api/media?${params.toString()}`);
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'تعذر تحميل الوسائط.');
        }
        if (!ignore) {
          setItems(payload.data.items);
          setPagination(payload.data.pagination);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || 'تعذر تحميل الوسائط.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      ignore = true;
    };
  }, [query, reloadKey]);

  async function uploadFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    setUploading(true);
    setNotice('');
    try {
      const formData = new FormData();
      formData.append('folder', 'library');
      files.forEach((file) => formData.append('files', file));

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'تعذر رفع الملفات.');
      }

      setNotice(
        payload.data.duplicates.length > 0
          ? `تم رفع ${payload.data.created.length} ملف، وتم تجاوز ${payload.data.duplicates.length} ملف مكرر.`
          : 'تم رفع الملفات بنجاح.',
      );
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setError(requestError.message || 'تعذر رفع الملفات.');
    } finally {
      setUploading(false);
    }
  }

  async function saveAssetMeta() {
    if (!selectedAsset) return;
    try {
      const response = await fetch(`/api/media/${selectedAsset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'تعذر تحديث الملف.');
      }
      setNotice('تم تحديث بيانات الملف.');
      setSelectedAsset(payload.data);
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setError(requestError.message || 'تعذر تحديث الملف.');
    }
  }

  async function deleteAsset(asset) {
    if (!window.confirm(`هل تريد حذف الملف "${asset.fileName || asset.originalName}"؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/media/${asset.id}`, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        const usageMessage = payload.validationErrors?.usageRefs?.length
          ? `الملف مستخدم في: ${payload.validationErrors.usageRefs.map((item) => item.entityLabel).join('، ')}`
          : payload.message;
        throw new Error(usageMessage || 'تعذر حذف الملف.');
      }

      setSelectedAsset(null);
      setNotice('تم حذف الملف.');
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setError(requestError.message || 'تعذر حذف الملف.');
    }
  }

  function openPicker() {
    fileInputRef.current?.click();
  }

  function openAssetDetails(asset) {
    setSelectedAsset(asset);
    setEditForm({
      fileName: asset.fileName || '',
      altText: asset.altText || '',
      description: asset.description || '',
    });
  }

  return (
    <div className="stack-lg">
      <div className="admin-page-header">
        <div>
          <h2>مكتبة الوسائط</h2>
          <p>رفع وإدارة الصور والفيديو والصوت والملفات مع تتبع أماكن الاستخدام داخل المشروع.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openPicker} disabled={uploading}>
          {uploading ? 'جارٍ الرفع...' : 'رفع ملفات'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={(event) => void uploadFiles(event.target.files)}
      />

      <div
        ref={dropRef}
        className="admin-card card-pad media-dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void uploadFiles(event.dataTransfer.files);
        }}
      >
        <strong>اسحب الملفات هنا أو اضغط على زر الرفع</strong>
        <span>يدعم الصور والفيديو والصوت وPDF حتى 25MB للملف الواحد.</span>
      </div>

      <div className="admin-card card-pad media-toolbar">
        <input
          type="search"
          placeholder="ابحث باسم الملف أو الوصف"
          value={query.search}
          onChange={(event) => setQuery((current) => ({ ...current, search: event.target.value, page: 1 }))}
        />
        <select value={query.type} onChange={(event) => setQuery((current) => ({ ...current, type: event.target.value, page: 1 }))}>
          <option value="all">كل الأنواع</option>
          <option value="image">الصور</option>
          <option value="video">الفيديو</option>
          <option value="audio">الصوت</option>
          <option value="file">الملفات</option>
        </select>
        <select value={query.sort} onChange={(event) => setQuery((current) => ({ ...current, sort: event.target.value }))}>
          <option value="newest">الأحدث</option>
          <option value="oldest">الأقدم</option>
          <option value="name">الاسم</option>
          <option value="size">الحجم</option>
        </select>
        <select value={query.view} onChange={(event) => setQuery((current) => ({ ...current, view: event.target.value }))}>
          <option value="grid">Grid</option>
          <option value="list">List</option>
        </select>
      </div>

      {notice ? <div className="admin-alert success">{notice}</div> : null}
      {error ? <div className="admin-alert error">{error}</div> : null}

      {loading ? <div className="admin-empty-state">جارٍ تحميل الوسائط...</div> : null}

      {!loading && items.length === 0 ? (
        <div className="admin-empty-state">لا توجد ملفات مطابقة للفلاتر الحالية.</div>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className={query.view === 'grid' ? 'media-grid' : 'media-list'}>
          {items.map((asset) => (
            <article key={asset.id} className="admin-card media-card">
              <button type="button" className="media-preview" onClick={() => openAssetDetails(asset)}>
                <PreviewAsset asset={asset} />
              </button>
              <div className="media-meta">
                <strong>{asset.fileName || asset.originalName}</strong>
                <span>{asset.fileType}</span>
                <span>{formatBytes(asset.sizeBytes)}</span>
                <span>{asset.usageRefs?.length ? `${asset.usageRefs.length} استخدام` : 'غير مستخدم'}</span>
              </div>
              <div className="media-actions">
                <button type="button" className="mini-btn" onClick={() => navigator.clipboard.writeText(asset.url)}>
                  نسخ الرابط
                </button>
                <button type="button" className="mini-btn" onClick={() => openAssetDetails(asset)}>
                  تفاصيل
                </button>
                <button type="button" className="mini-btn danger" onClick={() => void deleteAsset(asset)}>
                  حذف
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {pagination ? (
        <div className="media-pagination">
          <button
            type="button"
            className="mini-btn"
            disabled={pagination.page <= 1}
            onClick={() => setQuery((current) => ({ ...current, page: current.page - 1 }))}
          >
            السابق
          </button>
          <span>
            صفحة {pagination.page} من {pagination.totalPages}
          </span>
          <button
            type="button"
            className="mini-btn"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))}
          >
            التالي
          </button>
        </div>
      ) : null}

      {selectedAsset ? (
        <div className="media-modal-backdrop" onClick={() => setSelectedAsset(null)}>
          <div className="media-modal" onClick={(event) => event.stopPropagation()}>
            <div className="media-modal-preview">
              <PreviewAsset asset={selectedAsset} />
            </div>
            <div className="media-modal-body">
              <h3>تفاصيل الملف</h3>
              <label className="field-block">
                <span>اسم الملف</span>
                <input
                  value={editForm.fileName}
                  onChange={(event) => setEditForm((current) => ({ ...current, fileName: event.target.value }))}
                />
              </label>
              <label className="field-block">
                <span>Alt Text</span>
                <input
                  value={editForm.altText}
                  onChange={(event) => setEditForm((current) => ({ ...current, altText: event.target.value }))}
                />
              </label>
              <label className="field-block">
                <span>الوصف</span>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
                />
              </label>
              <div className="stack-sm">
                <div><strong>الرابط:</strong> <code>{selectedAsset.url}</code></div>
                <div><strong>النوع:</strong> {selectedAsset.fileType}</div>
                <div><strong>الحجم:</strong> {formatBytes(selectedAsset.sizeBytes)}</div>
                <div>
                  <strong>أماكن الاستخدام:</strong>{' '}
                  {selectedAsset.usageRefs?.length
                    ? selectedAsset.usageRefs.map((item) => item.entityLabel).join('، ')
                    : 'غير مستخدم'}
                </div>
              </div>
              <div className="media-modal-actions">
                <button type="button" className="action-btn secondary" onClick={() => setSelectedAsset(null)}>
                  إغلاق
                </button>
                <button type="button" className="action-btn primary" onClick={() => void saveAssetMeta()}>
                  حفظ التعديلات
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .media-dropzone {
          display: grid;
          gap: 6px;
          border: 2px dashed rgba(127, 42, 31, 0.18);
          background: rgba(255, 250, 246, 0.9);
          text-align: center;
        }
        .media-toolbar {
          display: grid;
          grid-template-columns: minmax(220px, 1fr) repeat(3, minmax(120px, 180px));
          gap: 12px;
        }
        .media-toolbar input,
        .media-toolbar select {
          width: 100%;
          border: 1px solid rgba(127, 42, 31, 0.12);
          border-radius: 14px;
          padding: 12px 14px;
          font: inherit;
          background: #fffaf9;
        }
        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .media-list {
          display: grid;
          gap: 12px;
        }
        .media-card {
          padding: 14px;
          display: grid;
          gap: 12px;
        }
        .media-preview {
          border: none;
          padding: 0;
          border-radius: 16px;
          overflow: hidden;
          background: #f4ece7;
          height: 180px;
        }
        .media-preview :global(img),
        .media-preview :global(video) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .media-audio-tile,
        .media-file-tile {
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          font-weight: 800;
          color: #7f2a1f;
        }
        .media-meta {
          display: grid;
          gap: 4px;
          color: #6d5d67;
        }
        .media-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .media-pagination {
          display: flex;
          justify-content: center;
          gap: 12px;
          align-items: center;
        }
        .media-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(35, 22, 22, 0.45);
          display: grid;
          place-items: center;
          padding: 20px;
          z-index: 80;
        }
        .media-modal {
          width: min(960px, 100%);
          display: grid;
          grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
          background: #fff;
          border-radius: 28px;
          overflow: hidden;
        }
        .media-modal-preview {
          background: #f5ece7;
          min-height: 320px;
        }
        .media-modal-preview :global(img),
        .media-modal-preview :global(video) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .media-modal-body {
          padding: 24px;
          display: grid;
          gap: 14px;
        }
        .media-modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        @media (max-width: 900px) {
          .media-toolbar {
            grid-template-columns: 1fr 1fr;
          }
          .media-modal {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .media-toolbar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
