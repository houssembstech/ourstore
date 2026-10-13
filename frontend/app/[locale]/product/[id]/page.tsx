'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import ProductCard from '@/components/products/ProductCard';
import { productsApi } from '@/lib/api';
import { useCartStore, useUIStore, useAuthStore } from '@/lib/store';
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, Plus, Minus, Check } from 'lucide-react';

export default function ProductPage() {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const locale = useLocale() as 'fr'|'ar'|'en';
  const params = useParams();
  const router = useRouter();
  const { addItem, items } = useCartStore();
  const { user } = useAuthStore();
  const { showToast, setCartOpen, toast, hideToast } = useUIStore();

  const [product, setProduct] = useState<null | {
    _id: string; name: Record<string, string>; description: Record<string, string>;
    price: number; comparePrice?: number; images: string[];
    rating: number; numReviews: number; stock: number;
    category?: { _id: string; name: Record<string, string>; slug: string };
    reviews: { _id: string; name: string; rating: number; comment: string; createdAt: string }[];
  }>(null);
  const [related, setRelated] = useState<unknown[]>([]);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const inCart = product ? items.some((i) => i.product === product._id) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productsApi.getOne(params.id as string);
        setProduct(res.data.data);
        if (res.data.data.category?._id) {
          const relRes = await productsApi.getAll({ category: res.data.data.category._id, limit: 4 });
          setRelated(relRes.data.data.filter((p: { _id: string }) => p._id !== res.data.data._id).slice(0, 4));
        }
      } catch { router.push(`/${locale}/shop`); }
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [params.id, locale, router]);

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    addItem({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.price,
      comparePrice: product.comparePrice,
      stock: product.stock,
      quantity: qty,
    });
    setAddedToCart(true);
    showToast(`${product.name[locale]} ${locale === 'ar' ? 'أضيف للسلة' : 'ajouté au panier'}`, 'success');
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push(`/${locale}/checkout`);
  };

  const handleReview = async () => {
    if (!user) { showToast(locale === 'ar' ? 'يرجى تسجيل الدخول' : 'Veuillez vous connecter', 'info'); return; }
    if (!reviewText.trim()) return;
    setSubmitting(true);
    try {
      await productsApi.addReview(product!._id, { rating: reviewRating, comment: reviewText });
      const res = await productsApi.getOne(product!._id);
      setProduct(res.data.data);
      setReviewText('');
      showToast(locale === 'ar' ? 'تم إضافة التقييم' : 'Avis ajouté avec succès', 'success');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg || 'Erreur', 'error');
    } finally { setSubmitting(false); }
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: product?.name[locale], url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Lien copié !', 'success');
    }
  };

  const discount = product?.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  if (loading) {
    return (
      <>
        <Navbar /><CartDrawer />
        <div className="container" style={{ padding: '3rem 1rem' }}>
          <div className="product-detail-skeleton">
            <div className="skeleton" style={{ height: '450px', borderRadius: 'var(--radius-lg)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="skeleton" style={{ height: '32px', width: '60%' }} />
              <div className="skeleton" style={{ height: '24px', width: '40%' }} />
              <div className="skeleton" style={{ height: '48px', width: '50%' }} />
              <div className="skeleton" style={{ height: '60px' }} />
              <div className="skeleton" style={{ height: '52px' }} />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) return null;

  const name = product.name?.[locale] || product.name?.fr;
  const description = product.description?.[locale] || product.description?.fr;

  return (
    <>
      <Navbar />
      <CartDrawer />
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`} onClick={hideToast}>
            {toast.type === 'success' ? '✓' : '✗'} {toast.message}
          </div>
        </div>
      )}

      <div className="container" style={{ padding: '1.5rem 1rem' }}>
        {/* Back */}
        <Link href={`/${locale}/shop`} className="back-link">
          <ArrowLeft size={16} /> Retour à la boutique
        </Link>

        {/* Product detail */}
        <div className="product-detail">
          {/* Images */}
          <div className="product-images">
            <div className="main-image-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.images?.[activeImage] || '/placeholder.jpg'} alt={name} className="main-image" />
              {discount > 0 && <span className="main-discount">-{discount}%</span>}
            </div>
            {product.images.length > 1 && (
              <div className="thumbnails">
                {product.images.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className={`thumbnail ${i === activeImage ? 'active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-detail-info">
            {product.category && (
              <Link href={`/${locale}/shop?category=${product.category._id}`} className="product-category-badge">
                {product.category.name?.[locale] || product.category.name?.fr}
              </Link>
            )}
            <h1 className="product-detail-name">{name}</h1>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div className="product-detail-rating">
                <div className="stars">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={16} fill={s <= Math.round(product.rating) ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <span className="rating-value">{product.rating.toFixed(1)}</span>
                <span className="rating-count">• {product.numReviews} {t('reviews')}</span>
              </div>
            )}

            {/* Price */}
            <div className="product-detail-price">
              <span className="price-main">{product.price.toLocaleString()} DA</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="price-compare">{product.comparePrice.toLocaleString()} DA</span>
              )}
            </div>

            {/* Description */}
            {description && <p className="product-detail-desc">{description}</p>}

            {/* Stock */}
            <div className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
              {product.stock > 0 ? `✓ ${t('in_stock')} (${product.stock})` : t('out_of_stock')}
            </div>

            <div className="divider" />

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="qty-section">
                <label className="form-label">{t('quantity')}</label>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={14} /></button>
                  <span className="qty-value">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}><Plus size={14} /></button>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="product-cta">
              <button
                className={`btn btn-lg cta-main ${addedToCart ? 'btn-success' : 'btn-primary'}`}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {addedToCart ? <><Check size={18} /> Ajouté !</> : <><ShoppingCart size={18} /> {t('add_to_cart')}</>}
              </button>
              <button className="btn btn-outline btn-lg" onClick={handleBuyNow} disabled={product.stock === 0}>
                {t('buy_now')}
              </button>
            </div>

            {/* Secondary actions */}
            <div className="secondary-actions">
              <button className="secondary-action-btn" onClick={share}>
                <Share2 size={15} /> {t('share')}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="reviews-section">
          <h2 className="section-title" style={{ fontSize: '1.25rem' }}>
            {t('reviews')} ({product.reviews.length})
          </h2>

          {/* Add review */}
          {user && (
            <div className="card add-review-card">
              <div className="form-group">
                <label className="form-label">Votre note</label>
                <div className="stars-input">
                  {[1,2,3,4,5].map((s) => (
                    <Star
                      key={s}
                      size={24}
                      fill={s <= reviewRating ? 'currentColor' : 'none'}
                      style={{ cursor: 'pointer', color: 'var(--primary)' }}
                      onClick={() => setReviewRating(s)}
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Votre commentaire</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px' }}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Donnez votre avis sur ce produit..."
                />
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleReview} disabled={submitting || !reviewText.trim()}>
                {submitting ? <><span className="spinner" />...</> : 'Soumettre l\'avis'}
              </button>
            </div>
          )}

          {/* Reviews list */}
          {product.reviews.length > 0 ? (
            <div className="reviews-list">
              {product.reviews.map((r) => (
                <div key={r._id} className="review-card card">
                  <div className="review-header">
                    <div className="reviewer-avatar">{r.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="reviewer-name">{r.name}</div>
                      <div className="stars" style={{ marginTop: '2px' }}>
                        {[1,2,3,4,5].map((s) => <Star key={s} size={12} fill={s <= r.rating ? 'currentColor' : 'none'} />)}
                      </div>
                    </div>
                    <div className="review-date">{new Date(r.createdAt).toLocaleDateString(locale)}</div>
                  </div>
                  <p className="review-comment">{r.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Aucun avis pour le moment.</p>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="related-section">
            <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>{t('related')}</h2>
            <div className="grid-products">
              {(related as { _id: string; name: Record<string, string>; price: number; comparePrice?: number; images: string[]; rating: number; numReviews: number; stock: number; category?: { name: Record<string, string>; slug: string } }[]).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          transition: var(--transition);
        }
        .back-link:hover { color: var(--primary); }
        .product-detail {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }
        @media (min-width: 768px) { .product-detail { grid-template-columns: 1fr 1fr; } }
        .product-detail-skeleton { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .main-image-wrapper { position: relative; border-radius: var(--radius-lg); overflow: hidden; background: var(--surface); border: 1px solid var(--border); }
        .main-image { width: 100%; max-height: 480px; object-fit: contain; display: block; padding: 1rem; }
        .main-discount {
          position: absolute; top: 1rem; left: 1rem;
          background: var(--error); color: white; font-size: 0.8rem; font-weight: 700;
          padding: 0.25rem 0.625rem; border-radius: var(--radius-full);
        }
        .thumbnails { display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; }
        .thumbnail {
          width: 64px; height: 64px; object-fit: cover; border-radius: var(--radius);
          border: 2px solid var(--border); cursor: pointer; transition: var(--transition);
        }
        .thumbnail.active { border-color: var(--primary); }
        .thumbnail:hover { border-color: var(--primary); }
        .product-category-badge {
          display: inline-block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.05em; color: var(--primary); text-decoration: none; margin-bottom: 0.5rem;
        }
        .product-detail-name { font-size: 1.75rem; font-weight: 800; line-height: 1.25; margin-bottom: 0.75rem; }
        .product-detail-rating { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
        .rating-value { font-weight: 700; font-size: 1rem; }
        .rating-count { color: var(--text-secondary); font-size: 0.875rem; }
        .product-detail-price { display: flex; align-items: center; gap: 0.875rem; margin-bottom: 1rem; }
        .price-main { font-size: 2rem; font-weight: 900; color: var(--text-primary); }
        .price-compare { font-size: 1.1rem; color: var(--text-muted); text-decoration: line-through; }
        .product-detail-desc { color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; margin-bottom: 1rem; }
        .stock-badge { font-size: 0.875rem; font-weight: 600; padding: 0.375rem 0.875rem; border-radius: var(--radius-full); display: inline-block; }
        .stock-badge.in-stock { background: #d1fae5; color: #065f46; }
        .stock-badge.out-stock { background: #fee2e2; color: #991b1b; }
        .qty-section { margin-bottom: 1.25rem; }
        .product-cta { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .cta-main { flex: 1; min-width: 160px; }
        .btn-success { background: var(--success) !important; border-color: var(--success) !important; }
        .secondary-actions { display: flex; gap: 1rem; margin-top: 1rem; }
        .secondary-action-btn {
          display: flex; align-items: center; gap: 0.375rem;
          font-size: 0.875rem; color: var(--text-secondary);
          background: none; border: none; cursor: pointer; font-family: inherit;
          transition: var(--transition);
        }
        .secondary-action-btn:hover { color: var(--primary); }
        .reviews-section { margin: 3rem 0 2rem; }
        .add-review-card { padding: 1.5rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .stars-input { display: flex; gap: 0.25rem; }
        .reviews-list { display: flex; flex-direction: column; gap: 1rem; }
        .review-card { padding: 1.25rem; }
        .review-header { display: flex; align-items: flex-start; gap: 0.875rem; margin-bottom: 0.75rem; }
        .reviewer-avatar {
          width: 36px; height: 36px; border-radius: 50%; background: var(--primary);
          color: white; font-weight: 700; display: flex; align-items: center; justify-content: center;
          font-size: 0.875rem; flex-shrink: 0;
        }
        .reviewer-name { font-weight: 600; font-size: 0.9rem; }
        .review-date { margin-inline-start: auto; font-size: 0.8rem; color: var(--text-muted); }
        .review-comment { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; }
        .related-section { margin: 2rem 0; }
        [dir='rtl'] .main-discount { left: auto; right: 1rem; }
      `}</style>
    </>
  );
}
