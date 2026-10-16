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

      
    </>
  );
}
