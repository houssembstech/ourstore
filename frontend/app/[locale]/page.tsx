'use client';

import { useState, useEffect, Suspense } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productsApi, categoriesApi } from '@/lib/api';
import ProductCard from '@/components/products/ProductCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { useUIStore } from '@/lib/store';
import { TrendingUp, Zap, Shield, Truck, HeadphonesIcon, Star, ChevronRight } from 'lucide-react';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80',
];

export default function HomePage() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale() as 'fr' | 'ar' | 'en';
  const { toast, hideToast } = useUIStore();
  const [featuredProducts, setFeaturedProducts] = useState<unknown[]>([]);
  const [newProducts, setNewProducts] = useState<unknown[]>([]);
  const [categories, setCategories] = useState<unknown[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, newRes, catRes] = await Promise.all([
          productsApi.getAll({ featured: 'true', limit: 8 }),
          productsApi.getAll({ sort: 'newest', limit: 4 }),
          categoriesApi.getAll(),
        ]);
        setFeaturedProducts(featRes.data.data);
        setNewProducts(newRes.data.data);
        setCategories(catRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Navbar />
      <CartDrawer />

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`} onClick={hideToast}>
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'} {toast.message}
          </div>
        </div>
      )}

      <main>
        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-bg" style={{ backgroundImage: `url(${HERO_IMAGES[heroIndex]})` }} />
          <div className="hero-overlay" />
          <div className="container hero-content">
            <div className="hero-badge">
              <Zap size={14} /> Nouveautés de la saison
            </div>
            <h1 className="hero-title">{t('hero_title')}</h1>
            <p className="hero-subtitle">{t('hero_subtitle')}</p>
            <div className="hero-actions">
              <Link href={`/${locale}/shop`} className="btn btn-primary btn-lg">
                {t('hero_cta')} <ChevronRight size={18} />
              </Link>
              <Link href={`/${locale}/shop`} className="btn hero-outline-btn">
                Voir toutes les catégories
              </Link>
            </div>
            {/* Hero dots */}
            <div className="hero-dots">
              {HERO_IMAGES.map((_, i) => (
                <button key={i} className={`hero-dot ${i === heroIndex ? 'active' : ''}`} onClick={() => setHeroIndex(i)} />
              ))}
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <section className="trust-bar">
          <div className="container trust-bar-inner">
            {[
              { icon: <Truck size={20} />, title: 'Livraison rapide', desc: 'Partout en Algérie' },
              { icon: <Shield size={20} />, title: '100% Sécurisé', desc: 'Commandes garanties' },
              { icon: <Star size={20} />, title: 'Qualité Premium', desc: 'Produits sélectionnés' },
              { icon: <HeadphonesIcon size={20} />, title: 'Support 24/7', desc: 'Toujours disponible' },
            ].map((item, i) => (
              <div key={i} className="trust-item-card">
                <div className="trust-icon">{item.icon}</div>
                <div>
                  <div className="trust-title">{item.title}</div>
                  <div className="trust-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        {categories.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-header">
                <div>
                  <h2 className="section-title">{t('categories')}</h2>
                  <p className="section-subtitle">Trouvez ce que vous cherchez</p>
                </div>
                <Link href={`/${locale}/shop`} className="btn btn-outline btn-sm">{t('view_all')}</Link>
              </div>
              <div className="categories-grid">
                {(categories as { _id: string; name: Record<string, string>; icon: string; slug: string }[]).map((cat) => (
                  <Link key={cat._id} href={`/${locale}/shop?category=${cat._id}`} className="category-card">
                    <div className="category-icon">{cat.icon}</div>
                    <div className="category-name">{cat.name?.[locale] || cat.name?.fr}</div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── FEATURED PRODUCTS ── */}
        <section className="section featured-section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">{t('featured')}</h2>
                <p className="section-subtitle">Notre sélection du moment</p>
              </div>
              <Link href={`/${locale}/shop`} className="btn btn-outline btn-sm">{t('view_all')}</Link>
            </div>

            {loading ? (
              <div className="grid-products">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-lg)' }} />
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid-products">
                {(featuredProducts as { _id: string; name: Record<string, string>; price: number; comparePrice?: number; images: string[]; rating: number; numReviews: number; stock: number; category?: { name: Record<string, string>; slug: string } }[]).map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <div className="empty-state-title">Produits à venir</div>
                <p className="empty-state-desc">Nos produits seront disponibles bientôt</p>
              </div>
            )}
          </div>
        </section>

        {/* ── PROMO BANNER ── */}
        <section className="promo-banner">
          <div className="container promo-inner">
            <div className="promo-text">
              <div className="promo-tag"><TrendingUp size={14} /> Offre spéciale</div>
              <h2 className="promo-title">Livraison Gratuite</h2>
              <p className="promo-subtitle">Sur toutes vos commandes — partout en Algérie</p>
              <Link href={`/${locale}/shop`} className="btn btn-primary btn-lg">
                Profiter maintenant
              </Link>
            </div>
            <div className="promo-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80" alt="Promotion" />
            </div>
          </div>
        </section>

        {/* ── NEW ARRIVALS ── */}
        {newProducts.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-header">
                <div>
                  <h2 className="section-title">{t('new_arrivals')}</h2>
                  <p className="section-subtitle">Découvrez en premier</p>
                </div>
              </div>
              <div className="grid-products">
                {(newProducts as { _id: string; name: Record<string, string>; price: number; comparePrice?: number; images: string[]; rating: number; numReviews: number; stock: number; category?: { name: Record<string, string>; slug: string } }[]).map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      <style>{`
        /* Hero */
        .hero {
          position: relative;
          min-height: 520px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        @media (min-width: 768px) { .hero { min-height: 620px; } }
        .hero-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: background-image 0.8s ease;
          transform: scale(1.05);
          animation: heroZoom 6s ease-in-out infinite alternate;
        }
        @keyframes heroZoom {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%);
        }
        .hero-content {
          position: relative;
          z-index: 2;
          color: white;
          padding: 3rem 1rem;
          max-width: 600px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          background: var(--primary);
          color: white;
          padding: 0.375rem 0.875rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          animation: fadeIn 0.6s ease;
        }
        .hero-title {
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 900;
          line-height: 1.15;
          margin-bottom: 1rem;
          animation: fadeIn 0.6s ease 0.1s both;
        }
        .hero-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 2rem;
          line-height: 1.6;
          animation: fadeIn 0.6s ease 0.2s both;
        }
        .hero-actions {
          display: flex;
          gap: 0.875rem;
          flex-wrap: wrap;
          animation: fadeIn 0.6s ease 0.3s both;
        }
        .hero-outline-btn {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.4);
          color: white;
          backdrop-filter: blur(4px);
        }
        .hero-outline-btn:hover { background: rgba(255,255,255,0.25); border-color: white; transform: translateY(-1px); }
        .hero-dots {
          display: flex;
          gap: 0.5rem;
          margin-top: 2rem;
          animation: fadeIn 0.6s ease 0.4s both;
        }
        .hero-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          border: none;
          cursor: pointer;
          transition: var(--transition);
        }
        .hero-dot.active { background: var(--primary); width: 24px; border-radius: 4px; }

        /* Trust bar */
        .trust-bar { background: white; border-bottom: 1px solid var(--border); }
        .trust-bar-inner {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0;
        }
        @media (min-width: 768px) { .trust-bar-inner { grid-template-columns: repeat(4, 1fr); } }
        .trust-item-card {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 1.25rem 1rem;
          border-right: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .trust-item-card:nth-child(2n) { border-right: none; }
        @media (min-width: 768px) {
          .trust-item-card:nth-child(2n) { border-right: 1px solid var(--border); }
          .trust-item-card:last-child { border-right: none; }
          .trust-item-card { border-bottom: none; }
        }
        .trust-icon { color: var(--primary); flex-shrink: 0; }
        .trust-title { font-weight: 600; font-size: 0.875rem; color: var(--text-primary); }
        .trust-desc { font-size: 0.8rem; color: var(--text-secondary); }

        /* Section header */
        .section-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 1.75rem; }
        .featured-section { background: var(--surface-2); }

        /* Categories */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.875rem;
        }
        @media (min-width: 640px) { .categories-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (min-width: 1024px) { .categories-grid { grid-template-columns: repeat(6, 1fr); } }
        .category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.625rem;
          padding: 1.25rem 0.75rem;
          background: white;
          border-radius: var(--radius-lg);
          border: 1.5px solid var(--border);
          text-decoration: none;
          color: var(--text-primary);
          transition: var(--transition);
          cursor: pointer;
        }
        .category-card:hover { border-color: var(--primary); background: var(--primary-light); transform: translateY(-2px); box-shadow: var(--shadow); }
        .category-icon { font-size: 2rem; }
        .category-name { font-size: 0.8rem; font-weight: 600; text-align: center; }

        /* Promo banner */
        .promo-banner {
          background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%);
          overflow: hidden;
          position: relative;
        }
        .promo-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 3rem 1rem;
          gap: 2rem;
        }
        .promo-text { flex: 1; color: white; }
        .promo-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          background: var(--primary);
          color: white;
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .promo-title { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 900; margin-bottom: 0.75rem; }
        .promo-subtitle { opacity: 0.8; margin-bottom: 1.5rem; font-size: 1.05rem; }
        .promo-image { flex-shrink: 0; display: none; }
        @media (min-width: 768px) { .promo-image { display: block; } }
        .promo-image img { width: 300px; height: 220px; object-fit: cover; border-radius: var(--radius-lg); opacity: 0.85; }
      `}</style>
    </>
  );
}
