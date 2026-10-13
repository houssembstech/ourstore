'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { useCartStore, useAuthStore, useUIStore } from '@/lib/store';
import { ordersApi } from '@/lib/api';
import { CheckCircle, Package } from 'lucide-react';

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar',
  'Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger',
  'Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma',
  'Constantine','Médéa','Mostaganem','Msila','Mascara','Ouargla','Oran','El Bayadh',
  'Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt',
  'El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma',
  'Aïn Témouchent','Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar',
  'Ouled Djellal','Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet',
  'El M\'Ghair','El Menia',
];

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const locale = useLocale() as 'fr'|'ar'|'en';
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { toast, hideToast, showToast } = useUIStore();

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    wilaya: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ orderNumber: string; _id: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = 'Nom requis';
    if (!form.phone.trim() || form.phone.length < 9) errs.phone = 'Téléphone invalide';
    if (!form.street.trim()) errs.street = 'Adresse requise';
    if (!form.city.trim()) errs.city = 'Ville requise';
    if (!form.wilaya) errs.wilaya = 'Wilaya requise';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await ordersApi.create({
        items: items.map((i) => ({ product: i.product, quantity: i.quantity })),
        shippingAddress: form,
        guestInfo: !user ? { name: form.fullName, phone: form.phone } : undefined,
        lang: locale,
      });
      setSuccess(res.data.data);
      clearCart();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg || 'Erreur lors de la commande', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !success) {
    return (
      <>
        <Navbar /><CartDrawer />
        <div className="empty-state" style={{ minHeight: '60vh' }}>
          <div className="empty-state-icon">🛒</div>
          <div className="empty-state-title">Panier vide</div>
          <Link href={`/${locale}/shop`} className="btn btn-primary">Continuer vos achats</Link>
        </div>
        <Footer />
      </>
    );
  }

  if (success) {
    return (
      <>
        <Navbar /><CartDrawer />
        <div className="success-page">
          <div className="success-card">
            <div className="success-icon"><CheckCircle size={64} /></div>
            <h1 className="success-title">{t('success_title')}</h1>
            <p className="success-desc">{t('success_desc')}</p>
            <div className="success-order-number">
              <Package size={16} /> {t('order_number')}: <strong>{success.orderNumber}</strong>
            </div>
            <div className="success-actions">
              <Link href={`/${locale}/orders`} className="btn btn-primary">Voir mes commandes</Link>
              <Link href={`/${locale}/shop`} className="btn btn-outline">Continuer vos achats</Link>
            </div>
          </div>
        </div>
        <Footer />
        <style>{`
          .success-page { display: flex; align-items: center; justify-content: center; min-height: 70vh; padding: 2rem 1rem; }
          .success-card { background: white; border-radius: var(--radius-lg); padding: 3rem 2rem; text-align: center; max-width: 480px; width: 100%; border: 1px solid var(--border); box-shadow: var(--shadow); animation: scaleIn 0.3s ease; }
          .success-icon { color: var(--success); margin-bottom: 1.5rem; }
          .success-title { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.75rem; }
          .success-desc { color: var(--text-secondary); margin-bottom: 1.5rem; }
          .success-order-number { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--primary-light); color: var(--primary-dark); padding: 0.5rem 1rem; border-radius: var(--radius-full); font-size: 0.9rem; margin-bottom: 2rem; }
          .success-actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`} onClick={hideToast}>✗ {toast.message}</div>
        </div>
      )}

      <div className="checkout-layout">
        <div className="checkout-form-section">
          <h1 className="checkout-title">{t('title')}</h1>

          <form onSubmit={handleSubmit} className="checkout-form">
            <h2 className="form-section-title">{t('shipping_info')}</h2>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{t('full_name')} *</label>
                <input className={`form-input ${errors.fullName ? 'error' : ''}`} value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                {errors.fullName && <span className="form-error">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('phone')} *</label>
                <input className={`form-input ${errors.phone ? 'error' : ''}`} value={form.phone} type="tel"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('street')} *</label>
              <input className={`form-input ${errors.street ? 'error' : ''}`} value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })} />
              {errors.street && <span className="form-error">{errors.street}</span>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{t('city')} *</label>
                <input className={`form-input ${errors.city ? 'error' : ''}`} value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })} />
                {errors.city && <span className="form-error">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('wilaya')} *</label>
                <select className={`form-input ${errors.wilaya ? 'error' : ''}`} value={form.wilaya}
                  onChange={(e) => setForm({ ...form, wilaya: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
                {errors.wilaya && <span className="form-error">{errors.wilaya}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('notes')}</label>
              <textarea className="form-input" value={form.notes} placeholder={t('notes_placeholder')}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>

            <button type="submit" className="btn btn-primary btn-lg submit-btn" disabled={loading}>
              {loading ? <><span className="spinner" /> Traitement...</> : `✓ ${t('place_order')}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="order-summary-section">
          <div className="order-summary-card">
            <h2 className="summary-title">{t('order_summary')}</h2>
            <div className="summary-items">
              {items.map((item) => (
                <div key={item.product} className="summary-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image || '/placeholder.jpg'} alt="" className="summary-item-img" />
                  <div className="summary-item-info">
                    <div className="summary-item-name">{item.name?.[locale] || item.name?.fr}</div>
                    <div className="summary-item-qty">x{item.quantity}</div>
                  </div>
                  <div className="summary-item-price">{(item.price * item.quantity).toLocaleString()} DA</div>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="summary-rows">
              <div className="summary-row">
                <span>Sous-total</span>
                <span>{subtotal().toLocaleString()} DA</span>
              </div>
              <div className="summary-row">
                <span>Livraison</span>
                <span className="free-text">Gratuite 🚚</span>
              </div>
              <div className="divider" />
              <div className="summary-row total-row">
                <span>Total</span>
                <span className="total-amount">{subtotal().toLocaleString()} DA</span>
              </div>
            </div>
            <div className="order-note">
              📞 Notre équipe vous contactera dans les 24h pour confirmer votre commande.
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        @media (min-width: 768px) { .checkout-layout { grid-template-columns: 1.4fr 1fr; } }
        .checkout-title { font-size: 1.75rem; font-weight: 800; margin-bottom: 1.5rem; }
        .form-section-title { font-size: 1rem; font-weight: 700; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
        .checkout-form { background: white; border-radius: var(--radius-lg); padding: 2rem; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 1rem; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 500px) { .form-grid { grid-template-columns: 1fr; } }
        .form-error { font-size: 0.78rem; color: var(--error); margin-top: 2px; }
        .submit-btn { width: 100%; margin-top: 0.5rem; }
        .order-summary-card { background: white; border-radius: var(--radius-lg); padding: 1.5rem; border: 1px solid var(--border); position: sticky; top: 80px; }
        .summary-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1.25rem; }
        .summary-items { display: flex; flex-direction: column; gap: 0.875rem; max-height: 300px; overflow-y: auto; }
        .summary-item { display: flex; align-items: center; gap: 0.75rem; }
        .summary-item-img { width: 52px; height: 52px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border); flex-shrink: 0; }
        .summary-item-info { flex: 1; min-width: 0; }
        .summary-item-name { font-size: 0.85rem; font-weight: 500; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .summary-item-qty { font-size: 0.8rem; color: var(--text-secondary); }
        .summary-item-price { font-size: 0.875rem; font-weight: 700; flex-shrink: 0; }
        .summary-rows { display: flex; flex-direction: column; gap: 0.625rem; }
        .summary-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary); }
        .free-text { color: var(--success); font-weight: 600; font-size: 0.85rem; }
        .total-row { font-weight: 800; font-size: 1.1rem; color: var(--text-primary); }
        .total-amount { color: var(--primary); }
        .order-note { margin-top: 1rem; padding: 0.875rem; background: var(--primary-light); border-radius: var(--radius); font-size: 0.825rem; color: #92400e; line-height: 1.5; }
      `}</style>
    </>
  );
}
