import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import CartItem from '../components/CartItem.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import { WHATSAPP_NUMBER } from '../utils/constants.js';

/* ─── Design Tokens ─── */
const T = {
  teal: '#1D9E75', tealDark: '#0F6E56', tealLight: '#E8F8F1', tealGlow: 'rgba(29,158,117,0.15)',
  wa: '#25D366', waHover: '#1da851',
  gray50: '#F9F9F8', gray100: '#F2F1EF', gray200: '#E5E3DE', gray300: '#C9C6BF',
  gray400: '#A8A59D', gray500: '#87847C', gray600: '#6B6862', gray700: '#4A4845',
  gray800: '#2E2D2A', gray900: '#1A1917',
  white: '#FFFFFF',
  danger: '#DC2626', dangerLight: '#FEE2E2',
  gold: '#C8A84B', goldLight: '#FDF6E3',
  font: `'DM Sans', system-ui, sans-serif`,
  fontDisplay: `'Fraunces', Georgia, serif`,
  shadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
  shadowLg: '0 4px 6px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.10)',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
  
  .cart-page * { box-sizing: border-box; }
  
  .cart-grid-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }
  @media (min-width: 900px) {
    .cart-grid-layout { grid-template-columns: 1fr 380px; }
  }

  .cart-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 13px 22px; border-radius: 12px; font-weight: 700; font-size: 14px;
    cursor: pointer; font-family: ${T.font}; border: none; text-decoration: none;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .cart-btn:hover { transform: translateY(-2px); }
  .cart-btn:active { transform: translateY(0); }

  .cart-btn--primary {
    background: ${T.teal}; color: #fff;
    box-shadow: 0 4px 16px rgba(29,158,117,0.35);
  }
  .cart-btn--primary:hover { background: ${T.tealDark}; box-shadow: 0 8px 24px rgba(29,158,117,0.45); }

  .cart-btn--wa {
    background: ${T.wa}; color: #fff;
    box-shadow: 0 4px 16px rgba(37,211,102,0.3);
  }
  .cart-btn--wa:hover { background: ${T.waHover}; box-shadow: 0 8px 24px rgba(37,211,102,0.4); }

  .cart-btn--ghost {
    background: ${T.white}; color: ${T.gray700};
    border: 1.5px solid ${T.gray200};
  }
  .cart-btn--ghost:hover { border-color: ${T.teal}; color: ${T.teal}; background: ${T.tealLight}; }

  .cart-btn--danger {
    background: ${T.dangerLight}; color: ${T.danger};
    border: 1.5px solid #FECACA;
  }
  .cart-btn--danger:hover { background: #FEE2E2; }

  .summary-card {
    background: ${T.white};
    border: 1.5px solid ${T.gray200};
    border-radius: 24px;
    padding: 28px;
    box-shadow: ${T.shadow};
    position: sticky;
    top: 20px;
  }

  .promo-input {
    display: flex; gap: 8px; margin: 16px 0;
  }
  .promo-input input {
    flex: 1; padding: 11px 16px;
    border: 1.5px solid ${T.gray200}; border-radius: 10px;
    font-family: ${T.font}; font-size: 13px; color: ${T.gray800};
    outline: none; transition: border-color 0.2s;
  }
  .promo-input input:focus { border-color: ${T.teal}; }
  .promo-input button {
    padding: 11px 18px; background: ${T.gray100}; border: 1.5px solid ${T.gray200};
    border-radius: 10px; font-weight: 700; font-size: 13px; color: ${T.gray700};
    cursor: pointer; font-family: ${T.font}; transition: all 0.2s;
  }
  .promo-input button:hover { background: ${T.tealLight}; border-color: ${T.teal}; color: ${T.teal}; }

  .trust-strip {
    display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px;
  }
  .trust-item {
    display: flex; align-items: center; gap: 5px;
    font-size: 11px; color: ${T.gray500}; font-weight: 600;
  }

  .pulse-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.3); }
  }

  .empty-cart-animate {
    animation: floatUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes floatUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .shimmer-bg {
    background: linear-gradient(135deg, ${T.tealLight} 0%, #f0fff8 50%, ${T.tealLight} 100%);
    background-size: 200% 200%;
    animation: shimmer 3s ease infinite;
  }
  @keyframes shimmer {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .items-section {
    background: ${T.white};
    border: 1.5px solid ${T.gray200};
    border-radius: 24px;
    overflow: hidden;
    box-shadow: ${T.shadow};
  }
  .items-header {
    padding: 20px 24px;
    border-bottom: 1px solid ${T.gray100};
    display: flex; align-items: center; justify-content: space-between;
  }
`;

const Cart = () => {
  const { items, totalItems, subtotal, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const whatsappText = totalItems
    ? `Hello NIRAA 🌿\n\nI'd like to place an order:\n\n${items.map(i => `• ${i.name}${i.variantDesc ? ` (${i.variantDesc})` : ''} × ${i.qty} = ${formatPrice(i.price * i.qty)}`).join('\n')}\n\n💰 Total: ${formatPrice(subtotal)}\n\nPlease confirm availability and delivery details. Thank you!`
    : `Hello NIRAA, I'd like to place an order from your website.`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(whatsappText)}`;

  const handlePromo = () => {
    if (promoCode.toUpperCase() === 'NIRAA10') {
      setPromoApplied(true);
    }
  };

  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  return (
    <main className="cart-page" style={{ background: T.gray50, minHeight: '100vh', fontFamily: T.font }}>
      <style>{css}</style>
      <div className="container" style={{ padding: '32px 16px 80px', maxWidth: 1200, margin: '0 auto' }}>

        {/* ─── Page Header ─── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.teal }}>
              Shopping Cart
            </span>
          </div>
          <h1 style={{ margin: '0 0 8px', fontFamily: T.fontDisplay, fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 900, color: T.gray900, letterSpacing: '-.03em', lineHeight: 1.1 }}>
            {totalItems ? `Your Cart` : 'Your Cart is Empty'}
          </h1>
          {totalItems > 0 && (
            <p style={{ margin: '0 0 20px', color: T.gray400, fontSize: 14 }}>
              {totalItems} item{totalItems > 1 ? 's' : ''} • Ready to checkout
            </p>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href={waLink} target="_blank" rel="noreferrer" className="cart-btn cart-btn--wa">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
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
          <div className="empty-cart-animate" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: T.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 48 }}>
              🛒
            </div>
            <h2 style={{ margin: '0 0 10px', fontFamily: T.fontDisplay, fontSize: '1.75rem', fontWeight: 900, color: T.gray900 }}>
              Start with a clean home
            </h2>
            <p style={{ margin: '0 0 28px', color: T.gray400, fontSize: 15, lineHeight: 1.6 }}>
              Browse our eco-friendly cleaning products and add your favourites to the cart.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/products" className="cart-btn cart-btn--primary">
                🌿 Shop Products
              </Link>
              <a href={waLink} target="_blank" rel="noreferrer" className="cart-btn cart-btn--wa">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Order via WhatsApp
              </a>
            </div>
            {/* Featured collections teaser */}
            <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[['🏠', 'Floor Care'], ['🚿', 'Bath Care'], ['🍽️', 'Kitchen']].map(([icon, label]) => (
                <Link key={label} to="/products" style={{ textDecoration: 'none', padding: '14px 8px', background: T.white, border: `1.5px solid ${T.gray200}`, borderRadius: 14, textAlign: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.teal; e.currentTarget.style.background = T.tealLight; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.gray200; e.currentTarget.style.background = T.white; }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
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
                    <span style={{ fontWeight: 800, fontSize: 16, color: T.gray900 }}>Items</span>
                    <span style={{ background: T.teal, color: '#fff', borderRadius: 999, fontSize: 12, fontWeight: 800, padding: '2px 10px' }}>{totalItems}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#22c55e', fontWeight: 700 }}>
                    <div className="pulse-dot" />
                    All items in stock
                  </div>
                </div>
                <div style={{ padding: '0 8px' }}>
                  {items.map(item => <CartItem key={item.uid} item={item} />)}
                </div>
              </div>

              {/* Delivery Banner */}
              <div className="shimmer-bg" style={{ marginTop: 16, borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>🚚</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: T.tealDark }}>Free Local Delivery</div>
                  <div style={{ fontSize: 12, color: T.tealDark, opacity: 0.8, marginTop: 2 }}>
                    Serving Dharmapuri & nearby areas · Estimated delivery within 6 hours
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Order Summary ─── */}
            <aside>
              <div className="summary-card">
                <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 18, color: T.gray900, marginBottom: 20 }}>Order Summary</div>

                {/* Line items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: T.gray600 }}>
                    <span>Subtotal ({totalItems} items)</span>
                    <span style={{ fontWeight: 700, color: T.gray800 }}>{formatPrice(subtotal)}</span>
                  </div>
                  {promoApplied && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#16a34a' }}>
                      <span style={{ fontWeight: 700 }}>🎉 Promo (NIRAA10)</span>
                      <span style={{ fontWeight: 800 }}>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: T.gray600 }}>
                    <span>Delivery</span>
                    <span style={{ fontWeight: 800, color: T.teal }}>FREE ✓</span>
                  </div>
                </div>

                {/* Promo Code */}
                {!promoApplied && (
                  <div className="promo-input">
                    <input
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                    />
                    <button onClick={handlePromo}>Apply</button>
                  </div>
                )}

                <div style={{ height: 1, background: T.gray100, margin: '16px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, fontWeight: 900, fontSize: 20 }}>
                  <span style={{ color: T.gray900 }}>Total</span>
                  <span style={{ color: T.tealDark, fontFamily: T.fontDisplay }}>{formatPrice(total)}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/checkout" className="cart-btn cart-btn--primary" style={{ width: '100%', fontSize: 15 }}>
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