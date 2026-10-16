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

      
    </>
  );
}
