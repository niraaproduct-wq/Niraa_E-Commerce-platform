import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { formatPrice } from '../utils/formatPrice.js';
import { WHATSAPP_NUMBER } from '../utils/constants.js';
import bannerImage from '../assets/images/banner.jpeg';
import { CATEGORIES } from '../utils/categories.js';
import { getProducts } from '../utils/productApi.js';
import SectionRenderer from '../components/SectionRenderer';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? (import.meta.env.VITE_API_BASE_URL.endsWith('/api') ? import.meta.env.VITE_API_BASE_URL : `${import.meta.env.VITE_API_BASE_URL}/api`)
  : '/api';

const TRUSTS = [
  { icon: '🌿', title: 'Eco-Friendly', desc: 'Safe for families & planet.', accent: '#0d7a6a' },
  { icon: '🛡️', title: '99.9% Germ Kill', desc: 'Clinically tested formulas.', accent: '#2563eb' },
  { icon: '💰', title: 'Save up to 38%', desc: 'Combo deals & bundles.', accent: '#c8a84b' },
  { icon: '🚚', title: 'Local Delivery', desc: 'Dharmapuri & nearby.', accent: '#16a34a' },
];

const TESTIMONIALS_MINI = [
  { name: 'Priya M.', text: 'Best floor cleaner in Dharmapuri! Lemon fragrance stays for hours.', stars: 5 },
  { name: 'Rajesh K.', text: 'Superb combo value! All 6 products work beautifully.', stars: 5 },
  { name: 'Meena S.', text: 'No harsh chemical smell — my bathroom has never been cleaner.', stars: 5 },
];

function AnimatedCounter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const num = parseInt(end);
        const step = Math.ceil(num / 40);
        const timer = setInterval(() => {
          start += step;
          if (start >= num) { setCount(num); clearInterval(timer); }
          else setCount(start);
        }, 30);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const SectionHeading = ({ label, title, cta, to }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
    <div>
      <div style={{
        fontSize: '0.68rem', color: 'var(--teal)', fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 5,
        display: 'flex', alignItems: 'center', gap: 6
      }}>
        <span style={{ width: 18, height: 2, background: 'var(--teal)', display: 'inline-block', borderRadius: 2 }} />
        {label}
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,3vw,1.75rem)', fontWeight: 900, color: 'var(--gray-800)', margin: 0, letterSpacing: '-0.02em' }}>{title}</h2>
    </div>
    {cta && to && (
      <Link to={to} style={{
        color: 'var(--teal-dark)', fontWeight: 700, fontSize: '0.83rem', textDecoration: 'none',
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '8px 16px', border: '1.5px solid rgba(42,125,114,0.3)', borderRadius: 999,
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--teal)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--teal-dark)'; e.currentTarget.style.borderColor = 'rgba(42,125,114,0.3)'; }}
      >
        {cta} <span style={{ fontSize: '1rem' }}>→</span>
      </Link>
    )}
  </div>
);

