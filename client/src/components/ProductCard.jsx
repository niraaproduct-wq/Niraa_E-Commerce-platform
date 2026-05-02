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

  // Optimize image URL for Cloudinary if applicable
  const getOptimizedImg = (url) => {
    if (!url) return placeholderImage(product.name || 'Product');
    if (url.includes('cloudinary.com')) {
      // Use higher res and pure white padding for a seamless look
      return url.replace('/upload/', '/upload/w_600,h_600,c_pad,b_white,f_auto,q_auto/');
    }
    return url;
  };

  const imgSrc = getOptimizedImg(product?.image || (product?.images?.[0]));
  const savings = (product?.originalPrice && product?.price) ? (product.originalPrice - product.price) : 0;
  
  // Highlight badges (prioritize bestseller, then discount)
  const badge = product.highlightBadge || (product.discount > 0 ? `${product.discount}% OFF` : null);

  return (
    <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid rgba(148,163,184,0.12)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-10px)';
          e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(42,125,114,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
        }}
      >
        {/* Image Area - Normalized Square Box */}
        <div style={{ 
          position: 'relative', 
          background: '#fff', // Pure white background to blend with Cloudinary padding
          width: '100%',
          aspectRatio: '1 / 1', // Force square ratio for perfect alignment
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12, // Balanced padding
          overflow: 'hidden',
          borderBottom: '1px solid rgba(0,0,0,0.03)'
        }}>
          <img
            src={imgSrc}
            alt={product.name}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain', 
              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.06))'
            }}
            onMouseEnter={e => { e.target.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
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
              boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)',
              textTransform: 'uppercase',
              zIndex: 2
            }}>{badge}</div>
          )}
          
          {product.isCombo && (
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: 'linear-gradient(135deg, #c8a84b, #d4a843)',
              color: '#fff',
              borderRadius: 8, fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px',
              boxShadow: '0 4px 10px rgba(200, 168, 75, 0.3)',
              textTransform: 'uppercase',
              zIndex: 2
            }}>Best Value</div>
          )}
        </div>

        {/* Content Area */}
        <div style={{ padding: '18px 20px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Trust Line & Rating */}
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

          {/* Product Name */}
          <h3 className="product-title" style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 900, 
            color: 'var(--gray-900)', 
            marginBottom: 8, 
            lineHeight: 1.2, 
            letterSpacing: '-0.02em' 
          }}>
            {product.name}
          </h3>

          {/* Benefit Highlight (Emotional Hook) */}
          <p className="benefit-text" style={{ 
            fontSize: '0.82rem', 
            color: 'var(--gray-500)', 
            marginBottom: 14, 
            lineHeight: 1.5,
            fontWeight: 500,
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.shortBenefit || "Professional grade cleaning that's safe for your home and family."}
          </p>

          {/* Social Proof */}
          <div className="social-proof" style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
             <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span> {product.salesCount || '500+'} customers trusted this
          </div>

          {/* Bottom Row: Price & CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span className="price-text" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.04em' }}>
                  {formatPrice(product.price || 0)}
                </span>
                {product.originalPrice > product.price && (
                   <span style={{ fontSize: '0.88rem', color: 'var(--gray-400)', textDecoration: 'line-through', fontWeight: 500 }}>
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 800 }}>Save {formatPrice(savings)}</span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="add-to-cart-btn"
              style={{
                background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))',
                color: '#fff', border: 'none',
                borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 10px 15px -3px rgba(42, 125, 114, 0.3)',
                flexShrink: 0,
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.transform = 'scale(1.05) rotate(2deg)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(42, 125, 114, 0.4)';
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.transform = 'scale(1) rotate(0)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(42, 125, 114, 0.3)';
              }}
            >
              <FiShoppingCart size={18} />
              <span className="btn-text" style={{ marginLeft: 8, fontSize: '0.85rem', fontWeight: 800 }}>Add to Cart</span>
            </button>
          </div>
        </div>

        <style>{`
          .product-card-content {
            padding: 18px 20px 24px;
          }
          .product-title {
            font-size: ${compact ? '1rem' : '1.15rem'};
          }
          .price-text {
            font-size: 1.45rem;
          }
          .add-to-cart-btn {
            padding: 12px 18px;
          }
          .btn-text {
            display: inline-block;
          }
          
          @media (max-width: 640px) {
            .product-card-content {
              padding: 12px 14px 16px !important;
            }
            .product-title {
              font-size: 0.9rem !important;
              margin-bottom: 4px !important;
            }
            .benefit-text {
              font-size: 0.75rem !important;
              margin-bottom: 8px !important;
              -webkit-line-clamp: 1 !important;
            }
            .social-proof {
              margin-bottom: 12px !important;
              font-size: 0.65rem !important;
            }
            .price-text {
              font-size: 1.1rem !important;
            }
            .add-to-cart-btn {
              padding: 10px !important;
              width: 40px !important;
              height: 40px !important;
              border-radius: 12px !important;
            }
            .btn-text {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </Link>
  );
}