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

      
    </footer>
  );
}
