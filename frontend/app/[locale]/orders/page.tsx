'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { ordersApi } from '@/lib/api';
import { useAuthStore, useUIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight, Clock } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; class: string; emoji: string }> = {
  pending:    { label: 'En attente',    class: 'status-pending',    emoji: '⏳' },
  confirmed:  { label: 'Confirmée',     class: 'status-confirmed',  emoji: '✅' },
  processing: { label: 'En traitement', class: 'status-processing', emoji: '⚙️' },
  shipped:    { label: 'Expédiée',      class: 'status-shipped',    emoji: '🚚' },
  delivered:  { label: 'Livrée',        class: 'status-delivered',  emoji: '📦' },
  cancelled:  { label: 'Annulée',       class: 'status-cancelled',  emoji: '❌' },
  rejected:   { label: 'Rejetée',       class: 'status-rejected',   emoji: '🚫' },
};

export default function OrdersPage() {
  const t = useTranslations('orders');
  const locale = useLocale() as 'fr'|'ar'|'en';
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast, hideToast } = useUIStore();
  const [orders, setOrders] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push(`/${locale}/login`); return; }
    ordersApi.getMy()
      .then((res) => setOrders(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, locale, router]);

  return (
    <>
      <Navbar /><CartDrawer />
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`} onClick={hideToast}>{toast.message}</div>
        </div>
      )}

      <div className="orders-page container">
        <h1 className="page-title"><Package size={28} /> {t('title')}</h1>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">{t('empty')}</div>
            <Link href={`/${locale}/shop`} className="btn btn-primary">Explorer la boutique</Link>
          </div>
        ) : (
          <div className="orders-list">
            {(orders as { _id: string; orderNumber: string; createdAt: string; status: string; total: number; items: { name: string; quantity: number; price: number; image: string }[]; agentNotes: string }[]).map((order) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <div key={order._id} className="order-card card">
                  <div className="order-header">
                    <div className="order-id">
                      <span className="order-emoji">{status.emoji}</span>
                      <div>
                        <div className="order-number">#{order.orderNumber}</div>
                        <div className="order-date">
                          <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className={`badge ${status.class}`}>{status.label}</span>
                    </div>
                  </div>

                  <div className="order-items-preview">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="order-item-chip">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image || '/placeholder.jpg'} alt="" />
                        <span>{item.name} x{item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && <span className="more-items">+{order.items.length - 3} autres</span>}
                  </div>

                  {order.agentNotes && (
                    <div className="agent-note">💬 {order.agentNotes}</div>
                  )}

                  <div className="order-footer">
                    <div className="order-total">
                      Total: <strong>{order.total.toLocaleString()} DA</strong>
                    </div>
                    <Link href={`/${locale}/orders/${order._id}`} className="btn btn-outline btn-sm">
                      {t('details')} <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />

      
    </>
  );
}
