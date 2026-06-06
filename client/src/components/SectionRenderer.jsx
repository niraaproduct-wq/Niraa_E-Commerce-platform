import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import EnhancedProductCard from './EnhancedProductCard';
import { getProducts } from '../utils/productApi.js';
import { CATEGORIES } from '../utils/categories.js';
import { WHATSAPP_NUMBER } from '../utils/constants.js';

// ─── Shared scroll-reveal hook ────────────────────────────────────────────────
function useReveal(threshold = 0.01) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); ob.disconnect(); } }, { threshold });
    ob.observe(el);
    return () => ob.disconnect();
  }, [threshold]);
  return [ref, visible];
}

const RENDERER_CSS = `
  @keyframes srMarquee   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes srReveal    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes srCardIn    { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes srHeroPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.015)} }
  @keyframes srCountFlip { from{transform:translateY(-100%);opacity:0} to{transform:translateY(0);opacity:1} }

  .sr-marquee-track { display:flex; white-space:nowrap; animation:srMarquee 25s linear infinite; }
  .sr-marquee-track:hover { animation-play-state:paused; }

  .sr-slider-dot { width:8px;height:8px;border-radius:4px;background:rgba(255,255,255,0.4);border:none;cursor:pointer;padding:0;
    transition:all .35s cubic-bezier(0.34,1.56,0.64,1); }
  .sr-slider-dot:hover { background:rgba(255,255,255,0.7); transform:scale(1.2); }
  .sr-slider-dot.active { width:22px;background:#fff; }

  .sr-prod-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
  @media(min-width:640px){ .sr-prod-grid{ grid-template-columns:repeat(3,1fr); } }
  @media(min-width:1024px){ .sr-prod-grid{ grid-template-columns:repeat(4,1fr); } }

  .sr-cat-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
  @media(min-width:560px){ .sr-cat-grid{ grid-template-columns:repeat(3,1fr); } }
  @media(min-width:900px){ .sr-cat-grid{ grid-template-columns:repeat(5,1fr); } }

  .sr-testimonials { display:grid; grid-template-columns:1fr; gap:16px; }
  @media(min-width:640px){ .sr-testimonials{ grid-template-columns:repeat(2,1fr); } }
  @media(min-width:900px){ .sr-testimonials{ grid-template-columns:repeat(3,1fr); } }

  .sr-section { max-width:1280px; margin:0 auto; padding:48px 24px; }
  @media(min-width:1280px){ .sr-section{ padding:48px 0; } }

  .sr-reveal { opacity:0; }
  .sr-reveal.visible { animation:srReveal 0.55s ease forwards; }

  .sr-card-item { opacity:0; }
  .sr-card-item.visible { animation:srCardIn 0.45s ease forwards; }

  .sr-cta-btn {
    display:inline-flex; align-items:center; gap:8px;
    padding:14px 28px; border-radius:10px; font-weight:700; text-decoration:none;
    font-size:1rem; transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
    box-shadow 0.25s ease, filter 0.2s ease;
  }
  .sr-cta-btn:hover { transform:translateY(-3px); filter:brightness(1.08); box-shadow:0 12px 28px rgba(0,0,0,0.25); }
  .sr-cta-btn:active { transform:scale(0.97); }

  .sr-cat-card {
    background:#fff; border-radius:16px; padding:20px; text-align:center;
    border:1px solid rgba(42,125,114,0.1);
    transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
               box-shadow 0.3s ease, border-color 0.2s ease;
    cursor:pointer; text-decoration:none; display:block;
  }
  .sr-cat-card:hover {
    transform:translateY(-6px) scale(1.02);
    box-shadow:0 16px 36px rgba(42,125,114,0.18);
    border-color:var(--teal);
  }
  .sr-cat-icon {
    transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    display:inline-block;
  }
  .sr-cat-card:hover .sr-cat-icon { transform:scale(1.2) rotate(-5deg); }

  .sr-testimonial-card {
    background:#fff; border:1px solid rgba(42,125,114,0.1); border-radius:18px;
    padding:24px; box-shadow:0 2px 12px rgba(15,26,24,0.06);
    transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
  }
  .sr-testimonial-card:hover {
    transform:translateY(-4px);
    box-shadow:0 12px 28px rgba(15,26,24,0.12);
  }

  .sr-hero-slide-img {
    transition:opacity 0.55s ease, transform 0.55s ease;
  }

  .sr-featured-card {
    background:linear-gradient(135deg,#0f1a18 0%,#1e5c53 100%);
    border-radius:24px; padding:36px 32px;
    display:flex; gap:32px; align-items:center; flex-wrap:wrap;
    box-shadow:0 20px 60px rgba(15,26,24,0.2);
    transition:transform 0.35s ease, box-shadow 0.35s ease;
  }
  .sr-featured-card:hover {
    transform:translateY(-4px);
    box-shadow:0 32px 72px rgba(15,26,24,0.28);
  }
  .sr-featured-img {
    transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  .sr-featured-card:hover .sr-featured-img { transform:scale(1.06) rotate(-2deg); }
`;

