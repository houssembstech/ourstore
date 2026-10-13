'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore, useAuthStore, useUIStore } from '@/lib/store';
import { usersApi } from '@/lib/api';

interface Product {
  _id: string;
  name: { fr: string; ar: string; en: string };
  price: number;
  comparePrice?: number;
  images: string[];
  rating: number;
  numReviews: number;
  stock: number;
  category?: { name: { fr: string; ar: string; en: string }; slug: string };
}

export default function ProductCard({ product }: { product: Product }) {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const locale = useLocale() as 'fr' | 'ar' | 'en';
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const { showToast, setCartOpen } = useUIStore();

  const name = product.name?.[locale] || product.name?.fr || '';
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addItem({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.price,
      comparePrice: product.comparePrice,
      stock: product.stock,
      quantity: 1,
      category: product.category,
    });
    showToast(`${name} ${locale === 'ar' ? 'أضيف للسلة' : 'ajouté au panier'}`, 'success');
    setCartOpen(true);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast(locale === 'ar' ? 'يرجى تسجيل الدخول' : 'Veuillez vous connecter', 'info');
      return;
    }
    try {
      await usersApi.toggleWishlist(product._id);
      showToast(locale === 'ar' ? 'تم تحديث المفضلة' : 'Liste de souhaits mise à jour', 'success');
    } catch { /* ignore */ }
  };

  return (
    <Link href={`/${locale}/product/${product._id}`} className="product-card-link">
      <article className="product-card">
        {/* Image */}
        <div className="product-img-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images?.[0] || '/placeholder.jpg'}
            alt={name}
            className="product-img"
            loading="lazy"
          />
          {discount > 0 && (
            <span className="product-discount">-{discount}%</span>
          )}
          {product.stock === 0 && (
            <span className="product-out-of-stock">{t('out_of_stock')}</span>
          )}
          <div className="product-actions-overlay">
            <button className="product-action-btn" onClick={handleWishlist} title={t('add_to_wishlist')}>
              <Heart size={16} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="product-info">
          {product.category && (
            <span className="product-category">
              {product.category.name?.[locale] || product.category.name?.fr}
            </span>
          )}
          <h3 className="product-name">{name}</h3>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="product-rating">
              <div className="stars">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={12} fill={s <= Math.round(product.rating) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="product-rating-count">({product.numReviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="product-price-row">
            <span className="product-price">{product.price.toLocaleString()} {tCommon('da')}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="product-compare-price">{product.comparePrice.toLocaleString()} {tCommon('da')}</span>
            )}
          </div>

          <button
            className="btn btn-primary add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart size={15} />
            {t('add_to_cart')}
          </button>
        </div>
      </article>

      <style jsx>{`
        .product-card-link { text-decoration: none; color: inherit; display: block; }
        .product-card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border);
          transition: var(--transition);
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .product-card:hover { box-shadow: var(--shadow); transform: translateY(-3px); border-color: #d1d5db; }
        .product-img-wrapper {
          position: relative;
          padding-top: 100%;
          overflow: hidden;
          background: var(--surface-2);
        }
        .product-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .product-card:hover .product-img { transform: scale(1.05); }
        .product-discount {
          position: absolute;
          top: 0.625rem;
          left: 0.625rem;
          background: var(--error);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-full);
        }
        [dir='rtl'] .product-discount { left: auto; right: 0.625rem; }
        .product-out-of-stock {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .product-actions-overlay {
          position: absolute;
          top: 0.625rem;
          right: 0.625rem;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          opacity: 0;
          transition: var(--transition);
        }
        [dir='rtl'] .product-actions-overlay { right: auto; left: 0.625rem; }
        .product-card:hover .product-actions-overlay { opacity: 1; }
        .product-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }
        .product-action-btn:hover { background: var(--primary); color: white; }
        .product-info { padding: 0.875rem; display: flex; flex-direction: column; gap: 0.375rem; flex: 1; }
        .product-category { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary); }
        .product-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .product-rating { display: flex; align-items: center; gap: 0.375rem; }
        .product-rating-count { font-size: 0.75rem; color: var(--text-muted); }
        .product-price-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .product-price { font-size: 1rem; font-weight: 800; color: var(--text-primary); }
        .product-compare-price { font-size: 0.8rem; color: var(--text-muted); text-decoration: line-through; }
        .add-to-cart-btn {
          margin-top: auto;
          width: 100%;
          font-size: 0.8125rem;
          padding: 0.5rem 0.875rem;
        }
      `}</style>
    </Link>
  );
}
