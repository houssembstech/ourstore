'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import ProductCard from '@/components/products/ProductCard';
import { productsApi, categoriesApi } from '@/lib/api';
import { useUIStore } from '@/lib/store';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ShopPage() {
  const t = useTranslations('shop');
  const tCommon = useTranslations('common');
  const locale = useLocale() as 'fr'|'ar'|'en';
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast, hideToast } = useUIStore();

  const [products, setProducts] = useState<unknown[]>([]);
  const [categories, setCategories] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters from URL
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    page: Number(searchParams.get('page')) || 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit: 12,
        page: filters.page,
        sort: filters.sort,
      };
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const res = await productsApi.getAll(params);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    categoriesApi.getAll().then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  const updateFilter = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key !== 'page' ? 1 : Number(value) }));
  };

  const clearFilters = () => {
    setFilters({ category: '', search: '', sort: 'newest', minPrice: '', maxPrice: '', page: 1 });
  };

  const SORTS = [
    { value: 'newest', label: t('sort_newest') },
    { value: 'price-asc', label: t('sort_price_asc') },
    { value: 'price-desc', label: t('sort_price_desc') },
    { value: 'rating', label: t('sort_rating') },
  ];

  const activeFiltersCount = [filters.category, filters.minPrice, filters.maxPrice].filter(Boolean).length;

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

      <div className="shop-layout">
        {/* Sidebar */}
        <aside className={`shop-sidebar ${filtersOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3 className="sidebar-title">{tCommon('filter')}</h3>
            <button className="btn btn-ghost btn-icon sidebar-close" onClick={() => setFiltersOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Categories */}
          <div className="filter-group">
            <div className="filter-group-title">{tCommon('category')}</div>
            <button
              className={`filter-option ${!filters.category ? 'active' : ''}`}
              onClick={() => updateFilter('category', '')}
            >
              {tCommon('all')}
            </button>
            {(categories as { _id: string; name: Record<string, string>; icon: string }[]).map((cat) => (
              <button
                key={cat._id}
                className={`filter-option ${filters.category === cat._id ? 'active' : ''}`}
                onClick={() => updateFilter('category', cat._id)}
              >
                <span>{cat.icon}</span> {cat.name?.[locale] || cat.name?.fr}
              </button>
            ))}
          </div>

          {/* Price */}
          <div className="filter-group">
            <div className="filter-group-title">{t('filter_price')} (DA)</div>
            <div className="price-inputs">
              <input
                type="number"
                className="form-input"
                placeholder={t('min_price')}
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
              />
              <input
                type="number"
                className="form-input"
                placeholder={t('max_price')}
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
              />
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <button className="btn btn-outline btn-sm clear-btn" onClick={clearFilters}>
              <X size={14} /> Effacer les filtres ({activeFiltersCount})
            </button>
          )}
        </aside>

        {/* Overlay for mobile */}
        {filtersOpen && <div className="overlay sidebar-overlay" onClick={() => setFiltersOpen(false)} />}

        {/* Main content */}
        <main className="shop-main">
          {/* Toolbar */}
          <div className="shop-toolbar">
            <div className="toolbar-left">
              <button className="btn btn-outline btn-sm filter-toggle" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal size={15} />
                {tCommon('filter')}
                {activeFiltersCount > 0 && <span className="badge badge-amber">{activeFiltersCount}</span>}
              </button>
              {!loading && (
                <span className="results-count">
                  {pagination.total} {t('results')}
                </span>
              )}
            </div>
            <div className="toolbar-right">
              <select
                className="form-input sort-select"
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
              >
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Search bar */}
          <div className="search-bar-shop">
            <input
              type="text"
              className="form-input"
              placeholder={`🔍 ${tCommon('search')}...`}
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid-products">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">{tCommon('no_results')}</div>
              <button className="btn btn-primary" onClick={clearFilters}>Effacer les filtres</button>
            </div>
          ) : (
            <div className="grid-products">
              {(products as { _id: string; name: Record<string, string>; price: number; comparePrice?: number; images: string[]; rating: number; numReviews: number; stock: number; category?: { name: Record<string, string>; slug: string } }[]).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={filters.page <= 1}
                onClick={() => updateFilter('page', filters.page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${filters.page === i + 1 ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => updateFilter('page', i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="btn btn-outline btn-sm"
                disabled={filters.page >= pagination.pages}
                onClick={() => updateFilter('page', filters.page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />

      <style>{`
        .shop-layout {
          display: flex;
          gap: 0;
          min-height: 80vh;
          max-width: 1280px;
          margin: 0 auto;
          padding: 1.5rem 1rem;
          gap: 1.5rem;
        }
        .shop-sidebar {
          width: 260px;
          flex-shrink: 0;
          display: none;
        }
        @media (min-width: 1024px) { .shop-sidebar { display: block; } }
        .shop-sidebar.open {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 50;
          background: white;
          overflow-y: auto;
          padding: 1rem;
          width: 280px;
          box-shadow: var(--shadow-lg);
          animation: slideInRight 0.3s ease;
        }
        [dir='rtl'] .shop-sidebar.open { left: auto; right: 0; }
        .sidebar-overlay { z-index: 49; }
        .sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
        .sidebar-title { font-size: 1.1rem; font-weight: 700; }
        .sidebar-close { display: flex; }
        @media (min-width: 1024px) { .sidebar-close { display: none; } }
        .filter-group { margin-bottom: 1.5rem; }
        .filter-group-title { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 0.75rem; }
        .filter-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius);
          border: none;
          background: none;
          font-size: 0.875rem;
          color: var(--text-secondary);
          cursor: pointer;
          text-align: start;
          transition: var(--transition);
          font-family: inherit;
        }
        .filter-option:hover { background: var(--surface-2); color: var(--text-primary); }
        .filter-option.active { background: var(--primary-light); color: var(--primary-dark); font-weight: 600; }
        .price-inputs { display: flex; flex-direction: column; gap: 0.5rem; }
        .clear-btn { width: 100%; }
        .shop-main { flex: 1; min-width: 0; }
        .shop-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; gap: 1rem; }
        .toolbar-left { display: flex; align-items: center; gap: 0.75rem; }
        .filter-toggle { display: flex; }
        @media (min-width: 1024px) { .filter-toggle { display: none; } }
        .results-count { font-size: 0.875rem; color: var(--text-secondary); }
        .sort-select { max-width: 200px; padding: 0.45rem 0.875rem; }
        .search-bar-shop { margin-bottom: 1.25rem; }
        .pagination { display: flex; align-items: center; justify-content: center; gap: 0.375rem; margin-top: 2rem; flex-wrap: wrap; }
      `}</style>
    </>
  );
}
