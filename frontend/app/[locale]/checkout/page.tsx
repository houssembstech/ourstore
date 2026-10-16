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

      
    </>
  );
}