// ─── Hero Banner ──────────────────────────────────────────────────────────────
const HeroBannerSection = ({ data }) => {
  const [ref, visible] = useReveal(0.05);
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}`;

  return (
    <section
      ref={ref}
      style={{
        position: 'relative', minHeight: 400, display: 'flex', alignItems: 'center',
        justifyContent: data.textAlign === 'left' ? 'flex-start' : data.textAlign === 'right' ? 'flex-end' : 'center',
        background: data.imageUrl ? '#000' : (data.bgColor || '#0f1a18'),
        overflow: 'hidden', padding: '60px 40px',
        animation: visible ? 'srHeroPulse 6s ease infinite' : 'none',
      }}
    >
      {data.imageUrl && (
        <img
          src={data.imageUrl} alt=""
          className="sr-hero-slide-img"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: data.overlay ? 0.45 : 1,
          }}
        />
      )}
      <div
        className={`sr-reveal${visible ? ' visible' : ''}`}
        style={{ position: 'relative', textAlign: data.textAlign || 'center', maxWidth: 640 }}
      >
        {data.heading && (
          <h1 style={{
            fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, color: '#fff',
            margin: '0 0 16px', lineHeight: 1.1,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>{data.heading}</h1>
        )}
        {data.subheading && (
          <p style={{
            fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)',
            margin: '0 0 28px', lineHeight: 1.65,
            animation: visible ? 'srReveal 0.7s 0.15s ease both' : 'none',
          }}>{data.subheading}</p>
        )}
        <div style={{
          display: 'flex', gap: 12,
          justifyContent: data.textAlign === 'left' ? 'flex-start' : data.textAlign === 'right' ? 'flex-end' : 'center',
          flexWrap: 'wrap',
          animation: visible ? 'srReveal 0.7s 0.3s ease both' : 'none',
        }}>
          {data.ctaText && data.ctaUrl && (
            <Link to={data.ctaUrl} className="sr-cta-btn" style={{ background: '#2a7d72', color: '#fff', boxShadow: '0 8px 24px rgba(42,125,114,0.4)' }}>
              {data.ctaText}
            </Link>
          )}
          <a href={waLink} target="_blank" rel="noreferrer" className="sr-cta-btn" style={{ background: '#25D366', color: '#fff', boxShadow: '0 8px 24px rgba(37,211,102,0.35)' }}>
            📱 WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

// ─── Image Slider ─────────────────────────────────────────────────────────────
const SliderSection = ({ data }) => {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const slides = data.slides || [];

  useEffect(() => {
    if (!data.autoplay || slides.length < 2) return;
    const t = setInterval(() => {
      setCurrent(p => { setPrev(p); return (p + 1) % slides.length; });
    }, data.interval || 4000);
    return () => clearInterval(t);
  }, [data.autoplay, slides.length, data.interval]);

  if (!slides.length) return null;
  const slide = slides[current];

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: '#0f1a18', minHeight: 360 }}>
      {slide.imageUrl && (
        <img
          key={current}
          src={slide.imageUrl} alt={slide.heading || ''}
          className="sr-hero-slide-img"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.5,
            animation: 'srReveal 0.55s ease',
          }}
        />
      )}
      <div style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', minHeight: 360,
        padding: 48, textAlign: 'center',
        animation: 'srReveal 0.5s ease',
        key: current,
      }}>
        {slide.heading && (
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, color: '#fff', margin: '0 0 12px', textShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
            {slide.heading}
          </h2>
        )}
        {slide.ctaText && slide.ctaUrl && (
          <Link to={slide.ctaUrl} className="sr-cta-btn" style={{ background: '#2a7d72', color: '#fff', marginTop: 16, boxShadow: '0 8px 24px rgba(42,125,114,0.4)' }}>
            {slide.ctaText}
          </Link>
        )}
      </div>
      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {slides.map((_, i) => (
            <button key={i} className={`sr-slider-dot${i === current ? ' active' : ''}`} onClick={() => { setPrev(current); setCurrent(i); }} />
          ))}
        </div>
      )}
    </section>
  );
};

// ─── Product Grid ─────────────────────────────────────────────────────────────
const ProductGridSection = ({ data }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ref, visible] = useReveal();

  useEffect(() => {
    getProducts({ limit: 100 }).then(r => {
      const all = r?.products || [];
      const ids = data.productIds || [];
      setProducts(ids.length ? all.filter(p => ids.includes(p._id)) : all.slice(0, data.columns || 4));
    }).catch(() => { }).finally(() => setLoading(false));
  }, [data.productIds, data.columns]);

  return (
    <div className="sr-section" ref={ref}>
      {data.title && (
        <h2 className={`sr-reveal${visible ? ' visible' : ''}`} style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#0f1a18', margin: '0 0 24px' }}>
          {data.title}
        </h2>
      )}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#6b8880', padding: 40 }}>
          <div style={{ display: 'inline-flex', gap: 8 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)', opacity: 0.5, animation: `srReveal 0.8s ${i * 0.15}s ease infinite alternate` }} />
            ))}
          </div>
        </div>
      ) : (
        <div className="sr-prod-grid">
          {products.map((p, i) => (
            <div
              key={p._id}
              className={`sr-card-item${visible ? ' visible' : ''}`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <EnhancedProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Product Row ──────────────────────────────────────────────────────────────
const ProductRowSection = ({ data }) => {
  const [products, setProducts] = useState([]);
  const [ref, visible] = useReveal();

  useEffect(() => {
    getProducts({ limit: 100 }).then(r => {
      const all = r?.products || [];
      const ids = data.productIds || [];
      setProducts(ids.length ? all.filter(p => ids.includes(p._id)) : all.slice(0, 8));
    }).catch(() => { });
  }, [data.productIds]);

  return (
    <div className="sr-section" ref={ref}>
      {data.title && (
        <h2 className={`sr-reveal${visible ? ' visible' : ''}`} style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#0f1a18', margin: '0 0 24px' }}>
          {data.title}
        </h2>
      )}
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none', scrollBehavior: 'smooth' }}>
        {products.map((p, i) => (
          <div
            key={p._id}
            className={`sr-card-item${visible ? ' visible' : ''}`}
            style={{ flexShrink: 0, width: 220, animationDelay: `${i * 0.06}s` }}
          >
            <EnhancedProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Offer Strip ──────────────────────────────────────────────────────────────
const OfferStripSection = ({ data }) => (
  <div style={{ background: data.bgColor || '#1a1a2e', overflow: 'hidden', padding: '12px 0' }}>
    {data.scrolling ? (
      <div style={{ overflow: 'hidden' }}>
        <div className="sr-marquee-track">
          {[...Array(4)].map((_, i) => (
            <span key={i} style={{ color: data.textColor || '#fbbf24', fontWeight: 700, fontSize: '0.9rem', padding: '0 40px' }}>
              {data.text || 'Special Offer!'} &nbsp;✦
            </span>
          ))}
        </div>
      </div>
    ) : (
      <p style={{ textAlign: 'center', color: data.textColor || '#fbbf24', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
        {data.text}
      </p>
    )}
  </div>
);

// ─── Category Grid ────────────────────────────────────────────────────────────
const CategoryGridSection = ({ data }) => {
  const [ref, visible] = useReveal();
  const cats = data.categories || CATEGORIES || [];

  return (
    <div className="sr-section" ref={ref}>
      {data.title && (
        <h2 className={`sr-reveal${visible ? ' visible' : ''}`} style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#0f1a18', margin: '0 0 24px', textAlign: 'center' }}>
          {data.title}
        </h2>
      )}
      <div className="sr-cat-grid">
        {cats.map((cat, i) => (
          <Link
            key={cat.slug || i}
            to={`/products?category=${cat.slug || cat.value || ''}`}
            className={`sr-cat-card sr-card-item${visible ? ' visible' : ''}`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="sr-cat-icon" style={{ fontSize: '2rem', marginBottom: 10 }}>{cat.icon || '🧴'}</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f1a18', lineHeight: 1.3 }}>{cat.label || cat.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// ─── Promo Card ───────────────────────────────────────────────────────────────
const PromoCardSection = ({ data }) => {
  const [ref, visible] = useReveal();
  return (
    <div className="sr-section" ref={ref}>
      <div
        className={`sr-reveal${visible ? ' visible' : ''}`}
        style={{
          background: data.bgColor || 'linear-gradient(135deg, #0f1a18, #1e5c53)',
          borderRadius: 20, padding: '36px 32px', display: 'flex', gap: 24,
          alignItems: 'center', flexWrap: 'wrap',
          boxShadow: '0 16px 48px rgba(15,26,24,0.18)',
          transition: 'transform 0.35s ease, box-shadow 0.35s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 24px 60px rgba(15,26,24,0.25)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(15,26,24,0.18)'; }}
      >
        {data.imageUrl && <img src={data.imageUrl} alt="" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 14, flexShrink: 0, transition: 'transform 0.3s ease' }} />}
        <div style={{ flex: 1, color: '#fff' }}>
          {data.badge && <div style={{ display: 'inline-block', background: '#c8a84b', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 12px', borderRadius: 999, marginBottom: 10, textTransform: 'uppercase' }}>{data.badge}</div>}
          {data.heading && <h2 style={{ fontSize: 'clamp(1.2rem,2.5vw,1.8rem)', fontWeight: 900, margin: '0 0 8px', lineHeight: 1.2 }}>{data.heading}</h2>}
          {data.subheading && <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', margin: '0 0 18px' }}>{data.subheading}</p>}
          {data.ctaText && data.ctaUrl && (
            <Link to={data.ctaUrl} className="sr-cta-btn" style={{ background: '#2a7d72', color: '#fff', boxShadow: '0 6px 18px rgba(42,125,114,0.4)' }}>
              {data.ctaText} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Announcement ─────────────────────────────────────────────────────────────
const AnnouncementSection = ({ data }) => {
  const [visible, setVisible] = useState(true);
  const [hiding, setHiding] = useState(false);

  const dismiss = () => {
    setHiding(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div style={{
      background: data.bgColor || '#fef3c7',
      color: data.textColor || '#92400e',
      padding: '12px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      fontSize: '0.9rem', fontWeight: 600, position: 'relative',
      animation: hiding ? 'srReveal 0.3s ease reverse forwards' : 'srReveal 0.4s ease',
    }}>
      <span>📢</span>
      <span>{data.text || 'Announcement'}</span>
      {data.closeable && (
        <button
          onClick={dismiss}
          style={{
            position: 'absolute', right: 16, background: 'none', border: 'none',
            fontSize: '1.1rem', cursor: 'pointer', color: 'inherit', opacity: 0.7,
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.transform = 'rotate(0) scale(1)'; }}
        >✕</button>
      )}
    </div>
  );
};

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TestimonialSection = ({ data }) => {
  const [ref, visible] = useReveal();
  const reviews = data.reviews || [];

  return (
    <div className="sr-section" ref={ref}>
      {data.title && (
        <h2 className={`sr-reveal${visible ? ' visible' : ''}`} style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#0f1a18', margin: '0 0 24px', textAlign: 'center' }}>
          {data.title}
        </h2>
      )}
      <div className="sr-testimonials">
        {reviews.map((r, i) => (
          <div
            key={i}
            className={`sr-testimonial-card sr-card-item${visible ? ' visible' : ''}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
              {[...Array(5)].map((_, s) => (
                <span key={s} style={{ color: s < (r.rating || 5) ? '#f59e0b' : '#e5e7eb', fontSize: '0.9rem', transition: 'transform 0.2s ease', display: 'inline-block' }}>★</span>
              ))}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#2d4440', fontStyle: 'italic', lineHeight: 1.7, margin: '0 0 16px' }}>"{r.text}"</p>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f1a18' }}>— {r.name}</div>
            {r.location && <div style={{ fontSize: '0.72rem', color: '#6b8880', marginTop: 4 }}>📍 {r.location}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Countdown ────────────────────────────────────────────────────────────────
const CountdownSection = ({ data }) => {
  const calc = useCallback(() => {
    if (!data.targetDate) return { d: 0, h: 0, m: 0, s: 0 };
    const diff = Math.max(0, new Date(data.targetDate) - Date.now());
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  }, [data.targetDate]);

  const [time, setTime] = useState(calc);
  const [prevTime, setPrevTime] = useState(calc);

  useEffect(() => {
    const t = setInterval(() => { setPrevTime(time); setTime(calc()); }, 1000);
    return () => clearInterval(t);
  }, [calc, time]);

  const pad = n => String(n).padStart(2, '0');

  return (
    <div style={{ background: data.bgColor || '#be123c', color: data.textColor || '#fff', padding: '40px 20px', textAlign: 'center' }}>
      {data.title && <h2 style={{ margin: '0 0 24px', fontWeight: 800, fontSize: 'clamp(1.2rem,2.5vw,1.8rem)' }}>{data.title}</h2>}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
        {[['d', 'DAYS'], ['h', 'HRS'], ['m', 'MIN'], ['s', 'SEC']].map(([k, label]) => (
          <div key={k} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 900, lineHeight: 1,
              background: 'rgba(0,0,0,0.22)', borderRadius: 14,
              padding: '10px 18px', minWidth: 72, overflow: 'hidden', position: 'relative',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)',
            }}>
              <span style={{
                display: 'block',
                animation: time[k] !== prevTime[k] ? 'srCountFlip 0.3s ease' : 'none',
                key: time[k],
              }}>
                {pad(time[k])}
              </span>
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: 8, letterSpacing: '0.1em', opacity: 0.75 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Rich Text ────────────────────────────────────────────────────────────────
const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<script[\s\S]*?>[^]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[^]*?<\/style>/gi, '')
    .replace(/<(iframe|object|embed|form|input|textarea|button)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(iframe|object|embed|form|input|textarea|button)\s*\/?>/gi, '')
    .replace(/\s+on\w+\s*=\s*["']?[^"'>]*["']?/gi, '')
    .replace(/\s+(href|src|action)\s*=\s*["']?javascript:[^"'>]*["']?/gi, '');
};

const RichTextSection = ({ data }) => {
  const [ref, visible] = useReveal();
  return (
    <div className="sr-section" ref={ref}>
      <div
        className={`sr-reveal${visible ? ' visible' : ''}`}
        style={{ padding: data.padding || 24, fontSize: '1rem', lineHeight: 1.8, color: '#2d4440' }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.html || '') }}
      />
    </div>
  );
};

