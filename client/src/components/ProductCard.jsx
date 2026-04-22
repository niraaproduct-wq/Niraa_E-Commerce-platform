import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice, placeholderImage } from '../utils/constants.js';
import toast from 'react-hot-toast';

export default function ProductCard({ product, compact = false }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVariant = product.variants?.[0] || null;
    const cartItem = {
      ...product,
      selectedVariant: defaultVariant,
      uid: defaultVariant ? `${product._id}-${defaultVariant.variantId}` : product._id,
      price: defaultVariant?.price ?? product.price,
    };
    addToCart(cartItem);
    const variantLabel = defaultVariant ? ` (${defaultVariant.size})` : '';
    toast.success(`${product.name}${variantLabel} added to cart! 🛒`);
  };

  const imgSrc = product.image || placeholderImage(product.name);
  const minPrice = product.variants?.length > 0
    ? Math.min(...product.variants.map(v => v.price))
    : product.price;
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;

  return (
    <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          border: '1px solid rgba(148,163,184,0.18)',
          transition: 'all 0.25s ease',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 12px 36px rgba(42,125,114,0.14)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)';
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', background: 'linear-gradient(135deg, #f0faf8 0%, #fefcf3 100%)', height: compact ? 160 : 200, flexShrink: 0 }}>
          <img
            src={imgSrc}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 16, transition: 'transform 0.35s ease' }}
            onError={e => { e.target.src = placeholderImage(product.name); }}
          />
          {/* Badges */}
          {product.discount > 0 && (
            <div style={{
              position: 'absolute', top: 10, left: 10,
              background: '#ef4444', color: '#fff',
              borderRadius: 999, fontSize: '0.68rem', fontWeight: 700,
              padding: '3px 9px', letterSpacing: '0.03em',
            }}>{product.discount}% OFF</div>
          )}
          {product.isCombo && (
            <div style={{
              position: 'absolute', top: 10, right: 10,
              background: product.comboColor || 'var(--gold)', color: '#fff',
              borderRadius: 999, fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px',
            }}>COMBO</div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Category label */}
          <div style={{ fontSize: '0.7rem', color: 'var(--teal)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            {product.categoryLabel || product.category?.replace(/-/g, ' ')}
          </div>

          {/* Name */}
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: compact ? '0.9rem' : '0.97rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 4, lineHeight: 1.3, flex: 1 }}>
            {product.name}
          </h3>

          {/* Size/quantity */}
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: 8 }}>
            {product.quantity}
          </div>

          {/* Rating */}
          {product.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <FiStar key={s} size={11}
                  fill={s <= Math.round(product.rating) ? '#f59e0b' : 'none'}
                  color={s <= Math.round(product.rating) ? '#f59e0b' : '#d1d5db'}
                />
              ))}
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginLeft: 2 }}>
                {product.rating.toFixed(1)} ({product.numReviews})
              </span>
            </div>
          )}

          {/* Combo items */}
          {product.isCombo && product.comboItems && (
            <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {product.comboItems.slice(0, 3).map((item, i) => (
                <span key={i} style={{
                  fontSize: '0.65rem', background: '#f0faf8', color: 'var(--teal-dark)',
                  padding: '2px 7px', borderRadius: 999, fontWeight: 600, border: '1px solid rgba(42,125,114,0.15)',
                }}>{item}</span>
              ))}
              {product.comboItems.length > 3 && (
                <span style={{ fontSize: '0.65rem', color: 'var(--gray-400)', padding: '2px 4px' }}>+{product.comboItems.length - 3} more</span>
              )}
            </div>
          )}

          {/* Price row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--teal-dark)' }}>
                {product.variants?.length > 1 ? `From ${formatPrice(minPrice)}` : formatPrice(minPrice)}
              </span>
              {product.originalPrice && (
                <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)', textDecoration: 'line-through', marginLeft: 6 }}>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              title="Add to cart"
              style={{
                background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))',
                color: '#fff', border: 'none',
                borderRadius: 12, padding: '9px 13px',
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: '0.78rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(42,125,114,0.25)',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(42,125,114,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(42,125,114,0.25)'; }}
            >
              <FiShoppingCart size={14} />
              <span>Add</span>
            </button>
          </div>

          {/* Savings label */}
          {savings > 0 && !product.isCombo && (
            <div style={{ marginTop: 7, fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
              💰 You save {formatPrice(savings)}
            </div>
          )}
          {product.isCombo && savings > 0 && (
            <div style={{ marginTop: 7, fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
              🎉 Combo saves you {formatPrice(product.originalPrice - product.price)}!
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}