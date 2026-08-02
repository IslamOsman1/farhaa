'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '../../../styles/admin.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      redirect: false,
      username,
      password
    });
    if (res?.ok) {
      router.push('/admin'); // Redirect to /admin directly
    } else {
      alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>فرحة</h1>
          <p>تسجيل الدخول للوحة الإدارة</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">اسم المستخدم</label>
            <input type="text" required className="form-control" value={username} onChange={(e)=>setUsername(e.target.value)} />
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
}