// ─── Featured Product ─────────────────────────────────────────────────────────
const FeaturedSection = ({ data }) => {
  const [product, setProduct] = useState(null);
  const [ref, visible] = useReveal();

  useEffect(() => {
    if (!data.productId) return;
    getProducts({ limit: 100 }).then(r => {
      const found = (r?.products || []).find(p => p._id === data.productId);
      setProduct(found || null);
    }).catch(() => { });
  }, [data.productId]);

  if (!product) return null;
  const img = Array.isArray(product.images) ? product.images[0] : product.image;

  return (
    <div className="sr-section" ref={ref}>
      <div className={`sr-featured-card sr-reveal${visible ? ' visible' : ''}`}>
        {img && (
          <img
            src={img} alt={product.name}
            className="sr-featured-img"
            style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 16, flexShrink: 0, boxShadow: '0 12px 28px rgba(0,0,0,0.25)' }}
          />
        )}
        <div style={{ color: '#fff', flex: 1 }}>
          {data.badge && (
            <div style={{ display: 'inline-block', background: '#c8a84b', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 12px', borderRadius: 999, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {data.badge}
            </div>
          )}
          <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, margin: '0 0 10px', lineHeight: 1.2 }}>{product.name}</h2>
          <p style={{ color: '#aadecd', fontSize: '0.9rem', margin: '0 0 18px', lineHeight: 1.65 }}>{product.description?.slice(0, 140)}</p>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#4ade80', marginBottom: 16 }}>₹{product.price}</div>
          <Link to={`/products/${product.slug || product._id}`} className="sr-cta-btn" style={{ background: '#2a7d72', color: '#fff', boxShadow: '0 6px 18px rgba(42,125,114,0.4)' }}>
            View Product →
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── Master Renderer ──────────────────────────────────────────────────────────
const SECTION_MAP = {
  hero_banner: HeroBannerSection,
  slider_banner: SliderSection,
  product_grid: ProductGridSection,
  product_row: ProductRowSection,
  offer_strip: OfferStripSection,
  promo_card: PromoCardSection,
  category_grid: CategoryGridSection,
  announcement: AnnouncementSection,
  testimonial: TestimonialSection,
  countdown: CountdownSection,
  rich_text: RichTextSection,
  featured: FeaturedSection,
};

export default function SectionRenderer({ sections = [] }) {
  const visible = sections.filter(s => s.isActive !== false && s.visible !== false);
  if (!visible.length) return null;

  return (
    <>
      <style>{RENDERER_CSS}</style>
      {visible.map(section => {
        const Component = SECTION_MAP[section.type];
        if (!Component) return null;
        return (
          <div key={section.id || section._id} data-section-type={section.type}>
            <Component data={section.data || {}} section={section} />
          </div>
        );
      })}
    </>
  );
}