import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { WHATSAPP_NUMBER } from '../utils/constants.js';
import bannerImage from '../assets/images/banner.jpeg';
import { CATEGORIES } from '../utils/categories.js';
import SectionRenderer from '../components/SectionRenderer';
import { useRealtime } from '../context/RealtimeContext.jsx';
import { useFirestoreProducts } from '../hooks/useFirestoreProducts';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? (import.meta.env.VITE_API_BASE_URL.endsWith('/api') ? import.meta.env.VITE_API_BASE_URL : `${import.meta.env.VITE_API_BASE_URL}/api`)
  : '/api';

const TRUSTS = [
  { icon: '🌿', title: 'Eco-Friendly', desc: 'Safe for families & planet.', accent: '#2a9d8f' },
  { icon: '🛡️', title: '99.9% Germ Kill', desc: 'Clinically tested formulas.', accent: '#2563eb' },
  { icon: '💰', title: 'Save up to 38%', desc: 'Combo deals & bundles.', accent: '#d4a843' },
  { icon: '🚚', title: 'Local Delivery', desc: 'Dharmapuri & nearby.', accent: '#16a34a' },
];

const TESTIMONIALS = [
  { name: 'Priya M.', text: 'Best floor cleaner in Dharmapuri! Lemon fragrance stays for hours.', stars: 5, avatar: 'PM' },
  { name: 'Rajesh K.', text: 'Superb combo value! All 6 products work beautifully together.', stars: 5, avatar: 'RK' },
  { name: 'Meena S.', text: 'No harsh chemical smell — my bathroom has never been this clean.', stars: 5, avatar: 'MS' },
  { name: 'Anitha V.', text: 'I love how eco-friendly these are. Great for kids and pets too!', stars: 5, avatar: 'AV' },
];

/* ─── ANIMATED COUNTER ─── */
function AnimatedCounter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const num = parseInt(end);
        const step = Math.ceil(num / 50);
        const timer = setInterval(() => {
          start += step;
          if (start >= num) { setCount(num); clearInterval(timer); }
          else setCount(start);
        }, 25);
        observer.disconnect();
      }
    }, { threshold: 0.01 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── SCROLL REVEAL HOOK ─── */
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

/* ─── REVEAL WRAPPER ─── */
function Reveal({ children, delay = 0, direction = 'up', className = '', style = {} }) {
  const [ref, visible] = useScrollReveal();
  const transforms = { up: 'translateY(32px)', down: 'translateY(-32px)', left: 'translateX(32px)', right: 'translateX(-32px)' };
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : (transforms[direction] || transforms.up),
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      ...style
    }}>
      {children}
    </div>
  );
}

/* ─── SECTION HEADING ─── */
const SectionHeading = ({ label, title, cta, to }) => (
  <div className="niraa-section-heading">
    <div>
      <div className="niraa-label">{label}</div>
      <h2 className="niraa-h2">{title}</h2>
    </div>
    {cta && to && (
      <Link to={to} className="niraa-cta-link">
        {cta} <span className="niraa-cta-arrow">→</span>
      </Link>
    )}
  </div>
);

