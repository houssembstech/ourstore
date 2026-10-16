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

      
    </>
  );
}
