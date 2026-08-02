import os

base = r"C:\Users\h\.gemini\antigravity\scratch\farha"

files = {
    "src/styles/admin.css": """
:root {
  --admin-sidebar-bg: #1a1f36;
  --admin-sidebar-text: #ffffff;
  --admin-sidebar-hover: rgba(255, 255, 255, 0.1);
  --admin-gold: #c9a96e;
  --admin-gold-hover: #b8985d;
  --admin-bg: #f4f6f8;
  --admin-surface: #ffffff;
  --admin-text-primary: #1e293b;
  --admin-text-secondary: #64748b;
  --admin-border: #e2e8f0;
  --admin-danger: #ef4444;
  --admin-success: #22c55e;
}

body {
  background-color: var(--admin-bg);
  color: var(--admin-text-primary);
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}

.admin-layout {
  display: flex;
  min-height: 100vh;
  direction: rtl;
}

.admin-sidebar {
  width: 260px;
  background-color: var(--admin-sidebar-bg);
  color: var(--admin-sidebar-text);
  display: flex;
  flex-direction: column;
}

.admin-sidebar-header {
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-sidebar-header h1 {
  margin: 0;
  color: var(--admin-gold);
  font-size: 24px;
}

.admin-sidebar-nav {
  flex: 1;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-nav-item {
  padding: 12px 24px;
  display: flex;
  align-items: center;
  color: var(--admin-sidebar-text);
  text-decoration: none;
  font-weight: 500;
}

.admin-nav-item:hover, .admin-nav-item.active {
  background-color: var(--admin-sidebar-hover);
  color: var(--admin-gold);
  border-right: 4px solid var(--admin-gold);
}

.admin-sidebar-footer {
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-logout {
  width: 100%;
  padding: 10px;
  background-color: transparent;
  color: var(--admin-sidebar-text);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  cursor: pointer;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  height: 70px;
  background-color: var(--admin-surface);
  border-bottom: 1px solid var(--admin-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
}

.admin-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--admin-surface);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid var(--admin-border);
}

.stat-card-title {
  color: var(--admin-text-secondary);
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-card-value {
  font-size: 28px;
  font-weight: 600;
}

.admin-card {
  background: var(--admin-surface);
  border-radius: 12px;
  border: 1px solid var(--admin-border);
}

.admin-card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--admin-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  text-align: right;
  padding: 16px 24px;
  background: #f8fafc;
  color: var(--admin-text-secondary);
  border-bottom: 1px solid var(--admin-border);
}

.admin-table td {
  padding: 16px 24px;
  border-bottom: 1px solid var(--admin-border);
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  font-size: 14px;
  text-decoration: none;
}

.btn-primary { background: var(--admin-gold); color: white; }
.btn-outline { background: transparent; border: 1px solid var(--admin-border); }
.btn-danger { background: #fef2f2; color: var(--admin-danger); border: 1px solid #fecaca; }

.badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.badge-success { background: #dcfce7; color: #166534; }
.badge-danger { background: #fee2e2; color: #991b1b; }

.form-group { margin-bottom: 20px; }
.form-label { display: block; margin-bottom: 8px; }
.form-control { width: 100%; padding: 10px; border: 1px solid var(--admin-border); border-radius: 6px; box-sizing: border-box; }

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--admin-sidebar-bg) 0%, #0d1123 100%);
  direction: rtl;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
}
.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.login-header h1 {
  color: var(--admin-gold);
  font-size: 32px;
  margin: 0 0 8px 0;
}
.login-header p {
  color: var(--admin-text-secondary);
  margin: 0;
}
.btn-login {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  margin-top: 16px;
}
""",
    "src/app/admin/login/page.js": """'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '../../../styles/admin.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    if (res?.ok) {
      router.push('/admin/dashboard');
    } else {
      alert('Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>فرحة</h1>
          <p>تسجيل الدخول للوحة التحكم</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <input type="email" required className="form-control" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <input type="password" required className="form-control" value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-login">دخول</button>
        </form>
      </div>
    </div>
  );
}""",
    "src/app/admin/Providers.js": """'use client';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}""",
    "src/app/admin/layout.js": """import Providers from './Providers';
import AdminLayout from '../../components/admin/AdminLayout';
import '../../styles/admin.css';

export const metadata = {
  title: 'لوحة تحكم فرحة',
};

export default function Layout({ children }) {
  return (
    <Providers>
      <AdminLayout>
        {children}
      </AdminLayout>
    </Providers>
  );
}""",
    "src/components/admin/AdminLayout.js": """'use client';
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
    { href: '/admin/dashboard', label: 'لوحة التحكم' },
    { href: '/admin/invitations', label: 'الدعوات' },
    { href: '/admin/clients', label: 'العملاء' },
    { href: '/admin/packages', label: 'الباقات' },
    { href: '/admin/templates', label: 'القوالب' },
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
}""",
    "src/app/admin/dashboard/page.js": """'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalInvitations: 0, activeInvitations: 0, totalRsvps: 0, totalVisits: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    // Mock fetch
    setStats({ totalInvitations: 120, activeInvitations: 45, totalRsvps: 850, totalVisits: 12400 });
    setRecent([
      { id: 1, clients: 'أحمد وسارة', date: '2024-10-01' },
      { id: 2, clients: 'محمد ونورة', date: '2024-10-05' },
    ]);
  }, []);

  return (
    <div>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-title">إجمالي الدعوات</div>
          <div className="stat-card-value">{stats.totalInvitations}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">الدعوات النشطة</div>
          <div className="stat-card-value">{stats.activeInvitations}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">إجمالي الردود</div>
          <div className="stat-card-value">{stats.totalRsvps}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">إجمالي الزيارات</div>
          <div className="stat-card-value">{stats.totalVisits}</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 style={{margin:0}}>أحدث الدعوات</h3>
          <Link href="/admin/invitations/new" className="btn btn-primary">إنشاء دعوة جديدة</Link>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>رقم الدعوة</th>
              <th>العروسين</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(item => (
              <tr key={item.id}>
                <td>#{item.id}</td>
                <td>{item.clients}</td>
                <td>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}""",
    "src/app/admin/invitations/page.js": """'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    setInvitations([
      { id: 1, client: 'خالد عبدلله', couple: 'أحمد وسارة', template: 'ذهبي', status: 'active', visits: 150, rsvps: 45 },
      { id: 2, client: 'سالم علي', couple: 'محمد ونورة', template: 'كلاسيك', status: 'expired', visits: 300, rsvps: 120 }
    ]);
  }, []);

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 style={{margin:0}}>قائمة الدعوات</h3>
        <Link href="/admin/invitations/new" className="btn btn-primary">إنشاء دعوة جديدة</Link>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>العميل</th>
            <th>العروسين</th>
            <th>القالب</th>
            <th>الحالة</th>
            <th>الزيارات</th>
            <th>الردود</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {invitations.map(inv => (
            <tr key={inv.id}>
              <td>{inv.client}</td>
              <td>{inv.couple}</td>
              <td>{inv.template}</td>
              <td>
                <span className={`badge badge-${inv.status === 'active' ? 'success' : 'danger'}`}>
                  {inv.status === 'active' ? 'نشط' : 'منتهي'}
                </span>
              </td>
              <td>{inv.visits}</td>
              <td>{inv.rsvps}</td>
              <td style={{display:'flex', gap:'8px'}}>
                <Link href={`/admin/invitations/${inv.id}`} className="btn btn-sm btn-outline">تعديل</Link>
                <Link href={`/admin/invitations/${inv.id}/rsvp`} className="btn btn-sm btn-outline">الردود</Link>
                <button className="btn btn-sm btn-danger">حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}""",
    "src/app/admin/invitations/new/page.js": """'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewInvitationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ groom: '', bride: '', date: '', venue: '', slug: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push('/admin/invitations');
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 style={{margin:0}}>إنشاء دعوة جديدة</h3>
      </div>
      <div style={{padding:'24px'}}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">العريس</label>
            <input className="form-control" value={formData.groom} onChange={e=>setFormData({...formData, groom: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">العروس</label>
            <input className="form-control" value={formData.bride} onChange={e=>setFormData({...formData, bride: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">التاريخ</label>
            <input type="datetime-local" className="form-control" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">الرابط المخصص</label>
            <input className="form-control" value={formData.slug} onChange={e=>setFormData({...formData, slug: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary">حفظ الدعوة</button>
        </form>
      </div>
    </div>
  );
}""",
    "src/app/admin/invitations/[id]/page.js": """'use client';
import NewInvitationPage from '../new/page';
export default NewInvitationPage;""",
    "src/app/admin/invitations/[id]/rsvp/page.js": """'use client';
import { useState, useEffect } from 'react';

export default function RsvpPage({ params }) {
  const [rsvps, setRsvps] = useState([]);
  
  useEffect(() => {
    setRsvps([
      { id: 1, name: 'فهد عبدالله', phone: '050000000', status: 'confirmed', companions: 2, message: 'ألف مبروك' },
      { id: 2, name: 'سعد محمد', phone: '051111111', status: 'declined', companions: 0, message: 'أعتذر لظروف السفر' }
    ]);
  }, []);

  return (
    <div>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-title">حضور مؤكد</div>
          <div className="stat-card-value">1</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">إعتذار</div>
          <div className="stat-card-value">1</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">المرافقين</div>
          <div className="stat-card-value">2</div>
        </div>
      </div>
      
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 style={{margin:0}}>إدارة الردود</h3>
          <button className="btn btn-outline">تصدير CSV</button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الهاتف</th>
              <th>الحالة</th>
              <th>المرافقين</th>
              <th>الرسالة</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.phone}</td>
                <td>
                  <span className={`badge badge-${r.status === 'confirmed' ? 'success' : 'danger'}`}>
                    {r.status === 'confirmed' ? 'مؤكد' : 'معتذر'}
                  </span>
                </td>
                <td>{r.companions}</td>
                <td>{r.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}""",
    "src/app/admin/clients/page.js": """'use client';
export default function ClientsPage() {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 style={{margin:0}}>العملاء</h3>
      </div>
      <div style={{padding:'24px'}}>قريباً</div>
    </div>
  );
}""",
    "src/app/admin/packages/page.js": """'use client';
export default function PackagesPage() {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 style={{margin:0}}>الباقات</h3>
      </div>
      <div style={{padding:'24px'}}>قريباً</div>
    </div>
  );
}"""
}

for rel_path, content in files.items():
    p = os.path.join(base, rel_path.replace("/", os.sep))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content.strip())
print("Files generated successfully.")
