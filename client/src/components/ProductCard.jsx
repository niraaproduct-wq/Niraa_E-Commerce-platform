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
    const defaultVariant = product?.variants?.[0] || null;
    const cartItem = {
      ...product,
      selectedVariant: defaultVariant,
      uid: defaultVariant ? `${product?._id}-${defaultVariant.variantId}` : product?._id,
      price: defaultVariant?.price ?? (product?.price || 0),
    };
    addToCart(cartItem);
    const variantLabel = defaultVariant ? ` (${defaultVariant.size})` : '';
    toast.success(`${product?.name || 'Product'}${variantLabel} added to cart! 🛒`);
  };

  const imgSrc = product?.image || (product?.images?.[0]) || placeholderImage(product?.name || 'Product');
  const savings = (product?.originalPrice && product?.price) ? (product.originalPrice - product.price) : 0;
  
  // Highlight badges (prioritize bestseller, then discount)
  const badge = product.highlightBadge || (product.discount > 0 ? `${product.discount}% OFF` : null);

  return (
    <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid rgba(148,163,184,0.12)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 20px 48px rgba(42,125,114,0.15)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
        }}
      >
        {/* Image Area */}
        <div style={{ 
          position: 'relative', 
          background: 'linear-gradient(145deg, #f0faf8 0%, #fefcf3 100%)', 
          height: compact ? 170 : 220, 
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10
        }}>
          <img
            src={imgSrc}
            alt={product.name}
            style={{ 
              maxWidth: '90%', 
              maxHeight: '90%', 
              objectFit: 'contain', 
              transition: 'transform 0.5s ease',
              filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.08))'
            }}
            onError={e => { e.target.src = placeholderImage(product.name); }}
          />
          
          {/* Persuasive Badges */}
          {badge && (
            <div style={{
              position: 'absolute', top: 12, left: 12,
              background: product.highlightBadge ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff',
              borderRadius: 8, fontSize: '0.65rem', fontWeight: 800,
              padding: '4px 10px', letterSpacing: '0.04em',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              textTransform: 'uppercase'
            }}>{badge}</div>
          )}
          
          {product.isCombo && (
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: 'linear-gradient(135deg, #c8a84b, #d4a843)',
              color: '#fff',
              borderRadius: 8, fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              textTransform: 'uppercase'
            }}>Best Value</div>
          )}
        </div>

        {/* Content Area */}
        <div style={{ padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Trust Line & Rating */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--teal)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {product.categoryLabel || product.category?.replace(/-/g, ' ')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#fef3c7', padding: '2px 6px', borderRadius: 6 }}>
              <FiStar size={10} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#92400e' }}>
                {product.rating ? Number(product.rating).toFixed(1) : '4.8'}
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h3 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: compact ? '0.95rem' : '1.05rem', 
            fontWeight: 800, 
            color: 'var(--gray-900)', 
            marginBottom: 6, 
            lineHeight: 1.25, 
            letterSpacing: '-0.01em' 
          }}>
            {product.name}
          </h3>

          {/* Benefit Highlight (Emotional Hook) */}
          <p style={{ 
            fontSize: '0.8rem', 
            color: 'var(--gray-500)', 
            marginBottom: 12, 
            lineHeight: 1.4,
            fontWeight: 500,
            fontStyle: 'italic'
          }}>
            {product.shortBenefit || "Removes tough stains & kills 99.9% germs effortlessly."}
          </p>

          {/* Social Proof */}
          <div style={{ fontSize: '0.68rem', color: 'var(--gray-400)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
             <span style={{ color: '#16a34a' }}>●</span> {product.salesCount || '500+'} customers trusted this
          </div>

          {/* Bottom Row: Price & CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.03em' }}>
                  {formatPrice(product.price || 0)}
                </span>
                {product.originalPrice > product.price && (
                   <span style={{ fontSize: '0.85rem', color: 'var(--gray-400)', textDecoration: 'line-through', fontWeight: 500 }}>
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 800 }}>Save {formatPrice(savings)}</span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              style={{
                background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))',
                color: '#fff', border: 'none',
                borderRadius: 14, padding: '12px 18px',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: '0.85rem', fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 8px 20px rgba(42,125,114,0.3)',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(42,125,114,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(42,125,114,0.3)'; }}
            >
              <FiShoppingCart size={16} />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}