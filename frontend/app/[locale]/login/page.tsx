'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { authApi } from '@/lib/api';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { showToast } = useUIStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form);
      setAuth(res.data.user, res.data.token);
      showToast(`Bienvenue ${res.data.user.name} !`, 'success');
      router.push(`/${locale}`);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar /><CartDrawer />
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">OUR<span>STORE</span></div>
          <h1 className="auth-title">{t('login_title')}</h1>

          {error && <div className="auth-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">{t('email')}</label>
              <input className="form-input" type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('password')}</label>
              <div className="pwd-wrapper">
                <input className="form-input" type={showPwd ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><span className="spinner" /> Connexion...</> : t('login_btn')}
            </button>
          </form>

          <p className="auth-switch">
            {t('no_account')} <Link href={`/${locale}/register`} className="auth-link">{t('register_btn')}</Link>
          </p>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .auth-page { display: flex; align-items: center; justify-content: center; min-height: 70vh; padding: 2rem 1rem; background: var(--background); }
        .auth-card { background: white; border-radius: var(--radius-lg); padding: 2.5rem 2rem; width: 100%; max-width: 420px; border: 1px solid var(--border); box-shadow: var(--shadow); animation: scaleIn 0.3s ease; }
        .auth-logo { font-size: 1.5rem; font-weight: 900; text-align: center; margin-bottom: 1.5rem; color: var(--text-primary); }
        .auth-logo span { color: var(--primary); }
        .auth-title { font-size: 1.5rem; font-weight: 800; text-align: center; margin-bottom: 1.5rem; }
        .auth-error { background: #fee2e2; color: #991b1b; padding: 0.75rem 1rem; border-radius: var(--radius); font-size: 0.875rem; margin-bottom: 1rem; }
        .auth-form { display: flex; flex-direction: column; gap: 1rem; }
        .pwd-wrapper { position: relative; }
        .pwd-wrapper .form-input { padding-inline-end: 2.75rem; }
        .pwd-toggle { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); }
        [dir='rtl'] .pwd-toggle { right: auto; left: 0.75rem; }
        .auth-switch { text-align: center; margin-top: 1.5rem; font-size: 0.875rem; color: var(--text-secondary); }
        .auth-link { color: var(--primary); font-weight: 600; text-decoration: none; }
        .auth-link:hover { text-decoration: underline; }
      `}</style>
    </>
  );
}