export default function Home() {
  const [combos, setCombos] = useState([]);
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicSections, setDynamicSections] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await getProducts({ limit: 100 });
        const prods = data?.products || [];
        setCombos(prods.filter(p => p.isCombo));
        setIndividuals(prods.filter(p => !p.isCombo));
      } catch (err) {
        console.error("Home fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSections = async () => {
      try {
        const res = await fetch(`${API_BASE}/sections/home`);
        if (res.ok) {
          const data = await res.json();
          setDynamicSections(data.sections || []);
        }
      } catch (err) {
        console.error("Home sections fetch error:", err);
      }
    };

    fetchAll();
    fetchSections();
  }, []);

  const mainCombo = combos.find(c => c._id === 'combo-complete-home') || combos[0];
  const waText = `Hello NIRAA, I want to order the Complete Home Combo. Please contact me!`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(waText)}`;

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS_MINI.length), 3500);
    return () => clearInterval(t);
  }, []);

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 600, color: 'var(--teal)' }}>Loading NIRAA Products...</div>;

  return (
    <>
      <SectionRenderer sections={dynamicSections} />
      <main className="container page">
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .home-grid { display: grid; gap: 20px; }
        @media (min-width: 900px) { .home-grid { grid-template-columns: 1fr 400px; align-items: start; } }

        .trust-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (min-width: 640px) { .trust-row { grid-template-columns: repeat(4,1fr); } }

        .trust-card {
          background: #fff;
          border: 1px solid rgba(42,125,114,0.1);
          border-radius: 20px;
          padding: 16px 14px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition: all 0.25s ease;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .trust-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 3px; height: 100%;
          background: var(--trust-accent, var(--teal));
          border-radius: 0 2px 2px 0;
          opacity: 0;
          transition: opacity 0.25s;
        }
        .trust-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(42,125,114,0.12); }
        .trust-card:hover::before { opacity: 1; }

        .cat-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
        @media (min-width: 560px) { .cat-grid { grid-template-columns: repeat(3,1fr); } }
        @media (min-width: 900px) { .cat-grid { grid-template-columns: repeat(5,1fr); } }

        .cat-card {
          background: #fff;
          border: 1px solid rgba(42,125,114,0.1);
          border-radius: 20px;
          padding: 20px 14px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          text-decoration: none;
        }
        .cat-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 16px 40px rgba(42,125,114,0.18);
          border-color: var(--teal);
          background: linear-gradient(145deg, #f0faf8, #fff);
        }

        .prod-row { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; }
        @media (min-width: 640px) { .prod-row { grid-template-columns: repeat(3,1fr); } }
        @media (min-width: 1024px) { .prod-row { grid-template-columns: repeat(4,1fr); } }

        .combo-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 640px) { .combo-grid { grid-template-columns: repeat(2,1fr); } }
        @media (min-width: 1000px) { .combo-grid { grid-template-columns: repeat(3,1fr); } }

        .section-bg {
          border-radius: 22px;
          padding: 18px 16px 16px;
          margin-bottom: 14px;
          font-size: 0.88rem;
          color: var(--gray-600);
          line-height: 1.7;
          border: 1px solid transparent;
        }

        .hero-combo-card {
          border-radius: 26px;
          overflow: hidden;
          position: relative;
          background: linear-gradient(145deg, #062019 0%, #1a4f47 100%);
          min-height: 400px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          box-shadow: 0 24px 60px rgba(6,32,25,0.4);
        }
        .hero-combo-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 70% 20%, rgba(200,168,75,0.15) 0%, transparent 60%);
          pointer-events: none;
        }

        .stat-bubble {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 14px;
          padding: 10px 14px;
          text-align: center;
          flex: 1;
        }

        .testimonial-ticker {
          background: linear-gradient(135deg, #f8fffe, #f0faf8);
          border: 1px solid rgba(42,125,114,0.15);
          border-radius: 18px;
          padding: 16px 18px;
          margin-top: 16px;
          overflow: hidden;
          position: relative;
          min-height: 80px;
        }

        .cta-banner {
          background: linear-gradient(135deg, #062019 0%, #0d7a6a 60%, #0b3d35 100%);
          position: relative;
          overflow: hidden;
        }
        .cta-banner::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: rgba(200,168,75,0.15);
          pointer-events: none;
        }
        .cta-banner::after {
          content: '';
          position: absolute;
          bottom: -40px; left: 20%;
          width: 120px; height: 120px;
          border-radius: 50%;
          background: rgba(74,222,128,0.1);
          pointer-events: none;
        }

        .wa-btn-pulse {
          animation: waPulse 2.5s ease-in-out infinite;
        }
        @keyframes waPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37,211,102,0.4); }
          50% { box-shadow: 0 0 0 10px rgba(37,211,102,0); }
        }

        .fade-in { animation: fadeSlideUp 0.5s ease both; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .combo-tag-pill {
          position: absolute; top: -8px; left: 14px; z-index: 10;
          border-radius: 999px; font-size: 0.65rem; font-weight: 800;
          padding: 3px 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .scroll-hint {
          display: flex;
          gap: 4px;
          justify-content: center;
          margin-top: 10px;
        }
        .scroll-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(42,125,114,0.25);
          transition: all 0.3s;
        }
        .scroll-dot.active { background: var(--teal); width: 18px; border-radius: 3px; }
      `}</style>

      {/* ─── HERO ─────────────────────────────── */}
      <section className="home-grid" style={{ marginBottom: 36 }}>
        {/* Left: trust + headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Badge */}
          <div style={{ marginBottom: 14 }}>
            <span style={{
              background: 'linear-gradient(135deg, #e6fff9, #d0f7ef)',
              border: '1px solid rgba(42,125,114,0.25)',
              color: '#0d7a6a',
              padding: '6px 14px', borderRadius: 999, fontSize: '0.73rem', fontWeight: 800,
              letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              🌿 Dharmapuri's Trusted Cleaning Brand
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 2.8rem)',
            fontWeight: 900,
            color: 'var(--gray-900, #111)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 14,
          }}>
            Clean Home,<br />
            <span style={{ color: 'var(--teal)', position: 'relative', display: 'inline-block' }}>
              Happy Family.
              <span style={{
                position: 'absolute', bottom: -4, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, var(--teal), transparent)',
                borderRadius: 2,
              }} />
            </span>
          </h1>

          <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 460, marginBottom: 20 }}>
            Eco-friendly cleaning products delivering real results — for every corner of your home. Scientifically formulated, locally delivered.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            <a href={waLink} target="_blank" rel="noreferrer" className="wa-btn-pulse" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#25D366', color: '#fff',
              padding: '13px 22px', borderRadius: 14, fontWeight: 800, fontSize: '0.9rem',
              textDecoration: 'none', boxShadow: '0 8px 24px rgba(37,211,102,0.3)',
            }}>
              <span style={{ fontSize: '1.1rem' }}>📱</span> Order via WhatsApp
            </a>
            <Link to="/products" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#fff', color: 'var(--teal-dark)',
              padding: '13px 22px', borderRadius: 14, fontWeight: 800, fontSize: '0.9rem',
              textDecoration: 'none', border: '2px solid rgba(42,125,114,0.2)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.background = '#f0faf8'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(42,125,114,0.2)'; e.currentTarget.style.background = '#fff'; }}
            >
              Browse Products →
            </Link>
          </div>

          {/* Trust pills */}
          <div className="trust-row">
            {TRUSTS.map((t, i) => (
              <div key={i} className="trust-card" style={{ '--trust-accent': t.accent }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{t.icon}</div>
                <div style={{ fontWeight: 800, color: 'var(--gray-800)', fontSize: '0.82rem', marginBottom: 2 }}>{t.title}</div>
                <div style={{ color: 'var(--gray-500)', fontSize: '0.72rem', lineHeight: 1.4 }}>{t.desc}</div>
              </div>
            ))}
          </div>

          {/* Testimonial ticker */}
          <div className="testimonial-ticker">
            <div style={{ fontSize: '0.7rem', color: 'var(--teal)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              ⭐ Real Reviews
            </div>
            <div key={activeTestimonial} className="fade-in" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--teal), #0d7a6a)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '0.8rem', flexShrink: 0,
              }}>
                {TESTIMONIALS_MINI[activeTestimonial].name[0]}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 1, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= TESTIMONIALS_MINI[activeTestimonial].stars ? '#f59e0b' : '#e5e7eb', fontSize: '0.7rem' }}>★</span>)}
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--gray-700)', lineHeight: 1.5, fontStyle: 'italic' }}>
                  "{TESTIMONIALS_MINI[activeTestimonial].text}"
                </p>
                <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: 4, fontWeight: 700 }}>
                  — {TESTIMONIALS_MINI[activeTestimonial].name}
                </div>
              </div>
            </div>
            <div className="scroll-hint">
              {TESTIMONIALS_MINI.map((_, i) => <div key={i} className={`scroll-dot ${i === activeTestimonial ? 'active' : ''}`} />)}
            </div>
          </div>
        </div>

        {/* Right: Hero Combo Card */}
        {mainCombo && (
          <div className="hero-combo-card">
            <img src={bannerImage} alt="NIRAA products"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28, mixBlendMode: 'luminosity' }} />

            {/* Floating stats */}
            <div style={{
              position: 'absolute', top: 20, right: 16,
              background: 'rgba(22,163,74,0.9)',
              backdropFilter: 'blur(8px)',
              borderRadius: 12, padding: '8px 12px',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 800 }}>⚡ BEST SELLER</span>
            </div>

            <div style={{ position: 'relative', padding: '0 22px 28px' }}>
              {/* Stats row */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[{ v: '500+', l: 'Families' }, { v: '4.6★', l: 'Rating' }, { v: '38%', l: 'Savings' }].map((s, i) => (
                  <div key={i} className="stat-bubble">
                    <div style={{ color: '#4ade80', fontWeight: 900, fontSize: '1rem', fontFamily: 'var(--font-display)' }}>{s.v}</div>
                    <div style={{ color: '#aadecd', fontSize: '0.65rem', fontWeight: 600 }}>{s.l}</div>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'inline-block', background: 'linear-gradient(135deg, #c8a84b, #d4a843)',
                color: '#fff', borderRadius: 999, fontSize: '0.68rem', fontWeight: 800,
                padding: '4px 12px', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12,
                boxShadow: '0 4px 12px rgba(200,168,75,0.4)',
              }}>🏆 Best Value Deal</div>

              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 8, letterSpacing: '-0.02em' }}>
                {mainCombo.name}
              </div>
              <div style={{ color: '#aadecd', fontSize: '0.8rem', marginBottom: 16, lineHeight: 1.5 }}>
                {mainCombo.comboItems?.slice(0, 4).join(' • ')}{mainCombo.comboItems?.length > 4 ? ` +${mainCombo.comboItems.length - 4} more` : ''}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#4ade80', letterSpacing: '-0.04em' }}>
                  {formatPrice(mainCombo.price)}
                </span>
                <span style={{ textDecoration: 'line-through', color: '#6aa99e', fontSize: '1rem' }}>
                  {formatPrice(mainCombo.originalPrice)}
                </span>
                <span style={{
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#fff', borderRadius: 999, fontSize: '0.68rem', fontWeight: 900,
                  padding: '4px 10px', boxShadow: '0 4px 12px rgba(22,163,74,0.4)',
                }}>
                  Save {formatPrice(mainCombo.originalPrice - mainCombo.price)}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Link to={`/products/${mainCombo.slug}`} style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  padding: '12px 16px', borderRadius: 14, fontWeight: 800,
                  textDecoration: 'none', fontSize: '0.85rem', flex: 1, textAlign: 'center',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                >View Deal</Link>
                <a href={waLink} target="_blank" rel="noreferrer" style={{
                  background: '#25D366',
                  color: '#fff',
                  padding: '12px 16px', borderRadius: 14, fontWeight: 800,
                  textDecoration: 'none', fontSize: '0.85rem', flex: 1, textAlign: 'center',
                  boxShadow: '0 8px 20px rgba(37,211,102,0.35)',
                }}>Order Now</a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── SHOP BY CATEGORY ─────────────────── */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeading label="Explore" title="Shop by Category" cta="View All" to="/products" />
        <div className="cat-grid">
          {CATEGORIES.map((cat, idx) => {
            const count = individuals.filter(p => p.category === cat.id).length;
            return (
              <Link key={cat.id} to={`/products?category=${cat.id}`} className="cat-card">
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>{cat.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--gray-800)', fontSize: '0.85rem', marginBottom: 4 }}>{cat.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--teal)', fontWeight: 700, background: 'rgba(42,125,114,0.08)', borderRadius: 999, padding: '2px 8px', display: 'inline-block' }}>
                  {count} products
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── PRODUCT SECTIONS ─────────────────── */}
      {[
        { cat: 'detergent', label: 'Laundry Care', title: '👕 Detergents & Conditioners', to: '/products?category=detergent', bg: 'linear-gradient(135deg, #f5f3ff, #fff)', border: 'rgba(124,58,237,0.1)', desc: 'Powerful liquid detergents for machine & hand wash. Eco-Green variant is plant-based and safe for sensitive skin.' },
        { cat: 'floor-cleaner', label: 'Floor Care', title: '🧹 Floor Cleaners', to: '/products?category=floor-cleaner', bg: 'linear-gradient(135deg, #f0faf8, #fefcf3)', border: 'rgba(42,125,114,0.1)', desc: 'Safe for marble, granite, tiles and mosaic — no rinsing needed. Available in multiple fresh fragrances and eco-refill options.' },
        { cat: 'toilet-cleaner', label: 'Bathroom Care', title: '🚿 Toilet Cleaners', to: '/products?category=toilet-cleaner', bg: 'linear-gradient(135deg, #eff6ff, #fff)', border: 'rgba(99,102,241,0.1)', desc: 'Thick gel formulas that cling under rims for deep cleaning. Kills 99.9% of germs with a single application.' },
        { cat: 'dish-wash', label: 'Kitchen Care', title: '🍽️ Dish Wash Liquids', to: '/products?category=dish-wash', bg: 'linear-gradient(135deg, #fffbeb, #fff)', border: 'rgba(200,168,75,0.15)', desc: 'High-foam dish wash liquids that cut through grease effortlessly — gentle on hands, tough on oil.' },
      ].map(({ cat, label, title, to, bg, border, desc }) => (
        <section key={cat} style={{ marginBottom: 40 }}>
          <SectionHeading label={label} title={title} cta={`See All ${label}`} to={to} />
          <div className="section-bg" style={{ background: bg, borderColor: border }}>
            {desc}
          </div>
          <div className="prod-row">
            {individuals.filter(p => p.category === cat).slice(0, 4).map(p => (
              <ProductCard key={p._id} product={p} compact />
            ))}
          </div>
        </section>
      ))}

      {/* ─── COMBO DEALS ──────────────────────── */}
      <section style={{ marginBottom: 40 }}>
        <div style={{
          background: 'linear-gradient(135deg, #062019 0%, #1e5c53 60%, #0b3d35 100%)',
          borderRadius: 28, padding: '28px 24px', marginBottom: 22,
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(6,32,25,0.3)',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -40, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(200,168,75,0.12)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: '30%', width: 100, height: 100, borderRadius: '50%', background: 'rgba(74,222,128,0.08)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 16, height: 2, background: '#4ade80', borderRadius: 2, display: 'inline-block' }} />
                🎁 Special Bundles
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,3vw,1.9rem)', fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Deals & Combo Offers
              </h2>
              <p style={{ color: '#aadecd', fontSize: '0.88rem', margin: 0, maxWidth: 400 }}>
                Save up to <strong style={{ color: '#4ade80' }}>38%</strong> when you bundle your favourites together.
              </p>
            </div>
            <Link to="/products?category=combo" style={{
              background: 'linear-gradient(135deg, #c8a84b, #d4a843)',
              color: '#fff', padding: '12px 22px',
              borderRadius: 14, fontWeight: 800, textDecoration: 'none', fontSize: '0.85rem',
              boxShadow: '0 8px 24px rgba(200,168,75,0.35)', flexShrink: 0,
            }}>View All Combos →</Link>
          </div>
        </div>

        <div className="combo-grid">
          {combos.slice(0, 6).map(p => (
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

      {/* ─── STATS STRIP ──────────────────────── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{
          background: 'linear-gradient(135deg, #f0faf8, #fefcf3)',
          border: '1px solid rgba(42,125,114,0.12)',
          borderRadius: 24, padding: '28px 24px',
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20,
        }}>
          {[
            { num: '500', suffix: '+', label: 'Happy Families', icon: '👨‍👩‍👧‍👦' },
            { num: '12', suffix: '+', label: 'Products', icon: '🧴' },
            { num: '99', suffix: '.9%', label: 'Germ Kill Rate', icon: '🛡️' },
            { num: '6', suffix: 'hrs', label: 'Local Delivery', icon: '🚚' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '12px 8px' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--teal-dark)', lineHeight: 1 }}>
                <AnimatedCounter end={s.num} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BOTTOM CTA ───────────────────────── */}
      <section style={{ marginBottom: 20 }}>
        <div className="cta-banner" style={{
          color: '#fff', borderRadius: 26, padding: '36px 28px',
          display: 'grid', gap: 16, boxShadow: '0 24px 60px rgba(6,32,25,0.3)',
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
              ⚡ Ready to Order?
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 10 }}>
              Get it delivered in seconds.
            </div>
            <div style={{ color: '#aadecd', fontWeight: 500, fontSize: '0.92rem', marginBottom: 22, maxWidth: 480, lineHeight: 1.6 }}>
              WhatsApp ordering for Dharmapuri & nearby areas. Pay via UPI or Cash on Delivery. No fuss, just clean.
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={waLink} target="_blank" rel="noreferrer" className="wa-btn-pulse" style={{
                background: '#25D366', color: '#fff',
                padding: '14px 26px', borderRadius: 16, fontWeight: 800,
                textDecoration: 'none', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: '1.2rem' }}>📱</span> Order via WhatsApp
              </a>
              <Link to="/products" style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                color: '#fff', padding: '14px 26px', borderRadius: 16,
                fontWeight: 800, textDecoration: 'none', fontSize: '0.95rem',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                Browse All Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}