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

export default function RegisterPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { showToast } = useUIStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', preferredLang: locale });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    if (form.password.length < 6) { setError('Mot de passe trop court (min. 6 caractères)'); return; }
    setLoading(true);
    try {
      const res = await authApi.register(form);
      setAuth(res.data.user, res.data.token);
      showToast(`Compte créé ! Bienvenue ${res.data.user.name}`, 'success');
      router.push(`/${locale}`);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors de l\'inscription');
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
          <h1 className="auth-title">{t('register_title')}</h1>

          {error && <div className="auth-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">{t('name')} *</label>
              <input className="form-input" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('email')} *</label>
              <input className="form-input" type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('phone')}</label>
              <input className="form-input" type="tel" value={form.phone}
                placeholder="0555 123 456"
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('password')} *</label>
              <div className="pwd-wrapper">
                <input className="form-input" type={showPwd ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('confirm_password')} *</label>
              <input className="form-input" type="password" required value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Langue préférée</label>
              <select className="form-input" value={form.preferredLang}
                onChange={(e) => setForm({ ...form, preferredLang: e.target.value })}>
                <option value="fr">🇫🇷 Français</option>
                <option value="ar">🇩🇿 العربية</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><span className="spinner" /> Création...</> : t('register_btn')}
            </button>
          </form>

          <p className="auth-switch">
            {t('have_account')} <Link href={`/${locale}/login`} className="auth-link">{t('login_btn')}</Link>
          </p>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .auth-page { display: flex; align-items: center; justify-content: center; min-height: 70vh; padding: 2rem 1rem; background: var(--background); }
        .auth-card { background: white; border-radius: var(--radius-lg); padding: 2.5rem 2rem; width: 100%; max-width: 440px; border: 1px solid var(--border); box-shadow: var(--shadow); animation: scaleIn 0.3s ease; }
        .auth-logo { font-size: 1.5rem; font-weight: 900; text-align: center; margin-bottom: 1.5rem; }
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
