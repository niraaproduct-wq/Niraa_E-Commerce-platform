import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice, placeholderImage } from '../utils/constants.js';
import toast from 'react-hot-toast';

const CARD_CSS = `
  @keyframes pcFlyToCart {
    0%   { transform: scale(1) translateY(0); opacity: 1; }
    60%  { transform: scale(0.6) translateY(-40px); opacity: 0.7; }
    100% { transform: scale(0.1) translateY(-80px); opacity: 0; }
  }
  @keyframes pcAddPulse {
    0%,100% { box-shadow: 0 10px 15px -3px rgba(42,125,114,0.3); }
    50%      { box-shadow: 0 0 0 8px rgba(42,125,114,0.15); }
  }
  @keyframes pcBadgeIn {
    from { transform: scale(0.5) rotate(-12deg); opacity: 0; }
    to   { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes pcShimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .pc-card {
    background: #fff;
    border-radius: 22px;
    overflow: hidden;
    border: 1px solid rgba(148,163,184,0.12);
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.35s ease;
    cursor: pointer;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .pc-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 28px 56px -12px rgba(42,125,114,0.2);
  }
  .pc-card:active {
    transform: scale(0.97) translateY(-2px);
    box-shadow: 0 10px 24px -6px rgba(42,125,114,0.15);
  }
  .pc-img {
    transition: transform 0.6s cubic-bezier(0.34,1.56,0.64,1);
  }
  .pc-card:hover .pc-img { transform: scale(1.07); }
  .pc-add-btn {
    background: linear-gradient(135deg, var(--teal), var(--teal-dark));
    color: #fff; border: none; border-radius: 12px;
    padding: 12px 16px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.25s ease, filter 0.2s ease;
    box-shadow: 0 10px 15px -3px rgba(42,125,114,0.3);
    width: 100%; font-size: 0.9rem; font-weight: 700; gap: 6px;
  }
  .pc-add-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 30px -6px rgba(42,125,114,0.4);
    filter: brightness(1.08);
  }
  .pc-add-btn:active { transform: scale(0.96); }
  .pc-add-btn.adding { animation: pcAddPulse 0.6s ease; }
  .pc-badge { animation: pcBadgeIn 0.35s cubic-bezier(0.34,1.56,0.64,1); }
  @media (max-width: 641px) {
    .pc-title  { font-size: 0.9rem !important; margin-bottom: 4px !important; }
    .pc-desc   { font-size: 0.75rem !important; margin-bottom: 8px !important; -webkit-line-clamp: 1 !important; }
    .pc-proof  { margin-bottom: 12px !important; font-size: 0.65rem !important; }
    .pc-price  { font-size: 1.1rem !important; }
    .pc-btn-wrapper { display: none !important; }
    .pc-mobile-cart {
      display: flex !important; align-items: center !important;
      justify-content: center !important;
      width: 38px !important; height: 38px !important; min-width: 38px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, var(--teal), var(--teal-dark)) !important;
      color: #fff !important; border: none !important; cursor: pointer !important;
      box-shadow: 0 4px 12px rgba(42,125,114,0.4) !important;
      margin-left: auto !important; margin-top: 8px !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease !important;
    }
    .pc-mobile-cart:active { transform: scale(0.9) !important; }
    .pc-mobile-cart.adding { animation: pcAddPulse 0.6s ease !important; }
    .pc-btn-text { display: none !important; }
  }
`;

