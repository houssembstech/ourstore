'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { X, Trash2, ShoppingBag, Shield, RefreshCcw, Headphones } from 'lucide-react';
import { useCartStore, useUIStore } from '@/lib/store';

export default function CartDrawer() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCartStore();
  const { cartOpen, setCartOpen } = useUIStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setCartOpen(false); };
    if (cartOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <>
      <div className="overlay" onClick={() => setCartOpen(false)} />
      <div className="drawer" ref={drawerRef}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <ShoppingBag size={20} className="drawer-title-icon" />
            <h2 className="drawer-title">{t('title')}</h2>
            {itemCount > 0 && <span className="badge badge-amber">{itemCount}</span>}
          </div>
          <button onClick={() => setCartOpen(false)} className="btn btn-ghost btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <div className="empty-state-title">{t('empty')}</div>
              <p className="empty-state-desc">{t('empty_desc')}</p>
              <Link href={`/${locale}/shop`} className="btn btn-primary" onClick={() => setCartOpen(false)}>
                {t('continue_shopping')}
              </Link>
            </div>
          ) : (
            <>
              <div className="cart-items-header">
                <span className="text-sm text-muted">{itemCount} {t('items')}</span>
                <button className="btn btn-ghost btn-sm" onClick={clearCart}>
                  <Trash2 size={14} /> {t('clear')}
                </button>
              </div>

              <div className="cart-items-list">
                {items.map((item) => (
                  <div key={item.product} className="cart-item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name?.[locale as 'fr' | 'ar' | 'en'] || item.name?.fr}
                      className="cart-item-img"
                    />
                    <div className="cart-item-info">
                      <Link
                        href={`/${locale}/product/${item.product}`}
                        className="cart-item-name"
                        onClick={() => setCartOpen(false)}
                      >
                        {item.name?.[locale as 'fr'|'ar'|'en'] || item.name?.fr}
                      </Link>
                      <div className="cart-item-price">{(item.price * item.quantity).toLocaleString()} DA</div>
                      <div className="cart-item-bottom">
                        <div className="qty-control">
                          <button className="qty-btn" onClick={() => updateQuantity(item.product, item.quantity - 1)}>−</button>
                          <span className="qty-value">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => updateQuantity(item.product, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}>+</button>
                        </div>
                        <button className="btn btn-ghost btn-sm remove-btn" onClick={() => removeItem(item.product)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="cart-summary">
              <div className="summary-row">
                <span>{t('subtotal')}</span>
                <span className="summary-value">{subtotal().toLocaleString()} DA</span>
              </div>
              <div className="summary-row">
                <span>{t('shipping')}</span>
                <span className="free-badge">{t('shipping_free')}</span>
              </div>
              <div className="divider" />
              <div className="summary-row total-row">
                <span>{t('total')}</span>
                <span className="total-value">{subtotal().toLocaleString()} DA</span>
              </div>
            </div>

            <Link href={`/${locale}/checkout`} className="btn btn-primary btn-lg checkout-btn" onClick={() => setCartOpen(false)}>
              {t('checkout')} →
            </Link>
            <Link href={`/${locale}/shop`} className="btn btn-outline continue-btn" onClick={() => setCartOpen(false)}>
              {t('continue_shopping')}
            </Link>

            {/* Trust badges */}
            <div className="trust-badges">
              <div className="trust-item"><Shield size={12} /> {t('secure')}</div>
              <div className="trust-item"><RefreshCcw size={12} /> {t('returns')}</div>
              <div className="trust-item"><Headphones size={12} /> {t('support')}</div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .drawer-title-group { display: flex; align-items: center; gap: 0.625rem; }
        .drawer-title-icon { color: var(--primary); }
        .drawer-title { font-size: 1.1rem; font-weight: 700; }
        .drawer-body { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; }
        .cart-items-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .cart-items-list { display: flex; flex-direction: column; gap: 1rem; }
        .cart-item { display: flex; gap: 0.875rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
        .cart-item:last-child { border-bottom: none; }
        .cart-item-img {
          width: 72px;
          height: 72px;
          object-fit: cover;
          border-radius: var(--radius);
          flex-shrink: 0;
          border: 1px solid var(--border);
        }
        .cart-item-info { flex: 1; min-width: 0; }
        .cart-item-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
          text-decoration: none;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }
        .cart-item-name:hover { color: var(--primary); }
        .cart-item-price { font-size: 0.9rem; font-weight: 700; color: var(--primary); margin: 0.25rem 0; }
        .cart-item-bottom { display: flex; align-items: center; justify-content: space-between; }
        .remove-btn { color: var(--text-muted); padding: 0.25rem; }
        .remove-btn:hover { color: var(--error); }
        .drawer-footer {
          border-top: 1px solid var(--border);
          padding: 1.25rem;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .cart-summary { display: flex; flex-direction: column; gap: 0.5rem; }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .summary-value { font-weight: 500; color: var(--text-primary); }
        .free-badge { font-size: 0.75rem; font-weight: 600; color: var(--success); background: #d1fae5; padding: 0.125rem 0.5rem; border-radius: 99px; }
        .total-row { font-weight: 700; font-size: 1rem; color: var(--text-primary); }
        .total-value { color: var(--primary); }
        .checkout-btn { width: 100%; font-size: 0.9375rem; }
        .continue-btn { width: 100%; }
        .trust-badges { display: flex; flex-direction: column; gap: 0.375rem; margin-top: 0.25rem; }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .text-sm { font-size: 0.875rem; }
        .text-muted { color: var(--text-muted); }
      `}</style>
    </>
  );
}
