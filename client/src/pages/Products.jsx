import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { WHATSAPP_NUMBER } from '../utils/constants.js';
import { CATEGORIES } from '../utils/categories.js';
import { getProducts } from '../utils/productApi.js';
import SectionRenderer from '../components/SectionRenderer';
import { useRealtime } from '../context/RealtimeContext.jsx';
import { useFirestoreProducts } from '../hooks/useFirestoreProducts';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? (import.meta.env.VITE_API_BASE_URL.endsWith('/api') ? import.meta.env.VITE_API_BASE_URL : `${import.meta.env.VITE_API_BASE_URL}/api`)
  : '/api';

/* ─── SCROLL REVEAL ─── */
function useScrollReveal(threshold = 0.01) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(24px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      ...style
    }}>
      {children}
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const activeCategory = searchParams.get('category') || 'all';
  const [headerVisible, setHeaderVisible] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicSections, setDynamicSections] = useState([]);

  const { products: liveProducts, loading: liveLoading } = useFirestoreProducts({ category: activeCategory });
  const { products: allProducts } = useFirestoreProducts();
  const { lastEvent } = useRealtime();

  useEffect(() => {
    if (!liveLoading) { setProducts(liveProducts); setLoading(false); }
  }, [liveProducts, liveLoading]);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/sections/products`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setDynamicSections(d.sections || []))
      .catch(() => { });
  }, [activeCategory, searchQuery]);

  const individuals = useMemo(() =>
    (Array.isArray(products) ? products : []).filter(p => p.productType !== 'combo' && !p.isCombo),
    [products]);
  const combos = useMemo(() =>
    (Array.isArray(products) ? products : []).filter(p => p.productType === 'combo' || p.isCombo),
    [products]);

  const grouped = useMemo(() => {
    const dynamicCats = [...new Set(liveProducts.map(p => p.category))].filter(c => Boolean(c) && c !== 'combo');
    const merged = [...CATEGORIES];
    dynamicCats.forEach(catId => {
      if (!merged.find(c => c.id === catId)) {
        merged.push({ id: catId, label: catId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), icon: '🧴', desc: 'Premium cleaning solutions.' });
      }
    });
    return merged.map(cat => ({ ...cat, products: individuals.filter(p => p.category === cat.id) }))
      .filter(g => g.products.length > 0);
  }, [individuals, allProducts]);

  const showAll = activeCategory === 'all';
  const showCombos = activeCategory === 'combo' || showAll;
  const displayedGroups = useMemo(() => activeCategory === 'combo' ? [] : grouped, [grouped, activeCategory]);
  const totalProducts = products.length;

  const waText = `Hello NIRAA, I'd like to order cleaning products from your website. Please contact me.`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(waText)}`;

  const categoryFilters = useMemo(() => {
    const dynamicCats = [...new Set(allProducts.map(p => p.category))].filter(c => c && c !== 'combo');
    const merged = [...CATEGORIES];
    dynamicCats.forEach(catId => {
      if (!merged.find(c => c.id === catId)) merged.push({ id: catId, label: catId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), icon: '🧴' });
    });
    return merged
      .filter(cat => allProducts.some(p => p.category === cat.id))
      .map(cat => (
        <Link key={cat.id} to={`/products?category=${cat.id}`} className={`np-pill ${activeCategory === cat.id ? 'np-pill--active' : ''}`}>
          <span className="np-pill__icon">{cat.icon}</span>
          {cat.label}
        </Link>
      ));
  }, [allProducts, activeCategory]);

  return (
    <>
      <SectionRenderer sections={dynamicSections} />

      <div className="np-root">
        <style>{`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,500&family=Jost:wght@300;400;500;600;700&display=swap');

:root {
  --teal:       #1a7a6e;
  --teal-dark:  #0f4f47;
  --teal-mid:   #2a9d8f;
  --teal-light: #e6f5f3;
  --teal-pale:  #f2faf9;
  --gold:       #c8a84b;
  --charcoal:   #1c2726;
  --ink:        #2d3d3b;
  --stone:      #6b8480;
  --mist:       #a8bfbc;
  --pearl:      #f7faf9;
  --white:      #ffffff;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans:  'Jost', system-ui, sans-serif;
  --ease-bounce: cubic-bezier(0.34,1.56,0.64,1);
  --ease-smooth: cubic-bezier(0.16,1,0.3,1);
}

.np-root { font-family: var(--font-sans); background: var(--pearl); min-height: 100vh; }

/* ── HEADER ── */
.np-header {
  background: linear-gradient(135deg, #0b1f1d 0%, #1a5048 55%, #0d3d35 100%);
  padding: clamp(40px,6vw,72px) clamp(20px,4vw,64px) clamp(32px,5vw,56px);
  position: relative; overflow: hidden;
}
.np-header::before {
  content: ''; position: absolute;
  top: -80px; right: -40px;
  width: 350px; height: 350px; border-radius: 50%;
  background: radial-gradient(circle, rgba(200,168,75,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.np-header::after {
  content: ''; position: absolute;
  bottom: -40px; left: 30%;
  width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.np-header__inner { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }
.np-header__eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14);
  color: rgba(170,222,205,0.9);
  border-radius: 999px; padding: 6px 16px;
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; margin-bottom: 16px;
}
.np-header__title {
  font-family: var(--font-serif);
  font-size: clamp(1.8rem, 4.5vw, 3rem);
  font-weight: 700; color: #fff; margin: 0 0 12px;
  line-height: 1.1; letter-spacing: -0.01em;
}
.np-header__sub {
  color: rgba(170,222,205,0.75); font-size: 0.92rem; line-height: 1.7;
  margin: 0 0 24px; max-width: 520px; font-weight: 300;
}
.np-header__sub strong { color: #4ade80; font-weight: 600; }
.np-header__actions { display: flex; gap: 12px; flex-wrap: wrap; }
.np-btn-wa {
  display: inline-flex; align-items: center; gap: 8px;
  background: #25D366; color: #fff; padding: 12px 22px;
  border-radius: 999px; font-weight: 600; font-size: 0.88rem;
  text-decoration: none; letter-spacing: 0.02em;
  transition: all 0.3s var(--ease-smooth);
  box-shadow: 0 8px 24px rgba(37,211,102,0.3);
}
.np-btn-wa:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(37,211,102,0.45); }
.np-btn-checkout {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(8px);
  color: rgba(255,255,255,0.85); padding: 12px 22px;
  border-radius: 999px; font-weight: 600; font-size: 0.88rem;
  text-decoration: none; transition: all 0.3s ease;
}
.np-btn-checkout:hover { background: rgba(255,255,255,0.14); color: #fff; }

/* ── MAIN ── */
.np-main { max-width: 1200px; margin: 0 auto; padding: clamp(28px,4vw,48px) clamp(20px,4vw,48px); }

/* ── SEARCH & FILTER BAR ── */
.np-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.np-search {
  position: relative; flex: 1; min-width: 200px; max-width: 400px;
}
.np-search__icon {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  font-size: 1rem; pointer-events: none; opacity: 0.5;
}
.np-search__input {
  width: 100%; padding: 12px 16px 12px 44px;
  border-radius: 999px; border: 1.5px solid rgba(26,122,110,0.18);
  background: var(--white); color: var(--charcoal);
  font-family: var(--font-sans); font-size: 0.88rem; font-weight: 400;
  outline: none; transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04); box-sizing: border-box;
}
.np-search__input:focus {
  border-color: var(--teal);
  box-shadow: 0 0 0 4px rgba(26,122,110,0.1), 0 2px 10px rgba(0,0,0,0.04);
}
.np-search__clear {
  padding: 9px 18px; border-radius: 999px;
  border: 1.5px solid rgba(26,122,110,0.2);
  background: var(--white); color: var(--stone);
  font-weight: 600; font-size: 0.8rem;
  cursor: pointer; transition: all 0.25s ease;
  white-space: nowrap;
}
.np-search__clear:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

/* ── FILTER PILLS ── */
.np-filters {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-bottom: 36px;
  padding: 16px 20px;
  background: var(--white);
  border-radius: 24px;
  border: 1.5px solid rgba(26,122,110,0.08);
  box-shadow: 0 2px 16px rgba(0,0,0,0.04);
}
.np-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 999px;
  font-size: 0.8rem; font-weight: 600;
  border: 1.5px solid rgba(26,122,110,0.15);
  color: var(--stone); background: transparent;
  text-decoration: none; transition: all 0.3s var(--ease-bounce);
  white-space: nowrap;
}
.np-pill:hover {
  background: var(--teal-light); color: var(--teal-dark);
  border-color: var(--teal-mid); transform: translateY(-1px);
}
.np-pill--active {
  background: var(--teal); color: #fff;
  border-color: var(--teal);
  box-shadow: 0 4px 16px rgba(26,122,110,0.3);
}
.np-pill--active:hover {
  background: var(--teal-dark); color: #fff;
  border-color: var(--teal-dark); transform: translateY(-1px);
}
.np-pill__icon { font-size: 0.95rem; }

/* ── CATEGORY SECTION ── */
.np-section { margin-bottom: 52px; }
.np-section__header {
  display: flex; align-items: center; gap: 16px;
  padding: 20px 24px; margin-bottom: 20px;
  background: var(--white); border-radius: 20px;
  border: 1.5px solid rgba(26,122,110,0.08);
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}
.np-section__icon {
  width: 52px; height: 52px; border-radius: 16px;
  background: var(--teal-light); display: flex; align-items: center;
  justify-content: center; font-size: 1.6rem; flex-shrink: 0;
  transition: transform 0.4s var(--ease-bounce);
}
.np-section__header:hover .np-section__icon { transform: scale(1.12) rotate(-8deg); }
.np-section__title {
  font-family: var(--font-serif); font-size: 1.4rem;
  font-weight: 700; color: var(--charcoal); margin: 0;
}
.np-section__desc { font-size: 0.75rem; color: var(--stone); margin-top: 2px; }
.np-section__count {
  margin-left: auto; background: var(--teal-light);
  color: var(--teal); font-size: 0.75rem; font-weight: 700;
  padding: 5px 14px; border-radius: 999px; white-space: nowrap;
}
.np-section__body-desc {
  background: linear-gradient(135deg, var(--teal-pale), var(--white));
  border: 1px solid rgba(26,122,110,0.08);
  border-radius: 16px; padding: 14px 18px; margin-bottom: 16px;
  font-size: 0.86rem; color: var(--stone); line-height: 1.7;
}

/* ── PRODUCT GRID ── */
.np-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
}
@media (min-width: 640px) { .np-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .np-grid { grid-template-columns: repeat(4, 1fr); } }

/* ── COMBO HEADER ── */
.np-combo-header {
  background: linear-gradient(135deg, #0b1f1d 0%, #1a5048 55%, #0d3d35 100%);
  border-radius: 24px; padding: 28px 32px; margin-bottom: 20px;
  position: relative; overflow: hidden;
}
.np-combo-header::before {
  content: ''; position: absolute;
  top: -50px; right: -30px;
  width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle, rgba(200,168,75,0.15) 0%, transparent 70%);
  pointer-events: none;
}
.np-combo-header__inner { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.np-combo-header__eyebrow { font-size: 0.65rem; color: #4ade80; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 8px; }
.np-combo-header__title { font-family: var(--font-serif); font-size: clamp(1.3rem,3vw,1.8rem); font-weight: 700; color: #fff; margin: 0 0 6px; }
.np-combo-header__sub { color: rgba(170,222,205,0.75); font-size: 0.86rem; margin: 0; }
.np-combo-header__sub strong { color: #4ade80; }
.np-combo-count {
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
  border-radius: 18px; padding: 14px 22px; text-align: center;
}
.np-combo-count__val { font-family: var(--font-serif); font-size: 2rem; font-weight: 700; color: #4ade80; display: block; }
.np-combo-count__label { font-size: 0.65rem; color: rgba(170,222,205,0.7); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }

.np-combo-tag {
  position: absolute; top: -8px; left: 16px; z-index: 10;
  border-radius: 999px; font-size: 0.63rem; font-weight: 800;
  padding: 4px 12px; letter-spacing: 0.04em;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
}

/* ── LOADING ── */
.np-loading {
  text-align: center; padding: 80px 20px;
  color: var(--teal); font-weight: 600;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.np-loading-ring {
  width: 40px; height: 40px; border-radius: 50%;
  border: 2.5px solid var(--teal-light);
  border-top-color: var(--teal);
  animation: np-spin 0.9s linear infinite;
}
@keyframes np-spin { to { transform: rotate(360deg); } }

/* ── NO RESULTS ── */
.np-empty {
  text-align: center; padding: 72px 24px;
  background: var(--white); border-radius: 28px;
  border: 1.5px solid rgba(26,122,110,0.08);
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}
.np-empty__icon { font-size: 3.5rem; margin-bottom: 18px; display: block; }
.np-empty__title { font-family: var(--font-serif); font-size: 1.5rem; font-weight: 700; color: var(--charcoal); margin: 0 0 8px; }
.np-empty__sub { color: var(--stone); font-size: 0.9rem; margin: 0 0 24px; }
.np-empty__cta {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--teal); color: #fff;
  padding: 12px 24px; border-radius: 999px;
  font-weight: 600; text-decoration: none; font-size: 0.88rem;
  transition: all 0.3s var(--ease-smooth);
}
.np-empty__cta:hover { background: var(--teal-dark); transform: translateY(-2px); }


@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.np-h-1 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
.np-h-2 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.22s both; }
.np-h-3 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.34s both; }
.np-h-4 { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.46s both; }
        `}</style>

        {/* ── HEADER ── */}
        <header className="np-header">
          <div className="np-header__inner">
            <div className="np-header__eyebrow np-h-1">🧴 Product Catalog</div>
            <h1 className="np-header__title np-h-2">Our Products</h1>
            <p className="np-header__sub np-h-3">
              Premium eco-friendly cleaning solutions for every corner of your home.
              Serving Dharmapuri & nearby areas —{' '}
              <strong>{totalProducts} products</strong> to explore.
            </p>
            <div className="np-header__actions np-h-4">
              <a href={waLink} target="_blank" rel="noreferrer" className="np-btn-wa">
                📱 Order via WhatsApp
              </a>
              <Link to="/checkout" className="np-btn-checkout">
                🛒 Go to Checkout
              </Link>
            </div>
          </div>
        </header>

        <main className="np-main">

          {/* ── SEARCH ── */}
          <Reveal>
            <div className="np-toolbar">
              <div className="np-search">
                <span className="np-search__icon">🔍</span>
                <input
                  className="np-search__input"
                  type="text"
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="np-search__clear">
                  Clear ✕
                </button>
              )}
            </div>
          </Reveal>

          {/* ── FILTER PILLS ── */}
          <Reveal delay={80}>
            <div className="np-filters">
              <Link to="/products" className={`np-pill ${activeCategory === 'all' ? 'np-pill--active' : ''}`}>
                <span className="np-pill__icon">🏠</span> All Products
              </Link>
              {categoryFilters}
              <Link to="/products?category=combo" className={`np-pill ${activeCategory === 'combo' ? 'np-pill--active' : ''}`}>
                <span className="np-pill__icon">🎁</span> Combo Deals
              </Link>
            </div>
          </Reveal>

          {/* ── PRODUCTS ── */}
          {loading ? (
            <div className="np-loading">
              <div className="np-loading-ring" />
              <span>Finding the best products for you…</span>
            </div>
          ) : (
            <>
              {displayedGroups.map((group, gIdx) => (
                <Reveal key={group.id} delay={gIdx * 60}>
                  <section className="np-section">
                    <div className="np-section__header">
                      <div className="np-section__icon">{group.icon}</div>
                      <div>
                        <h2 className="np-section__title">{group.label}</h2>
                        <div className="np-section__desc">{group.desc?.split('.')[0]}</div>
                      </div>
                      <span className="np-section__count">
                        {group.products.length} item{group.products.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {group.desc && (
                      <div className="np-section__body-desc">{group.desc}</div>
                    )}

                    <div className="np-grid">
                      {group.products.map((p, pIdx) => (
                        <Reveal key={p._id} delay={pIdx * 55}>
                          <ProductCard product={p} />
                        </Reveal>
                      ))}
                    </div>
                  </section>
                </Reveal>
              ))}

              {/* ── COMBOS ── */}
              {showCombos && combos.length > 0 && (
                <Reveal>
                  <section className="np-section">
                    <div className="np-combo-header">
                      <div className="np-combo-header__inner">
                        <div>
                          <div className="np-combo-header__eyebrow">✦ Bundle Deals</div>
                          <h2 className="np-combo-header__title">Combo Deals & Bundles</h2>
                          <p className="np-combo-header__sub">
                            Save up to <strong>38%</strong> when you bundle your favourites.
                          </p>
                        </div>
                        <div className="np-combo-count">
                          <span className="np-combo-count__val">{combos.length}</span>
                          <span className="np-combo-count__label">Bundles</span>
                        </div>
                      </div>
                    </div>

                    <div className="np-grid">
                      {combos.map((p, idx) => (
                        <Reveal key={p._id} delay={idx * 60}>
                          <div style={{ position: 'relative' }}>
                            {p.comboTag && (
                              <div className="np-combo-tag" style={{ background: p.comboColor || 'var(--teal)', color: '#fff' }}>
                                {p.comboTag}
                              </div>
                            )}
                            <ProductCard product={p} />
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  </section>
                </Reveal>
              )}

              {/* ── NO RESULTS ── */}
              {displayedGroups.length === 0 && !showCombos && (
                <Reveal>
                  <div className="np-empty">
                    <span className="np-empty__icon">🔍</span>
                    <h3 className="np-empty__title">No products found</h3>
                    <p className="np-empty__sub">
                      {searchQuery ? `No results for "${searchQuery}"` : 'No products in this category yet.'}
                    </p>
                    <Link to="/products" className="np-empty__cta">
                      View all products →
                    </Link>
                  </div>
                </Reveal>
              )}
            </>
          )}
        </main>

      </div>
    </>
  );
}