export default function ProductCard({ product, compact = false }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const btnRef = useRef(null);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setAdding(true);
    setTimeout(() => setAdding(false), 600);

    const defaultVariant = product?.variants?.[0] || null;
    const cartItem = {
      ...product,
      selectedVariant: defaultVariant,
      uid: defaultVariant ? `${product?._id}-${defaultVariant.variantId}` : product?._id,
      price: defaultVariant?.price ?? (product?.price || 0),
    };
    addToCart(cartItem);
    const variantLabel = defaultVariant ? ` (${defaultVariant.size})` : '';
    toast.success(`${product?.name || 'Product'}${variantLabel} added! 🛒`);
  };

  const getOptimizedImg = (url) => {
    if (!url) return placeholderImage(product.name || 'Product');
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', '/upload/w_600,h_600,c_pad,b_white,f_auto,q_auto/');
    }
    return url;
  };

  const imgSrc = getOptimizedImg(product?.image || product?.images?.[0]);
  const mrp = product?.comparePrice || product?.originalPrice || 0;
  const offerPrice = product?.price || 0;
  const savings = mrp > offerPrice ? mrp - offerPrice : 0;
  const discountPct = mrp > offerPrice ? Math.round(((mrp - offerPrice) / mrp) * 100) : 0;
  const badge = product.highlightBadge || (discountPct > 0 ? `${discountPct}% OFF` : null);

  const productLink = (product.productType === 'combo' || product.isCombo)
    ? `/combos/${product.slug}`
    : `/products/${product.slug}`;

  return (
    <Link to={productLink} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <style>{CARD_CSS}</style>

      <div className="pc-card" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

        {/* Image */}
        <div style={{
          position: 'relative', background: '#fff', width: '100%',
          aspectRatio: '1/1', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 12, overflow: 'hidden',
          borderBottom: '1px solid rgba(0,0,0,0.03)',
        }}>
          <img
            src={imgSrc}
            alt={product.name}
            className="pc-img"
            style={{
              maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.06))',
            }}
            onError={e => { e.target.src = placeholderImage(product.name); }}
          />

          {badge && (
            <div className="pc-badge" style={{
              position: 'absolute', top: 12, left: 12,
              background: product.highlightBadge
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff', borderRadius: 8, fontSize: '0.65rem', fontWeight: 800,
              padding: '4px 10px', letterSpacing: '0.04em',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              textTransform: 'uppercase', zIndex: 2,
            }}>{badge}</div>
          )}

          {product.isCombo && (
            <div className="pc-badge" style={{
              position: 'absolute', top: 12, right: 12,
              background: 'linear-gradient(135deg, #c8a84b, #d4a843)',
              color: '#fff', borderRadius: 8, fontSize: '0.65rem', fontWeight: 800,
              padding: '4px 10px', boxShadow: '0 4px 10px rgba(200,168,75,0.3)',
              textTransform: 'uppercase', zIndex: 2,
            }}>Best Value</div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '18px 20px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--teal)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {product.categoryLabel || product.category?.replace(/-/g, ' ')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#fef3c7', padding: '3px 8px', borderRadius: 8 }}>
              <FiStar size={10} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#92400e' }}>
                {product.rating ? Number(product.rating).toFixed(1) : '4.8'}
              </span>
            </div>
          </div>

          <h3 className="pc-title" style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            color: 'var(--gray-900)', marginBottom: 8,
            lineHeight: 1.2, letterSpacing: '-0.02em',
            fontSize: compact ? '1rem' : '1.15rem',
          }}>
            {product.name}
          </h3>

          <p className="pc-desc" style={{
            fontSize: '0.82rem', color: 'var(--gray-500)',
            marginBottom: 14, lineHeight: 1.5, fontWeight: 500,
            display: '-webkit-box', WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.shortBenefit || "Professional grade cleaning that's safe for your home and family."}
          </p>

          <div className="pc-proof" style={{
            fontSize: '0.7rem', color: 'var(--gray-400)',
            marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            {product.salesCount || '500+'} customers trusted this
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--teal)' }}>
                Offer Price
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span className="pc-price" style={{
                  fontFamily: 'var(--font-display)', fontWeight: 900,
                  color: 'var(--gray-900)', letterSpacing: '-0.04em', fontSize: '1.45rem',
                }}>{formatPrice(offerPrice)}</span>
                {mrp > offerPrice && (
                  <>
                    <span style={{ fontSize: '0.9rem', color: 'var(--gray-400)', textDecoration: 'line-through', fontWeight: 500 }}>
                      {formatPrice(mrp)}
                    </span>
                    {discountPct > 0 && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#e53935', background: 'rgba(229,57,53,0.12)', padding: '4px 8px', borderRadius: 4 }}>
                        {discountPct}% OFF
                      </span>
                    )}
                  </>
                )}
              </div>
              {mrp > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--gray-600)', fontWeight: 500 }}>
                  <span>MRP: {formatPrice(mrp)}</span>
                  {savings > 0 && <span style={{ color: '#16a34a', fontWeight: 700 }}>Save {formatPrice(savings)}</span>}
                </div>
              )}
            </div>

            {/* Mobile icon-only */}
            <button className={`pc-mobile-cart${adding ? ' adding' : ''}`} onClick={handleAddToCart} style={{ display: 'none' }}>
              <FiShoppingCart size={16} />
            </button>

            {/* Desktop full button */}
            <div className="pc-btn-wrapper">
              <button
                ref={btnRef}
                onClick={handleAddToCart}
                className={`pc-add-btn${adding ? ' adding' : ''}`}
              >
                <FiShoppingCart size={18} />
                <span className="pc-btn-text">
                  {adding ? 'Adding…' : 'Add to Cart'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}