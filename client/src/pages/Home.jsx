import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { formatPrice } from '../utils/formatPrice.js';
import { WHATSAPP_NUMBER } from '../utils/constants.js';
import bannerImage from '../assets/images/banner.jpeg';
import { mockProducts, getCombos, getIndividualProducts, CATEGORIES } from '../utils/mockProducts.js';

const TRUSTS = [
  { icon: '🌿', title: 'Eco-Friendly', desc: 'Safe for families & the planet.' },
  { icon: '🛡️', title: '99.9% Germ Kill', desc: 'Clinically tested formulas.' },
  { icon: '💰', title: 'Best Price', desc: 'Combo deals save up to 38%.' },
  { icon: '🚚', title: 'Local Delivery', desc: 'Serving Dharmapuri & nearby.' },
];

const SectionHeading = ({ label, title, cta, to }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
    <div>
      <div style={{ fontSize: '0.72rem', color: 'var(--teal)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,3vw,1.7rem)', fontWeight: 800, color: 'var(--gray-800)', margin: 0 }}>{title}</h2>
    </div>
    {cta && to && (
      <Link to={to} style={{
        color: 'var(--teal-dark)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
        display: 'flex', alignItems: 'center', gap: 4, borderBottom: '2px solid var(--teal)', paddingBottom: 2,
      }}>
        {cta} →
      </Link>
    )}
  </div>
);

