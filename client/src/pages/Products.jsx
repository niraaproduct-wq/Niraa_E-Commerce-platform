import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { formatPrice } from '../utils/formatPrice.js';
import { WHATSAPP_NUMBER } from '../utils/constants.js';
import { mockProducts, getIndividualProducts, getCombos, CATEGORIES } from '../utils/mockProducts.js';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const individuals = useMemo(() => getIndividualProducts(), []);
  const combos = useMemo(() => getCombos(), []);

  // Group products by category
  const grouped = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      products: individuals.filter(p => p.category === cat.id),
    })).filter(g => g.products.length > 0);
  }, [individuals]);

  // What to show based on active filter
  const showAll = activeCategory === 'all';
  const showCombos = activeCategory === 'combo' || showAll;
  const filteredGroups = showAll ? grouped : grouped.filter(g => g.id === activeCategory);

  const waText = `Hello NIRAA, I'd like to order cleaning products from your website. Please contact me.`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(waText)}`;

  return (
    <main className="container page">
      <style>{`
        .products-filter { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
        .filter-pill {
          padding: 8px 16px; border-radius: 999; font-size: 0.82rem; font-weight: 700;
          border: 1.5px solid rgba(42,125,114,0.2); background: #fff; color: var(--gray-600);
          cursor: pointer; transition: all 0.2s ease; text-decoration: none;
        }
        .filter-pill:hover { border-color: var(--teal); color: var(--teal); }
        .filter-pill--active {
          background: linear-gradient(135deg, var(--teal), var(--teal-dark)); color: #fff;
          border-color: var(--teal); box-shadow: 0 4px 12px rgba(42,125,114,0.25);
        }
        .cat-section { margin-bottom: 36px; }
        .cat-header {
          display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
          padding-bottom: 12px; border-bottom: 2px solid rgba(42,125,114,0.1);
        }
        .cat-icon { font-size: 1.8rem; }
        .cat-count {
          margin-left: auto; font-size: 0.75rem; color: var(--gray-400);
          background: var(--gray-50); padding: 4px 12px; border-radius: 999; font-weight: 600;
        }
        .cat-desc {
          background: linear-gradient(135deg, #f0faf8, #fefcf3); border-radius: 14px;
          padding: 12px 16px; margin-bottom: 14px; font-size: 0.85rem; color: var(--gray-600);
          border: 1px solid rgba(42,125,114,0.08);
        }
        .prod-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;
        }
        @media (min-width: 640px) { .prod-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .prod-grid { grid-template-columns: repeat(4, 1fr); } }
      `}</style>

      {/* Header */}
      <header className="page-header page-header--products">
        <div className="page-header__badge">Product Catalog</div>
        <div className="page-title">Our Products</div>
        <div className="page-subtitle">
          Premium eco-friendly cleaning solutions for every corner of your home.
          Serving Dharmapuri & nearby areas.
        </div>
        <div className="page-actions">
          <a className="btn btn--whatsapp" href={waLink} target="_blank" rel="noreferrer">
            Order via WhatsApp
          </a>
          <Link className="btn btn--ghost" to="/checkout">Checkout</Link>
        </div>
      </header>

      {/* Category Filter Pills */}
      <div className="products-filter">
        <Link
          to="/products"
          className={`filter-pill ${activeCategory === 'all' ? 'filter-pill--active' : ''}`}
        >
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

      {/* Category Sections */}
      {filteredGroups.map(group => (
        <section key={group.id} className="cat-section">
          <div className="cat-header">
            <span className="cat-icon">{group.icon}</span>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-800)', margin: 0 }}>
                {group.label}
              </h2>
            </div>
            <span className="cat-count">{group.products.length} product{group.products.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="cat-desc">{group.desc}</div>
          <div className="prod-grid">
            {group.products.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      ))}

      {/* Combo Section */}
      {showCombos && combos.length > 0 && (
        <section className="cat-section">
          <div style={{
            background: 'linear-gradient(135deg, #0b231f 0%, #1e5c53 100%)',
            borderRadius: 20, padding: '20px 22px', marginBottom: 16,
          }}>
            <div className="cat-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', marginBottom: 8 }}>
              <span className="cat-icon">🎁</span>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Combo Deals & Bundles
                </h2>
                <div style={{ color: '#aadecd', fontSize: '0.82rem', marginTop: 4 }}>
                  Save up to 38% when you bundle your favourites together.
                </div>
              </div>
              <span className="cat-count" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                {combos.length} bundle{combos.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="prod-grid">
            {combos.map(p => (
              <div key={p._id} style={{ position: 'relative' }}>
                {p.comboTag && (
                  <div style={{
                    position: 'absolute', top: -8, left: 14, zIndex: 10,
                    background: p.comboColor || 'var(--teal)', color: '#fff',
                    borderRadius: 999, fontSize: '0.65rem', fontWeight: 800,
                    padding: '3px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}>{p.comboTag}</div>
                )}
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* No results */}
      {filteredGroups.length === 0 && !showCombos && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-500)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>No products found in this category</div>
          <Link to="/products" style={{ color: 'var(--teal)', fontWeight: 700 }}>View all products →</Link>
        </div>
      )}
    </main>
  );
}
