import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { WHATSAPP_NUMBER } from '../utils/constants.js';
import { mockProducts } from '../utils/mockProducts.js';
import { FiShoppingCart, FiZap, FiStar, FiCheck, FiArrowLeft, FiTruck, FiShield, FiDroplet } from 'react-icons/fi';
import { AiOutlineWhatsApp } from 'react-icons/ai';

const TRUST_POINTS = [
  { icon: <FiShield size={14} />, text: '99.9% Germ Kill' },
  { icon: <FiDroplet size={14} />, text: 'Eco-Friendly Formula' },
  { icon: <FiTruck size={14} />, text: 'Delivery in 6 hrs' },
  { icon: <FiCheck size={14} />, text: 'Safe for Families' },
];

const RELATED_COUNT = 4;

const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [zoomPos, setZoomPos] = useState(null);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (!product) return (
    <main className="container page">
      <div style={{
        textAlign: 'center', padding: '100px 20px',
        background: '#fff', borderRadius: 24,
        border: '1px solid rgba(42,125,114,0.1)',
        margin: '20px auto', maxWidth: 500,
      }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🧴</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--gray-800)', marginBottom: 8 }}>Product not found</div>
        <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>This product may have been removed or the link is incorrect.</p>
        <Link to="/products" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: '#fff', background: 'var(--teal)',
          padding: '12px 24px', borderRadius: 14, fontWeight: 800, textDecoration: 'none',
        }}>
          <FiArrowLeft size={16} /> Back to Products
        </Link>
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

  // Related products (same category, excluding current)
  const related = useMemo(() => {
    return mockProducts.filter(p => p.category === product.category && p._id !== product._id).slice(0, RELATED_COUNT);
  }, [product]);

  const TABS = [
    { id: 'description', label: '📋 Description' },
    ...(product.features?.length ? [{ id: 'features', label: '✨ Features' }] : []),
    ...(product.usage ? [{ id: 'usage', label: '📖 How to Use' }] : []),
    ...(product.comboItems?.length ? [{ id: 'combo', label: '🎁 What\'s Inside' }] : []),
  ];

  return (
    <main className="container page" style={{ paddingTop: 12 }}>
      <style>{`
        .pd-layout { display: grid; grid-template-columns: 1fr; gap: 32px; }
        @media (min-width: 900px) { .pd-layout { grid-template-columns: 1fr 1.1fr; } }

        .pd-img-col { display: flex; gap: 12px; }

        .pd-thumbnails { display: flex; flex-direction: column; gap: 8px; }
        .pd-thumb-btn {
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 3px;
          background: #fff;
          cursor: pointer;
          width: 66px; height: 66px;
          flex-shrink: 0;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .pd-thumb-btn:hover { border-color: rgba(42,125,114,0.4); transform: scale(1.05); }
        .pd-thumb-btn.active { border-color: var(--teal); box-shadow: 0 4px 14px rgba(42,125,114,0.2); }
        .pd-thumb-btn img { width: 100%; height: 100%; object-fit: contain; border-radius: 9px; }

        .pd-main-img {
          flex: 1;
          background: linear-gradient(145deg, #f8fffe, #f0faf8);
          border-radius: 22px;
          border: 1px solid rgba(42,125,114,0.1);
          display: flex; align-items: center; justify-content: center;
          padding: 28px;
          min-height: 380px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(42,125,114,0.08);
          cursor: zoom-in;
        }
        .pd-main-img img {
          max-width: 100%;
          max-height: 340px;
          object-fit: contain;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pd-main-img:hover img { transform: scale(1.06); }

        .variant-btn {
          padding: 10px 16px;
          border-radius: 12px;
          border: 1.5px solid rgba(42,125,114,0.2);
          background: #fff;
          cursor: pointer;
          font-size: 0.88rem;
          font-weight: 700;
          transition: all 0.2s;
          text-align: left;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .variant-btn:hover { border-color: var(--teal); background: #f0faf8; transform: translateY(-1px); }
        .variant-btn.active {
          border-color: var(--teal-dark);
          background: linear-gradient(135deg, var(--teal), var(--teal-dark));
          color: #fff;
          box-shadow: 0 6px 20px rgba(42,125,114,0.3);
        }

        .qty-btn {
          width: 40px; height: 40px;
          border-radius: 12px;
          border: 1.5px solid rgba(42,125,114,0.2);
          background: #fff;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .qty-btn:hover { border-color: var(--teal); background: #f0faf8; }
        .qty-btn:active { transform: scale(0.92); }

        .action-btn {
          padding: 15px 20px;
          border-radius: 14px;
          font-size: 0.95rem;
          font-weight: 800;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s;
          letter-spacing: -0.01em;
        }
        .action-btn:active { transform: scale(0.97); }
        .action-btn--cart {
          background: #fff8e6;
          color: #92640a;
          border: 1.5px solid rgba(200,168,75,0.3);
        }
        .action-btn--cart:hover { background: #fef0bc; border-color: #c8a84b; }
        .action-btn--buy {
          background: linear-gradient(135deg, var(--teal), var(--teal-dark));
          color: #fff;
          box-shadow: 0 8px 24px rgba(42,125,114,0.3);
        }
        .action-btn--buy:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(42,125,114,0.4); }
        .action-btn--wa {
          background: linear-gradient(135deg, #25D366, #1da851);
          color: #fff;
          box-shadow: 0 8px 24px rgba(37,211,102,0.3);
        }
        .action-btn--wa:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(37,211,102,0.4); }

        .tabs-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 20px;
        }
        .tab-btn {
          padding: 9px 18px;
          border-radius: 999px;
          border: 1.5px solid rgba(42,125,114,0.15);
          background: #fff;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--gray-600);
        }
        .tab-btn:hover { border-color: var(--teal); color: var(--teal); }
        .tab-btn.active {
          background: linear-gradient(135deg, var(--teal), var(--teal-dark));
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(42,125,114,0.25);
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media (min-width: 640px) { .related-grid { grid-template-columns: repeat(4, 1fr); } }

        .delivery-card {
          background: linear-gradient(135deg, #f8fffe, #f0faf8);
          border: 1px solid rgba(42,125,114,0.12);
          border-radius: 18px;
          padding: 18px 16px;
        }

        .discount-badge {
          position: absolute;
          top: 16px; left: 16px;
          background: linear-gradient(135deg, #e53e3e, #c53030);
          color: #fff;
          border-radius: 10px;
          padding: 5px 12px;
          font-size: 0.8rem;
          font-weight: 900;
          box-shadow: 0 4px 12px rgba(229,62,62,0.35);
          z-index: 2;
        }
        .combo-badge {
          position: absolute;
          top: 16px; right: 16px;
          background: linear-gradient(135deg, var(--gold, #c8a84b), #d4a843);
          color: #fff;
          border-radius: 10px;
          padding: 5px 12px;
          font-size: 0.72rem;
          font-weight: 900;
          box-shadow: 0 4px 12px rgba(200,168,75,0.35);
          z-index: 2;
        }
      `}</style>

      {/* ─── BREADCRUMB ──────────────────────── */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: '0.82rem', flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>Home</Link>
        <span style={{ color: 'var(--gray-400)' }}>/</span>
        <Link to="/products" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>Products</Link>
        <span style={{ color: 'var(--gray-400)' }}>/</span>
        <span style={{ color: 'var(--gray-600)', fontWeight: 700 }}>{product.name}</span>
      </nav>

      {/* ─── MAIN SECTION ────────────────────── */}
      <section className="pd-layout" style={{ marginBottom: 40 }}>
        {/* LEFT: Images */}
        <div>
          <div className="pd-img-col">
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

            <div className="pd-main-img">
              {discountPct > 0 && <div className="discount-badge">{discountPct}% OFF</div>}
              {product.isCombo && <div className="combo-badge">COMBO DEAL</div>}
              {mainImage ? (
                <img src={mainImage} alt={product.name} />
              ) : (
                <div style={{ fontSize: '6rem', opacity: 0.4 }}>🧴</div>
              )}
            </div>
          </div>

          {/* Trust row below image */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            {TRUST_POINTS.map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: '#f0faf8', color: 'var(--teal-dark)',
                borderRadius: 999, padding: '5px 12px', fontSize: '0.73rem', fontWeight: 700,
                border: '1px solid rgba(42,125,114,0.1)',
              }}>
                {t.icon} {t.text}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Category badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(42,125,114,0.1)', color: 'var(--teal-dark)',
              padding: '4px 12px', borderRadius: 999, fontSize: '0.73rem', fontWeight: 700,
            }}>
              {product.category?.replace(/-/g, ' ')?.toUpperCase()}
            </span>
            {product.isCombo && (
              <span style={{
                background: 'rgba(200,168,75,0.12)', color: '#9a6a00',
                padding: '4px 12px', borderRadius: 999, fontSize: '0.73rem', fontWeight: 700,
              }}>🎁 COMBO</span>
            )}
            {product.subscriptionAvailable && (
              <span style={{
                background: 'rgba(22,163,74,0.1)', color: '#15803d',
                padding: '4px 12px', borderRadius: 999, fontSize: '0.73rem', fontWeight: 700,
              }}>🔄 Monthly Refill</span>
            )}
          </div>

          {/* Product name */}
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
              fontWeight: 900,
              color: 'var(--gray-900, #111)',
              margin: '0 0 8px',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}>
              {product.name}
            </h1>
            {/* Rating stars (mock) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} style={{ color: s <= 4 ? '#f59e0b' : '#e5e7eb', fontSize: '1rem' }}>★</span>
                ))}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)', fontWeight: 600 }}>4.6 (120+ reviews)</span>
            </div>
          </div>

          {/* Price */}
          <div style={{ background: 'linear-gradient(135deg, #f8fffe, #f0faf8)', borderRadius: 18, padding: '18px 16px', border: '1px solid rgba(42,125,114,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: savings > 0 ? 8 : 0 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: 'var(--teal-dark)', letterSpacing: '-0.04em' }}>
                {formatPrice(currentPrice)}
              </span>
              {currentOriginalPrice && (
                <span style={{ textDecoration: 'line-through', color: 'var(--gray-400)', fontSize: '1.1rem', fontWeight: 500 }}>
                  {formatPrice(currentOriginalPrice)}
                </span>
              )}
              {discountPct > 0 && (
                <span style={{
                  background: 'linear-gradient(135deg, #e53e3e, #c53030)',
                  color: '#fff', fontWeight: 900, fontSize: '0.82rem',
                  padding: '3px 10px', borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(229,62,62,0.25)',
                }}>
                  {discountPct}% OFF
                </span>
              )}
            </div>
            {savings > 0 && (
              <div style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiCheck size={14} /> You save {formatPrice(savings)}!
              </div>
            )}
            <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--gray-500)' }}>Inclusive of all taxes • Free delivery in Dharmapuri area</div>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <div style={{ fontWeight: 800, color: 'var(--gray-800)', marginBottom: 12, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                📦 Select Size / Type
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {product.variants.map(v => (
                  <button
                    key={v.variantId}
                    className={`variant-btn ${selectedVariant?.variantId === v.variantId ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    <div style={{ fontSize: '0.88rem' }}>{v.size} · {v.type}</div>
                    <div style={{ fontSize: '0.8rem', marginTop: 2, opacity: 0.9, fontWeight: 800 }}>{formatPrice(v.price)}</div>
                    {v.stockQuantity < 15 && (
                      <div style={{ fontSize: '0.7rem', color: selectedVariant?.variantId === v.variantId ? '#fde68a' : '#dc2626', marginTop: 2, fontWeight: 700 }}>
                        ⚠ Only {v.stockQuantity} left!
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <div style={{ fontWeight: 800, color: 'var(--gray-800)', marginBottom: 12, fontSize: '0.9rem' }}>Quantity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#fff', border: '1.5px solid rgba(42,125,114,0.2)', borderRadius: 14, overflow: 'hidden' }}>
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} style={{ border: 'none', borderRadius: 0, borderRight: '1px solid rgba(42,125,114,0.15)' }}>−</button>
                <span style={{ fontWeight: 900, fontSize: '1.1rem', minWidth: 44, textAlign: 'center', padding: '0 8px' }}>{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => Math.min(10, q + 1))} style={{ border: 'none', borderRadius: 0, borderLeft: '1px solid rgba(42,125,114,0.15)' }}>+</button>
              </div>
              {currentStock < 15 && currentStock > 0 && (
                <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ⚠ Only {currentStock} in stock
                </span>
              )}
              {currentStock === 0 && (
                <span style={{ color: '#dc2626', fontWeight: 800, fontSize: '0.82rem' }}>
                  ❌ Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button className="action-btn action-btn--cart" onClick={addSelectedToCart}>
                <FiShoppingCart size={17} /> Add to Cart
              </button>
              <button className="action-btn action-btn--buy" onClick={handleBuyNow}>
                <FiZap size={17} /> Buy Now
              </button>
            </div>
            <a href={waLink} target="_blank" rel="noreferrer" className="action-btn action-btn--wa" style={{ textDecoration: 'none' }}>
              <AiOutlineWhatsApp size={20} /> Order via WhatsApp
            </a>
          </div>

          {/* Delivery Info */}
          <div className="delivery-card">
            <div style={{ fontWeight: 800, color: 'var(--teal-dark)', marginBottom: 12, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiTruck size={16} /> Delivery Info
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { icon: '📍', text: 'Dharmapuri & nearby' },
                { icon: '🔢', text: 'Pincode starts 636' },
                { icon: '⚡', text: 'Delivery in 6 hours' },
                { icon: '💳', text: 'UPI or Cash on Delivery' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: '0.8rem', color: 'var(--gray-700)' }}>
                  <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <span style={{ fontWeight: 600 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCT DETAIL TABS ─────────────── */}
      <section style={{ marginBottom: 44, background: '#fff', borderRadius: 24, border: '1px solid rgba(42,125,114,0.1)', padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div className="tabs-row">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <p style={{ color: 'var(--gray-700)', lineHeight: 1.8, fontSize: '0.95rem', margin: 0 }}>
            {product.description}
          </p>
        )}
        {activeTab === 'features' && product.features?.length > 0 && (
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {product.features.map((f, i) => (
              <li key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: '#f0faf8', borderRadius: 12, padding: '10px 14px',
                color: 'var(--gray-700)', fontSize: '0.88rem', lineHeight: 1.5,
                border: '1px solid rgba(42,125,114,0.08)',
              }}>
                <FiCheck size={15} color="var(--teal)" style={{ marginTop: 2, flexShrink: 0 }} />
                {f}
              </li>
            ))}
          </ul>
        )}
        {activeTab === 'usage' && product.usage && (
          <p style={{ color: 'var(--gray-700)', lineHeight: 1.8, fontSize: '0.92rem', margin: 0 }}>
            {product.usage}
          </p>
        )}
        {activeTab === 'combo' && product.comboItems?.length > 0 && (
          <div>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.88rem', marginBottom: 16 }}>
              This combo includes {product.comboItems.length} premium products:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {product.comboItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#fffbf0', borderRadius: 12, padding: '10px 14px',
                  color: 'var(--gray-700)', fontSize: '0.88rem',
                  border: '1.5px solid rgba(200,168,75,0.2)',
                }}>
                  <span style={{ color: '#c8a84b', fontWeight: 900, fontSize: '1rem' }}>✦</span> {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ─── RELATED PRODUCTS ────────────────── */}
      {related.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 10 }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--teal)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 16, height: 2, background: 'var(--teal)', borderRadius: 2, display: 'inline-block' }} />
                You Might Like
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 900, color: 'var(--gray-800)', margin: 0, letterSpacing: '-0.02em' }}>
                Related Products
              </h2>
            </div>
            <Link to={`/products?category=${product.category}`} style={{
              color: 'var(--teal-dark)', fontWeight: 700, fontSize: '0.82rem',
              textDecoration: 'none', padding: '8px 16px',
              border: '1.5px solid rgba(42,125,114,0.2)', borderRadius: 999,
            }}>
              View All →
            </Link>
          </div>
          <div className="related-grid">
            {related.map(p => (
              <ProductCard key={p._id} product={p} compact />
            ))}
          </div>
        </section>
      )}

      {/* ─── BACK LINK ───────────────────────── */}
      <div style={{ paddingBottom: 24 }}>
        <Link to="/products" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          color: 'var(--teal)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem',
          padding: '10px 18px', border: '1.5px solid rgba(42,125,114,0.2)',
          borderRadius: 12, transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f0faf8'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <FiArrowLeft size={16} /> Back to All Products
        </Link>
      </div>
    </main>
  );
};

export default ProductDetails;