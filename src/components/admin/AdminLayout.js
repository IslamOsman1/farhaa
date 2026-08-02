'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const links = [
    { href: '/admin/dashboard', label: 'لوحة التحكم', icon: '📊' },
    { href: '/admin/invitations', label: 'الدعوات', icon: '💌' },
    { href: '/admin/packages', label: 'الباقات' },
    { href: '/admin/templates', label: 'القوالب', icon: '🎨' },
    { href: '/admin/settings', label: 'إعدادات الموقع', icon: '⚙️' },
  ];

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h1>فرحة</h1>
        </div>
        <nav className="admin-sidebar-nav">
          {links.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`admin-nav-item ${pathname.startsWith(link.href) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className="btn-logout">
            تسجيل الخروج
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h2>{links.find(l => pathname.startsWith(l.href))?.label || 'لوحة التحكم'}</h2>
          <div className="admin-user-info">
            <span>مرحباً، {session?.user?.name || 'المدير'}</span>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
