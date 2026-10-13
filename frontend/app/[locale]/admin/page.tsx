'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { ordersApi, productsApi, categoriesApi, usersApi, uploadApi } from '@/lib/api';
import { useAuthStore, useUIStore } from '@/lib/store';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, X,
  TrendingUp, Clock, CheckCircle, Truck, Plus, Edit, Trash2,
  Upload, ChevronDown, Search
} from 'lucide-react';

type Tab = 'dashboard' | 'orders' | 'products' | 'categories' | 'users';

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ En attente', confirmed: '✅ Confirmée', processing: '⚙️ En traitement',
  shipped: '🚚 Expédiée', delivered: '📦 Livrée', cancelled: '❌ Annulée', rejected: '🚫 Rejetée',
};
const STATUS_CLASSES: Record<string, string> = {
  pending: 'status-pending', confirmed: 'status-confirmed', processing: 'status-processing',
  shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled', rejected: 'status-rejected',
};

export default function AdminPage() {
  const locale = useLocale() as 'fr'|'ar'|'en';
  const router = useRouter();
  const { user } = useAuthStore();
  const { showToast, toast, hideToast } = useUIStore();

  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<{ total: number; pending: number; confirmed: number; delivered: number; revenue: number } | null>(null);
  const [orders, setOrders] = useState<unknown[]>([]);
  const [products, setProducts] = useState<unknown[]>([]);
  const [categories, setCategories] = useState<unknown[]>([]);
  const [users, setUsers] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');

  // Product form
  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Record<string, unknown> | null>(null);
  const [productForm, setProductForm] = useState({
    name: { fr: '', ar: '', en: '' },
    description: { fr: '', ar: '', en: '' },
    price: '', comparePrice: '', stock: '', category: '',
    images: [] as string[], isFeatured: false, tags: '',
  });
  const [uploading, setUploading] = useState(false);

  // Category form
  const [catModal, setCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: { fr: '', ar: '', en: '' }, slug: '', icon: '📦', description: { fr: '', ar: '', en: '' } });

  useEffect(() => {
    if (!user || !['admin', 'agent'].includes(user.role)) {
      router.push(`/${locale}`);
      return;
    }
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const [statsRes, ordersRes] = await Promise.all([ordersApi.getStats(), ordersApi.getAll({ limit: 5 })]);
        setStats(statsRes.data.data);
        setOrders(ordersRes.data.data);
      } else if (tab === 'orders') {
        const params: Record<string, string | number> = { limit: 50 };
        if (orderStatusFilter) params.status = orderStatusFilter;
        if (orderSearch) params.search = orderSearch;
        const res = await ordersApi.getAll(params);
        setOrders(res.data.data);
      } else if (tab === 'products') {
        const [prodRes, catRes] = await Promise.all([productsApi.getAll({ limit: 50 }), categoriesApi.getAll()]);
        setProducts(prodRes.data.data);
        setCategories(catRes.data.data);
      } else if (tab === 'categories') {
        const res = await categoriesApi.getAll();
        setCategories(res.data.data);
      } else if (tab === 'users' && user?.role === 'admin') {
        const res = await usersApi.getAll({ limit: 50 });
        setUsers(res.data.data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    try {
      await ordersApi.updateStatus(orderId, { status, agentNotes: notes || '' });
      showToast('Statut mis à jour', 'success');
      loadData();
    } catch { showToast('Erreur', 'error'); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const res = await uploadApi.upload(file);
        urls.push(res.data.url);
      }
      setProductForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      showToast(`${urls.length} image(s) uploadée(s)`, 'success');
    } catch { showToast('Erreur upload image', 'error'); }
    finally { setUploading(false); }
  };

  const handleSaveProduct = async () => {
    try {
      const data = {
        ...productForm,
        price: Number(productForm.price),
        comparePrice: Number(productForm.comparePrice) || 0,
        stock: Number(productForm.stock),
        tags: productForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      if (editingProduct) {
        await productsApi.update(editingProduct._id as string, data);
        showToast('Produit mis à jour', 'success');
      } else {
        await productsApi.create(data);
        showToast('Produit créé', 'success');
      }
      setProductModal(false);
      setEditingProduct(null);
      loadData();
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await productsApi.delete(id);
      showToast('Produit supprimé', 'success');
      loadData();
    } catch { showToast('Erreur', 'error'); }
  };

  const handleSaveCategory = async () => {
    try {
      await categoriesApi.create(catForm);
      showToast('Catégorie créée', 'success');
      setCatModal(false);
      setCatForm({ name: { fr: '', ar: '', en: '' }, slug: '', icon: '📦', description: { fr: '', ar: '', en: '' } });
      loadData();
    } catch { showToast('Erreur', 'error'); }
  };

  const openEditProduct = (p: Record<string, unknown>) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name as { fr: string; ar: string; en: string },
      description: (p.description as { fr: string; ar: string; en: string }) || { fr: '', ar: '', en: '' },
      price: String(p.price || ''),
      comparePrice: String(p.comparePrice || ''),
      stock: String(p.stock || ''),
      category: (p.category as { _id: string })?._id || p.category as string || '',
      images: (p.images as string[]) || [],
      isFeatured: Boolean(p.isFeatured),
      tags: ((p.tags as string[]) || []).join(', '),
    });
    setProductModal(true);
  };

  const TABS = [
    { key: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { key: 'orders', icon: <ShoppingBag size={18} />, label: 'Commandes' },
    { key: 'products', icon: <Package size={18} />, label: 'Produits' },
    { key: 'categories', icon: <Tag size={18} />, label: 'Catégories' },
    ...(user?.role === 'admin' ? [{ key: 'users', icon: <Users size={18} />, label: 'Utilisateurs' }] : []),
  ];

  return (
    <>
      <Navbar /><CartDrawer />
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`} onClick={hideToast}>{toast.message}</div>
        </div>
      )}

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <span className="admin-badge">Admin Panel</span>
          </div>
          <nav className="admin-nav">
            {TABS.map((t) => (
              <button key={t.key} className={`admin-nav-item ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key as Tab)}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="admin-main">
          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <div className="animate-fade-in">
              <h1 className="admin-page-title">Tableau de bord</h1>
              <div className="stats-grid">
                {[
                  { icon: <ShoppingBag size={20} />, label: 'Total commandes', value: stats?.total || 0, color: '#3b82f6' },
                  { icon: <Clock size={20} />, label: 'En attente', value: stats?.pending || 0, color: '#f59e0b' },
                  { icon: <CheckCircle size={20} />, label: 'Confirmées', value: stats?.confirmed || 0, color: '#10b981' },
                  { icon: <TrendingUp size={20} />, label: 'Revenus (DA)', value: (stats?.revenue || 0).toLocaleString(), color: '#8b5cf6' },
                ].map((s, i) => (
                  <div key={i} className="stat-card card">
                    <div className="stat-icon" style={{ color: s.color, background: s.color + '18' }}>{s.icon}</div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <h2 style={{ fontWeight: 700, marginBottom: '1rem', marginTop: '2rem' }}>Dernières commandes</h2>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr><th>N°</th><th>Client</th><th>Total</th><th>Statut</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {(orders as { _id: string; orderNumber: string; shippingAddress: { fullName: string; phone: string }; total: number; status: string }[]).slice(0, 5).map((o) => (
                      <tr key={o._id}>
                        <td><strong>#{o.orderNumber}</strong></td>
                        <td><div>{o.shippingAddress?.fullName}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{o.shippingAddress?.phone}</div></td>
                        <td><strong style={{ color: 'var(--primary)' }}>{o.total?.toLocaleString()} DA</strong></td>
                        <td><span className={`badge ${STATUS_CLASSES[o.status]}`}>{STATUS_LABELS[o.status]}</span></td>
                        <td>
                          <select className="form-input" style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                            value={o.status} onChange={(e) => updateOrderStatus(o._id, e.target.value)}>
                            {Object.keys(STATUS_LABELS).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {tab === 'orders' && (
            <div className="animate-fade-in">
              <div className="admin-page-header">
                <h1 className="admin-page-title">Commandes</h1>
              </div>
              <div className="admin-toolbar">
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" style={{ paddingLeft: '2.25rem', maxWidth: '280px' }}
                    placeholder="Rechercher commande / client..." value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadData()} />
                </div>
                <select className="form-input" style={{ maxWidth: '180px' }} value={orderStatusFilter}
                  onChange={(e) => { setOrderStatusFilter(e.target.value); }}>
                  <option value="">Tous les statuts</option>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button className="btn btn-primary btn-sm" onClick={loadData}>Filtrer</button>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr><th>N° Commande</th><th>Client</th><th>Wilaya</th><th>Articles</th><th>Total</th><th>Statut</th><th>Date</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {(orders as { _id: string; orderNumber: string; shippingAddress: { fullName: string; phone: string; wilaya: string }; items: { name: string; quantity: number }[]; total: number; status: string; createdAt: string; agentNotes: string }[]).map((o) => (
                      <tr key={o._id}>
                        <td><strong>#{o.orderNumber}</strong></td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{o.shippingAddress?.fullName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{o.shippingAddress?.phone}</div>
                        </td>
                        <td>{o.shippingAddress?.wilaya}</td>
                        <td>{o.items?.length} article(s)</td>
                        <td><strong style={{ color: 'var(--primary)' }}>{o.total?.toLocaleString()} DA</strong></td>
                        <td><span className={`badge ${STATUS_CLASSES[o.status]}`}>{STATUS_LABELS[o.status]}</span></td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {new Date(o.createdAt).toLocaleDateString('fr')}
                        </td>
                        <td>
                          <select className="form-input" style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem', width: 'auto', minWidth: '140px' }}
                            value={o.status} onChange={(e) => updateOrderStatus(o._id, e.target.value)}>
                            {Object.keys(STATUS_LABELS).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {tab === 'products' && (
            <div className="animate-fade-in">
              <div className="admin-page-header">
                <h1 className="admin-page-title">Produits</h1>
                <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setProductForm({ name: { fr: '', ar: '', en: '' }, description: { fr: '', ar: '', en: '' }, price: '', comparePrice: '', stock: '', category: '', images: [], isFeatured: false, tags: '' }); setProductModal(true); }}>
                  <Plus size={16} /> Ajouter un produit
                </button>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr><th>Image</th><th>Nom</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Vedette</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {(products as { _id: string; name: Record<string, string>; category?: { name: Record<string, string> }; price: number; stock: number; images: string[]; isFeatured: boolean }[]).map((p) => (
                      <tr key={p._id}>
                        <td>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.images?.[0] || '/placeholder.jpg'} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                        </td>
                        <td><div style={{ fontWeight: 500 }}>{p.name?.fr}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.name?.ar}</div></td>
                        <td>{p.category?.name?.fr || '—'}</td>
                        <td><strong>{p.price?.toLocaleString()} DA</strong></td>
                        <td>
                          <span className={`badge ${p.stock > 10 ? 'badge-green' : p.stock > 0 ? 'badge-amber' : 'badge-red'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td>{p.isFeatured ? '⭐' : '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEditProduct(p as unknown as Record<string, unknown>)}>
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDeleteProduct(p._id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CATEGORIES ── */}
          {tab === 'categories' && (
            <div className="animate-fade-in">
              <div className="admin-page-header">
                <h1 className="admin-page-title">Catégories</h1>
                <button className="btn btn-primary" onClick={() => setCatModal(true)}>
                  <Plus size={16} /> Ajouter
                </button>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead><tr><th>Icône</th><th>Nom FR</th><th>Nom AR</th><th>Nom EN</th><th>Slug</th><th>Actions</th></tr></thead>
                  <tbody>
                    {(categories as { _id: string; name: Record<string, string>; icon: string; slug: string }[]).map((c) => (
                      <tr key={c._id}>
                        <td style={{ fontSize: '1.5rem' }}>{c.icon}</td>
                        <td>{c.name?.fr}</td>
                        <td>{c.name?.ar}</td>
                        <td>{c.name?.en}</td>
                        <td><code style={{ fontSize: '0.8rem', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>{c.slug}</code></td>
                        <td>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={async () => { if (confirm('Supprimer ?')) { await categoriesApi.delete(c._id); loadData(); } }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {tab === 'users' && user?.role === 'admin' && (
            <div className="animate-fade-in">
              <h1 className="admin-page-title">Utilisateurs</h1>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscrit le</th><th>Statut</th><th>Actions</th></tr></thead>
                  <tbody>
                    {(users as { _id: string; name: string; email: string; role: string; createdAt: string; isActive: boolean }[]).map((u) => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <select className="form-input" style={{ padding: '0.3rem', fontSize: '0.8rem', width: 'auto' }}
                            value={u.role} onChange={async (e) => { await usersApi.updateRole(u._id, e.target.value); showToast('Rôle mis à jour', 'success'); loadData(); }}>
                            <option value="user">User</option>
                            <option value="agent">Agent</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString('fr')}</td>
                        <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Actif' : 'Inactif'}</span></td>
                        <td>
                          <button className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-primary'}`}
                            onClick={async () => { await usersApi.toggleStatus(u._id, !u.isActive); loadData(); }}>
                            {u.isActive ? 'Désactiver' : 'Activer'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Product Modal */}
      {productModal && (
        <>
          <div className="overlay" onClick={() => setProductModal(false)} />
          <div className="modal animate-scale-in">
            <div className="modal-header">
              <h2>{editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setProductModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-tabs">
                {['Informations', 'Images', 'Options'].map((tabName, i) => (
                  <div key={tabName} className={`modal-section`}>
                    <h3 className="modal-section-title">{tabName}</h3>
                    {i === 0 && (
                      <>
                        <div className="form-grid-3">
                          <div className="form-group">
                            <label className="form-label">🇫🇷 Nom (FR) *</label>
                            <input className="form-input" value={productForm.name.fr} onChange={(e) => setProductForm({ ...productForm, name: { ...productForm.name, fr: e.target.value } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">🇩🇿 Nom (AR)</label>
                            <input className="form-input" dir="rtl" value={productForm.name.ar} onChange={(e) => setProductForm({ ...productForm, name: { ...productForm.name, ar: e.target.value } })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">🇬🇧 Nom (EN)</label>
                            <input className="form-input" value={productForm.name.en} onChange={(e) => setProductForm({ ...productForm, name: { ...productForm.name, en: e.target.value } })} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Description (FR)</label>
                          <textarea className="form-input" value={productForm.description.fr} onChange={(e) => setProductForm({ ...productForm, description: { ...productForm.description, fr: e.target.value } })} />
                        </div>
                        <div className="form-grid-3">
                          <div className="form-group">
                            <label className="form-label">Prix (DA) *</label>
                            <input className="form-input" type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Prix barré (DA)</label>
                            <input className="form-input" type="number" value={productForm.comparePrice} onChange={(e) => setProductForm({ ...productForm, comparePrice: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Stock *</label>
                            <input className="form-input" type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Catégorie</label>
                          <select className="form-input" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                            <option value="">— Choisir —</option>
                            {(categories as { _id: string; name: Record<string, string>; icon: string }[]).map((c) => (
                              <option key={c._id} value={c._id}>{c.icon} {c.name?.fr}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Tags (séparés par virgule)</label>
                          <input className="form-input" value={productForm.tags} placeholder="ex: chaussure, sport, été" onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })} />
                        </div>
                        <label className="checkbox-label">
                          <input type="checkbox" checked={productForm.isFeatured} onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })} />
                          ⭐ Mettre en vedette
                        </label>
                      </>
                    )}
                    {i === 1 && (
                      <>
                        <label className="upload-zone">
                          <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                          <Upload size={24} />
                          <span>{uploading ? 'Upload en cours...' : 'Cliquer pour uploader des images'}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>JPG, PNG, WebP — max 5MB</span>
                        </label>
                        {productForm.images.length > 0 && (
                          <div className="image-preview-grid">
                            {productForm.images.map((url, i) => (
                              <div key={i} className="image-preview-item">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="" />
                                <button className="img-remove-btn" onClick={() => setProductForm({ ...productForm, images: productForm.images.filter((_, idx) => idx !== i) })}>
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setProductModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSaveProduct}>
                {editingProduct ? 'Mettre à jour' : 'Créer le produit'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Category Modal */}
      {catModal && (
        <>
          <div className="overlay" onClick={() => setCatModal(false)} />
          <div className="modal animate-scale-in" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Nouvelle catégorie</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setCatModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">🇫🇷 Nom (FR) *</label>
                  <input className="form-input" value={catForm.name.fr} onChange={(e) => setCatForm({ ...catForm, name: { ...catForm.name, fr: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label className="form-label">🇩🇿 Nom (AR)</label>
                  <input className="form-input" dir="rtl" value={catForm.name.ar} onChange={(e) => setCatForm({ ...catForm, name: { ...catForm.name, ar: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label className="form-label">🇬🇧 Nom (EN)</label>
                  <input className="form-input" value={catForm.name.en} onChange={(e) => setCatForm({ ...catForm, name: { ...catForm.name, en: e.target.value } })} />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Slug (URL) *</label>
                  <input className="form-input" placeholder="ex: electronique" value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Icône (emoji)</label>
                  <input className="form-input" value={catForm.icon} style={{ fontSize: '1.25rem' }} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setCatModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSaveCategory}>Créer</button>
            </div>
          </div>
        </>
      )}

      <Footer />

      <style jsx>{`
        .admin-layout { display: flex; min-height: calc(100vh - 64px); }
        .admin-sidebar { width: 220px; flex-shrink: 0; background: white; border-right: 1px solid var(--border); padding: 1.5rem 0; display: none; }
        @media (min-width: 768px) { .admin-sidebar { display: block; } }
        .admin-sidebar-header { padding: 0 1rem 1rem; border-bottom: 1px solid var(--border); margin-bottom: 0.75rem; }
        .admin-badge { background: var(--primary); color: white; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: var(--radius-full); text-transform: uppercase; }
        .admin-nav { display: flex; flex-direction: column; gap: 0.25rem; padding: 0 0.75rem; }
        .admin-nav-item {
          display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.875rem;
          border-radius: var(--radius); border: none; background: none; font-size: 0.9rem;
          color: var(--text-secondary); cursor: pointer; font-family: inherit; text-align: start;
          transition: var(--transition); width: 100%;
        }
        .admin-nav-item:hover { background: var(--surface-2); color: var(--text-primary); }
        .admin-nav-item.active { background: var(--primary-light); color: var(--primary-dark); font-weight: 600; }
        .admin-main { flex: 1; padding: 1.5rem; overflow: auto; background: var(--background); }
        .admin-page-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 1.5rem; }
        .admin-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
        .admin-page-header .admin-page-title { margin-bottom: 0; }
        .admin-toolbar { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        @media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }
        .stat-card { padding: 1.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
        .stat-icon { width: 48px; height: 48px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; }
        .stat-value { font-size: 1.75rem; font-weight: 900; color: var(--text-primary); }
        .stat-label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 500; }
        .admin-table-wrapper { background: white; border-radius: var(--radius-lg); border: 1px solid var(--border); overflow: auto; }
        .admin-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .admin-table th { background: var(--surface-2); padding: 0.875rem 1rem; text-align: start; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-secondary); border-bottom: 1px solid var(--border); white-space: nowrap; }
        .admin-table td { padding: 0.875rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: var(--surface-2); }
        /* Modal */
        .modal {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          background: white; border-radius: var(--radius-lg); z-index: 60;
          width: min(700px, 95vw); max-height: 90vh; display: flex; flex-direction: column;
          box-shadow: var(--shadow-lg);
        }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); flex-shrink: 0; }
        .modal-header h2 { font-size: 1.1rem; font-weight: 700; }
        .modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1.25rem 1.5rem; border-top: 1px solid var(--border); flex-shrink: 0; }
        .modal-section-title { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); }
        .modal-section { display: flex; flex-direction: column; gap: 1rem; }
        .form-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.875rem; }
        .form-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.875rem; }
        @media (max-width: 500px) { .form-grid-3, .form-grid-2 { grid-template-columns: 1fr; } }
        .checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer; }
        .upload-zone {
          border: 2px dashed var(--border); border-radius: var(--radius-lg);
          padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
          cursor: pointer; transition: var(--transition); color: var(--text-secondary); text-align: center;
        }
        .upload-zone:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
        .image-preview-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .image-preview-item { position: relative; width: 80px; height: 80px; }
        .image-preview-item img { width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm); }
        .img-remove-btn {
          position: absolute; top: -6px; right: -6px; background: var(--error); color: white;
          border: none; border-radius: 50%; width: 20px; height: 20px;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
      `}</style>
    </>
  );
}
