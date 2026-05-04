import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { WHATSAPP_NUMBER } from '../utils/constants.js';
import { FiShoppingCart, FiZap, FiCheck, FiArrowLeft, FiTruck, FiShield, FiGift } from 'react-icons/fi';
import { AiOutlineWhatsApp } from 'react-icons/ai';
import { db } from '../config/firebase';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';

const TRUST_POINTS = [
  { icon: <FiShield size={14} />, text: 'Guaranteed Savings' },
  { icon: <FiGift size={14} />, text: 'Curated Bundle' },
  { icon: <FiTruck size={14} />, text: 'Free Delivery' },
];

const ComboDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart, items, updateQty } = useCart();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Listen for real-time updates
    const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        const p = { id: docSnap.id, _id: docSnap.id, ...data };
        setProduct(p);
        setMainImage(img => img || p.images?.[0] || p.image);
        setLoading(false);
      } else {
        setLoading(false);
        setProduct(null);
      }
    }, (err) => {
      console.error('Firestore onSnapshot error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  const imageList = useMemo(() => {
    if (product?.images?.length) return product.images;
    if (product?.image) return [product.image];
    return [];
  }, [product]);

  if (loading) return (
    <main className="container page">
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--teal)' }}>
        Loading combo details...
      </div>
    </main>
  );

  if (!product) return (
    <main className="container page">
      <div style={{
        textAlign: 'center', padding: '100px 20px',
        background: '#fff', borderRadius: 24,
        border: '1px solid rgba(42,125,114,0.1)',
        margin: '20px auto', maxWidth: 500,
      }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎁</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--gray-800)', marginBottom: 8 }}>Combo not found</div>
        <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>This combo deal may have expired or the link is incorrect.</p>
        <Link to="/products" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: '#fff', background: 'var(--teal)',
          padding: '12px 24px', borderRadius: 14, fontWeight: 800, textDecoration: 'none',
        }}>
          <FiArrowLeft size={16} /> Explore Other Deals
        </Link>
      </div>
    </main>
  );

  // Compute Prices
  const comboItemsList = product.comboItems || [];
  const hasItemPrices = comboItemsList.some(i => i.price && typeof i === 'object');
  
  // Calculate total individual price if we have item prices, otherwise fallback to product.originalPrice
  let totalIndividualPrice = 0;
  if (hasItemPrices) {
    totalIndividualPrice = comboItemsList.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
  } else {
    totalIndividualPrice = product.originalPrice || product.comparePrice || product.price;
  }
  
  const comboPrice = product.price || 0;
  // Make sure totalIndividualPrice is at least comboPrice for sanity
  totalIndividualPrice = Math.max(totalIndividualPrice, comboPrice);
  
  const savingsAmount = totalIndividualPrice - comboPrice;
  const savingsPct = totalIndividualPrice > 0 ? Math.round((savingsAmount / totalIndividualPrice) * 100) : 0;
  const currentStock = product.stock || 0;

  const addSelectedToCart = () => {
    const uid = product._id;
    const existing = items.find(i => i.uid === uid);
    const safeQty = Math.max(1, Math.min(10, Number(qty) || 1));
    if (existing) {
      updateQty(uid, existing.qty + safeQty);
    } else {
      for (let i = 0; i < safeQty; i++) addToCart(product);
    }
    toast.success(`${product.name} combo added to cart!`);
  };

  const handleBuyNow = () => {
    addSelectedToCart();
    navigate('/checkout');
  };

  const waText = `Hello NIRAA! I want to order the COMBO deal:\n*${product.name}*\nQty: ${qty}\nCombo Price: ${formatPrice(comboPrice)}\n\nPlease confirm availability and delivery.`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(waText)}`;

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
        .pd-thumb-btn:hover { border-color: rgba(200,168,75,0.4); transform: scale(1.05); }
        .pd-thumb-btn.active { border-color: #c8a84b; box-shadow: 0 4px 14px rgba(200,168,75,0.2); }
        .pd-thumb-btn img { width: 100%; height: 100%; object-fit: contain; border-radius: 9px; }

        .pd-main-img {
          flex: 1;
          background: linear-gradient(145deg, #fffdf8, #fcf8ec);
          border-radius: 22px;
          border: 1px solid rgba(200,168,75,0.2);
          display: flex; align-items: center; justify-content: center;
          padding: 28px;
          min-height: 380px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(200,168,75,0.08);
          cursor: zoom-in;
        }
        .pd-main-img img {
          max-width: 100%;
          max-height: 340px;
          object-fit: contain;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pd-main-img:hover img { transform: scale(1.06); }

        .qty-btn {
          width: 40px; height: 40px;
          border-radius: 12px;
          border: 1.5px solid rgba(200,168,75,0.3);
          background: #fff;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .qty-btn:hover { border-color: #c8a84b; background: #fffdf8; }
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
          border: 1.5px solid rgba(200,168,75,0.4);
        }
        .action-btn--cart:hover { background: #fef0bc; border-color: #c8a84b; }
        .action-btn--buy {
          background: linear-gradient(135deg, #d4a843, #b48616);
          color: #fff;
          box-shadow: 0 8px 24px rgba(200,168,75,0.3);
        }
        .action-btn--buy:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(200,168,75,0.4); }

        .price-breakdown {
          background: linear-gradient(135deg, #fffdf8, #fffdf8);
          border: 1px solid rgba(200,168,75,0.3);
          border-radius: 16px;
          padding: 16px;
          margin-top: 16px;
        }
        .breakdown-row {
          display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem;
        }
      `}</style>

      {/* ─── BREADCRUMB ──────────────────────── */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: '0.82rem', flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>Home</Link>
        <span style={{ color: 'var(--gray-400)' }}>/</span>
        <Link to="/products" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>Special Bundles</Link>
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
              <div style={{
                position: 'absolute', top: 16, right: 16,
                background: 'linear-gradient(135deg, #c8a84b, #d4a843)',
                color: '#fff', padding: '5px 12px', borderRadius: 10,
                fontSize: '0.72rem', fontWeight: 900, boxShadow: '0 4px 12px rgba(200,168,75,0.35)',
                zIndex: 2
              }}>🎁 COMBO OFFER</div>
              
              {savingsPct > 0 && (
                <div style={{
                  position: 'absolute', top: 16, left: 16,
                  background: 'linear-gradient(135deg, #e53e3e, #c53030)',
                  color: '#fff', padding: '5px 12px', borderRadius: 10,
                  fontSize: '0.8rem', fontWeight: 900, boxShadow: '0 4px 12px rgba(229,62,62,0.35)',
                  zIndex: 2
                }}>{savingsPct}% OFF</div>
              )}

              {mainImage ? (
                <img src={mainImage} alt={product.name} />
              ) : (
                <div style={{ fontSize: '6rem', opacity: 0.4 }}>🎁</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            {TRUST_POINTS.map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: '#fffdf8', color: '#9a6a00',
                borderRadius: 999, padding: '5px 12px', fontSize: '0.73rem', fontWeight: 700,
                border: '1px solid rgba(200,168,75,0.2)',
              }}>
                {t.icon} {t.text}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Header */}
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 900,
              color: 'var(--gray-900, #111)',
              margin: '0 0 8px',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}>
              {product.name}
            </h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem', marginBottom: 0, fontWeight: 500 }}>
              {product.shortBenefit || "Get the complete set and maximize your savings."}
            </p>
          </div>

          {/* Items Included List */}
          {comboItemsList.length > 0 && (
            <div>
              <div style={{ fontWeight: 800, color: 'var(--gray-800)', marginBottom: 12, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                🧾 Included Products
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                {comboItemsList.map((item, idx) => {
                  const itemName = typeof item === 'object' ? item.name : item;
                  const itemPrice = typeof item === 'object' && item.price ? item.price : null;
                  const itemQty = typeof item === 'object' && item.qty ? item.qty : 1;
                  
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx !== comboItemsList.length - 1 ? '1px solid #e2e8f0' : 'none', paddingBottom: idx !== comboItemsList.length - 1 ? 8 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiCheck color="#16a34a" size={16} />
                        <span style={{ fontSize: '0.9rem', color: 'var(--gray-700)', fontWeight: 600 }}>
                          {itemName} {itemQty > 1 ? `(x${itemQty})` : ''}
                        </span>
                      </div>
                      {itemPrice && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 500 }}>
                          {formatPrice(itemPrice * itemQty)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pricing & Value Comparison */}
          <div className="price-breakdown">
            <div className="breakdown-row" style={{ color: 'var(--gray-500)' }}>
              <span>Total Individual Price:</span>
              <span style={{ textDecoration: 'line-through' }}>{formatPrice(totalIndividualPrice)}</span>
            </div>
            <div className="breakdown-row" style={{ color: 'var(--gray-800)', fontWeight: 700, fontSize: '1.1rem', marginTop: 8 }}>
              <span>Combo Price:</span>
              <span style={{ color: '#b48616', fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 900 }}>{formatPrice(comboPrice)}</span>
            </div>
            {savingsAmount > 0 && (
              <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px 12px', borderRadius: 8, marginTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.95rem' }}>
                <span>You Save:</span>
                <span>{formatPrice(savingsAmount)} ({savingsPct}%)</span>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <div style={{ fontWeight: 800, color: 'var(--gray-800)', marginBottom: 8, fontSize: '0.9rem' }}>Quantity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#fff', border: '1.5px solid rgba(200,168,75,0.3)', borderRadius: 14, overflow: 'hidden' }}>
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} style={{ border: 'none', borderRadius: 0, borderRight: '1px solid rgba(200,168,75,0.15)' }}>−</button>
                <span style={{ fontWeight: 900, fontSize: '1.1rem', minWidth: 44, textAlign: 'center', padding: '0 8px' }}>{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => Math.min(10, q + 1))} style={{ border: 'none', borderRadius: 0, borderLeft: '1px solid rgba(200,168,75,0.15)' }}>+</button>
              </div>
              {currentStock < 15 && currentStock > 0 && (
                <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.82rem' }}>
                  ⚠ Only {currentStock} in stock
                </span>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button className="action-btn action-btn--cart" onClick={addSelectedToCart}>
                <FiShoppingCart size={17} /> Add Combo to Cart
              </button>
              <button className="action-btn action-btn--buy" onClick={handleBuyNow}>
                <FiZap size={17} /> Buy Combo Now
              </button>
            </div>
            <a href={waLink} target="_blank" rel="noreferrer" className="action-btn" style={{ background: '#25D366', color: '#fff', textDecoration: 'none' }}>
              <AiOutlineWhatsApp size={20} /> Order via WhatsApp
            </a>
          </div>

        </div>
      </section>

      {/* ─── DESCRIPTION SECTION ─────────────── */}
      {product.description && (
        <section style={{ marginBottom: 44, background: '#fff', borderRadius: 24, border: '1px solid rgba(200,168,75,0.2)', padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 16px', fontFamily: 'var(--font-display)', color: 'var(--gray-900)' }}>Combo Description</h3>
          <p style={{ color: 'var(--gray-700)', lineHeight: 1.8, fontSize: '0.95rem', margin: 0 }}>
            {product.description}
          </p>
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

export default ComboDetails;
