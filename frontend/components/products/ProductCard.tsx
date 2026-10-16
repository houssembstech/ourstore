'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore, useAuthStore, useUIStore } from '@/lib/store';
import { usersApi } from '@/lib/api';

interface Product {
  _id: string;
  name: Record<string, string>;
  price: number;
  comparePrice?: number;
  images: string[];
  rating: number;
  numReviews: number;
  stock: number;
  category?: { name: Record<string, string>; slug: string };
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

      
    </Link>
  );
}
