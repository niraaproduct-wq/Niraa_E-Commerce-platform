import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { WHATSAPP_NUMBER } from '../utils/constants.js';
import { FiShoppingCart, FiZap, FiCheck, FiArrowLeft, FiTruck, FiShield, FiGift } from 'react-icons/fi';
import { AiOutlineWhatsApp } from 'react-icons/ai';
import { db } from '../config/firebase';
import { collection, query, where, limit, onSnapshot, getDocs } from 'firebase/firestore';

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
  const [comboItemsWithCurrentPrices, setComboItemsWithCurrentPrices] = useState([]);
  const navigate = useNavigate();
  const { addToCart, items, updateQty } = useCart();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Listen for real-time updates
    const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        const p = { id: docSnap.id, _id: docSnap.id, ...data };
        setProduct(p);
        setMainImage(p.images?.[0] || p.image);
        setQty(1);
        
        // Fetch current prices for combo items if they exist
        if (p.comboItems && p.comboItems.length > 0) {
          await fetchComboItemsWithCurrentPrices(p.comboItems);
        }
        
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

  // Fetch current prices for all combo items from database
  const fetchComboItemsWithCurrentPrices = async (comboItems) => {
    try {
      // Fetch all active products once to allow fuzzy/normalized matching
      const productsSnap = await getDocs(query(collection(db, 'products')));
      const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const normalize = (s = '') =>
        s
          .toString()
          .toLowerCase()
          .replace(/[–—_\/]+/g, ' ')
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\b(litre|liter|lt|l|ml|g|kg|500ml|750ml|1l|1lt|1lt)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();

      const findProduct = (itemName) => {
        if (!itemName) return null;
        const n = normalize(itemName);

        // Exact normalized match
        let match = products.find((p) => normalize(p.name) === n);
        if (match) return match;

        // Contains / partial match
        match = products.find((p) => {
          const pn = normalize(p.name);
          return (pn && n && (pn.includes(n) || n.includes(pn)));
        });
        if (match) return match;

        // Try matching by slug
        match = products.find((p) => p.slug && p.slug.toLowerCase() === itemName.toString().toLowerCase());
        if (match) return match;

        return null;
      };

      const updatedItems = await Promise.all(
        comboItems.map(async (item) => {
          // String item (e.g., "Dish Wash Lemon 750ml")
          if (typeof item === 'string') {
            const matched = findProduct(item);
            if (matched) {
              return { name: item, price: matched.price || 0, qty: 1, productId: matched.id };
            }
            return { name: item, price: 0, qty: 1 };
          }

          // Object item with name
          if (typeof item === 'object' && item.name) {
            const matched = findProduct(item.name);
            if (matched) {
              return {
                ...item,
                price: matched.price || item.price || 0,
                qty: item.qty || 1,
                productId: matched.id,
              };
            }
            // keep as-is but ensure numeric fields
            return {
              ...item,
              price: item.price || 0,
              qty: item.qty || 1,
            };
          }

          return item;
        })
      );

      setComboItemsWithCurrentPrices(updatedItems);
    } catch (err) {
      console.error('Error fetching combo items prices:', err);
      setComboItemsWithCurrentPrices(comboItems);
    }
  };

  // Sync qty when stock changes
  useEffect(() => {
    if (product) {
      const stock = product.stock || 0;
      if (stock <= 0) {
        setQty(0);
      } else {
        setQty(1);
      }
    }
  }, [product]);

  const imageList = useMemo(() => {
    if (product?.images?.length) return product.images;
    if (product?.image) return [product.image];
    return [];
  }, [product]);

  if (loading) return (
    <main className="container page" style={{ paddingTop: 12 }}>
      <div className="pd-layout">
        <style>{`
          .pd-layout { display: grid; grid-template-columns: 1fr; gap: 32px; margin-top: 20px; }
          @media (min-width: 900px) { .pd-layout { grid-template-columns: 1fr 1.1fr; } }
          
          .pdd-shimmer {
            animation: pddSweep 1.6s infinite linear;
            background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
            background-size: 1000px 104px;
            position: relative;
            overflow: hidden;
          }
          @keyframes pddSweep {
            0% { background-position: -468px 0; }
            100% { background-position: 468px 0; }
          }
          .skeleton-breadcrumb {
            height: 16px; width: 220px; border-radius: 4px; margin-bottom: 20px;
          }
          .skeleton-img-box {
            height: 380px; border-radius: 22px; width: 100%; margin-bottom: 14px;
          }
          .skeleton-thumbs {
            display: flex; gap: 12px;
          }
          .skeleton-thumb {
            width: 66px; height: 66px; border-radius: 12px;
          }
          .skeleton-badge {
            width: 120px; height: 22px; border-radius: 999px; margin-bottom: 12px;
          }
          .skeleton-title {
            width: 80%; height: 36px; border-radius: 6px; margin-bottom: 12px;
          }
          .skeleton-desc-line {
            width: 60%; height: 16px; border-radius: 4px; margin-bottom: 24px;
          }
          .skeleton-items-card {
            height: 140px; border-radius: 16px; width: 100%; margin-bottom: 20px;
          }
          .skeleton-price-card {
            height: 110px; border-radius: 16px; width: 100%; margin-bottom: 24px;
          }
          .skeleton-qty {
            width: 140px; height: 40px; border-radius: 14px; margin-bottom: 28px;
          }
          .skeleton-btn-row {
            display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;
          }
          .skeleton-btn-large {
            height: 50px; border-radius: 14px;
          }
          .skeleton-btn-wide {
            height: 50px; border-radius: 14px; width: 100%;
          }
        `}</style>
        
        <div>
          <div className="skeleton-breadcrumb pdd-shimmer" />
          <div className="skeleton-img-box pdd-shimmer" />
          <div className="skeleton-thumbs">
            <div className="skeleton-thumb pdd-shimmer" />
            <div className="skeleton-thumb pdd-shimmer" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '36px' }}>
          <div className="skeleton-title pdd-shimmer" />
          <div className="skeleton-desc-line pdd-shimmer" />
          
          <div style={{ width: '150px', height: '18px', borderRadius: '4px', marginBottom: '10px' }} className="pdd-shimmer" />
          <div className="skeleton-items-card pdd-shimmer" />
          
          <div className="skeleton-price-card pdd-shimmer" />
          <div className="skeleton-qty pdd-shimmer" />
          
          <div className="skeleton-btn-row">
            <div className="skeleton-btn-large pdd-shimmer" />
            <div className="skeleton-btn-large pdd-shimmer" />
          </div>
          <div className="skeleton-btn-wide pdd-shimmer" />
        </div>
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

  // Compute Prices Dynamically
  const comboItemsList = comboItemsWithCurrentPrices.length > 0 ? comboItemsWithCurrentPrices : product?.comboItems || [];
  
  // Calculate total individual price with current prices
  let totalIndividualPrice = 0;
  if (comboItemsList.length > 0) {
    totalIndividualPrice = comboItemsList.reduce((acc, item) => {
      const itemPrice = typeof item === 'object' && item.price ? Number(item.price) : 0;
      const itemQty = typeof item === 'object' && item.qty ? Number(item.qty) : 1;
      return acc + (itemPrice * itemQty);
    }, 0);
  }
  
  // If no items or calculated price is 0, fallback to originalPrice
  if (totalIndividualPrice === 0) {
    totalIndividualPrice = product?.originalPrice || product?.comparePrice || product?.price || 0;
  }
  
  const comboPrice = product?.price || 0;
  // Make sure totalIndividualPrice is at least comboPrice for sanity
  totalIndividualPrice = Math.max(totalIndividualPrice, comboPrice);
  
  const savingsAmount = totalIndividualPrice - comboPrice;
  const savingsPct = totalIndividualPrice > 0 ? Math.round((savingsAmount / totalIndividualPrice) * 100) : 0;
  const currentStock = product?.stock || 0;



  const addSelectedToCart = (silent = false) => {
    if (currentStock <= 0) {
      toast.error('Sorry, this combo is currently out of stock!');
      return false;
    }
    const uid = product._id;
    const existing = items.find(i => i.uid === uid);
    
    // Ensure we don't exceed current stock
    const cartQty = existing ? existing.qty : 0;
    const requestedQty = Math.max(1, Math.min(10, Number(qty) || 1));
    
    if (cartQty + requestedQty > currentStock) {
      toast.error(`Cannot add more. You already have ${cartQty} in cart, and only ${currentStock} are available.`);
      return false;
    }

    if (existing) {
      updateQty(uid, cartQty + requestedQty);
    } else {
      for (let i = 0; i < requestedQty; i++) addToCart(product);
    }
    
    if (!silent) {
      toast.success(`${product.name} combo added to cart!`);
    }
    return true;
  };

  const handleBuyNow = () => {
    const success = addSelectedToCart(true);
    if (success) {
      navigate('/checkout');
    }
  };

  const waText = currentStock <= 0
    ? `Hello NIRAA! I wanted to inquire about the availability of the COMBO deal:\n*${product.name}*\nIt is currently showing as out of stock. When will it be back in stock?`
    : `Hello NIRAA! I want to order the COMBO deal:\n*${product.name}*\nQty: ${qty}\nCombo Price: ${formatPrice(comboPrice)}\n\nPlease confirm availability and delivery.`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(waText)}`;

  return (
    <main className="container page" style={{ paddingTop: 12 }}>
      <Helmet>
        <title>{`${product.name} Combo | Niraa Care`}</title>
        <meta name="description" content={product.description ? (product.description.length > 155 ? `${product.description.substring(0, 152)}...` : product.description) : `Save on Niraa Care's special bundle deal: ${product.name}. Eco-friendly cleaning products with fast delivery in Dharmapuri.`} />
      </Helmet>
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
                   const itemPrice = typeof item === 'object' && item.price ? Number(item.price) : null;
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
                <button
                  className="qty-btn"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={currentStock <= 0}
                  style={{
                    border: 'none',
                    borderRadius: 0,
                    borderRight: '1px solid rgba(200,168,75,0.15)',
                    ...(currentStock <= 0 ? { cursor: 'not-allowed', opacity: 0.5 } : {})
                  }}
                >
                  −
                </button>
                <span style={{ fontWeight: 900, fontSize: '1.1rem', minWidth: 44, textAlign: 'center', padding: '0 8px', color: currentStock <= 0 ? 'var(--gray-400)' : 'inherit' }}>
                  {qty}
                </span>
                <button
                  className="qty-btn"
                  onClick={() => setQty(q => Math.min(currentStock, q + 1))}
                  disabled={currentStock <= 0 || qty >= currentStock}
                  style={{
                    border: 'none',
                    borderRadius: 0,
                    borderLeft: '1px solid rgba(200,168,75,0.15)',
                    ...(currentStock <= 0 || qty >= currentStock ? { cursor: 'not-allowed', opacity: 0.5 } : {})
                  }}
                >
                  +
                </button>
              </div>
              {currentStock < 15 && currentStock > 0 && (
                <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.82rem' }}>
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
          <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                className="action-btn action-btn--cart"
                onClick={() => addSelectedToCart(false)}
                disabled={currentStock <= 0}
                style={currentStock <= 0 ? {
                  background: '#f1f5f9',
                  color: '#94a3b8',
                  border: '1.5px solid #cbd5e1',
                  cursor: 'not-allowed',
                  boxShadow: 'none'
                } : {}}
              >
                <FiShoppingCart size={17} />
                {currentStock <= 0 ? 'Out of Stock' : 'Add Combo to Cart'}
              </button>
              <button
                className="action-btn action-btn--buy"
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                style={currentStock <= 0 ? {
                  background: '#f8fafc',
                  color: '#cbd5e1',
                  cursor: 'not-allowed',
                  boxShadow: 'none',
                  border: '1px solid #e2e8f0'
                } : {}}
              >
                <FiZap size={17} /> Buy Combo Now
              </button>
            </div>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="action-btn"
              style={{
                color: '#fff',
                textDecoration: 'none',
                background: currentStock <= 0 ? 'linear-gradient(135deg, #718096, #4a5568)' : '#25D366',
                boxShadow: currentStock <= 0 ? 'none' : '0 8px 24px rgba(37,211,102,0.3)'
              }}
            >
              <AiOutlineWhatsApp size={20} />
              {currentStock <= 0 ? 'Inquire Stock via WhatsApp' : 'Order via WhatsApp'}
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