export default function Home() {
  const [combos, setCombos] = useState([]);
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicSections, setDynamicSections] = useState([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  const { products: liveProducts, loading: liveLoading } = useFirestoreProducts();
  const { lastEvent } = useRealtime();

  useEffect(() => {
    setCombos(liveProducts.filter(p => p.productType === 'combo' || p.isCombo));
    setIndividuals(liveProducts.filter(p => p.productType !== 'combo' && !p.isCombo));
    if (!liveLoading) setLoading(false);
  }, [liveProducts, liveLoading]);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/sections/home`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setDynamicSections(d.sections || []))
      .catch(() => { });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
    });
  }, []);

  const waText = `Hello NIRAA, I want to order the Complete Home Combo. Please contact me!`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(waText)}`;

  const categoryMetadata = useMemo(() => {
    const dynamicCats = [...new Set(liveProducts.map(p => p.category))].filter(c => c && c !== 'combo');
    const merged = [...CATEGORIES];
    dynamicCats.forEach(catId => {
      if (!merged.find(c => c.id === catId)) {
        merged.push({ id: catId, label: catId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), icon: '🧴', desc: 'Premium cleaning solutions.' });
      }
    });
    return merged;
  }, [liveProducts]);

  const categoryList = useMemo(() => categoryMetadata.map((cat, idx) => {
    const count = liveProducts.filter(p => p.category === cat.id).length;
    if (!count) return null;
    return (
      <Reveal key={cat.id} delay={idx * 60}>
        <Link to={`/products?category=${cat.id}`} className="niraa-cat-card">
          <div className="niraa-cat-icon">{cat.icon}</div>
          <div className="niraa-cat-name">{cat.label}</div>
          <div className="niraa-cat-count">{count} products</div>
          <div className="niraa-cat-arrow">→</div>
        </Link>
      </Reveal>
    );
  }).filter(Boolean), [categoryMetadata, liveProducts]);

  const groupedSections = useMemo(() => categoryMetadata.map(cat => {
    const catProducts = individuals.filter(p => p.category === cat.id);
    if (!catProducts.length) return null;
    return { ...cat, products: catProducts.slice(0, 4) };
  }).filter(Boolean), [categoryMetadata, individuals]);

  if (loading) return (
    <div className="niraa-loading">
      <div className="niraa-loading-ring" />
      <span>Preparing your NIRAA experience…</span>
    </div>
  );

  return (
    <>
      <SectionRenderer sections={dynamicSections} />
      <div className="niraa-home">
        <style>{`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Jost:wght@300;400;500;600;700&display=swap');

:root {
  --teal:        #1a7a6e;
  --teal-dark:   #0f4f47;
  --teal-mid:    #2a9d8f;
  --teal-light:  #e6f5f3;
  --teal-pale:   #f2faf9;
  --gold:        #c8a84b;
  --gold-light:  #fdf8ec;
  --gold-pale:   #fffdf5;
  --charcoal:    #1c2726;
  --ink:         #2d3d3b;
  --stone:       #6b8480;
  --mist:        #a8bfbc;
  --pearl:       #f7faf9;
  --white:       #ffffff;
  --font-serif:  'Cormorant Garamond', Georgia, serif;
  --font-sans:   'Jost', system-ui, sans-serif;
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
}

.niraa-home { font-family: var(--font-sans); background: var(--pearl); color: var(--ink); }

/* ── LOADING ── */
.niraa-loading {
  min-height: 80vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 20px;
  font-family: var(--font-sans); font-size: 1rem; color: var(--teal);
  font-weight: 500; letter-spacing: 0.05em;
}
.niraa-loading-ring {
  width: 48px; height: 48px; border-radius: 50%;
  border: 2.5px solid var(--teal-light);
  border-top-color: var(--teal);
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════
   HERO — Light 2-column layout (original)
   with enhanced animations
══════════════════════════════════════════ */
.niraa-hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 28px;
  background: var(--pearl);
  padding: clamp(36px, 6vw, 72px) clamp(16px, 4vw, 48px) clamp(28px, 4vw, 56px);
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}
@media (min-width: 900px) {
  .niraa-hero {
    grid-template-columns: 1fr 460px;
    gap: 48px;
    align-items: start;
  }
}

/* subtle background texture for hero */
.niraa-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 10% 20%, rgba(42,157,143,0.07) 0%, transparent 55%),
    radial-gradient(ellipse at 90% 80%, rgba(200,168,75,0.05) 0%, transparent 50%);
  pointer-events: none;
}

.niraa-hero__left {
  display: flex;
  flex-direction: column;
  gap: 22px;
  position: relative;
  z-index: 1;
}

/* badge */
.niraa-hero__badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(26,122,110,0.07);
  border: 1px solid rgba(26,122,110,0.18);
  color: var(--teal);
  border-radius: 999px; padding: 8px 18px;
  font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  width: fit-content;
  backdrop-filter: blur(4px);
}
.niraa-hero__badge-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34,197,94,0.5);
  animation: badge-pulse 2s ease-in-out infinite;
}
@keyframes badge-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
  50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
}

/* headline */
.niraa-hero__headline {
  font-family: var(--font-serif);
  font-size: clamp(2.8rem, 5.5vw, 4.6rem);
  font-weight: 600;
  line-height: 1.06;
  color: var(--charcoal);
  margin: 0;
  letter-spacing: -0.02em;
}
.niraa-hero__headline em {
  font-style: italic;
  color: var(--teal-mid);
}
.niraa-hero__headline .gold {
  color: var(--gold);
  position: relative;
}
/* subtle underline shimmer on gold word */
.niraa-hero__headline .gold::after {
  content: '';
  position: absolute;
  bottom: 2px; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--gold), transparent);
  border-radius: 1px;
  opacity: 0.5;
}

/* sub */
.niraa-hero__sub {
  font-size: clamp(0.9rem, 1.4vw, 1.02rem);
  color: var(--stone); line-height: 1.8;
  font-weight: 400; max-width: 430px; margin: 0;
}

/* action buttons */
.niraa-hero__actions {
  display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
}

.niraa-btn-primary {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--teal); color: #fff;
  padding: 13px 28px; border-radius: 14px;
  font-family: var(--font-sans); font-weight: 700;
  font-size: 0.9rem; text-decoration: none;
  transition: all 0.35s var(--ease-smooth);
  box-shadow: 0 6px 22px rgba(26,122,110,0.28);
  position: relative; overflow: hidden;
}
.niraa-btn-primary::after {
  content: '';
  position: absolute; inset: 0;
  background: rgba(255,255,255,0);
  transition: background 0.3s;
}
.niraa-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(26,122,110,0.38);
  background: var(--teal-mid);
}
.niraa-btn-primary:hover::after { background: rgba(255,255,255,0.06); }

.niraa-btn-wa {
  display: inline-flex; align-items: center; gap: 10px;
  background: #25D366; color: #fff;
  padding: 13px 22px; border-radius: 14px;
  font-family: var(--font-sans); font-weight: 800;
  font-size: 0.9rem; text-decoration: none;
  box-shadow: 0 8px 24px rgba(37,211,102,0.3);
  animation: wa-glow 2.5s ease-in-out infinite;
  transition: transform 0.2s;
}
.niraa-btn-wa:hover { transform: translateY(-2px); }
@keyframes wa-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(37,211,102,0.4); }
  50%       { box-shadow: 0 0 0 10px rgba(37,211,102,0); }
}

/* trust cards */
.orig-trust-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (min-width: 560px) {
  .orig-trust-row { grid-template-columns: repeat(4, 1fr); }
}
.orig-trust-card {
  background: #fff;
  border: 1px solid rgba(42,125,114,0.1);
  border-radius: 20px; padding: 16px 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  transition: all 0.32s var(--ease-smooth);
  cursor: default; position: relative; overflow: hidden;
}
.orig-trust-card::before {
  content: ''; position: absolute; top: 0; left: 0;
  width: 3px; height: 100%;
  background: var(--trust-accent, var(--teal));
  border-radius: 0 2px 2px 0;
  opacity: 0; transition: opacity 0.25s;
}
.orig-trust-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 14px 36px rgba(42,125,114,0.13);
}
.orig-trust-card:hover::before { opacity: 1; }
.orig-trust-icon {
  font-size: 1.45rem; margin-bottom: 7px; display: block;
  transition: transform 0.35s var(--ease-bounce);
}
.orig-trust-card:hover .orig-trust-icon { transform: scale(1.2) rotate(-6deg); }
.orig-trust-title { font-weight: 700; font-size: 0.79rem; color: var(--charcoal); margin-bottom: 3px; }
.orig-trust-desc  { font-size: 0.69rem; color: var(--stone); line-height: 1.4; }

/* testimonial ticker */
.orig-ticker {
  background: linear-gradient(135deg, #f3fffe, #eaf7f4);
  border: 1px solid rgba(42,125,114,0.14);
  border-radius: 18px; padding: 15px 18px;
  overflow: hidden; position: relative; min-height: 76px;
}
.orig-ticker-slide {
  display: none;
  align-items: flex-start; gap: 12px;
  animation: testi-in 0.55s var(--ease-smooth);
}
.orig-ticker-slide.active { display: flex; }
@keyframes testi-in {
  from { opacity: 0; transform: translateX(18px); }
  to   { opacity: 1; transform: translateX(0); }
}
.orig-ticker-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--teal); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.68rem; flex-shrink: 0;
}
.orig-ticker-text {
  font-size: 0.77rem; color: var(--charcoal);
  font-style: italic; line-height: 1.55;
}
.orig-ticker-meta {
  font-size: 0.64rem; color: var(--teal);
  font-weight: 700; margin-top: 5px;
  font-style: normal;
}

/* hero image (right column) */
.niraa-hero__image {
  border-radius: 32px; overflow: hidden;
  position: relative;
  min-height: 500px;
  box-shadow: 0 28px 70px rgba(26,122,110,0.16), 0 8px 24px rgba(0,0,0,0.08);
  transition: transform 0.45s var(--ease-smooth), box-shadow 0.45s var(--ease-smooth);
  z-index: 1;
}
@media (max-width: 899px) {
  .niraa-hero__image {
    min-height: 320px;
    border-radius: 24px;
    margin-top: 12px;
  }
}
.niraa-hero__image:hover {
  transform: translateY(-6px);
  box-shadow: 0 40px 90px rgba(26,122,110,0.22), 0 12px 32px rgba(0,0,0,0.1);
}
.niraa-hero__image img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform 6s ease;
}
.niraa-hero__image:hover img { transform: scale(1.04); }
.niraa-hero__image-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%);
}

/* --- Hero Combo Card Overlays --- */
.hero-combo-badge-top {
  position: absolute; top: 20px; right: 20px;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(8px);
  padding: 6px 14px; border-radius: 99px;
  font-size: 0.72rem; font-weight: 700; color: var(--charcoal);
  display: flex; align-items: center; gap: 7px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 2;
  animation: fadeIn 0.8s ease 0.6s both;
}
.hero-combo-badge-dot {
  width: 7px; height: 7px; background: #22c55e; border-radius: 50%;
  animation: badge-pulse 2s ease-in-out infinite;
}

.hero-combo-content {
  position: absolute; 
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 clamp(20px, 5vw, 36px);
  z-index: 2; color: #fff;
  animation: fadeUp 0.8s var(--ease-smooth) 0.4s both;
}
.hero-combo-label {
  background: #f59e0b; color: #fff;
  font-size: 0.68rem; font-weight: 800;
  padding: 4px 12px; border-radius: 6px;
  display: inline-flex; align-items: center; gap: 6px; margin-bottom: 12px;
  letter-spacing: 0.04em;
  box-shadow: 0 4px 10px rgba(245,158,11,0.3);
  width: fit-content;
}
.hero-combo-title {
  font-family: var(--font-serif); font-size: clamp(1.5rem, 3.5vw, 2rem);
  font-weight: 700; margin: 0 0 4px 0; line-height: 1.1;
  text-shadow: 0 2px 15px rgba(0,0,0,0.4);
}
.hero-combo-price {
  font-size: clamp(1.4rem, 2.5vw, 1.8rem); font-weight: 800; color: #fff; margin-bottom: 16px;
  font-family: var(--font-sans);
  display: flex; align-items: center; gap: 8px;
}
.hero-combo-price::before {
  content: '₹'; font-size: 0.7em; opacity: 0.9; font-weight: 400;
}
.hero-combo-actions {
  display: flex; gap: 10px; margin-top: 4px;
}
.hero-combo-btn-outline {
  padding: 10px 18px; border: 1.5px solid rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.1); backdrop-filter: blur(12px);
  color: #fff; border-radius: 12px; font-weight: 600; font-size: 0.8rem;
  text-decoration: none; transition: all 0.3s var(--ease-smooth);
}
.hero-combo-btn-outline:hover { background: rgba(255,255,255,0.25); border-color: #fff; transform: translateY(-2px); }

.hero-combo-btn-solid {
  padding: 10px 18px; background: #22c55e; color: #fff;
  border-radius: 12px; font-weight: 700; font-size: 0.8rem;
  text-decoration: none; box-shadow: 0 6px 20px rgba(34,197,94,0.35);
  transition: all 0.3s var(--ease-smooth);
  display: inline-flex; align-items: center; justify-content: center;
}
.hero-combo-btn-solid:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(34,197,94,0.45); background: #1eb852; }

.hero-combo-footer {
  position: absolute; bottom: 28px; left: clamp(20px, 5vw, 36px); right: clamp(20px, 5vw, 36px);
  display: flex; justify-content: space-between; align-items: flex-end;
  z-index: 2;
  animation: fadeIn 1s ease 0.8s both;
}
.hero-combo-promise .promise-label {
  font-size: 0.62rem; font-weight: 800; color: rgba(255,255,255,0.7);
  letter-spacing: 0.12em; margin-bottom: 5px;
}
.hero-combo-promise .promise-text {
  font-size: 0.95rem; font-weight: 700; color: #fff; line-height: 1.35;
}
.hero-combo-stats {
  display: flex; gap: 12px;
}
.hero-stat-box {
  background: rgba(255,255,255,0.12); backdrop-filter: blur(12px);
  padding: 10px 14px; border-radius: 14px; text-align: center;
  border: 1px solid rgba(255,255,255,0.12); min-width: 75px;
}
.hero-stat-val { font-size: 1rem; font-weight: 800; color: #fff; }
.hero-stat-label { font-size: 0.58rem; font-weight: 700; color: rgba(255,255,255,0.75); margin-top: 2px; text-transform: uppercase; }

/* ── staggered hero animations ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96) translateY(18px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes slideRight {
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
}

.hero-animate-1   { animation: slideRight 0.7s var(--ease-smooth) 0.05s both; }
.hero-animate-2   { animation: fadeUp    0.8s var(--ease-smooth) 0.18s both; }
.hero-animate-3   { animation: fadeUp    0.8s var(--ease-smooth) 0.32s both; }
.hero-animate-4   { animation: fadeUp    0.8s var(--ease-smooth) 0.46s both; }
.hero-animate-5   { animation: fadeUp    0.8s var(--ease-smooth) 0.60s both; }
.hero-animate-6   { animation: fadeUp    0.8s var(--ease-smooth) 0.74s both; }
.hero-animate-img { animation: fadeIn    1.1s var(--ease-smooth) 0.08s both; }

/* ── TRUST STRIP ── */
.niraa-trust {
  background: var(--white);
  border-top: 1px solid rgba(26,122,110,0.08);
  border-bottom: 1px solid rgba(26,122,110,0.08);
  padding: 28px 0;
}
.niraa-trust__inner {
  max-width: 1200px; margin: 0 auto;
  padding: 0 clamp(16px, 4vw, 48px);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
}
@media (min-width: 640px) {
  .niraa-trust__inner { grid-template-columns: repeat(4, 1fr); }
}
.niraa-trust__item {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 20px;
  transition: background 0.25s ease;
}
.niraa-trust__item:hover { background: var(--teal-pale); border-radius: 16px; }
.niraa-trust__icon {
  width: 44px; height: 44px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; flex-shrink: 0;
  background: var(--teal-light); transition: transform 0.3s var(--ease-bounce);
}
.niraa-trust__item:hover .niraa-trust__icon { transform: scale(1.12) rotate(-5deg); }
.niraa-trust__title { font-size: 0.85rem; font-weight: 700; color: var(--charcoal); }
.niraa-trust__desc { font-size: 0.73rem; color: var(--stone); font-weight: 400; margin-top: 2px; }

/* ── PAGE CONTAINER ── */
.niraa-container {
  max-width: 1200px; margin: 0 auto;
  padding: 0 clamp(16px, 4vw, 48px);
}
.niraa-section { margin: 64px 0; }

/* ── SECTION HEADING ── */
.niraa-section-heading {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
}
.niraa-label {
  font-size: 0.68rem; font-weight: 700; color: var(--teal);
  text-transform: uppercase; letter-spacing: 0.16em;
  display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
}
.niraa-label::before {
  content: ''; width: 24px; height: 1.5px;
  background: var(--teal); border-radius: 1px; display: block;
}
.niraa-h2 {
  font-family: var(--font-serif); font-size: clamp(1.5rem, 3vw, 2.2rem);
  font-weight: 600; color: var(--charcoal); margin: 0;
  letter-spacing: -0.01em; line-height: 1.2;
}
.niraa-cta-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.83rem; font-weight: 600; color: var(--teal);
  text-decoration: none; padding: 9px 20px;
  border: 1.5px solid rgba(26,122,110,0.25); border-radius: 999px;
  transition: all 0.3s ease; white-space: nowrap;
}
.niraa-cta-link:hover { background: var(--teal); color: #fff; border-color: var(--teal); }

/* --- Combo Header (from Products page) --- */
.niraa-combo-banner {
  background: linear-gradient(135deg, #0b1f1d 0%, #1a5048 55%, #0d3d35 100%);
  border-radius: 28px; padding: clamp(24px, 5vw, 40px) clamp(20px, 5vw, 48px);
  margin-bottom: 32px; position: relative; overflow: hidden;
  box-shadow: 0 20px 50px rgba(11,31,29,0.25);
}
.niraa-combo-banner::before {
  content: ''; position: absolute;
  top: -60px; right: -40px;
  width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle, rgba(200,168,75,0.18) 0%, transparent 70%);
  pointer-events: none;
}
.niraa-combo-banner__inner {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 24px;
}
.niraa-combo-banner__eyebrow {
  font-size: 0.7rem; color: #4ade80; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.16em; margin-bottom: 10px;
  display: flex; align-items: center; gap: 8px;
}
.niraa-combo-banner__title {
  font-family: var(--font-serif); font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 700; color: #fff; margin: 0 0 8px; line-height: 1.2;
}
.niraa-combo-banner__sub {
  color: rgba(170,222,205,0.8); font-size: 0.95rem; margin: 0;
  max-width: 480px; line-height: 1.6;
}
.niraa-combo-banner__sub strong { color: #4ade80; font-weight: 600; }
.niraa-combo-banner__count {
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(8px); border-radius: 24px;
  padding: 20px 32px; text-align: center; min-width: 140px;
}
.niraa-combo-banner__count-val {
  font-family: var(--font-serif); font-size: 2.5rem;
  font-weight: 700; color: #4ade80; display: block; line-height: 1;
}
.niraa-combo-banner__count-label {
  font-size: 0.7rem; color: rgba(170,222,205,0.75);
  font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
  margin-top: 6px; display: block;
}
.niraa-combo-banner__cta {
  margin-top: 24px; display: inline-flex;
}
@media (max-width: 600px) {
  .niraa-combo-banner__inner { justify-content: center; text-align: center; }
  .niraa-combo-banner__eyebrow { justify-content: center; }
  .niraa-combo-banner__count { width: 100%; }
}
.niraa-cta-arrow { transition: transform 0.3s; }
.niraa-cta-link:hover .niraa-cta-arrow { transform: translateX(3px); }

/* ── CATEGORY GRID ── */
.niraa-cat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); gap: 14px;
}
@media (min-width: 560px) { .niraa-cat-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 900px) { .niraa-cat-grid { grid-template-columns: repeat(5, 1fr); } }

.niraa-cat-card {
  background: var(--white); border-radius: 24px;
  padding: 24px 16px; text-align: center; text-decoration: none;
  border: 1.5px solid rgba(26,122,110,0.08);
  box-shadow: 0 2px 16px rgba(0,0,0,0.04);
  transition: all 0.4s var(--ease-smooth);
  position: relative; overflow: hidden; display: block;
}
.niraa-cat-card::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, var(--teal-pale), transparent);
  opacity: 0; transition: opacity 0.35s;
}
.niraa-cat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 24px 60px rgba(26,122,110,0.18);
  border-color: rgba(26,122,110,0.3);
}
.niraa-cat-card:hover::after { opacity: 1; }
.niraa-cat-icon {
  font-size: 2.2rem; margin-bottom: 12px; display: block;
  transition: transform 0.4s var(--ease-bounce);
}
.niraa-cat-card:hover .niraa-cat-icon { transform: scale(1.2) rotate(-8deg); }
.niraa-cat-name {
  font-weight: 700; color: var(--charcoal); font-size: 0.83rem;
  margin-bottom: 6px; position: relative; z-index: 1;
}
.niraa-cat-count {
  font-size: 0.7rem; color: var(--teal); font-weight: 700;
  background: var(--teal-light); border-radius: 999px;
  padding: 3px 10px; display: inline-block;
  position: relative; z-index: 1;
}
.niraa-cat-arrow {
  position: absolute; bottom: 14px; right: 16px;
  font-size: 0.85rem; color: var(--teal); opacity: 0;
  transform: translateX(-8px); transition: all 0.3s ease;
}
.niraa-cat-card:hover .niraa-cat-arrow { opacity: 1; transform: translateX(0); }

/* ── PRODUCT GRID ── */
.niraa-prod-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
}
@media (min-width: 640px) { .niraa-prod-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .niraa-prod-grid { grid-template-columns: repeat(4, 1fr); } }

/* ── COMBO SECTION — old-style dark image card + product grid ── */

/* outer 2-col layout: image card left, product cards right */
.niraa-combo-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 860px) {
  .niraa-combo-layout { grid-template-columns: 380px 1fr; align-items: start; }
}

/* dark hero-style image card */
.orig-hero-combo {
  border-radius: 26px; overflow: hidden; position: relative;
  background: linear-gradient(145deg, #062019 0%, #1a4f47 100%);
  min-height: 420px; display: flex; flex-direction: column;
  justify-content: flex-end;
  box-shadow: 0 24px 60px rgba(6,32,25,0.35);
  transition: transform 0.4s var(--ease-smooth), box-shadow 0.4s var(--ease-smooth);
}
.orig-hero-combo:hover {
  transform: translateY(-5px);
  box-shadow: 0 36px 80px rgba(6,32,25,0.45);
}
.orig-hero-combo::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 70% 20%, rgba(200,168,75,0.15) 0%, transparent 60%);
  pointer-events: none;
}

/* combo card background image */
.orig-hero-combo__img {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
  opacity: 0.35;
  transition: transform 6s ease, opacity 0.4s ease;
}
.orig-hero-combo:hover .orig-hero-combo__img {
  transform: scale(1.06);
  opacity: 0.45;
}

/* content sits above image */
.orig-hero-combo__body {
  position: relative; z-index: 2;
  padding: 28px;
  display: flex; flex-direction: column; gap: 14px;
}

.orig-hero-combo__eyebrow {
  font-size: 0.66rem; color: #4ade80; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.16em;
  display: flex; align-items: center; gap: 8px;
}
.orig-hero-combo__eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #4ade80; box-shadow: 0 0 8px rgba(74,222,128,0.6);
  animation: badge-pulse 2s ease-in-out infinite;
}

.orig-hero-combo__title {
  font-family: var(--font-serif);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 600; color: #fff; margin: 0; line-height: 1.15;
}

.orig-hero-combo__sub {
  color: rgba(170,222,205,0.8); font-size: 0.85rem; line-height: 1.6; margin: 0;
}
.orig-hero-combo__sub strong { color: #4ade80; }

.orig-hero-combo__actions {
  display: flex; gap: 10px; flex-wrap: wrap; padding-top: 4px;
}

/* floating discount badge top-right */
.orig-hero-combo__badge {
  position: absolute; top: 16px; right: 16px; z-index: 10;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(8px);
  padding: 8px 16px; border-radius: 12px;
  font-weight: 800; font-size: 0.75rem; color: var(--teal);
  box-shadow: 0 4px 14px rgba(0,0,0,0.12);
  display: flex; align-items: center; gap: 6px;
  animation: float-card 4s ease-in-out infinite;
}
.orig-hero-combo__badge-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #22c55e;
  animation: badge-pulse 2s ease-in-out infinite;
}

/* product cards grid on the right */
.niraa-combo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
@media (min-width: 640px) { .niraa-combo-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1100px) { .niraa-combo-grid { grid-template-columns: repeat(3, 1fr); } }

.niraa-combo-tag {
  position: absolute; top: -8px; left: 16px; z-index: 10;
  border-radius: 999px; font-size: 0.63rem; font-weight: 800;
  padding: 4px 12px; letter-spacing: 0.04em;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
}

/* view-all link inside combo grid area */
.niraa-combo-viewall {
  grid-column: 1 / -1;
  display: flex; justify-content: center; padding-top: 4px;
}

/* ── STATS SECTION ── */
.niraa-stats {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
}
@media (min-width: 640px) { .niraa-stats { grid-template-columns: repeat(4, 1fr); } }

.niraa-stat-card {
  background: var(--white); border-radius: 24px; padding: 28px 20px;
  text-align: center; border: 1.5px solid rgba(26,122,110,0.08);
  box-shadow: 0 2px 16px rgba(0,0,0,0.04);
  transition: all 0.4s var(--ease-smooth);
}
.niraa-stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 50px rgba(26,122,110,0.15);
  border-color: rgba(26,122,110,0.2);
}
.niraa-stat-icon { font-size: 1.8rem; margin-bottom: 12px; display: block; }
.niraa-stat-val {
  font-family: var(--font-serif); font-size: 2.4rem;
  font-weight: 700; color: var(--teal-dark); line-height: 1; display: block;
}
.niraa-stat-label { font-size: 0.75rem; color: var(--stone); font-weight: 500; margin-top: 6px; }

/* ── TESTIMONIALS ── */
.niraa-testimonials { position: relative; }
.niraa-testimonials__track {
  overflow: hidden; border-radius: 28px;
  background: linear-gradient(135deg, var(--teal-pale) 0%, var(--white) 100%);
  border: 1.5px solid rgba(26,122,110,0.1);
  padding: 40px;
}
.niraa-testimonials__slide {
  display: none; animation: testi-in 0.5s var(--ease-smooth);
}
.niraa-testimonials__slide.active { display: block; }
.niraa-testimonials__stars { color: #f59e0b; font-size: 1.1rem; margin-bottom: 16px; letter-spacing: 2px; }
.niraa-testimonials__text {
  font-family: var(--font-serif); font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  font-style: italic; color: var(--charcoal); line-height: 1.7;
  margin: 0 0 24px;
}
.niraa-testimonials__author { display: flex; align-items: center; gap: 14px; }
.niraa-testimonials__avatar {
  width: 46px; height: 46px; border-radius: 50%;
  background: var(--teal); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.83rem; flex-shrink: 0;
}
.niraa-testimonials__name { font-weight: 700; color: var(--charcoal); font-size: 0.88rem; }
.niraa-testimonials__dots {
  display: flex; gap: 8px; justify-content: center; margin-top: 20px;
}
.niraa-testimonials__dot {
  height: 6px; border-radius: 3px; background: rgba(26,122,110,0.2);
  transition: all 0.4s var(--ease-smooth); cursor: pointer; border: none;
  width: 6px;
}
.niraa-testimonials__dot.active { background: var(--teal); width: 24px; }

/* ── CTA BANNER ── */
.niraa-cta {
  background: linear-gradient(135deg, #0b1f1d 0%, #1a5048 50%, #0d3d35 100%);
  border-radius: 36px; padding: clamp(40px, 7vw, 72px) clamp(28px, 5vw, 64px);
  position: relative; overflow: hidden;
  box-shadow: 0 32px 80px rgba(11,31,29,0.4);
}
.niraa-cta::before {
  content: ''; position: absolute;
  top: -100px; right: -60px;
  width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(200,168,75,0.15) 0%, transparent 70%);
}
.niraa-cta::after {
  content: ''; position: absolute;
  bottom: -60px; left: 15%;
  width: 260px; height: 260px; border-radius: 50%;
  background: radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%);
}
.niraa-cta__inner { position: relative; z-index: 1; max-width: 640px; }
.niraa-cta__eyebrow {
  font-size: 0.7rem; color: #4ade80; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 14px;
  display: flex; align-items: center; gap: 10px;
}
.niraa-cta__title {
  font-family: var(--font-serif);
  font-size: clamp(1.8rem, 4.5vw, 3rem);
  font-weight: 600; color: #fff; margin: 0 0 14px; line-height: 1.15;
}
.niraa-cta__sub {
  color: rgba(170,222,205,0.8); font-size: 0.95rem; line-height: 1.7;
  margin: 0 0 32px; font-weight: 300;
}
.niraa-cta__actions { display: flex; gap: 14px; flex-wrap: wrap; }

.niraa-btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  background: #fff; color: var(--teal-dark);
  padding: 13px 22px; border-radius: 14px;
  border: 2px solid rgba(42,125,114,0.2);
  font-family: var(--font-sans); font-weight: 800;
  font-size: 0.9rem; text-decoration: none;
  transition: all 0.2s ease;
}
.niraa-btn-ghost:hover { border-color: var(--teal); background: #f0faf8; }

/* ── SECTION CARD DESCRIPTION ── */
.niraa-section-desc {
  font-size: 0.88rem; color: var(--stone); line-height: 1.7;
  background: linear-gradient(135deg, var(--teal-pale), var(--white));
  border: 1px solid rgba(26,122,110,0.08);
  border-radius: 18px; padding: 16px 20px; margin-bottom: 16px;
}

        `}</style>

        {/* ══════════════════════════════════════
            HERO — Light 2-column (original layout)
            with enhanced staggered animations
        ══════════════════════════════════════ */}
        <section className="niraa-hero" ref={heroRef} onMouseMove={handleMouseMove}>

          {/* Left column */}
          <div className="niraa-hero__left">

            {/* Badge */}
            <div className="hero-animate-1">
              <div className="niraa-hero__badge">
                <span className="niraa-hero__badge-dot" />
                🌿 Dharmapuri's Trusted Cleaning Brand
              </div>
            </div>

            {/* Headline */}
            <h1 className="niraa-hero__headline hero-animate-2">
              Clean Home,<br />
              <em>Happy Family.</em>
            </h1>

            {/* Sub */}
            <p className="niraa-hero__sub hero-animate-3">
              Eco-friendly cleaning products delivering real results — for every
              corner of your home. Scientifically formulated, locally delivered.
            </p>

            {/* CTA Buttons */}
            <div className="niraa-hero__actions hero-animate-4">
              <a href={waLink} target="_blank" rel="noreferrer" className="niraa-btn-wa">
                📱 Order on WhatsApp
              </a>
              <Link to="/products" className="niraa-cta-link" style={{ padding: '13px 28px', borderRadius: '14px', background: '#fff' }}>
                Browse Products →
              </Link>
            </div>

            {/* Trust cards 2×2 / 4-col */}
            <div className="orig-trust-row hero-animate-5">
              {TRUSTS.map((t, i) => (
                <div
                  key={i}
                  className="orig-trust-card"
                  style={{ '--trust-accent': t.accent }}
                >
                  <span className="orig-trust-icon">{t.icon}</span>
                  <div className="orig-trust-title">{t.title}</div>
                  <div className="orig-trust-desc">{t.desc}</div>
                </div>
              ))}
            </div>

            {/* Testimonial ticker */}
            <div className="orig-ticker hero-animate-6">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className={`orig-ticker-slide ${i === activeTestimonial ? 'active' : ''}`}
                >
                  <div className="orig-ticker-avatar">{t.avatar}</div>
                  <div>
                    <div className="orig-ticker-text">"{t.text}"</div>
                    <div className="orig-ticker-meta">
                      {'★'.repeat(t.stars)} · {t.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right column — image */}
          <div className="niraa-hero__image hero-animate-img">
            <img src={bannerImage} alt="NIRAA eco-friendly cleaning products" />
            <div className="niraa-hero__image-overlay" />

            {/* Top Right: Premium Quality badge */}
            <div className="hero-combo-badge-top">
              <span className="hero-combo-badge-dot"></span>
              Premium Quality
            </div>

            {/* Middle Content */}
            <div className="hero-combo-content">
              <div className="hero-combo-label">
                <span role="img" aria-label="fire">🔥</span> BEST VALUE DEAL
              </div>
              <h2 className="hero-combo-title">
                {combos.find(c => c.name.toLowerCase().includes('complete'))?.name || 'Complete Home Combo'}
              </h2>
              <div className="hero-combo-price">
                {combos.find(c => c.name.toLowerCase().includes('complete'))?.price || combos[0]?.price || '700'}
              </div>
              
              <div className="hero-combo-actions">
                <Link 
                  to={combos.find(c => c.name.toLowerCase().includes('complete'))?.slug 
                    ? `/combos/${combos.find(c => c.name.toLowerCase().includes('complete')).slug}` 
                    : '/products?category=combo'} 
                  className="hero-combo-btn-outline"
                >
                  View Combo Deal
                </Link>
                <a href={waLink} className="hero-combo-btn-solid">
                  Order via WA
                </a>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="hero-combo-footer">
              <div className="hero-combo-promise">
                <div className="promise-label">THE NIRAA PROMISE</div>
                <div className="promise-text">Scientifically Formulated.<br/>Eco-Friendly.</div>
              </div>
              <div className="hero-combo-stats">
                <div className="hero-stat-box">
                  <div className="hero-stat-val">500+</div>
                  <div className="hero-stat-label">FAMILIES</div>
                </div>
                <div className="hero-stat-box">
                  <div className="hero-stat-val">4.6★</div>
                  <div className="hero-stat-label">RATING</div>
                </div>
              </div>
            </div>
          </div>

        </section>

        <div className="niraa-container">

          {/* ── CATEGORIES ── */}
          <div className="niraa-section">
            <Reveal>
              <SectionHeading label="Explore" title="Shop by Category" cta="View All" to="/products" />
            </Reveal>
            <div className="niraa-cat-grid">
              {categoryList}
            </div>
          </div>

          {/* ── INDIVIDUAL PRODUCT SECTIONS ── */}
          {groupedSections.map((section, sIdx) => (
            <div key={section.id} className="niraa-section">
              <Reveal delay={100}>
                <SectionHeading
                  label={section.label}
                  title={`${section.icon} ${section.label}`}
                  cta={`See All ${section.label}`}
                  to={`/products?category=${section.id}`}
                />
              </Reveal>
              {section.desc && (
                <Reveal delay={150}>
                  <div className="niraa-section-desc">{section.desc}</div>
                </Reveal>
              )}
              <div className="niraa-prod-grid">
                {section.products.map((p, pIdx) => (
                  <Reveal key={p._id} delay={pIdx * 70}>
                    <ProductCard product={p} compact />
                  </Reveal>
                ))}
              </div>
            </div>
          ))}

          {/* ── COMBO DEALS — featured product grid ── */}
          {combos.length > 0 && (
            <div className="niraa-section">
              <Reveal>
                <div className="niraa-combo-banner">
                  <div className="niraa-combo-banner__inner">
                    <div>
                      <div className="niraa-combo-banner__eyebrow">✦ Special Bundles</div>
                      <h2 className="niraa-combo-banner__title">Combo Deals & Offers</h2>
                      <p className="niraa-combo-banner__sub">
                        Save up to <strong>38%</strong> when you bundle your favourites together. 
                        Premium eco-friendly cleaning solutions, delivered to your door.
                      </p>
                    </div>
                    <div className="niraa-combo-banner__count">
                      <span className="niraa-combo-banner__count-val">{combos.length}</span>
                      <span className="niraa-combo-banner__count-label">Active Bundles</span>
                    </div>
                  </div>
                </div>
              </Reveal>

              <div className="niraa-prod-grid">
                {combos.slice(0, 4).map((p, idx) => (
                  <Reveal key={p._id} delay={idx * 80}>
                    <div style={{ position: 'relative' }}>
                      {p.comboTag && (
                        <div className="niraa-combo-tag" style={{ background: p.comboColor || 'var(--teal)', color: '#fff' }}>
                          {p.comboTag}
                        </div>
                      )}
                      <ProductCard product={p} />
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* ── STATS ── */}
          <Reveal>
            <div className="niraa-section">
              <SectionHeading label="By the Numbers" title="Trusted by Hundreds" />
              <div className="niraa-stats">
                {[
                  { num: '500', suffix: '+', label: 'Happy Families', icon: '👨‍👩‍👧‍👦' },
                  { num: '12', suffix: '+', label: 'Products', icon: '🧴' },
                  { num: '99', suffix: '.9%', label: 'Germ Kill Rate', icon: '🛡️' },
                  { num: '6', suffix: 'hrs', label: 'Local Delivery', icon: '🚚' },
                ].map((s, i) => (
                  <Reveal key={i} delay={i * 80}>
                    <div className="niraa-stat-card">
                      <span className="niraa-stat-icon">{s.icon}</span>
                      <span className="niraa-stat-val">
                        <AnimatedCounter end={s.num} suffix={s.suffix} />
                      </span>
                      <div className="niraa-stat-label">{s.label}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>



          {/* ── TESTIMONIALS ── */}
          <Reveal>
            <div className="niraa-section">
              <SectionHeading label="Reviews" title="What Families Say" />
              <div className="niraa-testimonials">
                <div className="niraa-testimonials__track">
                  {TESTIMONIALS.map((t, i) => (
                    <div key={i} className={`niraa-testimonials__slide ${i === activeTestimonial ? 'active' : ''}`}>
                      <div className="niraa-testimonials__stars">{'★'.repeat(t.stars)}</div>
                      <p className="niraa-testimonials__text">"{t.text}"</p>
                      <div className="niraa-testimonials__author">
                        <div className="niraa-testimonials__avatar">{t.avatar}</div>
                        <div className="niraa-testimonials__name">{t.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="niraa-testimonials__dots">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      className={`niraa-testimonials__dot ${i === activeTestimonial ? 'active' : ''}`}
                      onClick={() => setActiveTestimonial(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── FINAL CTA ── */}
          <Reveal>
            <div className="niraa-section">
              <div className="niraa-cta">
                <div className="niraa-cta__inner">
                  <div className="niraa-cta__eyebrow">
                    <span>⚡</span> Ready to Order?
                  </div>
                  <h2 className="niraa-cta__title">
                    Get it delivered to your door.
                  </h2>
                  <p className="niraa-cta__sub">
                    WhatsApp ordering for Dharmapuri & nearby areas.
                    Pay via UPI or Cash on Delivery. No fuss, just clean.
                  </p>
                  <div className="niraa-cta__actions">
                    <a href={waLink} target="_blank" rel="noreferrer" className="niraa-btn-wa">
                      📱 Order via WhatsApp
                    </a>
                    <Link to="/products" className="niraa-btn-ghost">
                      Browse All Products
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

        </div>


      </div>
    </>
  );
}