export default function Home() {
  const allProducts = mockProducts;
  const combos = useMemo(() => getCombos(), []);
  const individuals = useMemo(() => getIndividualProducts(), []);

  const mainCombo = combos.find(c => c._id === 'combo-complete-home') || combos[0];
  const waText = `Hello NIRAA, I want to order the Complete Home Combo. Please contact me!`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(waText)}`;

  return (
    <main className="container page">
      <style>{`
        .home-grid { display: grid; gap: 16px; }
        @media (min-width: 900px) { .home-grid { grid-template-columns: 1fr 380px; align-items: start; } }
        .trust-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (min-width: 640px) { .trust-row { grid-template-columns: repeat(4,1fr); } }
        .cat-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
        @media (min-width: 560px) { .cat-grid { grid-template-columns: repeat(3,1fr); } }
        @media (min-width: 900px) { .cat-grid { grid-template-columns: repeat(5,1fr); } }
        .prod-row { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; }
        @media (min-width: 640px) { .prod-row { grid-template-columns: repeat(3,1fr); } }
        @media (min-width: 1024px) { .prod-row { grid-template-columns: repeat(4,1fr); } }
        .combo-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 640px) { .combo-grid { grid-template-columns: repeat(2,1fr); } }
        @media (min-width: 1000px) { .combo-grid { grid-template-columns: repeat(3,1fr); } }
      `}</style>

      {/* ─── HERO ─────────────────────────────── */}
      <section className="home-grid" style={{ marginBottom: 32 }}>
        {/* Left: trust + headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <header className="page-header page-header--home" style={{ marginBottom: 0 }}>
            <div className="page-header__badge">🌿 Dharmapuri's Trusted Cleaning Brand</div>
            <div className="page-title">Clean Home,<br />Happy Family.</div>
            <div className="page-subtitle">Eco-friendly cleaning products delivering real results — for every corner of your home.</div>
            <div className="page-actions">
              <a className="btn btn--whatsapp" href={waLink} target="_blank" rel="noreferrer">Order via WhatsApp</a>
              <Link className="btn btn--ghost" to="/products">Browse All Products</Link>
            </div>
          </header>

          {/* Trust pills */}
          <div className="trust-row">
            {TRUSTS.map((t, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid rgba(42,125,114,0.12)',
                borderRadius: 16, padding: '12px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}>
                <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{t.icon}</div>
                <div style={{ fontWeight: 800, color: 'var(--teal-dark)', fontSize: '0.85rem' }}>{t.title}</div>
                <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', marginTop: 2 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Hero Combo Card */}
        {mainCombo && (
          <div style={{
            borderRadius: 22, overflow: 'hidden', position: 'relative',
            background: 'linear-gradient(145deg, #0b231f 0%, #1a4f47 100%)',
            minHeight: 380, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          }}>
            <img src={bannerImage} alt="NIRAA banner"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
            <div style={{ position: 'relative', padding: '24px 22px' }}>
              <div style={{
                display: 'inline-block', background: '#c8a84b', color: '#fff',
                borderRadius: 999, fontSize: '0.7rem', fontWeight: 800, padding: '4px 12px',
                letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10,
              }}>🏆 Best Value Deal</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>
                {mainCombo.name}
              </div>
              <div style={{ color: '#aadecd', fontSize: '0.85rem', marginBottom: 12 }}>
                {mainCombo.comboItems?.join(' • ')}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: '#4ade80' }}>
                  {formatPrice(mainCombo.price)}
                </span>
                <span style={{ textDecoration: 'line-through', color: '#7fa99e', fontSize: '1.1rem' }}>
                  {formatPrice(mainCombo.originalPrice)}
                </span>
                <span style={{ background: '#16a34a', color: '#fff', borderRadius: 999, fontSize: '0.7rem', fontWeight: 800, padding: '3px 9px' }}>
                  Save {formatPrice(mainCombo.originalPrice - mainCombo.price)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link to={`/products/${mainCombo.slug}`} style={{
                  background: 'linear-gradient(135deg, var(--teal), #1a4f47)', color: '#fff',
                  padding: '11px 18px', borderRadius: 14, fontWeight: 800, textDecoration: 'none', fontSize: '0.88rem', flex: 1, textAlign: 'center',
                }}>View Deal</Link>
                <a href={waLink} target="_blank" rel="noreferrer" style={{
                  background: '#25D366', color: '#fff',
                  padding: '11px 18px', borderRadius: 14, fontWeight: 800, textDecoration: 'none', fontSize: '0.88rem', flex: 1, textAlign: 'center',
                }}>Order Now</a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── SHOP BY CATEGORY ─────────────────── */}
      <section style={{ marginBottom: 36 }}>
        <SectionHeading label="Explore" title="Shop by Category" cta="View All" to="/products" />
        <div className="cat-grid">
          {CATEGORIES.map(cat => {
            const count = individuals.filter(p => p.category === cat.id).length;
            return (
              <Link key={cat.id} to={`/products?category=${cat.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#fff', border: '1px solid rgba(42,125,114,0.12)',
                  borderRadius: 18, padding: '18px 14px', textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.22s ease', cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(42,125,114,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>{cat.icon}</div>
                  <div style={{ fontWeight: 800, color: 'var(--gray-800)', fontSize: '0.9rem', marginBottom: 4 }}>{cat.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginBottom: 8 }}>{cat.desc}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--teal)', fontWeight: 700 }}>{count} product{count !== 1 ? 's' : ''} →</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── FLOOR CARE SECTION ───────────────── */}
      <section style={{ marginBottom: 36 }}>
        <SectionHeading label="Floor Care" title="🧹 Floor Cleaners" cta="See All Floor Care" to="/products?category=floor-cleaner" />
        <div style={{
          background: 'linear-gradient(135deg, #f0faf8, #fefcf3)',
          borderRadius: 18, padding: 16, marginBottom: 12,
          border: '1px solid rgba(42,125,114,0.1)',
        }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', margin: 0 }}>
            Our floor cleaners are safe for marble, granite, tiles and mosaic — no rinsing needed.
            Available in multiple fresh fragrances and eco-refill options.
          </p>
        </div>
        <div className="prod-row">
          {individuals.filter(p => p.category === 'floor-cleaner').slice(0, 4).map(p => (
            <ProductCard key={p._id} product={p} compact />
          ))}
        </div>
      </section>

      {/* ─── BATHROOM CARE SECTION ────────────── */}
      <section style={{ marginBottom: 36 }}>
        <SectionHeading label="Bathroom Care" title="🚿 Toilet Cleaners" cta="See All Bathroom Care" to="/products?category=toilet-cleaner" />
        <div style={{
          background: 'linear-gradient(135deg, #f0f4ff, #fff)',
          borderRadius: 18, padding: 16, marginBottom: 12,
          border: '1px solid rgba(99,102,241,0.1)',
        }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', margin: 0 }}>
            Thick gel formulas that cling under rims for deep cleaning. Kills 99.9% of germs
            and eliminates tough stains with a single application.
          </p>
        </div>
        <div className="prod-row">
          {individuals.filter(p => p.category === 'toilet-cleaner').slice(0, 4).map(p => (
            <ProductCard key={p._id} product={p} compact />
          ))}
        </div>
      </section>

      {/* ─── KITCHEN CARE SECTION ─────────────── */}
      <section style={{ marginBottom: 36 }}>
        <SectionHeading label="Kitchen Care" title="🍽️ Dish Wash Liquids" cta="See All Kitchen Care" to="/products?category=dish-wash" />
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb, #fff)',
          borderRadius: 18, padding: 16, marginBottom: 12,
          border: '1px solid rgba(200,168,75,0.15)',
        }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', margin: 0 }}>
            High-foam dish wash liquids that cut through grease effortlessly — gentle on hands,
            tough on oil. Works great even in hard water.
          </p>
        </div>
        <div className="prod-row">
          {individuals.filter(p => p.category === 'dish-wash').slice(0, 4).map(p => (
            <ProductCard key={p._id} product={p} compact />
          ))}
        </div>
      </section>

      {/* ─── LAUNDRY CARE SECTION ─────────────── */}
      <section style={{ marginBottom: 36 }}>
        <SectionHeading label="Laundry Care" title="👕 Detergents & Conditioners" cta="See All Laundry Care" to="/products?category=detergent" />
        <div style={{
          background: 'linear-gradient(135deg, #f5f3ff, #fff)',
          borderRadius: 18, padding: 16, marginBottom: 12,
          border: '1px solid rgba(124,58,237,0.1)',
        }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', margin: 0 }}>
            Powerful liquid detergents for machine & hand wash. Eco-Green variant is plant-based
            and safe for sensitive skin. Pair with our Fabric Conditioner for best results.
          </p>
        </div>
        <div className="prod-row">
          {individuals.filter(p => p.category === 'detergent').slice(0, 4).map(p => (
            <ProductCard key={p._id} product={p} compact />
          ))}
        </div>
      </section>

      {/* ─── COMBO DEALS ──────────────────────── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{
          background: 'linear-gradient(135deg, #0b231f 0%, #1e5c53 100%)',
          borderRadius: 24, padding: '28px 24px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>🎁 Special Bundles</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>Deals & Combo Offers</h2>
              <p style={{ color: '#aadecd', fontSize: '0.88rem', margin: 0 }}>Save up to 38% when you bundle your favourites together.</p>
            </div>
            <Link to="/products?category=combo" style={{
              background: '#c8a84b', color: '#fff', padding: '10px 20px',
              borderRadius: 14, fontWeight: 800, textDecoration: 'none', fontSize: '0.85rem', flexShrink: 0,
            }}>View All Combos →</Link>
          </div>
        </div>

        <div className="combo-grid">
          {combos.slice(0, 6).map(p => (
            <div key={p._id} style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', top: -10, left: 16, zIndex: 10,
                background: p.comboColor || 'var(--teal)', color: '#fff',
                borderRadius: 999, fontSize: '0.68rem', fontWeight: 800,
                padding: '3px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}>{p.comboTag || 'COMBO'}</div>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* ─── BOTTOM CTA ───────────────────────── */}
      <section style={{ marginBottom: 20 }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--teal-dark) 0%, #0b231f 100%)',
          color: '#fff', borderRadius: 22, padding: '28px 24px',
          display: 'grid', gap: 12,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 900 }}>
            Ready to order? Get it in seconds.
          </div>
          <div style={{ color: '#aadecd', fontWeight: 600, fontSize: '0.9rem' }}>
            WhatsApp ordering for Dharmapuri & nearby areas. Pay via UPI or Cash on Delivery.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={waLink} target="_blank" rel="noreferrer" style={{
              background: '#25D366', color: '#fff',
              padding: '12px 20px', borderRadius: 14, fontWeight: 800, textDecoration: 'none',
            }}>📱 Order via WhatsApp</a>
            <Link to="/products" style={{
              background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.3)',
              color: '#fff', padding: '12px 20px', borderRadius: 14, fontWeight: 800, textDecoration: 'none',
            }}>Browse All Products</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
