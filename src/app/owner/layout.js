import '../../styles/admin.css';

export const metadata = {
  title: 'متابعة الدعوة | FARHA',
};

export default function OwnerPortalLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="admin-header" style={{ position: 'sticky', top: 0, zIndex: 20 }}>
        <div>
          <h2 style={{ marginBottom: '4px' }}>بوابة متابعة الدعوة</h2>
          <small>رابط خاص لصاحب الدعوة لمتابعة الحضور والردود</small>
        </div>
        <div style={{ color: '#c9a96e', fontWeight: 800, fontSize: '1.1rem' }}>FARHA</div>
      </header>
      <main className="admin-content" style={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
}
