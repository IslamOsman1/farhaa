'use client';

import { useEffect, useMemo, useState } from 'react';
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
  { href: '/admin/fonts', label: 'مكتبة الخطوط', permissions: ['settings.manage'] },
  { href: '/admin/packages', label: 'الباقات', permissions: ['packages.manage'] },
  { href: '/admin/settings', label: 'الإعدادات', permissions: ['settings.manage'] },
  { href: '/admin/audit-logs', label: 'سجل العمليات', permissions: ['auditLogs.view'] },
];

function buildMobileQuickLinks(visibleLinks) {
  const priority = ['/admin/dashboard', '/admin/invitations', '/admin/studio', '/admin/settings'];
  const quickLinks = [];

  priority.forEach((href) => {
    const found = visibleLinks.find((link) => link.href === href);
    if (found) {
      quickLinks.push(found);
    }
  });

  visibleLinks.forEach((link) => {
    if (quickLinks.length >= 4) {
      return;
    }

    if (!quickLinks.some((item) => item.href === link.href)) {
      quickLinks.push(link);
    }
  });

  return quickLinks.slice(0, 4);
}

function MenuIcon() {
  return (
    <span className="admin-menu-icon" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isStudioWorkspace = pathname.startsWith('/admin/studio/');

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  if (pathname === '/admin/login') {
    return children;
  }

  const role = session?.user?.role || 'viewer';
  const visibleLinks = links.filter((link) => hasAnyPermission(role, link.permissions));
  const pageLabel = visibleLinks.find((link) => pathname.startsWith(link.href))?.label || 'لوحة الإدارة';
  const mobileQuickLinks = useMemo(() => buildMobileQuickLinks(visibleLinks), [visibleLinks]);

  return (
    <div className={`admin-layout ${isStudioWorkspace ? 'admin-layout--studio-focus' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <button
        type="button"
        className={`admin-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-label="إغلاق القائمة"
      />

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''} ${isStudioWorkspace ? 'admin-sidebar--floating' : ''}`}>
        <div className="admin-sidebar-header">
          <button type="button" className="admin-mobile-close" onClick={() => setSidebarOpen(false)} aria-label="إغلاق القائمة">
            <span aria-hidden="true">×</span>
          </button>
          <div className="admin-sidebar-brand">
            <span className="admin-sidebar-kicker">لوحة التحكم</span>
            <h1>FARHA</h1>
            <p>إدارة الدعوات والردود والقوالب من مكان واحد</p>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`admin-nav-item ${pathname.startsWith(link.href) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
            >
              <span className="admin-nav-item__dot" aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <strong>{session?.user?.name || 'مدير FARHA'}</strong>
            <span>{session?.user?.email || session?.user?.username || role}</span>
          </div>
          <button type="button" onClick={() => signOut({ callbackUrl: '/admin/login' })} className="btn-logout">
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className={`admin-main ${isStudioWorkspace ? 'admin-main--studio-focus' : ''}`}>
        <header className="admin-header">
          <div className="admin-header__main">
            <button
              type="button"
              className={`admin-mobile-toggle ${isStudioWorkspace ? 'always-visible' : ''}`}
              onClick={() => setSidebarOpen((value) => !value)}
              aria-label="فتح القائمة"
            >
              <MenuIcon />
            </button>

            <div className="admin-header__copy">
              <span className="admin-header__eyebrow">لوحة الإدارة</span>
              <h2>{pageLabel}</h2>
              <small>{session?.user?.email || session?.user?.username || 'farha admin'}</small>
            </div>
          </div>

          <div className="admin-header__actions">
            {isStudioWorkspace ? (
              <button
                type="button"
                className="admin-desktop-sidebar-toggle"
                onClick={() => setSidebarOpen((value) => !value)}
              >
                {sidebarOpen ? 'إخفاء القائمة' : 'إظهار القائمة'}
              </button>
            ) : null}

            <div className="admin-role-pill">{role}</div>
          </div>
        </header>

        <div className={`admin-content ${isStudioWorkspace ? 'admin-content--studio-focus' : ''}`}>{children}</div>
      </main>

      <nav className="admin-mobile-bottom-nav" aria-label="التنقل السريع">
        {mobileQuickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`admin-mobile-bottom-nav__item ${pathname.startsWith(link.href) ? 'active' : ''}`}
            aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
          >
            <span className="admin-mobile-bottom-nav__dot" aria-hidden="true" />
            <span>{link.label}</span>
          </Link>
        ))}

        <button
          type="button"
          className="admin-mobile-bottom-nav__item admin-mobile-bottom-nav__item--menu"
          onClick={() => setSidebarOpen(true)}
          aria-label="فتح القائمة الكاملة"
        >
          <MenuIcon />
          <span>القائمة</span>
        </button>
      </nav>
    </div>
  );
}
