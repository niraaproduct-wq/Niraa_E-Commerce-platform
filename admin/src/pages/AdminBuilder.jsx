import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../utils/constants';
import toast from 'react-hot-toast';
import { useAdmin } from '../context/AdminContext';

// ─── Section & Block Types ───────────────────────────────────────────────────
const SECTION_TYPES = {
  HERO_BANNER: 'hero_banner',
  SLIDER_BANNER: 'slider_banner',
  PRODUCT_GRID: 'product_grid',
  PRODUCT_ROW: 'product_row',
  FEATURED: 'featured',
  OFFER_STRIP: 'offer_strip',
  PROMO_CARD: 'promo_card',
  CATEGORY_GRID: 'category_grid',
  ANNOUNCEMENT: 'announcement',
  TESTIMONIAL: 'testimonial',
  COUNTDOWN: 'countdown',
  RICH_TEXT: 'rich_text',
};

const SECTION_META = {
  hero_banner: { label: 'Hero Banner', icon: '🖼️', color: '#7c3aed', desc: 'Full-width hero image with CTA' },
  slider_banner: { label: 'Image Slider', icon: '🎞️', color: '#2563eb', desc: 'Auto-rotating banner slides' },
  product_grid: { label: 'Product Grid', icon: '🛍️', color: '#059669', desc: 'Grid of product cards' },
  product_row: { label: 'Product Row', icon: '📦', color: '#0891b2', desc: 'Horizontal scrollable products' },
  featured: { label: 'Featured Item', icon: '⭐', color: '#d97706', desc: 'Single highlighted product' },
  offer_strip: { label: 'Offer Strip', icon: '🎯', color: '#dc2626', desc: 'Full-width promotional strip' },
  promo_card: { label: 'Promo Card', icon: '🎁', color: '#7c3aed', desc: 'Discount / coupon card' },
  category_grid: { label: 'Category Grid', icon: '🗂️', color: '#0f766e', desc: 'Browse by category' },
  announcement: { label: 'Announcement', icon: '📢', color: '#b45309', desc: 'Marquee / info banner' },
  testimonial: { label: 'Testimonials', icon: '💬', color: '#6d28d9', desc: 'Customer reviews section' },
  countdown: { label: 'Countdown Timer', icon: '⏱️', color: '#be123c', desc: 'Sale deadline timer' },
  rich_text: { label: 'Rich Text', icon: '📝', color: '#374151', desc: 'Custom HTML / text block' },
};

// ─── Default data shapes ──────────────────────────────────────────────────────
const DEFAULT_DATA = {
  hero_banner: { imageUrl: '', heading: 'Big Sale Starts Now', subheading: 'Up to 50% off on all items', ctaText: 'Shop Now', ctaUrl: '/shop', bgColor: '#f3f4f6', textAlign: 'center', overlay: true },
  slider_banner: { slides: [{ imageUrl: '', heading: 'Slide 1', ctaText: 'View', ctaUrl: '/' }], autoplay: true, interval: 4000 },
  product_grid: { title: 'Featured Products', productIds: [], columns: 4, showBadge: true, showRating: true },
  product_row: { title: 'New Arrivals', productIds: [], showArrows: true },
  featured: { productId: '', badge: 'Staff Pick', showDetails: true },
  offer_strip: { text: '🎉 Free delivery on orders above ₹499 — Use code FREESHIP', bgColor: '#1a1a2e', textColor: '#fbbf24', scrolling: true },
  promo_card: { title: 'Limited Time Offer', description: 'Get 20% off your first order', code: 'FIRST20', discount: '20%', expiry: '', bgColor: '#7c3aed', imageUrl: '' },
  category_grid: { title: 'Shop by Category', categories: [{ label: 'Sarees', imageUrl: '', url: '/' }, { label: 'Kurtis', imageUrl: '', url: '/' }], columns: 4 },
  announcement: { text: 'Welcome to our store! Check out our latest collection.', bgColor: '#fef3c7', textColor: '#92400e', closeable: true },
  testimonial: { title: 'What Our Customers Say', reviews: [{ name: 'Priya', text: 'Amazing quality!', rating: 5 }] },
  countdown: { title: 'Sale Ends In', targetDate: '', bgColor: '#be123c', textColor: '#ffffff' },
  rich_text: { html: '<p>Add your custom content here...</p>', padding: 24 },
};

