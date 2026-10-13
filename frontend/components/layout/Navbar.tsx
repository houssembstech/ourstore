'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import { useCartStore, useAuthStore, useUIStore } from '@/lib/store';
import { productsApi } from '@/lib/api';
import {
  ShoppingCart, Search, Menu, X, User, LogOut,
  Globe, ChevronDown, Heart, Package, LayoutDashboard
} from 'lucide-react';

const LOCALES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇩🇿' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, setCartOpen } = useCartStore((s) => ({ totalItems: s.totalItems, setCartOpen: useUIStore.getState().setCartOpen }));
  const cartCount = useCartStore((s) => s.totalItems());
  const { user, logout, isAdmin, isAgent } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<unknown[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const res = await productsApi.getAll({ search: searchQuery, limit: 5 });
          setSearchResults(res.data.data);
        } catch { setSearchResults([]); }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
    setLangOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    router.push(`/${locale}`);
  };

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/shop`, label: t('shop') },
    { href: `/${locale}/contact`, label: t('contact') },
  ];

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container navbar-inner">
          {/* Logo */}
          <Link href={`/${locale}`} className="navbar-logo">
            OUR<span>STORE</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="navbar-links">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className={`navbar-link ${pathname === l.href ? 'active' : ''}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search bar */}
          <div className="navbar-search" ref={searchRef}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchResults.length > 0 && (
              <div className="search-dropdown">
                {(searchResults as { _id: string; name: Record<string, string>; price: number; images: string[] }[]).map((p) => (
                  <Link
                    key={p._id}
                    href={`/${locale}/product/${p._id}`}
                    className="search-result-item"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images?.[0] || '/placeholder.jpg'} alt="" className="search-result-img" />
                    <div>
                      <div className="search-result-name">{p.name?.[locale] || p.name?.fr}</div>
                      <div className="search-result-price">{p.price?.toLocaleString()} DA</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            {/* Language switcher */}
            <div className="dropdown-wrapper">
              <button className="btn btn-ghost btn-icon navbar-action-btn" onClick={() => setLangOpen(!langOpen)} aria-label="Language">
                <Globe size={18} />
                <span className="lang-code">{locale.toUpperCase()}</span>
              </button>
              {langOpen && (
                <div className="dropdown-menu lang-menu">
                  {LOCALES.map((l) => (
                    <button
                      key={l.code}
                      className={`dropdown-item ${locale === l.code ? 'active' : ''}`}
                      onClick={() => switchLocale(l.code)}
                    >
                      <span>{l.flag}</span> {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              className="btn btn-ghost btn-icon navbar-action-btn cart-btn"
              onClick={() => useUIStore.getState().setCartOpen(true)}
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {/* User */}
            {user ? (
              <div className="dropdown-wrapper">
                <button className="btn btn-ghost btn-icon navbar-action-btn" onClick={() => setUserOpen(!userOpen)}>
                  <User size={18} />
                </button>
                {userOpen && (
                  <div className="dropdown-menu user-menu">
                    <div className="dropdown-user-header">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                    <div className="dropdown-divider" />
                    {(isAdmin() || isAgent()) && (
                      <Link href={`/${locale}/admin`} className="dropdown-item" onClick={() => setUserOpen(false)}>
                        <LayoutDashboard size={15} /> {t('admin')}
                      </Link>
                    )}
                    <Link href={`/${locale}/orders`} className="dropdown-item" onClick={() => setUserOpen(false)}>
                      <Package size={15} /> {t('orders')}
                    </Link>
                    <Link href={`/${locale}/wishlist`} className="dropdown-item" onClick={() => setUserOpen(false)}>
                      <Heart size={15} /> {t('wishlist')}
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={15} /> {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-btns">
                <Link href={`/${locale}/login`} className="btn btn-ghost btn-sm">{t('login')}</Link>
                <Link href={`/${locale}/register`} className="btn btn-primary btn-sm">{t('register')}</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button className="btn btn-ghost btn-icon mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mobile-menu">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="mobile-link" onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            {!user && (
              <div className="mobile-auth">
                <Link href={`/${locale}/login`} className="btn btn-outline" onClick={() => setMenuOpen(false)}>{t('login')}</Link>
                <Link href={`/${locale}/register`} className="btn btn-primary" onClick={() => setMenuOpen(false)}>{t('register')}</Link>
              </div>
            )}
          </div>
        )}
      </header>

      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          transition: box-shadow 0.3s ease;
        }
        .navbar-scrolled { box-shadow: var(--shadow); }
        .navbar-inner {
          display: flex;
          align-items: center;
          gap: 1rem;
          height: 64px;
        }
        .navbar-logo {
          font-size: 1.375rem;
          font-weight: 900;
          letter-spacing: -0.5px;
          color: var(--text-primary);
          text-decoration: none;
          flex-shrink: 0;
        }
        .navbar-logo span { color: var(--primary); }
        .navbar-links {
          display: none;
          gap: 0.25rem;
        }
        @media (min-width: 768px) { .navbar-links { display: flex; } }
        .navbar-link {
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-full);
          font-weight: 500;
          font-size: 0.9rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: var(--transition);
        }
        .navbar-link:hover, .navbar-link.active { color: var(--primary); background: var(--primary-light); }
        .navbar-search {
          flex: 1;
          max-width: 360px;
          position: relative;
          display: none;
        }
        @media (min-width: 640px) { .navbar-search { display: block; } }
        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        [dir='rtl'] .search-icon { left: auto; right: 0.75rem; }
        .search-input {
          width: 100%;
          padding: 0.5rem 0.75rem 0.5rem 2.25rem;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          background: var(--surface-2);
          outline: none;
          transition: var(--transition);
          font-family: inherit;
        }
        [dir='rtl'] .search-input { padding: 0.5rem 2.25rem 0.5rem 0.75rem; }
        .search-input:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); }
        .search-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          right: 0;
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
          overflow: hidden;
          z-index: 200;
          animation: scaleIn 0.15s ease;
        }
        .search-result-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: inherit;
          transition: var(--transition);
        }
        .search-result-item:hover { background: var(--surface-2); }
        .search-result-img { width: 40px; height: 40px; object-fit: cover; border-radius: var(--radius-sm); }
        .search-result-name { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }
        .search-result-price { font-size: 0.8rem; color: var(--primary); font-weight: 600; }
        .navbar-actions { display: flex; align-items: center; gap: 0.25rem; margin-inline-start: auto; }
        .navbar-action-btn { position: relative; color: var(--text-secondary); }
        .navbar-action-btn:hover { color: var(--text-primary); }
        .lang-code { font-size: 0.7rem; font-weight: 700; }
        .cart-btn { position: relative; }
        .cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--primary);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          animation: pulse-amber 2s infinite;
        }
        .dropdown-wrapper { position: relative; }
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
          min-width: 180px;
          z-index: 200;
          animation: scaleIn 0.15s ease;
          overflow: hidden;
        }
        [dir='rtl'] .dropdown-menu { right: auto; left: 0; }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          cursor: pointer;
          color: var(--text-primary);
          text-decoration: none;
          transition: var(--transition);
          width: 100%;
          background: none;
          border: none;
          font-family: inherit;
        }
        .dropdown-item:hover { background: var(--surface-2); }
        .dropdown-item.active { color: var(--primary); background: var(--primary-light); }
        .dropdown-item.danger { color: var(--error); }
        .dropdown-item.danger:hover { background: #fee2e2; }
        .dropdown-user-header { padding: 0.875rem 1rem; }
        .user-name { font-weight: 600; font-size: 0.9rem; }
        .user-email { color: var(--text-secondary); font-size: 0.8rem; }
        .dropdown-divider { height: 1px; background: var(--border); margin: 0.25rem 0; }
        .auth-btns { display: none; gap: 0.5rem; }
        @media (min-width: 640px) { .auth-btns { display: flex; } }
        .mobile-menu-btn { display: flex; }
        @media (min-width: 768px) { .mobile-menu-btn { display: none; } }
        .mobile-menu {
          padding: 1rem;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          background: white;
        }
        .mobile-link {
          padding: 0.75rem 1rem;
          border-radius: var(--radius);
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: var(--transition);
        }
        .mobile-link:hover { background: var(--surface-2); color: var(--text-primary); }
        .mobile-auth { display: flex; gap: 0.75rem; padding: 0.75rem 0 0; }
      `}</style>
    </>
  );
}
