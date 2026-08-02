'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import '@/styles/admin.css'; // Reusing admin dashboard styles for client dashboard

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: 'لوحة التحكم' },
    { href: '/dashboard/invitations', label: 'دعواتي' },
    { href: '/dashboard/profile', label: 'حسابي' },
  ];

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}><h1>فرحة</h1></Link>
        </div>
        <nav className="admin-sidebar-nav">
          {links.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`admin-nav-item ${pathname === link.href || pathname.startsWith(link.href + '/') ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn-logout">
            تسجيل الخروج
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h2>{links.find(l => pathname === l.href || pathname.startsWith(l.href + '/'))?.label || 'لوحة التحكم'}</h2>
          <div className="admin-user-info">
            <span>مرحباً، {session?.user?.name || 'العميل'}</span>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
