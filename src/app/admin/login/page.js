'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '../../../styles/admin.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const result = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    setSubmitting(false);

    if (result?.ok) {
      router.push('/admin/dashboard');
      return;
    }

    setErrorMessage('تعذر تسجيل الدخول. تأكد من اسم المستخدم أو البريد الإلكتروني وكلمة المرور.');
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>FARHA</h1>
          <p>تسجيل الدخول إلى لوحة الإدارة</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">اسم المستخدم أو البريد الإلكتروني</label>
            <input
              type="text"
              required
              className="form-control"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <input
              type="password"
              required
              className="form-control"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {errorMessage ? <div className="inline-issue">{errorMessage}</div> : null}

          <button type="submit" className="btn btn-primary btn-login" disabled={submitting}>
            {submitting ? 'جارٍ التحقق...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