// ─── Icon Components (no react-icons dependency) ───────────────────────────
const Icon = ({ name, size = 16 }) => {
  const paths = {
    plus: 'M12 5v14M5 12h14',
    trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    save: 'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8',
    eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z',
    grip: 'M9 5h2M9 12h2M9 19h2M15 5h2M15 12h2M15 19h2',
    chevronU: 'M18 15l-6-6-6 6',
    chevronD: 'M6 9l6 6 6-6',
    x: 'M18 6L6 18M6 6l12 12',
    copy: 'M8 4H5a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1v-3M8 4a1 1 0 011-1h7l4 4v10a1 1 0 01-1 1H9a1 1 0 01-1-1V4z',
    undo: 'M3 7v6h6M3 13A9 9 0 1021 12',
    redo: 'M21 7v6h-6M21 13A9 9 0 113 12',
    layout: 'M12 3H3v7h9V3zM21 3h-6v4h6V3zM21 10h-6v11h6V10zM12 13H3v8h9v-8z',
    settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    mobile: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
    desktop: 'M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4m-4 4h-4m2-4v4',
    publish: 'M5 12H1l4-4 4 4H5v8H1l4-4M9 4h14M9 8h10M9 12h6',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] || ''} />
    </svg>
  );
};

// ─── Field Components ─────────────────────────────────────────────────────────
const Field = ({ label, children, hint }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</label>
    {children}
    {hint && <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{hint}</p>}
  </div>
);

const Input = ({ value, onChange, placeholder, type = 'text', ...props }) => (
  <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', background: '#fff', boxSizing: 'border-box', outline: 'none' }}
    {...props} />
);

const Textarea = ({ value, onChange, rows = 3, placeholder }) => (
  <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', background: '#fff', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
);

