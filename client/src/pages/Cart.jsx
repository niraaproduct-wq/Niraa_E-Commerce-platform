import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import CartItem from '../components/CartItem.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import { WHATSAPP_NUMBER } from '../utils/constants.js';

/* ─── Design Tokens ─── */
const T = {
  teal: '#1D9E75', tealDark: '#0F6E56', tealLight: '#E8F8F1',
  wa: '#25D366', waHover: '#1da851',
  gray50: '#F9F9F8', gray100: '#F2F1EF', gray200: '#E5E3DE',
  gray300: '#C9C6BF', gray400: '#A8A59D', gray500: '#87847C',
  gray600: '#6B6862', gray700: '#4A4845', gray800: '#2E2D2A', gray900: '#1A1917',
  white: '#FFFFFF', danger: '#DC2626', dangerLight: '#FEE2E2',
  gold: '#C8A84B',
  font: `'Outfit', 'DM Sans', system-ui, sans-serif`,
  fontDisplay: `'Playfair Display', Georgia, serif`,
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');

  .cart-page * { box-sizing: border-box; }

  /* ─── Entrance animations ─── */
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes bouncePop {
    0%   { transform: scale(1); }
    35%  { transform: scale(1.18); }
    65%  { transform: scale(0.94); }
    100% { transform: scale(1); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.55; transform: scale(1.35); }
  }
  @keyframes waPulse {
    0%   { box-shadow: 0 0 0 0 rgba(37,211,102,0.55); }
    70%  { box-shadow: 0 0 0 14px rgba(37,211,102,0); }
    100% { box-shadow: 0 0 0 0 rgba(37,211,102,0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes ribbonSlide {
    from { transform: translateX(-100%); }
    to   { transform: translateX(100%); }
  }
  @keyframes checkDraw {
    from { stroke-dashoffset: 40; opacity: 0; }
    to   { stroke-dashoffset: 0; opacity: 1; }
  }
  @keyframes floatUp {
    from { opacity: 0; transform: translateY(30px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* ─── Page layout ─── */
  .cart-grid-layout {
    display: grid; grid-template-columns: 1fr; gap: 24px;
  }
  @media (min-width: 900px) {
    .cart-grid-layout { grid-template-columns: 1fr 380px; }
  }

  /* ─── Buttons ─── */
  .cart-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 22px; border-radius: 14px; font-weight: 700; font-size: 14px;
    cursor: pointer; font-family: ${T.font}; border: none; text-decoration: none;
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    position: relative; overflow: hidden;
  }
  .cart-btn:hover { transform: translateY(-3px); }
  .cart-btn:active { transform: translateY(0) scale(0.97); }

  .cart-btn--primary {
    background: ${T.teal}; color: #fff;
    box-shadow: 0 4px 18px rgba(29,158,117,0.38);
  }
  .cart-btn--primary:hover { background: ${T.tealDark}; box-shadow: 0 10px 28px rgba(29,158,117,0.48); }

  .cart-btn--wa {
    background: ${T.wa}; color: #fff;
    animation: waPulse 2.5s ease-in-out infinite;
  }
  .cart-btn--wa:hover { background: ${T.waHover}; }

  .cart-btn--ghost {
    background: ${T.white}; color: ${T.gray700};
    border: 1.5px solid ${T.gray200};
  }
  .cart-btn--ghost:hover { border-color: ${T.teal}; color: ${T.teal}; background: ${T.tealLight}; }

  .cart-btn--danger {
    background: ${T.dangerLight}; color: ${T.danger};
    border: 1.5px solid #FECACA;
  }
  .cart-btn--danger:hover { background: #FEE2E2; transform: translateY(-2px); }

  /* Shimmer overlay on button */
  .cart-btn--shimmer::after {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: ribbonSlide 2.8s ease-in-out infinite;
  }

  /* ─── Summary card ─── */
  .summary-card {
    background: ${T.white};
    border: 1.5px solid ${T.gray200};
    border-radius: 26px; padding: 28px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    position: sticky; top: 20px;
    animation: slideInRight 0.6s 0.2s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* ─── Total row animation ─── */
  .total-amount {
    font-family: ${T.fontDisplay}; font-weight: 900;
    color: ${T.tealDark}; font-size: 22px;
    display: inline-block;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .total-amount.updated { animation: bouncePop 0.4s cubic-bezier(0.34,1.56,0.64,1); }

  /* ─── Promo ─── */
  .promo-input { display: flex; gap: 8px; margin: 16px 0; }
  .promo-input input {
    flex: 1; padding: 12px 16px;
    border: 1.5px solid ${T.gray200}; border-radius: 12px;
    font-family: ${T.font}; font-size: 13px; color: ${T.gray800};
    background: ${T.white}; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .promo-input input:focus {
    border-color: ${T.teal};
    box-shadow: 0 0 0 4px rgba(29,158,117,0.12);
  }
  .promo-input button {
    padding: 12px 18px; background: ${T.gray100}; border: 1.5px solid ${T.gray200};
    border-radius: 12px; font-weight: 700; font-size: 13px; color: ${T.gray700};
    cursor: pointer; font-family: ${T.font}; transition: all 0.25s;
  }
  .promo-input button:hover { background: ${T.tealLight}; border-color: ${T.teal}; color: ${T.teal}; transform: scale(1.04); }

  /* ─── Trust strip ─── */
  .trust-strip { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
  .trust-item {
    display: flex; align-items: center; gap: 5px;
    font-size: 11px; color: ${T.gray500}; font-weight: 600;
    padding: 5px 10px; background: ${T.gray50}; border-radius: 999px;
    border: 1px solid ${T.gray100}; transition: all 0.2s;
  }
  .trust-item:hover { background: ${T.tealLight}; color: ${T.tealDark}; border-color: rgba(29,158,117,0.2); }

  /* ─── Pulse dot ─── */
  .pulse-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
    animation: pulse 2s infinite; flex-shrink: 0;
  }

  /* ─── Items section ─── */
  .items-section {
    background: ${T.white}; border: 1.5px solid ${T.gray200};
    border-radius: 26px; overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    animation: slideInUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  .items-header {
    padding: 20px 24px; border-bottom: 1px solid ${T.gray100};
    display: flex; align-items: center; justify-content: space-between;
  }

  /* ─── Delivery banner ─── */
  .delivery-banner {
    margin-top: 16px; border-radius: 18px; padding: 16px 20px;
    display: flex; align-items: center; gap: 14px;
    background: linear-gradient(135deg, #e8f8f1, #f0fff8);
    border: 1px solid rgba(29,158,117,0.18);
    animation: gradientShift 6s ease infinite;
    background-size: 200% 200%;
  }

  /* ─── Empty cart ─── */
  .empty-cart {
    animation: floatUp 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
    max-width: 520px; margin: 0 auto; text-align: center; padding: 60px 24px;
  }
  .empty-icon-circle {
    width: 130px; height: 130px; border-radius: 50%;
    background: linear-gradient(135deg, ${T.tealLight}, #d1fae5);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 28px; font-size: 52px;
    animation: bouncePop 0.8s 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
    box-shadow: 0 12px 36px rgba(29,158,117,0.2);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .empty-icon-circle:hover { transform: scale(1.08) rotate(-5deg); }

  /* ─── Category teasers ─── */
  .cat-teaser {
    text-decoration: none; padding: 16px 10px;
    background: ${T.white}; border: 1.5px solid ${T.gray200};
    border-radius: 18px; text-align: center;
    transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
    display: block;
  }
  .cat-teaser:hover {
    border-color: ${T.teal}; background: ${T.tealLight};
    transform: translateY(-5px) scale(1.03);
    box-shadow: 0 12px 30px rgba(29,158,117,0.18);
  }
  .cat-teaser-icon {
    font-size: 26px; margin-bottom: 6px; display: block;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .cat-teaser:hover .cat-teaser-icon { transform: scale(1.2) translateY(-3px); }

  /* ─── Item count badge ─── */
  .item-badge {
    background: ${T.teal}; color: #fff; border-radius: 999px;
    font-size: 12px; font-weight: 800; padding: 2px 11px;
    display: inline-block;
    animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* ─── Savings tag ─── */
  .savings-tag {
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    color: #166534; border: 1px solid #86efac;
    border-radius: 999px; font-size: 11px; font-weight: 800;
    padding: 4px 12px; display: inline-flex; align-items: center; gap: 4px;
    animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  /* ─── Page header ─── */
  .cart-page-header {
    margin-bottom: 28px;
    animation: slideInUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
`;

export const Cart = () => {
  const { items, totalItems, subtotal, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [prevTotal, setPrevTotal] = useState(subtotal);
  const [totalUpdated, setTotalUpdated] = useState(false);

  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const waText = items.length > 0
    ? `Hello NIRAA! I'd like to order:\n${items.map(i => `• ${i.name} (x${i.qty})`).join('\n')}\nTotal: ${formatPrice(total)}\nPlease confirm availability!`
    : `Hello NIRAA! I'd like to browse your products.`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(waText)}`;

  useEffect(() => {
    if (total !== prevTotal) {
      setTotalUpdated(true);
      setPrevTotal(total);
      const t = setTimeout(() => setTotalUpdated(false), 450);
      return () => clearTimeout(t);
    }
  }, [total]);

  const handlePromo = () => {
    if (promoCode.trim().toUpperCase() === '') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid code. Try NIRAA10 🎁');
      setTimeout(() => setPromoError(''), 3000);
    }
  };

  return (
    <main className="cart-page" style={{ background: '#F7F6F3', minHeight: '100vh', fontFamily: T.font }}>
      <style>{css}</style>

      <div style={{ padding: '32px 16px 80px', maxWidth: 1100, margin: '0 auto' }}>

        {/* ─── Header ─── */}
        <div className="cart-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal }} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: T.teal }}>
              Shopping Cart
            </span>
          </div>
          <h1 style={{
            margin: '0 0 8px', fontFamily: T.fontDisplay,
            fontSize: 'clamp(1.7rem,4vw,2.3rem)', fontWeight: 900,
            color: T.gray900, letterSpacing: '-.03em'
          }}>
            Your Cart {totalItems > 0 && (
              <span className="item-badge" style={{ verticalAlign: 'middle', marginLeft: 10 }}>
                {totalItems}
              </span>
            )}
          </h1>
          <p style={{ margin: '0 0 16px', color: T.gray400, fontSize: 14, lineHeight: 1.5 }}>
            {items.length === 0
              ? 'Your cart is waiting to be filled with clean goodness.'
              : `${totalItems} item${totalItems !== 1 ? 's' : ''} · Free delivery to Dharmapuri & nearby areas`}
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href={waLink} target="_blank" rel="noreferrer" className="cart-btn cart-btn--wa cart-btn--shimmer">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              Order via WhatsApp
            </a>
            <Link to="/products" className="cart-btn cart-btn--ghost">Browse Products</Link>
            {totalItems > 0 && (
              <button onClick={clearCart} className="cart-btn cart-btn--danger">
                🗑️ Clear Cart
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (

          /* ─── Empty State ─── */
          <div className="empty-cart">
            <div className="empty-icon-circle">🛒</div>
            <h2 style={{ margin: '0 0 12px', fontFamily: T.fontDisplay, fontSize: '1.85rem', fontWeight: 900, color: T.gray900 }}>
              Start with a clean home
            </h2>
            <p style={{ margin: '0 0 30px', color: T.gray400, fontSize: 15, lineHeight: 1.65 }}>
              Browse our eco-friendly cleaning products and add your favourites to the cart.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/products" className="cart-btn cart-btn--primary cart-btn--shimmer">
                🌿 Shop Products
              </Link>
              <a href={waLink} target="_blank" rel="noreferrer" className="cart-btn cart-btn--wa">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Order via WhatsApp
              </a>
            </div>

            <div style={{ marginTop: 44, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[['🏠', 'Floor Care'], ['🚿', 'Bath Care'], ['🍽️', 'Kitchen']].map(([icon, label]) => (
                <Link key={label} to="/products" className="cat-teaser">
                  <span className="cat-teaser-icon">{icon}</span>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.gray700 }}>{label}</div>
                </Link>
              ))}
            </div>
          </div>

        ) : (

          <div className="cart-grid-layout">

            {/* ─── Cart Items ─── */}
            <div>
              <div className="items-section">
                <div className="items-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: 16, color: T.gray900, fontFamily: T.fontDisplay }}>Your Items</span>
                    <span className="item-badge">{totalItems}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#16a34a', fontWeight: 700 }}>
                    <span className="pulse-dot" />
                    All items in stock
                  </div>
                </div>
                <div style={{ padding: '0 8px' }}>
                  {items.map((item, idx) => (
                    <div key={item.uid} style={{ animation: `slideInUp 0.4s ${idx * 0.05}s cubic-bezier(0.22,1,0.36,1) both` }}>
                      <CartItem item={item} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Banner */}
              <div className="delivery-banner">
                <div style={{ fontSize: 30, flexShrink: 0 }}>🚚</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: T.tealDark }}>Free Local Delivery</div>
                  <div style={{ fontSize: 12, color: T.tealDark, opacity: 0.75, marginTop: 2 }}>
                    Serving Dharmapuri & nearby areas · Estimated delivery within 6 hours
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Order Summary ─── */}
            <aside>
              <div className="summary-card">
                <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 19, color: T.gray900, marginBottom: 22 }}>
                  Order Summary
                </div>

                {/* Line items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: T.gray600 }}>
                    <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                    <span style={{ fontWeight: 700, color: T.gray800 }}>{formatPrice(subtotal)}</span>
                  </div>
                  {promoApplied && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span className="savings-tag">🎉 NIRAA10 applied</span>
                      <span style={{ fontWeight: 800, color: '#16a34a' }}>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: T.gray600 }}>
                    <span>Delivery</span>
                    <span style={{ fontWeight: 800, color: T.teal }}>FREE ✓</span>
                  </div>
                </div>

                {/* Promo Code */}
                {!promoApplied && (
                  <div>
                    <div className="promo-input">
                      <input
                        placeholder="Promo code "
                        value={promoCode}
                        onChange={e => { setPromoCode(e.target.value); setPromoError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handlePromo()}
                      />
                      <button onClick={handlePromo}>Apply</button>
                    </div>
                    {promoError && (
                      <div style={{ fontSize: 12, color: T.danger, fontWeight: 600, marginTop: -8, marginBottom: 8 }}>
                        {promoError}
                      </div>
                    )}
                  </div>
                )}

                {promoApplied && (
                  <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    ✅ Promo applied — you're saving {formatPrice(discount)}!
                  </div>
                )}

                <div style={{ height: 1, background: T.gray100, margin: '16px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 26, alignItems: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: T.gray900 }}>Total</span>
                  <span className={`total-amount ${totalUpdated ? 'updated' : ''}`}>
                    {formatPrice(total)}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/checkout" className="cart-btn cart-btn--primary cart-btn--shimmer" style={{ width: '100%', fontSize: 15 }}>
                    Checkout — {formatPrice(total)} →
                  </Link>
                  <a href={waLink} target="_blank" rel="noreferrer" className="cart-btn cart-btn--wa" style={{ width: '100%' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    Order via WhatsApp
                  </a>
                </div>

                {/* Trust indicators */}
                <div className="trust-strip">
                  {['🔒 Secure checkout', '🌿 Eco packaging', '⚡ 6hr delivery'].map(t => (
                    <span key={t} className="trust-item">{t}</span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;