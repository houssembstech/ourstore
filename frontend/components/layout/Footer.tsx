'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Share2, Heart, X, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        {/* Brand */}
        <div className="footer-brand">
          <Link href={`/${locale}`} className="footer-logo">OUR<span>STORE</span></Link>
          <p className="footer-tagline">{t('tagline')}</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook" className="social-btn"><Share2 size={18} /></a>
            <a href="#" aria-label="Instagram" className="social-btn"><Heart size={18} /></a>
            <a href="#" aria-label="Twitter" className="social-btn"><X size={18} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h3 className="footer-col-title">{t('quick_links')}</h3>
          <nav className="footer-nav">
            <Link href={`/${locale}`} className="footer-link">Accueil / Home / الرئيسية</Link>
            <Link href={`/${locale}/shop`} className="footer-link">Boutique / Shop / المتجر</Link>
            <Link href={`/${locale}/contact`} className="footer-link">Contact</Link>
            <Link href={`/${locale}/orders`} className="footer-link">Mes commandes</Link>
          </nav>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h3 className="footer-col-title">{t('contact')}</h3>
          <div className="footer-contact">
            <div className="contact-item">
              <Mail size={15} />
              <span>contact@ourstore.dz</span>
            </div>
            <div className="contact-item">
              <Phone size={15} />
              <span>+213 555 123 456</span>
            </div>
            <div className="contact-item">
              <MapPin size={15} />
              <span>Algérie</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} OurStore. {t('rights')}.</p>
        <div className="payment-badges">
          <span className="payment-badge">🔒 SSL</span>
          <span className="payment-badge">🚚 Livraison rapide</span>
          <span className="payment-badge">↩️ Retours 30j</span>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--text-primary);
          color: #d1d5db;
          margin-top: auto;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          padding: 3rem 1rem 2rem;
        }
        @media (min-width: 640px) { .footer-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .footer-grid { grid-template-columns: 2fr 1fr 1fr; } }
        .footer-logo {
          font-size: 1.5rem;
          font-weight: 900;
          color: white;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 0.75rem;
        }
        .footer-logo span { color: var(--primary); }
        .footer-tagline { font-size: 0.875rem; color: #9ca3af; line-height: 1.6; margin-bottom: 1.25rem; }
        .social-links { display: flex; gap: 0.625rem; }
        .social-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          color: #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: var(--transition);
        }
        .social-btn:hover { background: var(--primary); color: white; transform: translateY(-2px); }
        .footer-col-title { font-size: 0.9rem; font-weight: 700; color: white; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .footer-nav { display: flex; flex-direction: column; gap: 0.5rem; }
        .footer-link { color: #9ca3af; text-decoration: none; font-size: 0.875rem; transition: var(--transition); }
        .footer-link:hover { color: var(--primary); padding-inline-start: 4px; }
        .footer-contact { display: flex; flex-direction: column; gap: 0.75rem; }
        .contact-item { display: flex; align-items: center; gap: 0.625rem; font-size: 0.875rem; color: #9ca3af; }
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 1.25rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          max-width: 1280px;
          margin: 0 auto;
          font-size: 0.8125rem;
          color: #6b7280;
        }
        .payment-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .payment-badge {
          background: rgba(255,255,255,0.06);
          padding: 0.25rem 0.625rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: #9ca3af;
        }
      `}</style>
    </footer>
  );
}
