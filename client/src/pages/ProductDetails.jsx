import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { WHATSAPP_NUMBER } from '../utils/constants.js';
import { mockProducts } from '../utils/mockProducts.js';
import { FiShoppingCart, FiZap, FiStar, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { AiOutlineWhatsApp } from 'react-icons/ai';

const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();
  const { addToCart, items, updateQty } = useCart();

  useEffect(() => {
    const data = mockProducts.find(p => p.slug === slug);
    if (data) {
      setProduct(data);
      setMainImage(data.images?.[0] || data.image);
      setQty(1);
      setSelectedVariant(data.variants?.[0] || null);
    } else {
      setProduct(null);
    }
  }, [slug]);

  if (!product) return (
    <main className="container page">
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--gray-400)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🧴</div>
        <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>Product not found</div>
        <Link to="/products" style={{ marginTop: 16, display: 'inline-block', color: 'var(--teal)', fontWeight: 700 }}>← Back to Products</Link>
      </div>
    </main>
  );

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const currentStock = selectedVariant ? selectedVariant.stockQuantity : 99;
  const discountPct = currentOriginalPrice ? Math.round((1 - currentPrice / currentOriginalPrice) * 100) : product.discount;
  const savings = currentOriginalPrice ? currentOriginalPrice - currentPrice : 0;

  const addSelectedToCart = () => {
    const pToAdd = selectedVariant
      ? { ...product, price: currentPrice, originalPrice: currentOriginalPrice, variantId: selectedVariant.variantId, variantDesc: `${selectedVariant.size} - ${selectedVariant.type}` }
      : product;
    const uid = pToAdd.variantId ? `${pToAdd._id}-${pToAdd.variantId}` : pToAdd._id;
    const existing = items.find(i => i.uid === uid);
    const safeQty = Math.max(1, Math.min(10, Number(qty) || 1));
    if (existing) {
      updateQty(uid, existing.qty + safeQty);
    } else {
      for (let i = 0; i < safeQty; i++) addToCart(pToAdd);
    }
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addSelectedToCart();
    navigate('/checkout');
  };

  const waText = `Hello NIRAA! I want to order:\n*${product.name}*${selectedVariant ? ` (${selectedVariant.size} - ${selectedVariant.type})` : ''}\nQty: ${qty}\nPrice: ${formatPrice(currentPrice)} each\n\nPlease confirm availability and delivery.`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(waText)}`;

  const imageList = useMemo(() => {
    if (product?.images?.length) return product.images;
    if (product?.image) return [product.image];
    return [];
  }, [product]);

  return (
    <main className="container page" style={{ paddingTop: 12 }}>

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, fontSize: '0.88rem', color: 'var(--gray-500)', flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link to="/products" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>Products</Link>
        <span>/</span>
        <span style={{ color: 'var(--gray-700)', fontWeight: 600 }}>{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <style>{`
        .pd-layout { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 900px) { .pd-layout { grid-template-columns: 1fr 1.1fr; } }
        .pd-img-col { display: flex; gap: 12px; }
        .pd-thumbnails { display: flex; flex-direction: column; gap: 8px; }
        .pd-thumb-btn { border: 2px solid transparent; border-radius: 8px; padding: 3px; background: #fff; cursor: pointer; width: 62px; height: 62px; flex-shrink: 0; transition: border-color 0.2s; }
        .pd-thumb-btn:hover, .pd-thumb-btn.active { border-color: var(--teal); }
        .pd-thumb-btn img { width: 100%; height: 100%; object-fit: contain; border-radius: 5px; }
        .variant-btn { padding: 8px 16px; border-radius: 8px; border: 1.5px solid var(--gray-300); background: #fff; cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.18s; text-align: left; }
        .variant-btn:hover { border-color: var(--teal); }
        .variant-btn.active { border-color: var(--teal-dark); background: var(--teal-dark); color: #fff; }
        .qty-btn { width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid var(--gray-300); background: #fff; font-size: 1.1rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: border-color 0.2s; }
        .qty-btn:hover { border-color: var(--teal); }
        .action-btn { padding: 14px 24px; border-radius: 10px; font-size: 1rem; font-weight: 800; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
        .action-btn--cart { background: #fff5e0; color: #b27700; border: 1.5px solid #f0c040; }
        .action-btn--cart:hover { background: #ffe9a0; }
        .action-btn--buy { background: var(--teal); color: #fff; }
        .action-btn--buy:hover { background: var(--teal-dark); }
        .action-btn--wa { background: #25D366; color: #fff; }
        .action-btn--wa:hover { background: #1da851; }
        .feature-tag { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; background: #e6f4f2; color: var(--teal-dark); border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
      `}</style>

      <section className="pd-layout">
        {/* LEFT: Images */}
        <div>
          <div className="pd-img-col">
            {/* Vertical Thumbnails */}
            {imageList.length > 1 && (
              <div className="pd-thumbnails">
                {imageList.map((src, i) => (
                  <button
                    key={i}
                    className={`pd-thumb-btn ${mainImage === src ? 'active' : ''}`}
                    onMouseEnter={() => setMainImage(src)}
                    onClick={() => setMainImage(src)}
                  >
                    <img src={src} alt={`${product.name} view ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div style={{
              flex: 1, background: '#fff', borderRadius: 16, border: '1px solid var(--gray-200)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24, minHeight: 380, position: 'relative', overflow: 'hidden'
            }}>
              {discountPct > 0 && (
                <div style={{
                  position: 'absolute', top: 14, left: 14,
                  background: '#e53e3e', color: '#fff',
                  borderRadius: 6, padding: '4px 10px',
                  fontSize: '0.8rem', fontWeight: 800
                }}>{discountPct}% OFF</div>
              )}
              {product.isCombo && (
                <div style={{
                  position: 'absolute', top: 14, right: 14,
                  background: 'var(--gold)', color: '#fff',
                  borderRadius: 6, padding: '4px 10px',
                  fontSize: '0.75rem', fontWeight: 800
                }}>COMBO DEAL</div>
              )}
              <img
                src={mainImage || product.image}
                alt={product.name}
                style={{ maxWidth: '100%', maxHeight: 340, objectFit: 'contain', transition: 'transform 0.3s' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              />
            </div>
          </div>

          {/* Action buttons for mobile (shown below image)  */}
          <div style={{ display: 'none' }} className="mobile-actions" />
        </div>

        {/* RIGHT: Product Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Category + Title */}
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--teal)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              {product.categoryLabel || product.category.replace(/-/g, ' ')}
            </div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--gray-900)', lineHeight: 1.3 }}>
              {product.name}
            </h1>

            {/* Rating row */}
            {product.rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(s => (
                    <FiStar key={s} size={14} fill={s <= Math.round(product.rating) ? 'var(--gold)' : 'none'} color="var(--gold)" />
                  ))}
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>{product.rating.toFixed(1)} ({product.numReviews} reviews)</span>
              </div>
            )}
          </div>

          {/* Price Block */}
          <div style={{ background: '#f8fffe', borderRadius: 12, padding: '14px 16px', border: '1px solid #d4f0ec' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--teal-dark)', fontFamily: 'var(--font-display)' }}>
                {formatPrice(currentPrice)}
              </span>
              {currentOriginalPrice && (
                <span style={{ fontSize: '1rem', color: 'var(--gray-400)', textDecoration: 'line-through' }}>
                  {formatPrice(currentOriginalPrice)}
                </span>
              )}
              {discountPct > 0 && (
                <span style={{ background: '#e6f4f2', color: 'var(--teal-dark)', fontWeight: 800, fontSize: '0.88rem', padding: '3px 8px', borderRadius: 6 }}>
                  {discountPct}% OFF
                </span>
              )}
            </div>
            {savings > 0 && (
              <div style={{ marginTop: 4, color: '#2d7d4a', fontWeight: 700, fontSize: '0.9rem' }}>
                ✓ You save {formatPrice(savings)}!
              </div>
            )}
            <div style={{ marginTop: 6, fontSize: '0.82rem', color: 'var(--gray-500)' }}>Inclusive of all taxes. Free delivery for Dharmapuri area.</div>
          </div>

          {/* Feature Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span className="feature-tag"><FiCheck size={12} /> Safe Formula</span>
            <span className="feature-tag"><FiCheck size={12} /> Eco-Friendly</span>
            <span className="feature-tag"><FiCheck size={12} /> Local Delivery</span>
            {product.subscriptionAvailable && <span className="feature-tag"><FiCheck size={12} /> Monthly Refill</span>}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <div style={{ fontWeight: 800, color: 'var(--gray-800)', marginBottom: 10, fontSize: '0.95rem' }}>
                Select Size / Type
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {product.variants.map(v => (
                  <button
                    key={v.variantId}
                    className={`variant-btn ${selectedVariant?.variantId === v.variantId ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    <div>{v.size} · {v.type}</div>
                    <div style={{ fontSize: '0.82rem', marginTop: 2, opacity: 0.85 }}>{formatPrice(v.price)}</div>
                    {v.stockQuantity < 15 && (
                      <div style={{ fontSize: '0.75rem', color: selectedVariant?.variantId === v.variantId ? '#ffd' : '#c05', marginTop: 2, fontWeight: 700 }}>
                        Only {v.stockQuantity} left!
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <div style={{ fontWeight: 800, color: 'var(--gray-800)', marginBottom: 10, fontSize: '0.95rem' }}>Quantity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span style={{ fontWeight: 900, fontSize: '1.2rem', minWidth: 32, textAlign: 'center' }}>{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(10, q + 1))}>+</button>
              {currentStock < 15 && (
                <span style={{ color: '#c05', fontWeight: 700, fontSize: '0.85rem' }}>
                  ⚠ Only {currentStock} in stock
                </span>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button className="action-btn action-btn--cart" onClick={addSelectedToCart}>
                <FiShoppingCart size={18} /> Add to Cart
              </button>
              <button className="action-btn action-btn--buy" onClick={handleBuyNow}>
                <FiZap size={18} /> Buy Now
              </button>
            </div>
            <a href={waLink} target="_blank" rel="noreferrer" className="action-btn action-btn--wa" style={{ textDecoration: 'none' }}>
              <AiOutlineWhatsApp size={20} /> Order via WhatsApp
            </a>
          </div>

          {/* Delivery Info */}
          <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 10, padding: '12px 14px', fontSize: '0.88rem' }}>
            <div style={{ fontWeight: 800, color: 'var(--gray-800)', marginBottom: 6 }}>🚚 Delivery Info</div>
            <div style={{ color: 'var(--gray-600)', lineHeight: 1.7 }}>
              <div>✓ Serving <strong>Dharmapuri & nearby areas</strong> only</div>
              <div>✓ Pincode must start with <strong>636</strong></div>
              <div>✓ Local delivery within <strong>6 hours</strong> of order</div>
              <div>✓ Pay via <strong>UPI or Cash on Delivery</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Tabs */}
      <section style={{ marginTop: 36, display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>

        {/* Description */}
        <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 14, padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', color: 'var(--teal-dark)', fontSize: '1rem', fontWeight: 800 }}>📋 Product Description</h3>
          <p style={{ color: 'var(--gray-700)', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>{product.description}</p>
        </div>

        {/* Features */}
        {product.features?.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ margin: '0 0 12px', color: 'var(--teal-dark)', fontSize: '1rem', fontWeight: 800 }}>✨ Key Features</h3>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {product.features.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--gray-700)', fontSize: '0.92rem' }}>
                  <FiCheck size={15} color="var(--teal)" style={{ marginTop: 3, flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Usage */}
        {product.usage && (
          <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ margin: '0 0 12px', color: 'var(--teal-dark)', fontSize: '1rem', fontWeight: 800 }}>📖 How to Use</h3>
            <p style={{ color: 'var(--gray-700)', lineHeight: 1.7, fontSize: '0.92rem', margin: 0 }}>{product.usage}</p>
          </div>
        )}

        {/* Combo items */}
        {product.comboItems?.length > 0 && (
          <div style={{ background: '#fffbf0', border: '1.5px solid var(--gold-light)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ margin: '0 0 12px', color: '#9a6a00', fontSize: '1rem', fontWeight: 800 }}>🎁 Combo Includes</h3>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {product.comboItems.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray-700)', fontSize: '0.92rem' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 900 }}>•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Back to Products */}
      <div style={{ marginTop: 32, paddingBottom: 20 }}>
        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--teal)', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
          <FiArrowLeft size={16} /> Back to All Products
        </Link>
      </div>

    </main>
  );
};

export default ProductDetails;
