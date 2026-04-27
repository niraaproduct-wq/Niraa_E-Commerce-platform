import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { formatPrice } from '../utils/formatPrice.js';
import { WHATSAPP_NUMBER } from '../utils/constants.js';
import { CATEGORIES } from '../utils/categories.js';
import { getProducts } from '../utils/productApi.js';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const activeCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          category: activeCategory !== 'all' && activeCategory !== 'combo' ? activeCategory : undefined,
          featured: activeCategory === 'featured' ? true : undefined,
          search: searchQuery || undefined,
          limit: 100
        };
        const data = await getProducts(params);
        setProducts(data?.products || []);
      } catch (err) {
        console.error("Products fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, searchQuery]);

  const individuals = useMemo(() => (Array.isArray(products) ? products : []).filter(p => !p.isCombo), [products]);
  const combos = useMemo(() => (Array.isArray(products) ? products : []).filter(p => p.isCombo), [products]);

  const grouped = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      products: individuals.filter(p => p.category === cat.id),
    })).filter(g => g.products.length > 0);
  }, [individuals]);

  const showAll = activeCategory === 'all';
  const showCombos = activeCategory === 'combo' || showAll;

  // Since we are now filtering via API, we don't need the complex filteredGroups useMemo
  // But we still want to group individuals by category for display if showing "all" or a specific category
  const displayedGroups = useMemo(() => {
    if (activeCategory === 'combo') return [];
    return grouped;
  }, [grouped, activeCategory]);

  const totalProducts = products.length;
  const waText = `Hello NIRAA, I'd like to order cleaning products from your website. Please contact me.`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(waText)}`;

  return (
    <main className="container page">
      <style>{`
        .products-header-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .search-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
          max-width: 360px;
        }
        .search-input {
          width: 100%;
          padding: 10px 14px 10px 38px;
          border: 1.5px solid rgba(42,125,114,0.2);
          border-radius: 999px;
          font-size: 0.88rem;
          background: #fff;
          color: var(--gray-700);
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .search-input:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(42,125,114,0.12); }
        .search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: var(--gray-400); pointer-events: none; font-size: 1rem;
        }

        .products-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 32px;
          padding: 16px 18px;
          background: #fff;
          border-radius: 20px;
          border: 1px solid rgba(42,125,114,0.1);
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .filter-pill {
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1.5px solid rgba(42,125,114,0.18);
          background: transparent;
          color: var(--gray-600);
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .filter-pill:hover {
          border-color: var(--teal);
          color: var(--teal);
          background: rgba(42,125,114,0.05);
          transform: translateY(-1px);
        }
        .filter-pill--active {
          background: linear-gradient(135deg, var(--teal), var(--teal-dark));
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(42,125,114,0.28);
          transform: translateY(-1px);
        }

        .cat-section { margin-bottom: 44px; }

        .cat-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
          padding-bottom: 16px;
          border-bottom: 2px solid rgba(42,125,114,0.08);
        }
        .cat-icon-wrap {
          width: 52px; height: 52px;
          border-radius: 16px;
          background: linear-gradient(135deg, #f0faf8, #e6f4f0);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem;
          border: 1px solid rgba(42,125,114,0.1);
          flex-shrink: 0;
        }
        .cat-count {
          margin-left: auto;
          font-size: 0.72rem;
          color: var(--teal-dark);
          background: rgba(42,125,114,0.1);
          padding: 5px 14px;
          border-radius: 999px;
          font-weight: 700;
        }
        .cat-desc {
          background: linear-gradient(135deg, #f8fffe, #fefcf3);
          border-radius: 16px;
          padding: 14px 18px;
          margin-bottom: 16px;
          font-size: 0.86rem;
          color: var(--gray-600);
          border: 1px solid rgba(42,125,114,0.08);
          line-height: 1.7;
        }

        .prod-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media (min-width: 640px) { .prod-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .prod-grid { grid-template-columns: repeat(4, 1fr); } }

        .combo-header-card {
          background: linear-gradient(135deg, #062019 0%, #1a4f47 70%, #0b3d35 100%);
          border-radius: 26px;
          padding: 26px 24px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(6,32,25,0.25);
        }
        .combo-header-card::before {
          content: '';
          position: absolute;
          top: -50px; right: -30px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(200,168,75,0.12);
        }
        .combo-header-card::after {
          content: '';
          position: absolute;
          bottom: -40px; left: 30%;
          width: 120px; height: 120px;
          border-radius: 50%;
          background: rgba(74,222,128,0.08);
        }
        .combo-tag-pill {
          position: absolute; top: -8px; left: 14px; z-index: 10;
          border-radius: 999px; font-size: 0.65rem; font-weight: 800;
          padding: 4px 12px; box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }
      `}</style>

      {/* ─── HEADER ─────────────────────────── */}
      <header style={{ marginBottom: 30 }}>
        <div style={{
          background: 'linear-gradient(135deg, #062019 0%, #1a4f47 100%)',
          borderRadius: 26, padding: '32px 28px', color: '#fff',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(6,32,25,0.3)',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(200,168,75,0.1)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#aadecd',
              borderRadius: 999, fontSize: '0.7rem', fontWeight: 800,
              padding: '5px 14px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
            }}>🧴 Product Catalog</div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 4vw, 2.3rem)',
              fontWeight: 900, color: '#fff', margin: '0 0 10px',
              lineHeight: 1.1, letterSpacing: '-0.02em',
            }}>
              Our Products
            </h1>
            <p style={{ color: '#aadecd', fontSize: '0.92rem', margin: '0 0 20px', maxWidth: 480, lineHeight: 1.6 }}>
              Premium eco-friendly cleaning solutions for every corner of your home.
              Serving Dharmapuri & nearby areas — <strong style={{ color: '#4ade80' }}>{totalProducts} products</strong> to explore.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href={waLink} target="_blank" rel="noreferrer" style={{
                background: '#25D366', color: '#fff',
                padding: '12px 20px', borderRadius: 14, fontWeight: 800,
                textDecoration: 'none', fontSize: '0.88rem',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 8px 20px rgba(37,211,102,0.3)',
              }}>
                📱 Order via WhatsApp
              </a>
              <Link to="/checkout" style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                color: '#fff', padding: '12px 20px', borderRadius: 14,
                fontWeight: 800, textDecoration: 'none', fontSize: '0.88rem',
              }}>
                🛒 Go to Checkout
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ─── SEARCH + FILTER ─────────────────── */}
      <div className="products-header-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={{
            padding: '8px 16px', borderRadius: 999, border: '1.5px solid rgba(42,125,114,0.2)',
            background: '#fff', color: 'var(--gray-600)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
          }}>
            Clear ✕
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="products-filter">
        <Link to="/products" className={`filter-pill ${activeCategory === 'all' ? 'filter-pill--active' : ''}`}>
          🏠 All Products
        </Link>
        {CATEGORIES.map(cat => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.id}`}
            className={`filter-pill ${activeCategory === cat.id ? 'filter-pill--active' : ''}`}
          >
            {cat.icon} {cat.label}
          </Link>
        ))}
        <Link
          to="/products?category=combo"
          className={`filter-pill ${activeCategory === 'combo' ? 'filter-pill--active' : ''}`}
        >
          🎁 Combo Deals
        </Link>
      </div>

      {/* ─── CATEGORY SECTIONS ───────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--teal)', fontWeight: 700 }}>
          Finding the best cleaning products for you...
        </div>
      ) : (
        displayedGroups.map(group => (
        <section key={group.id} className="cat-section">
          <div className="cat-header">
            <div className="cat-icon-wrap">{group.icon}</div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 900, color: 'var(--gray-800)', margin: 0, letterSpacing: '-0.01em' }}>
                {group.label}
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2, fontWeight: 500 }}>
                {group.desc?.split('.')[0]}
              </div>
            </div>
            <span className="cat-count">{group.products.length} item{group.products.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="cat-desc">{group.desc}</div>
          <div className="prod-grid">
            {group.products.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )))}

      {/* ─── COMBO SECTION ───────────────────── */}
      {showCombos && combos.length > 0 && (
        <section className="cat-section">
          <div className="combo-header-card">
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8 }}>
                  🎁 Bundle Deals
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                  Combo Deals & Bundles
                </h2>
                <p style={{ color: '#aadecd', fontSize: '0.85rem', margin: 0 }}>
                  Save up to <strong style={{ color: '#4ade80' }}>38%</strong> when you bundle your favourites together.
                </p>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 16, padding: '12px 18px', textAlign: 'center',
              }}>
                <div style={{ color: '#4ade80', fontWeight: 900, fontSize: '1.6rem', fontFamily: 'var(--font-display)' }}>{combos.length}</div>
                <div style={{ color: '#aadecd', fontSize: '0.7rem', fontWeight: 600 }}>bundles</div>
              </div>
            </div>
          </div>

          <div className="prod-grid">
            {combos.map(p => (
              <div key={p._id} style={{ position: 'relative' }}>
                {p.comboTag && (
                  <div className="combo-tag-pill" style={{ background: p.comboColor || 'var(--teal)', color: '#fff' }}>
                    {p.comboTag}
                  </div>
                )}
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── NO RESULTS ──────────────────────── */}
      {!loading && displayedGroups.length === 0 && !showCombos && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: '#fff', borderRadius: 24,
          border: '1px solid rgba(42,125,114,0.1)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🔍</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--gray-800)', marginBottom: 8 }}>
            No products found
          </div>
          <div style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: 20 }}>
            {searchQuery ? `No results for "${searchQuery}"` : 'No products in this category'}
          </div>
          <Link to="/products" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#fff', background: 'var(--teal)',
            padding: '10px 20px', borderRadius: 12, fontWeight: 700, textDecoration: 'none', fontSize: '0.88rem',
          }}>
            View all products →
          </Link>
        </div>
      )}
    </main>
  );
}