'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StudioSessionsGrid({ initialSessions }) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');

  async function handleDelete(session) {
    const confirmed = window.confirm(`هل تريد حذف الجلسة "${session.name}"؟ لا يمكن التراجع عن هذا الإجراء.`);
    if (!confirmed) return;

    setDeletingId(session.id);
    setError('');

    try {
      const response = await fetch(`/api/studio/sessions/${session.id}`, {
        method: 'DELETE',
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || payload.error || 'تعذر حذف الجلسة.');
      }

      setSessions((current) => current.filter((item) => item.id !== session.id));
      router.refresh();
    } catch (requestError) {
      setError(requestError.message || 'تعذر حذف الجلسة.');
    } finally {
      setDeletingId('');
    }
  }

  return (
    <>
      {error ? <div className="admin-alert error">{error}</div> : null}

      <div className="admin-grid-cards">
        {sessions.map((session) => (
          <article key={session.id} className="admin-card card-pad studio-session-card">
            <div className="stack-sm">
              <div className="badge badge-warning">{session.status}</div>
              <h3>{session.name}</h3>
              <p>{session.baseTemplate?.nameAr || session.baseTemplate?.name || 'قالب غير معروف'}</p>
              <div className="meta-pair">
                <strong>آخر تحديث:</strong>
                <span>{new Date(session.updatedAt || session.createdAt).toLocaleString('ar-EG')}</span>
              </div>
              <div className="meta-pair">
                <strong>النسخة الداخلية:</strong>
                <span>{session.templateVariant?.name || 'لا توجد'}</span>
              </div>
            </div>

            <div className="studio-card-actions">
              <Link className="btn-primary" href={`/admin/studio/${session.id}`}>فتح الجلسة</Link>
              <Link className="btn-secondary" href={`/admin/studio/${session.id}/preview`} target="_blank">معاينة</Link>
              <button
                type="button"
                className="mini-btn danger"
                onClick={() => void handleDelete(session)}
                disabled={deletingId === session.id}
              >
                {deletingId === session.id ? 'جارٍ الحذف...' : 'حذف'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
