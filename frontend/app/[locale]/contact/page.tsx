'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000)); // simulate send
    setSent(true);
    setLoading(false);
  };

  return (
    <>
      <Navbar /><CartDrawer />

      {/* Hero */}
      <div className="contact-hero">
        <div className="container contact-hero-inner">
          <h1 className="contact-hero-title">{t('title')}</h1>
          <p className="contact-hero-subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <div className="container contact-layout">
        {/* Info cards */}
        <div className="contact-info">
          {[
            { icon: <Mail size={22} />, label: t('email_label'), value: 'contact@ourstore.dz', href: 'mailto:contact@ourstore.dz' },
            { icon: <Phone size={22} />, label: t('phone_label'), value: '+213 555 123 456', href: 'tel:+213555123456' },
            { icon: <MapPin size={22} />, label: t('address_label'), value: 'Algérie', href: '#' },
            { icon: <Clock size={22} />, label: 'Horaires', value: 'Lun – Sam : 9h – 18h', href: '#' },
          ].map((item, i) => (
            <a key={i} href={item.href} className="contact-card card">
              <div className="contact-card-icon">{item.icon}</div>
              <div>
                <div className="contact-card-label">{item.label}</div>
                <div className="contact-card-value">{item.value}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Form */}
        <div className="contact-form-card card">
          {sent ? (
            <div className="sent-state">
              <div style={{ fontSize: '3rem' }}>✉️</div>
              <h2>{t('sent')}</h2>
              <p>Nous vous répondrons dans les plus brefs délais.</p>
              <button className="btn btn-primary" onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}>
                Nouveau message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <h2 className="form-heading">Envoyez-nous un message</h2>
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
                <label className="form-label">{t('message')} *</label>
                <textarea className="form-input" required value={form.message} style={{ minHeight: '140px' }}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Comment pouvons-nous vous aider ?" />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? <><span className="spinner" /> Envoi...</> : <><Send size={16} /> {t('send')}</>}
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .contact-hero { background: linear-gradient(135deg, var(--text-primary) 0%, #374151 100%); padding: 4rem 1rem; }
        .contact-hero-inner { text-align: center; color: white; }
        .contact-hero-title { font-size: clamp(2rem, 5vw, 3rem); font-weight: 900; margin-bottom: 0.75rem; }
        .contact-hero-subtitle { font-size: 1.1rem; opacity: 0.8; }
        .contact-layout { display: grid; grid-template-columns: 1fr; gap: 2rem; padding: 2.5rem 1rem; max-width: 1100px; margin: 0 auto; }
        @media (min-width: 768px) { .contact-layout { grid-template-columns: 1fr 1.5fr; } }
        .contact-info { display: flex; flex-direction: column; gap: 1rem; }
        .contact-card { display: flex; align-items: flex-start; gap: 1rem; padding: 1.25rem; text-decoration: none; color: inherit; transition: var(--transition); }
        .contact-card:hover { border-color: var(--primary); }
        .contact-card-icon { width: 46px; height: 46px; background: var(--primary-light); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; color: var(--primary-dark); flex-shrink: 0; }
        .contact-card-label { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary); margin-bottom: 0.25rem; }
        .contact-card-value { font-weight: 600; font-size: 0.95rem; }
        .contact-form-card { padding: 2rem; }
        .form-heading { font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; }
        .contact-form { display: flex; flex-direction: column; gap: 1rem; }
        .sent-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 2rem; text-align: center; }
        .sent-state h2 { font-size: 1.5rem; font-weight: 800; }
        .sent-state p { color: var(--text-secondary); }
      `}</style>
    </>
  );
}
