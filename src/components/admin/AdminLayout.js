'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { hasAnyPermission } from '@/lib/admin-security';

const links = [
  { href: '/admin/dashboard', label: 'نظرة عامة', permissions: ['dashboard.view'] },
  { href: '/admin/invitations', label: 'الدعوات', permissions: ['invitations.view'] },
  { href: '/admin/templates', label: 'القوالب', permissions: ['templates.view'] },
  { href: '/admin/studio', label: 'استوديو الدعوات', permissions: ['studio.view'] },
  { href: '/admin/openings', label: 'الافتتاحيات', permissions: ['openings.view'] },
  { href: '/admin/media', label: 'الوسائط', permissions: ['media.view'] },
  { href: '/admin/packages', label: 'الباقات', permissions: ['packages.manage'] },
  { href: '/admin/settings', label: 'الإعدادات', permissions: ['settings.manage'] },
  { href: '/admin/audit-logs', label: 'سجل العمليات', permissions: ['auditLogs.view'] },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isStudioWorkspace = pathname.startsWith('/admin/studio/');

  if (pathname === '/admin/login') {
    return children;
  }

  const role = session?.user?.role || 'viewer';
  const visibleLinks = links.filter((link) => hasAnyPermission(role, link.permissions));
  const pageLabel = visibleLinks.find((link) => pathname.startsWith(link.href))?.label || 'لوحة الإدارة';

  return (
    <div className={`admin-layout ${isStudioWorkspace ? 'admin-layout--studio-focus' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {isStudioWorkspace ? (
        <button
          type="button"
          className={`admin-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
          aria-label="إغلاق القائمة"
        />
      ) : null}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''} ${isStudioWorkspace ? 'admin-sidebar--floating' : ''}`}>
        <div className="admin-sidebar-header">
          <button type="button" className="admin-mobile-close" onClick={() => setSidebarOpen(false)}>
            ×
          </button>
          <h1>FARHA</h1>
          <p>لوحة إدارة الدعوات</p>
        </div>

        <nav className="admin-sidebar-nav">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`admin-nav-item ${pathname.startsWith(link.href) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <strong>{session?.user?.name || 'مدير FARHA'}</strong>
            <span>{session?.user?.role || 'viewer'}</span>
          </div>
          <button type="button" onClick={() => signOut({ callbackUrl: '/admin/login' })} className="btn-logout">
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className={`admin-main ${isStudioWorkspace ? 'admin-main--studio-focus' : ''}`}>
        <header className="admin-header">
          <button
            type="button"
            className={`admin-mobile-toggle ${isStudioWorkspace ? 'always-visible' : ''}`}
            onClick={() => setSidebarOpen((value) => !value)}
          >
            ☰
          </button>
          {isStudioWorkspace ? (
            <button
              type="button"
              className="admin-desktop-sidebar-toggle"
              onClick={() => setSidebarOpen((value) => !value)}
            >
              {sidebarOpen ? 'إخفاء القائمة' : 'إظهار القائمة'}
            </button>
          ) : null}
          <div>
            <h2>{pageLabel}</h2>
            <small>{session?.user?.email || session?.user?.username || 'farha admin'}</small>
          </div>
        </header>
        <div className={`admin-content ${isStudioWorkspace ? 'admin-content--studio-focus' : ''}`}>{children}</div>
      </main>
    </div>
  );
}
