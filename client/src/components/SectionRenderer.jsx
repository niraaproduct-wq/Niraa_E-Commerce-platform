import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import EnhancedProductCard from './EnhancedProductCard';
import { getProducts } from '../utils/productApi.js';
import { CATEGORIES } from '../utils/categories.js';
import { WHATSAPP_NUMBER } from '../utils/constants.js';

// ─── CSS injected once ──────────────────────────────────────────────────────
const RENDERER_CSS = `
  @keyframes srMarquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .sr-marquee-track { display:flex; white-space:nowrap; animation:srMarquee 25s linear infinite; }
  .sr-marquee-track:hover { animation-play-state:paused; }
  .sr-slider-dot { width:8px;height:8px;border-radius:4px;background:rgba(255,255,255,0.4);border:none;cursor:pointer;padding:0;transition:all .3s; }
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
`;

// ─── Hero Banner ─────────────────────────────────────────────────────────────
const HeroBannerSection = ({ data }) => {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}`;
  return (
    <section style={{
      position: 'relative', minHeight: 400, display: 'flex', alignItems: 'center',
      justifyContent: data.textAlign === 'left' ? 'flex-start' : data.textAlign === 'right' ? 'flex-end' : 'center',
      background: data.imageUrl ? '#000' : (data.bgColor || '#0f1a18'),
      overflow: 'hidden', padding: '60px 40px',
    }}>
      {data.imageUrl && (
        <img src={data.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: data.overlay ? 0.45 : 1 }} />
      )}
      <div style={{ position: 'relative', textAlign: data.textAlign || 'center', maxWidth: 640 }}>
        {data.heading && (
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, color: '#fff', margin: '0 0 16px', lineHeight: 1.1 }}>{data.heading}</h1>
        )}
        {data.subheading && (
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', margin: '0 0 28px', lineHeight: 1.65 }}>{data.subheading}</p>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: data.textAlign === 'left' ? 'flex-start' : data.textAlign === 'right' ? 'flex-end' : 'center', flexWrap: 'wrap' }}>
          {data.ctaText && data.ctaUrl && (
            <Link to={data.ctaUrl} style={{ background: '#2a7d72', color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: '1rem', transition: 'all .25s' }}>
              {data.ctaText}
            </Link>
          )}
          <a href={waLink} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff', padding: '14px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
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
  const slides = data.slides || [];

  useEffect(() => {
    if (!data.autoplay || slides.length < 2) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), data.interval || 4000);
    return () => clearInterval(t);
  }, [data.autoplay, slides.length, data.interval]);

  if (!slides.length) return null;
  const slide = slides[current];
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: '#0f1a18', minHeight: 360 }}>
      {slide.imageUrl && <img src={slide.imageUrl} alt={slide.heading || ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, padding: 48, textAlign: 'center' }}>
        {slide.heading && <h2 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, color: '#fff', margin: '0 0 12px' }}>{slide.heading}</h2>}
        {slide.ctaText && slide.ctaUrl && (
          <Link to={slide.ctaUrl} style={{ background: '#2a7d72', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>{slide.ctaText}</Link>
        )}
      </div>
      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {slides.map((_, i) => (
            <button key={i} className={`sr-slider-dot${i === current ? ' active' : ''}`} onClick={() => setCurrent(i)} />
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

  useEffect(() => {
    getProducts({ limit: 100 }).then(r => {
      const all = r?.products || [];
      const ids = data.productIds || [];
      setProducts(ids.length ? all.filter(p => ids.includes(p._id)) : all.slice(0, data.columns || 4));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [data.productIds, data.columns]);

  return (
    <div className="sr-section">
      {data.title && <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#0f1a18', margin: '0 0 24px' }}>{data.title}</h2>}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#6b8880', padding: 40 }}>Loading products…</div>
      ) : (
        <div className="sr-prod-grid">
          {products.map(p => <EnhancedProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
};

// ─── Product Row ──────────────────────────────────────────────────────────────
const ProductRowSection = ({ data }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts({ limit: 100 }).then(r => {
      const all = r?.products || [];
      const ids = data.productIds || [];
      setProducts(ids.length ? all.filter(p => ids.includes(p._id)) : all.slice(0, 8));
    }).catch(() => {});
  }, [data.productIds]);

  return (
    <div className="sr-section">
      {data.title && <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#0f1a18', margin: '0 0 24px' }}>{data.title}</h2>}
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
        {products.map(p => (
          <div key={p._id} style={{ flexShrink: 0, width: 220 }}>
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
      <p style={{ color: data.textColor || '#fbbf24', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>{data.text}</p>
    )}
  </div>
);

// ─── Promo Card ───────────────────────────────────────────────────────────────
const PromoCardSection = ({ data }) => (
  <div className="sr-section">
    <div style={{
      background: data.bgColor || '#7c3aed', borderRadius: 20, padding: '40px 36px',
      color: '#fff', position: 'relative', overflow: 'hidden', textAlign: 'center',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      {data.title && <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 900, margin: '0 0 10px' }}>{data.title}</h2>}
      {data.description && <p style={{ fontSize: '1rem', opacity: 0.85, margin: '0 0 24px' }}>{data.description}</p>}
      {data.code && (
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', border: '2px dashed rgba(255,255,255,0.5)', borderRadius: 10, padding: '10px 24px', fontSize: '1.1rem', fontWeight: 900, letterSpacing: 4, marginBottom: 12 }}>
          {data.code}
        </div>
      )}
      {data.discount && <div style={{ fontSize: '2.5rem', fontWeight: 900, opacity: 0.15, position: 'absolute', bottom: 10, right: 24 }}>{data.discount} OFF</div>}
    </div>
  </div>
);

// ─── Category Grid ────────────────────────────────────────────────────────────
const CategoryGridSection = ({ data }) => {
  const cats = (data.categories && data.categories.length) ? data.categories : CATEGORIES;
  return (
    <div className="sr-section">
      {data.title && <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#0f1a18', margin: '0 0 24px' }}>{data.title}</h2>}
      <div className="sr-cat-grid">
        {cats.map((cat, i) => (
          <Link key={i} to={cat.url || `/products?category=${encodeURIComponent(cat.label || cat.name || '')}`}
            style={{ background: '#fff', border: '1.5px solid rgba(42,125,114,0.1)', borderRadius: 18, padding: '22px 14px 18px', textAlign: 'center', textDecoration: 'none', display: 'block', transition: 'all .25s', boxShadow: '0 2px 12px rgba(15,26,24,0.06)' }}>
            {cat.imageUrl
              ? <img src={cat.imageUrl} alt={cat.label || cat.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '50%', marginBottom: 10 }} />
              : <span style={{ fontSize: '2.2rem', display: 'block', marginBottom: 10 }}>{cat.icon || '🗂️'}</span>}
            <div style={{ fontWeight: 800, color: '#0f1a18', fontSize: '0.9rem', marginBottom: 4 }}>{cat.label || cat.name}</div>
            {cat.desc && <div style={{ fontSize: '0.72rem', color: '#6b8880' }}>{cat.desc}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
};

// ─── Announcement ─────────────────────────────────────────────────────────────
const AnnouncementSection = ({ data }) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div style={{ background: data.bgColor || '#fef3c7', color: data.textColor || '#92400e', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: '0.9rem', fontWeight: 600, position: 'relative' }}>
      <span>📢</span>
      <span>{data.text || 'Announcement'}</span>
      {data.closeable && (
        <button onClick={() => setVisible(false)} style={{ position: 'absolute', right: 16, background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: 'inherit', opacity: 0.7 }}>✕</button>
      )}
    </div>
  );
};

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TestimonialSection = ({ data }) => {
  const reviews = data.reviews || [];
  return (
    <div className="sr-section">
      {data.title && <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, color: '#0f1a18', margin: '0 0 24px', textAlign: 'center' }}>{data.title}</h2>}
      <div className="sr-testimonials">
        {reviews.map((r, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid rgba(42,125,114,0.1)', borderRadius: 18, padding: 24, boxShadow: '0 2px 12px rgba(15,26,24,0.06)' }}>
            <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
              {[...Array(5)].map((_, s) => <span key={s} style={{ color: s < (r.rating || 5) ? '#f59e0b' : '#e5e7eb', fontSize: '0.9rem' }}>★</span>)}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#2d4440', fontStyle: 'italic', lineHeight: 1.7, margin: '0 0 16px' }}>"{r.text}"</p>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f1a18' }}>— {r.name}</div>
            {r.location && <div style={{ fontSize: '0.72rem', color: '#6b8880' }}>📍 {r.location}</div>}
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
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s };
  }, [data.targetDate]);

  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [calc]);

  const pad = n => String(n).padStart(2, '0');
  return (
    <div style={{ background: data.bgColor || '#be123c', color: data.textColor || '#fff', padding: '40px 20px', textAlign: 'center' }}>
      {data.title && <h2 style={{ margin: '0 0 24px', fontWeight: 800, fontSize: 'clamp(1.2rem,2.5vw,1.8rem)' }}>{data.title}</h2>}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
        {[['d', 'DAYS'], ['h', 'HRS'], ['m', 'MIN'], ['s', 'SEC']].map(([k, label]) => (
          <div key={k} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 900, lineHeight: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '10px 18px', minWidth: 72 }}>{pad(time[k])}</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: 6, letterSpacing: '0.1em', opacity: 0.7 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Rich Text ────────────────────────────────────────────────────────────────
const RichTextSection = ({ data }) => (
  <div className="sr-section">
    <div
      style={{ padding: data.padding || 24, fontSize: '1rem', lineHeight: 1.8, color: '#2d4440' }}
      dangerouslySetInnerHTML={{ __html: data.html || '' }}
    />
  </div>
);

// ─── Featured Product ─────────────────────────────────────────────────────────
const FeaturedSection = ({ data }) => {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!data.productId) return;
    getProducts({ limit: 100 }).then(r => {
      const found = (r?.products || []).find(p => p._id === data.productId);
      setProduct(found || null);
    }).catch(() => {});
  }, [data.productId]);

  if (!product) return null;
  const img = Array.isArray(product.images) ? product.images[0] : product.image;
  return (
    <div className="sr-section">
      <div style={{ background: 'linear-gradient(135deg, #0f1a18 0%, #1e5c53 100%)', borderRadius: 24, padding: '36px 32px', display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap', boxShadow: '0 20px 60px rgba(15,26,24,0.2)' }}>
        {img && <img src={img} alt={product.name} style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 16, flexShrink: 0 }} />}
        <div style={{ color: '#fff', flex: 1 }}>
          {data.badge && <div style={{ display: 'inline-block', background: '#c8a84b', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 12px', borderRadius: 999, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{data.badge}</div>}
          <h2 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, margin: '0 0 10px', lineHeight: 1.2 }}>{product.name}</h2>
          <p style={{ color: '#aadecd', fontSize: '0.9rem', margin: '0 0 18px', lineHeight: 1.65 }}>{product.description?.slice(0, 140)}</p>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#4ade80', marginBottom: 16 }}>₹{product.price}</div>
          <Link to={`/products/${product.slug || product._id}`} style={{ background: '#2a7d72', color: '#fff', padding: '12px 24px', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>View Product →</Link>
        </div>
      </div>
    </div>
  );
};

// ─── Master Renderer ──────────────────────────────────────────────────────────
const SECTION_MAP = {
  hero_banner:  HeroBannerSection,
  slider_banner: SliderSection,
  product_grid: ProductGridSection,
  product_row:  ProductRowSection,
  offer_strip:  OfferStripSection,
  promo_card:   PromoCardSection,
  category_grid: CategoryGridSection,
  announcement: AnnouncementSection,
  testimonial:  TestimonialSection,
  countdown:    CountdownSection,
  rich_text:    RichTextSection,
  featured:     FeaturedSection,
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