const Toggle = ({ value, onChange, label }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
    <div onClick={() => onChange(!value)} style={{
      width: 36, height: 20, borderRadius: 10, background: value ? '#2d9a8e' : '#e5e7eb',
      position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', top: 2, left: value ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
    {label && <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>}
  </label>
);

const ColorPicker = ({ value, onChange, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <input type="color" value={value || '#ffffff'} onChange={e => onChange(e.target.value)}
      style={{ width: 36, height: 36, border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', padding: 2, background: 'none' }} />
    <Input value={value} onChange={onChange} placeholder="#000000" />
  </div>
);

const Select = ({ value, onChange, options }) => (
  <select value={value || ''} onChange={e => onChange(e.target.value)}
    style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', background: '#fff', outline: 'none' }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ─── Canvas Preview Components ────────────────────────────────────────────────
const PreviewHeroBanner = ({ data }) => (
  <div style={{ background: data.bgColor || '#f3f4f6', minHeight: 160, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: data.textAlign === 'left' ? 'flex-start' : data.textAlign === 'right' ? 'flex-end' : 'center', padding: 32, position: 'relative', overflow: 'hidden' }}>
    {data.imageUrl && <img src={data.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: data.overlay ? 0.45 : 1 }} />}
    <div style={{ position: 'relative', textAlign: data.textAlign || 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: data.imageUrl ? '#fff' : '#111827', marginBottom: 6 }}>{data.heading || 'Hero Heading'}</div>
      <div style={{ fontSize: 13, color: data.imageUrl ? 'rgba(255,255,255,0.85)' : '#6b7280', marginBottom: 14 }}>{data.subheading}</div>
      {data.ctaText && <div style={{ display: 'inline-block', background: '#2d9a8e', color: '#fff', padding: '8px 20px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{data.ctaText}</div>}
    </div>
  </div>
);

const PreviewProductGrid = ({ data }) => (
  <div>
    {data.title && <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{data.title}</div>}
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(data.columns || 4, 4)}, 1fr)`, gap: 10 }}>
      {Array.from({ length: Math.min(data.columns || 4, 4) }).map((_, i) => (
        <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ background: '#e5e7eb', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#9ca3af' }}>Image</div>
          <div style={{ padding: '8px 10px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#111827', marginBottom: 2 }}>Product Name</div>
            <div style={{ fontSize: 11, color: '#2d9a8e', fontWeight: 700 }}>₹299</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PreviewOfferStrip = ({ data }) => (
  <div style={{ background: data.bgColor || '#1a1a2e', color: data.textColor || '#fbbf24', padding: '10px 20px', borderRadius: 8, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
    {data.text || 'Offer text here'}
  </div>
);

const PreviewPromoCard = ({ data }) => (
  <div style={{ background: data.bgColor || '#7c3aed', borderRadius: 12, padding: 20, color: '#fff', position: 'relative', overflow: 'hidden' }}>
    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{data.title || 'Promo Title'}</div>
    <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>{data.description}</div>
    {data.code && <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', border: '1.5px dashed rgba(255,255,255,0.5)', borderRadius: 6, padding: '4px 12px', fontSize: 13, fontWeight: 700, letterSpacing: 2 }}>{data.code}</div>}
  </div>
);

const PreviewAnnouncement = ({ data }) => (
  <div style={{ background: data.bgColor || '#fef3c7', color: data.textColor || '#92400e', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
    <span>📢</span><span>{data.text || 'Announcement text'}</span>
  </div>
);

const PreviewCountdown = ({ data }) => (
  <div style={{ background: data.bgColor || '#be123c', color: data.textColor || '#fff', padding: '16px 20px', borderRadius: 8, textAlign: 'center' }}>
    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, opacity: 0.9 }}>{data.title || 'Sale Ends In'}</div>
    <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
      {['00', '12', '30', '45'].map((v, i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{v}</div>
          <div style={{ fontSize: 9, opacity: 0.7 }}>{['DAYS', 'HRS', 'MIN', 'SEC'][i]}</div>
        </div>
      ))}
    </div>
  </div>
);

const PreviewCategoryGrid = ({ data }) => (
  <div>
    {data.title && <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10 }}>{data.title}</div>}
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(data.columns || 4, 4)}, 1fr)`, gap: 8 }}>
      {(data.categories || []).slice(0, data.columns || 4).map((cat, i) => (
        <div key={i} style={{ background: '#f3f4f6', borderRadius: 8, padding: '12px 8px', textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, background: '#e5e7eb', borderRadius: '50%', margin: '0 auto 6px' }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>{cat.label || 'Category'}</div>
        </div>
      ))}
    </div>
  </div>
);

const PreviewTestimonial = ({ data }) => (
  <div>
    {data.title && <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10, textAlign: 'center' }}>{data.title}</div>}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {(data.reviews || []).slice(0, 2).map((r, i) => (
        <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 11, color: '#fbbf24', marginBottom: 4 }}>{'★'.repeat(r.rating || 5)}</div>
          <div style={{ fontSize: 11, color: '#374151', marginBottom: 6 }}>"{r.text}"</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>— {r.name}</div>
        </div>
      ))}
    </div>
  </div>
);

const PreviewRichText = ({ data }) => (
  <div style={{ padding: `${data.padding || 24}px`, background: '#f9fafb', borderRadius: 8, fontSize: 13, color: '#374151' }}
    dangerouslySetInnerHTML={{ __html: data.html || '<p>Rich text content</p>' }} />
);

const PreviewFeatured = ({ data }) => (
  <div style={{ background: '#f9fafb', border: '2px solid #e5e7eb', borderRadius: 10, padding: 20, display: 'flex', gap: 20 }}>
    <div style={{ width: 120, height: 120, background: '#e5e7eb', borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#9ca3af' }}>Image</div>
    <div>
      {data.badge && <div style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginBottom: 6 }}>{data.badge}</div>}
      <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Featured Product Name</div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Short description of the product goes here...</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#2d9a8e' }}>₹1,299</div>
    </div>
  </div>
);

const PreviewSlider = ({ data }) => (
  <div style={{ background: '#1e293b', borderRadius: 10, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
    <div style={{ textAlign: 'center', color: '#fff' }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{data.slides?.[0]?.heading || 'Slide 1'}</div>
      <div style={{ fontSize: 11, opacity: 0.7 }}>{data.slides?.length || 1} slide{(data.slides?.length || 1) > 1 ? 's' : ''} · {data.autoplay ? `Auto ${data.interval / 1000}s` : 'Manual'}</div>
    </div>
    <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
      {(data.slides || [{}]).map((_, i) => (
        <div key={i} style={{ width: i === 0 ? 16 : 6, height: 6, borderRadius: 3, background: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)' }} />
      ))}
    </div>
  </div>
);

const PREVIEW_MAP = {
  hero_banner: PreviewHeroBanner,
  slider_banner: PreviewSlider,
  product_grid: PreviewProductGrid,
  product_row: PreviewProductGrid,
  featured: PreviewFeatured,
  offer_strip: PreviewOfferStrip,
  promo_card: PreviewPromoCard,
  category_grid: PreviewCategoryGrid,
  announcement: PreviewAnnouncement,
  testimonial: PreviewTestimonial,
  countdown: PreviewCountdown,
  rich_text: PreviewRichText,
};

// ─── Properties Panels ────────────────────────────────────────────────────────
const HeroBannerProps = ({ data, onChange }) => (
  <>
    <Field label="Background Image URL" hint="Paste a direct image URL"><Input value={data.imageUrl} onChange={v => onChange({ ...data, imageUrl: v })} placeholder="https://..." /></Field>
    <Field label="Heading"><Input value={data.heading} onChange={v => onChange({ ...data, heading: v })} /></Field>
    <Field label="Sub Heading"><Input value={data.subheading} onChange={v => onChange({ ...data, subheading: v })} /></Field>
    <Field label="CTA Button Text"><Input value={data.ctaText} onChange={v => onChange({ ...data, ctaText: v })} /></Field>
    <Field label="CTA URL"><Input value={data.ctaUrl} onChange={v => onChange({ ...data, ctaUrl: v })} placeholder="/shop" /></Field>
    <Field label="Background Color"><ColorPicker value={data.bgColor} onChange={v => onChange({ ...data, bgColor: v })} /></Field>
    <Field label="Text Alignment"><Select value={data.textAlign} onChange={v => onChange({ ...data, textAlign: v })} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} /></Field>
    <Field label=""><Toggle value={data.overlay} onChange={v => onChange({ ...data, overlay: v })} label="Dark image overlay" /></Field>
  </>
);

const OfferStripProps = ({ data, onChange }) => (
  <>
    <Field label="Strip Text"><Textarea value={data.text} onChange={v => onChange({ ...data, text: v })} rows={2} /></Field>
    <Field label="Background Color"><ColorPicker value={data.bgColor} onChange={v => onChange({ ...data, bgColor: v })} /></Field>
    <Field label="Text Color"><ColorPicker value={data.textColor} onChange={v => onChange({ ...data, textColor: v })} /></Field>
    <Field label=""><Toggle value={data.scrolling} onChange={v => onChange({ ...data, scrolling: v })} label="Scrolling marquee" /></Field>
  </>
);

const PromoCardProps = ({ data, onChange }) => (
  <>
    <Field label="Title"><Input value={data.title} onChange={v => onChange({ ...data, title: v })} /></Field>
    <Field label="Description"><Textarea value={data.description} onChange={v => onChange({ ...data, description: v })} rows={2} /></Field>
    <Field label="Coupon Code"><Input value={data.code} onChange={v => onChange({ ...data, code: v })} placeholder="SUMMER20" /></Field>
    <Field label="Discount Label"><Input value={data.discount} onChange={v => onChange({ ...data, discount: v })} placeholder="20%" /></Field>
    <Field label="Expiry Date"><Input type="date" value={data.expiry} onChange={v => onChange({ ...data, expiry: v })} /></Field>
    <Field label="Background Color"><ColorPicker value={data.bgColor} onChange={v => onChange({ ...data, bgColor: v })} /></Field>
    <Field label="Image URL (optional)"><Input value={data.imageUrl} onChange={v => onChange({ ...data, imageUrl: v })} placeholder="https://..." /></Field>
  </>
);

const ProductGridProps = ({ data, onChange }) => (
  <>
    <Field label="Section Title"><Input value={data.title} onChange={v => onChange({ ...data, title: v })} /></Field>
    <Field label="Columns"><Select value={String(data.columns)} onChange={v => onChange({ ...data, columns: parseInt(v) })} options={[{ value: '2', label: '2 Columns' }, { value: '3', label: '3 Columns' }, { value: '4', label: '4 Columns' }, { value: '5', label: '5 Columns' }]} /></Field>
    <Field label="Product IDs" hint="Comma separated product IDs"><Textarea value={(data.productIds || []).join(', ')} onChange={v => onChange({ ...data, productIds: v.split(',').map(s => s.trim()).filter(Boolean) })} rows={3} placeholder="101, 102, 103..." /></Field>
    <Field label=""><Toggle value={data.showBadge} onChange={v => onChange({ ...data, showBadge: v })} label="Show badges (New / Sale)" /></Field>
    <Field label=""><Toggle value={data.showRating} onChange={v => onChange({ ...data, showRating: v })} label="Show star ratings" /></Field>
  </>
);

const CategoryGridProps = ({ data, onChange }) => {
  const updateCat = (i, key, val) => {
    const cats = [...(data.categories || [])];
    cats[i] = { ...cats[i], [key]: val };
    onChange({ ...data, categories: cats });
  };
  const addCat = () => onChange({ ...data, categories: [...(data.categories || []), { label: 'New Category', imageUrl: '', url: '/' }] });
  const removeCat = (i) => onChange({ ...data, categories: (data.categories || []).filter((_, idx) => idx !== i) });
  return (
    <>
      <Field label="Section Title"><Input value={data.title} onChange={v => onChange({ ...data, title: v })} /></Field>
      <Field label="Columns"><Select value={String(data.columns)} onChange={v => onChange({ ...data, columns: parseInt(v) })} options={[{ value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' }]} /></Field>
      <Field label="Categories">
        {(data.categories || []).map((cat, i) => (
          <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Category {i + 1}</span>
              <button onClick={() => removeCat(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}><Icon name="x" size={14} /></button>
            </div>
            <Input value={cat.label} onChange={v => updateCat(i, 'label', v)} placeholder="Category name" />
            <div style={{ marginTop: 6 }}><Input value={cat.imageUrl} onChange={v => updateCat(i, 'imageUrl', v)} placeholder="Image URL" /></div>
            <div style={{ marginTop: 6 }}><Input value={cat.url} onChange={v => updateCat(i, 'url', v)} placeholder="/category/sarees" /></div>
          </div>
        ))}
        <button onClick={addCat} style={{ width: '100%', padding: '8px', border: '1.5px dashed #d1d5db', borderRadius: 8, background: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 12, marginTop: 4 }}>+ Add Category</button>
      </Field>
    </>
  );
};

const AnnouncementProps = ({ data, onChange }) => (
  <>
    <Field label="Text"><Textarea value={data.text} onChange={v => onChange({ ...data, text: v })} rows={2} /></Field>
    <Field label="Background Color"><ColorPicker value={data.bgColor} onChange={v => onChange({ ...data, bgColor: v })} /></Field>
    <Field label="Text Color"><ColorPicker value={data.textColor} onChange={v => onChange({ ...data, textColor: v })} /></Field>
    <Field label=""><Toggle value={data.closeable} onChange={v => onChange({ ...data, closeable: v })} label="Show close button" /></Field>
  </>
);

const TestimonialProps = ({ data, onChange }) => {
  const updateReview = (i, key, val) => {
    const reviews = [...(data.reviews || [])];
    reviews[i] = { ...reviews[i], [key]: val };
    onChange({ ...data, reviews });
  };
  const addReview = () => onChange({ ...data, reviews: [...(data.reviews || []), { name: 'Customer', text: 'Great product!', rating: 5 }] });
  const removeReview = (i) => onChange({ ...data, reviews: (data.reviews || []).filter((_, idx) => idx !== i) });
  return (
    <>
      <Field label="Section Title"><Input value={data.title} onChange={v => onChange({ ...data, title: v })} /></Field>
      <Field label="Reviews">
        {(data.reviews || []).map((r, i) => (
          <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Review {i + 1}</span>
              <button onClick={() => removeReview(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}><Icon name="x" size={14} /></button>
            </div>
            <Input value={r.name} onChange={v => updateReview(i, 'name', v)} placeholder="Customer name" />
            <div style={{ marginTop: 6 }}><Textarea value={r.text} onChange={v => updateReview(i, 'text', v)} rows={2} placeholder="Review text" /></div>
            <div style={{ marginTop: 6 }}><Select value={String(r.rating)} onChange={v => updateReview(i, 'rating', parseInt(v))} options={[5, 4, 3, 2, 1].map(n => ({ value: String(n), label: '★'.repeat(n) }))} /></div>
          </div>
        ))}
        <button onClick={addReview} style={{ width: '100%', padding: '8px', border: '1.5px dashed #d1d5db', borderRadius: 8, background: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 12, marginTop: 4 }}>+ Add Review</button>
      </Field>
    </>
  );
};

const CountdownProps = ({ data, onChange }) => (
  <>
    <Field label="Title"><Input value={data.title} onChange={v => onChange({ ...data, title: v })} /></Field>
    <Field label="Target Date & Time"><Input type="datetime-local" value={data.targetDate} onChange={v => onChange({ ...data, targetDate: v })} /></Field>
    <Field label="Background Color"><ColorPicker value={data.bgColor} onChange={v => onChange({ ...data, bgColor: v })} /></Field>
    <Field label="Text Color"><ColorPicker value={data.textColor} onChange={v => onChange({ ...data, textColor: v })} /></Field>
  </>
);

const SliderProps = ({ data, onChange }) => {
  const updateSlide = (i, key, val) => {
    const slides = [...(data.slides || [])];
    slides[i] = { ...slides[i], [key]: val };
    onChange({ ...data, slides });
  };
  const addSlide = () => onChange({ ...data, slides: [...(data.slides || []), { imageUrl: '', heading: `Slide ${(data.slides || []).length + 1}`, ctaText: 'View', ctaUrl: '/' }] });
  const removeSlide = (i) => onChange({ ...data, slides: (data.slides || []).filter((_, idx) => idx !== i) });
  return (
    <>
      <Field label=""><Toggle value={data.autoplay} onChange={v => onChange({ ...data, autoplay: v })} label="Autoplay" /></Field>
      {data.autoplay && <Field label="Interval (ms)"><Input type="number" value={data.interval} onChange={v => onChange({ ...data, interval: parseInt(v) })} /></Field>}
      <Field label="Slides">
        {(data.slides || []).map((slide, i) => (
          <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Slide {i + 1}</span>
              {(data.slides || []).length > 1 && <button onClick={() => removeSlide(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}><Icon name="x" size={14} /></button>}
            </div>
            <Input value={slide.imageUrl} onChange={v => updateSlide(i, 'imageUrl', v)} placeholder="Image URL" />
            <div style={{ marginTop: 6 }}><Input value={slide.heading} onChange={v => updateSlide(i, 'heading', v)} placeholder="Slide heading" /></div>
            <div style={{ marginTop: 6 }}><Input value={slide.ctaText} onChange={v => updateSlide(i, 'ctaText', v)} placeholder="Button text" /></div>
            <div style={{ marginTop: 6 }}><Input value={slide.ctaUrl} onChange={v => updateSlide(i, 'ctaUrl', v)} placeholder="Link URL" /></div>
          </div>
        ))}
        <button onClick={addSlide} style={{ width: '100%', padding: '8px', border: '1.5px dashed #d1d5db', borderRadius: 8, background: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 12, marginTop: 4 }}>+ Add Slide</button>
      </Field>
    </>
  );
};

const FeaturedProps = ({ data, onChange }) => (
  <>
    <Field label="Product ID"><Input value={data.productId} onChange={v => onChange({ ...data, productId: v })} placeholder="e.g. 101" /></Field>
    <Field label="Badge Text"><Input value={data.badge} onChange={v => onChange({ ...data, badge: v })} placeholder="Staff Pick" /></Field>
    <Field label=""><Toggle value={data.showDetails} onChange={v => onChange({ ...data, showDetails: v })} label="Show description & price" /></Field>
  </>
);

const RichTextProps = ({ data, onChange }) => (
  <>
    <Field label="HTML Content" hint="Raw HTML is supported"><Textarea value={data.html} onChange={v => onChange({ ...data, html: v })} rows={8} /></Field>
    <Field label="Padding (px)"><Input type="number" value={data.padding} onChange={v => onChange({ ...data, padding: parseInt(v) })} /></Field>
  </>
);

const PROPS_MAP = {
  hero_banner: HeroBannerProps,
  slider_banner: SliderProps,
  product_grid: ProductGridProps,
  product_row: ProductGridProps,
  featured: FeaturedProps,
  offer_strip: OfferStripProps,
  promo_card: PromoCardProps,
  category_grid: CategoryGridProps,
  announcement: AnnouncementProps,
  testimonial: TestimonialProps,
  countdown: CountdownProps,
  rich_text: RichTextProps,
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminBuilder = () => {
  const { isAdminMode, toggleAdminMode } = useAdmin();
  const [sections, setSections] = useState([]);
  const [activePage, setActivePage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState('desktop');
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [published, setPublished] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => { fetchSections(activePage); }, [activePage]);

  const fetchSections = async (page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('niraa_token');
      const res = await fetch(`${API_BASE_URL}/sections/admin/${page}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        const initial = data.sections || [];
        setSections(initial);
        setHistory([initial]);
        setHistoryIndex(0);
        setSelectedId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pushHistory = useCallback((newSections) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newSections].slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const updateSections = (newSections) => {
    setSections(newSections);
    pushHistory(newSections);
    setPublished(false);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setSections(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setSections(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  };

  const addSection = (type) => {
    const newSection = {
      id: `sec_${Date.now()}`,
      page: activePage,
      type,
      title: SECTION_META[type].label,
      visible: true,
      order: sections.length,
      data: { ...DEFAULT_DATA[type] },
    };
    const newSections = [...sections, newSection];
    updateSections(newSections);
    setSelectedId(newSection.id);
  };

  const deleteSection = (id) => {
    if (!window.confirm('Delete this section?')) return;
    updateSections(sections.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateSection = (section) => {
    const copy = { ...section, id: `sec_${Date.now()}`, title: section.title + ' (copy)', data: { ...section.data } };
    const idx = sections.findIndex(s => s.id === section.id);
    const newSections = [...sections.slice(0, idx + 1), copy, ...sections.slice(idx + 1)];
    updateSections(newSections);
    setSelectedId(copy.id);
  };

  const toggleVisibility = (id) => {
    updateSections(sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const moveSection = (id, dir) => {
    const idx = sections.findIndex(s => s.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const arr = [...sections];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    updateSections(arr);
  };

  const updateSectionData = (id, data) => {
    updateSections(sections.map(s => s.id === id ? { ...s, data } : s));
  };

  const updateSectionTitle = (id, title) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, title } : s));
  };

  const saveSections = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('niraa_token');
      const res = await fetch(`${API_BASE_URL}/sections/bulk/${activePage}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sections }),
      });
      if (res.ok) {
        toast.success('Changes saved!');
      } else {
        toast.error('Save failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const publishSections = async () => {
    await saveSections();
    try {
      const token = localStorage.getItem('niraa_token');
      const res = await fetch(`${API_BASE_URL}/sections/${activePage}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPublished(true);
        toast.success(`🚀 ${activePage} page published to live site!`);
      } else {
        toast.error('Publish failed');
      }
    } catch {
      toast.error('Network error during publish');
    }
  };

  // Drag & drop
  const handleDragStart = (e, id) => { setIsDragging(id); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e, id) => { e.preventDefault(); setDragOver(id); };
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!isDragging || isDragging === targetId) { setIsDragging(null); setDragOver(null); return; }
    const fromIdx = sections.findIndex(s => s.id === isDragging);
    const toIdx = sections.findIndex(s => s.id === targetId);
    const arr = [...sections];
    const [removed] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, removed);
    updateSections(arr);
    setIsDragging(null);
    setDragOver(null);
  };

  const selectedSection = sections.find(s => s.id === selectedId);
  const PropsPanel = selectedSection ? PROPS_MAP[selectedSection.type] : null;
  const filteredTypes = Object.entries(SECTION_META).filter(([, m]) =>
    !searchQuery || m.label.toLowerCase().includes(searchQuery.toLowerCase()) || m.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#2d9a8e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      <span style={{ color: '#6b7280', fontSize: 14 }}>Loading builder...</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', system-ui, sans-serif", background: '#f1f5f9', overflow: 'hidden' }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width: 240, background: '#0f172a', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
        {/* Brand */}
        <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.02em' }}>🛒 Site Builder</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Drag sections to reorder</div>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 12px 8px' }}>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search blocks..." style={{ width: '100%', padding: '7px 10px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#e2e8f0', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {/* Section type buttons */}
        <div style={{ padding: '4px 12px 12px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, marginTop: 4 }}>Add Block</div>
          {filteredTypes.map(([type, meta]) => (
            <button key={type} onClick={() => addSection(type)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer', marginBottom: 2, transition: 'background 0.15s', textAlign: 'left', color: '#cbd5e1' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: 16 }}>{meta.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{meta.label}</div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>{meta.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom nav */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: '#475569', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Actions</div>
          {[
            { label: 'Undo', icon: 'undo', action: undo, disabled: historyIndex <= 0 },
            { label: 'Redo', icon: 'redo', action: redo, disabled: historyIndex >= history.length - 1 },
            { label: 'Customer View', icon: 'eye', action: toggleAdminMode },
          ].map(item => (
            <button key={item.label} onClick={item.action} disabled={item.disabled}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', background: 'none', border: 'none', borderRadius: 8, cursor: item.disabled ? 'not-allowed' : 'pointer', color: item.disabled ? '#334155' : '#94a3b8', fontSize: 12, marginBottom: 2 }}
            >
              <Icon name={item.icon} size={13} />{item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CANVAS AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 20px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Page Layout</span>
              <span style={{ background: published ? '#d1fae5' : '#fef3c7', color: published ? '#065f46' : '#92400e', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>{published ? '✓ LIVE' : '● DRAFT'}</span>
            </div>
            
            {/* Page Selector */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: 8 }}>
              {['home', 'about', 'contact', 'products'].map(page => (
                <button
                  key={page}
                  onClick={() => setActivePage(page)}
                  style={{
                    padding: '6px 12px',
                    background: activePage === page ? '#fff' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: activePage === page ? '#0f172a' : '#64748b',
                    cursor: 'pointer',
                    boxShadow: activePage === page ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    textTransform: 'capitalize'
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Preview mode toggle */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 2, gap: 2 }}>
              {[{ val: 'desktop', icon: 'desktop' }, { val: 'mobile', icon: 'mobile' }].map(p => (
                <button key={p.val} onClick={() => setPreview(p.val)}
                  style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: preview === p.val ? '#fff' : 'none', color: preview === p.val ? '#0f172a' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, boxShadow: preview === p.val ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                >
                  <Icon name={p.icon} size={13} />{p.val.charAt(0).toUpperCase() + p.val.slice(1)}
                </button>
              ))}
            </div>

            <span style={{ color: '#e2e8f0' }}>|</span>
            <button onClick={saveSections} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151' }}>
              <Icon name="save" size={13} />{saving ? 'Saving…' : 'Save Draft'}
            </button>
            <button onClick={publishSections}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: '#2d9a8e', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff' }}>
              <Icon name="publish" size={13} />Publish
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', justifyContent: 'center' }}>
          <div ref={canvasRef} style={{ width: preview === 'mobile' ? 390 : '100%', maxWidth: 900, transition: 'width 0.3s' }}>
            {sections.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: 16, border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏗️</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Canvas is empty</div>
                <div style={{ fontSize: 13 }}>Pick a block from the left panel to start building</div>
              </div>
            )}

            {sections.map((section, idx) => {
              const meta = SECTION_META[section.type];
              const PreviewComp = PREVIEW_MAP[section.type];
              const isSelected = selectedId === section.id;
              const isDragTarget = dragOver === section.id;
              return (
                <div key={section.id}
                  draggable
                  onDragStart={e => handleDragStart(e, section.id)}
                  onDragOver={e => handleDragOver(e, section.id)}
                  onDrop={e => handleDrop(e, section.id)}
                  onDragEnd={() => { setIsDragging(null); setDragOver(null); }}
                  onClick={() => setSelectedId(isSelected ? null : section.id)}
                  style={{
                    marginBottom: 12, borderRadius: 12, overflow: 'hidden',
                    border: isSelected ? '2px solid #2d9a8e' : isDragTarget ? '2px dashed #2d9a8e' : '2px solid transparent',
                    background: '#fff',
                    opacity: isDragging === section.id ? 0.5 : section.visible ? 1 : 0.45,
                    cursor: 'grab', boxShadow: isSelected ? '0 0 0 4px rgba(45,154,142,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
                    transition: 'border 0.15s, box-shadow 0.15s',
                  }}
                >
                  {/* Section bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: isSelected ? '#f0fdf9' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#94a3b8', cursor: 'grab' }}><Icon name="grip" size={14} /></span>
                    <span style={{ fontSize: 14 }}>{meta.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', flex: 1 }}>{section.title}</span>
                    <span style={{ fontSize: 10, color: '#94a3b8', background: '#f1f5f9', padding: '1px 6px', borderRadius: 6 }}>{meta.label}</span>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 2, marginLeft: 4 }} onClick={e => e.stopPropagation()}>
                      <ActionBtn icon="chevronU" title="Move Up" onClick={() => moveSection(section.id, -1)} disabled={idx === 0} />
                      <ActionBtn icon="chevronD" title="Move Down" onClick={() => moveSection(section.id, 1)} disabled={idx === sections.length - 1} />
                      <ActionBtn icon="eye" title={section.visible ? 'Hide' : 'Show'} onClick={() => toggleVisibility(section.id)} active={!section.visible} />
                      <ActionBtn icon="copy" title="Duplicate" onClick={() => duplicateSection(section)} />
                      <ActionBtn icon="trash" title="Delete" onClick={() => deleteSection(section.id)} danger />
                    </div>
                  </div>

                  {/* Section preview */}
                  <div style={{ padding: 16 }}>
                    {PreviewComp && <PreviewComp data={section.data || {}} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      {selectedSection && (
        <div style={{ width: 300, background: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
          {/* Panel header */}
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{SECTION_META[selectedSection.type]?.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Edit Section</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{SECTION_META[selectedSection.type]?.label}</div>
              </div>
            </div>
            <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
              <Icon name="x" size={16} />
            </button>
          </div>

          <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
            {/* Section name edit */}
            <Field label="Section Label" hint="Internal name, not visible to customers">
              <Input value={selectedSection.title} onChange={v => updateSectionTitle(selectedSection.id, v)} />
            </Field>

            <div style={{ height: 1, background: '#e2e8f0', margin: '12px 0' }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Content Settings</div>

            {/* Type-specific props */}
            {PropsPanel && (
              <PropsPanel
                data={selectedSection.data || {}}
                onChange={data => updateSectionData(selectedSection.id, data)}
              />
            )}
          </div>

          {/* Apply changes footer */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0 }}>
            <button onClick={saveSections}
              style={{ width: '100%', padding: '9px', background: '#2d9a8e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon name="save" size={14} />Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Small reusable action button ──────────────────────────────────────────────
const ActionBtn = ({ icon, title, onClick, disabled, danger, active }) => (
  <button
    onClick={onClick} disabled={disabled} title={title}
    style={{
      padding: '4px 6px', background: 'none', border: 'none', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
      color: danger ? '#ef4444' : active ? '#2d9a8e' : '#94a3b8', opacity: disabled ? 0.35 : 1,
      display: 'flex', alignItems: 'center', transition: 'background 0.1s',
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = danger ? '#fee2e2' : '#f1f5f9'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
  >
    <Icon name={icon} size={14} />
  </button>
);

export default AdminBuilder;