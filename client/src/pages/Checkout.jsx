import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import toast from 'react-hot-toast';
import { API_BASE_URL, WHATSAPP_NUMBER } from '../utils/constants.js';
import LoginModal from '../components/LoginModal.jsx';

const T = {
  teal: '#1D9E75', tealDark: '#0F6E56', tealLight: '#E8F8F1',
  wa: '#25D366', gray50: '#F9F9F8', gray100: '#F2F1EF', gray200: '#E5E3DE',
  gray300: '#C9C6BF', gray400: '#A8A59D', gray500: '#87847C',
  gray600: '#6B6862', gray700: '#4A4845', gray800: '#2E2D2A', gray900: '#1A1917',
  white: '#FFFFFF', gold: '#C8A84B',
  font: `'Outfit', 'DM Sans', system-ui, sans-serif`,
  fontDisplay: `'Playfair Display', Georgia, serif`,
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');

  .checkout-page * { box-sizing: border-box; }

  /* ─── Animations ─── */
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(28px); }
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
  @keyframes checkPop {
    0%   { transform: scale(0); opacity: 0; }
    60%  { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes waPulse {
    0%   { box-shadow: 0 0 0 0 rgba(37,211,102,0.5); }
    70%  { box-shadow: 0 0 0 14px rgba(37,211,102,0); }
    100% { box-shadow: 0 0 0 0 rgba(37,211,102,0); }
  }
  @keyframes ribbonSlide {
    from { transform: translateX(-100%); }
    to   { transform: translateX(100%); }
  }
  @keyframes progressFill {
    from { width: 0%; }
    to   { width: var(--progress-width); }
  }
  @keyframes fieldHighlight {
    0%   { box-shadow: 0 0 0 0 rgba(29,158,117,0.4); }
    100% { box-shadow: 0 0 0 6px rgba(29,158,117,0); }
  }
  @keyframes successBounce {
    0%   { transform: scale(0.8) rotate(-5deg); opacity: 0; }
    50%  { transform: scale(1.05) rotate(2deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  /* ─── Layout ─── */
  .checkout-grid {
    display: grid; gap: 24px; grid-template-columns: 1fr;
  }
  @media (min-width: 900px) {
    .checkout-grid { grid-template-columns: 1fr 360px; }
  }

  /* ─── Step progress bar ─── */
  .checkout-steps {
    display: flex; align-items: center; gap: 0;
    margin-bottom: 28px; padding: 18px 22px;
    background: ${T.white}; border-radius: 18px;
    border: 1.5px solid ${T.gray200};
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    animation: slideInUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
  }
  .checkout-step {
    display: flex; align-items: center; gap: 10px; flex: 1;
    font-size: 13px; font-weight: 700; color: ${T.gray400};
    transition: color 0.3s;
  }
  .checkout-step.active { color: ${T.teal}; }
  .checkout-step.done { color: ${T.tealDark}; }
  .step-circle {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800;
    border: 2px solid ${T.gray200};
    background: ${T.white}; color: ${T.gray400};
    transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  .checkout-step.active .step-circle {
    border-color: ${T.teal}; background: ${T.tealLight}; color: ${T.teal};
    box-shadow: 0 0 0 4px rgba(29,158,117,0.15);
  }
  .checkout-step.done .step-circle {
    border-color: ${T.teal}; background: ${T.teal}; color: #fff;
    animation: checkPop 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  .step-line { flex: 1; height: 2px; background: ${T.gray200}; margin: 0 8px; border-radius: 2px; }
  .step-line.done { background: ${T.teal}; transition: background 0.4s; }

  /* ─── Form cards ─── */
  .form-card {
    background: ${T.white}; border: 1.5px solid ${T.gray200};
    border-radius: 22px; padding: 28px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.05);
    transition: box-shadow 0.3s, border-color 0.3s;
    animation: slideInUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  .form-card:focus-within {
    border-color: rgba(29,158,117,0.3);
    box-shadow: 0 4px 24px rgba(29,158,117,0.1);
  }
  .form-card-title {
    font-weight: 800; font-size: 15px; color: ${T.gray900};
    margin-bottom: 22px; padding-bottom: 16px;
    border-bottom: 1px solid ${T.gray100};
    display: flex; align-items: center; gap: 10px;
    font-family: ${T.fontDisplay};
  }

  /* ─── Fields ─── */
  .field-label {
    display: block; margin-bottom: 7px;
    font-size: 11px; font-weight: 800;
    letter-spacing: .08em; text-transform: uppercase;
    color: ${T.gray500};
  }
  .field-input {
    width: 100%; padding: 13px 16px;
    border: 1.5px solid ${T.gray200}; border-radius: 14px;
    font-size: 14px; font-family: ${T.font}; color: ${T.gray800};
    background: ${T.white}; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  }
  .field-input:focus {
    border-color: ${T.teal};
    box-shadow: 0 0 0 4px rgba(29,158,117,0.12);
    transform: translateY(-1px);
  }
  .field-input:disabled { background: ${T.gray50}; color: ${T.gray400}; cursor: not-allowed; }
  .field-input.filled { border-color: rgba(29,158,117,0.3); background: linear-gradient(135deg,#fff,#f8fffc); }

  /* ─── Payment options ─── */
  .pay-option {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 18px; border-radius: 16px;
    border: 1.5px solid ${T.gray200};
    background: ${T.white}; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    position: relative; overflow: hidden;
  }
  .pay-option::before {
    content: ''; position: absolute; inset: 0; opacity: 0;
    background: linear-gradient(135deg, ${T.tealLight}, #f0fff8);
    transition: opacity 0.3s; pointer-events: none;
  }
  .pay-option:hover { border-color: rgba(29,158,117,0.4); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(29,158,117,0.1); }
  .pay-option.active {
    border-color: ${T.teal};
    box-shadow: 0 0 0 3px rgba(29,158,117,0.12);
    transform: translateY(-2px);
  }
  .pay-option.active::before { opacity: 1; }

  .pay-radio {
    width: 20px; height: 20px; border-radius: 50%;
    border: 2px solid ${T.gray300}; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
    position: relative; z-index: 1;
  }
  .pay-option.active .pay-radio { border-color: ${T.teal}; }
  .pay-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: ${T.teal}; transform: scale(0);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .pay-option.active .pay-dot { transform: scale(1); }

  /* ─── Checkout Buttons ─── */
  .checkout-btn {
    width: 100%; padding: 16px; border: none; border-radius: 16px;
    font-weight: 800; font-size: 15px; cursor: pointer;
    font-family: ${T.font}; display: flex; align-items: center;
    justify-content: center; gap: 10px;
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    position: relative; overflow: hidden;
  }
  .checkout-btn::after {
    content: '';
    position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: ribbonSlide 2.5s ease-in-out infinite;
  }
  .checkout-btn--primary {
    background: ${T.teal}; color: #fff;
    box-shadow: 0 6px 20px rgba(29,158,117,0.4);
  }
  .checkout-btn--primary:hover:not(:disabled) {
    background: ${T.tealDark}; box-shadow: 0 10px 28px rgba(29,158,117,0.5);
    transform: translateY(-3px);
  }
  .checkout-btn--primary:active:not(:disabled) { transform: translateY(0); }
  .checkout-btn--primary:disabled { opacity: 0.65; cursor: not-allowed; }

  .checkout-btn--wa {
    background: #25D366; color: #fff;
    animation: waPulse 2.5s ease-in-out infinite;
    box-shadow: 0 6px 20px rgba(37,211,102,0.35);
  }
  .checkout-btn--wa:hover:not(:disabled) {
    background: #1da851; transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(37,211,102,0.45);
  }
  .checkout-btn--wa:disabled { opacity: 0.65; cursor: not-allowed; }

  /* ─── Summary card ─── */
  .summary-card {
    background: ${T.white}; border: 1.5px solid ${T.gray200};
    border-radius: 22px; padding: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    position: sticky; top: 20px;
    animation: slideInRight 0.6s 0.2s cubic-bezier(0.22,1,0.36,1) both;
  }
  .summary-item {
    display: flex; gap: 12px; align-items: center;
    padding: 12px 0; border-bottom: 1px solid ${T.gray100};
    transition: background 0.2s;
  }
  .summary-item:last-child { border-bottom: none; }
  .summary-img {
    width: 50px; height: 50px; border-radius: 12px;
    background: linear-gradient(135deg,${T.gray100},${T.gray50});
    overflow: hidden; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid ${T.gray200};
    transition: transform 0.2s;
  }
  .summary-item:hover .summary-img { transform: scale(1.05); }

  /* ─── Delivery badge ─── */
  .delivery-badge {
    background: linear-gradient(135deg,${T.tealLight},#f0fff8);
    border: 1.5px solid rgba(29,158,117,0.18);
    border-radius: 14px; padding: 14px 16px; margin-top: 16px;
    font-size: 12px; color: ${T.tealDark}; font-weight: 700;
    display: flex; align-items: center; gap: 10px;
  }

  /* ─── Info note ─── */
  .info-note {
    background: linear-gradient(135deg,${T.tealLight},#f0fff8);
    border-radius: 12px; padding: 11px 15px;
    font-size: 12px; color: ${T.tealDark}; font-weight: 600;
    border-left: 3px solid ${T.teal}; line-height: 1.5;
  }

  /* ─── Login nudge ─── */
  .login-nudge {
    background: linear-gradient(135deg,#fefce8,#fef9c3);
    border: 1px solid #fde68a; border-radius: 14px;
    padding: 12px 16px; font-size: 13px; color: #78350f; font-weight: 600;
    display: flex; align-items: center; gap: 10px; cursor: pointer;
    transition: all 0.25s;
  }
  .login-nudge:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(245,158,11,0.2); }
`;

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const whatsAppOverrideRef = useRef(false);
  const [focus, setFocus] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    name: user?.name || (user?.firstName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : ''),
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || 'Dharmapuri',
    pincode: user?.address?.pincode || '',
  });

  useEffect(() => {
    if (user) setForm(p => ({
      ...p,
      name: user.name || p.name,
      phone: user.phone || p.phone,
      street: user.address?.street || p.street,
      city: user.address?.city || p.city,
      pincode: user.address?.pincode || p.pincode,
    }));
  }, [user]);

  // Track step progress
  useEffect(() => {
    const hasDetails = form.name && form.phone && form.street && form.pincode;
    if (hasDetails && currentStep < 2) setCurrentStep(2);
    if (hasDetails && paymentMethod && currentStep < 3) setCurrentStep(3);
  }, [form, paymentMethod]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const placeOrder = async e => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Your cart is empty!'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, paymentMethod, items, subtotal }),
      });
      if (res.ok) {
        toast.success('🎉 Order placed successfully!');
        if (!whatsAppOverrideRef.current) { clearCart(); navigate('/'); }
      } else {
        toast.error('Something went wrong. Try WhatsApp!');
      }
    } catch {
      toast.error('Network error. Please try WhatsApp ordering.');
    } finally { setLoading(false); }
  };

  const submitViaWhatsApp = async () => {
    whatsAppOverrideRef.current = true;
    const lines = items.map(i => `• ${i.name} ×${i.qty} — ${formatPrice(i.price * i.qty)}`).join('\n');
    const msg = `Hello NIRAA! 🌿\n\nNew Order:\n${lines}\n\nDelivery Details:\nName: ${form.name}\nPhone: ${form.phone}\nAddress: ${form.street}, ${form.city} - ${form.pincode}\nPayment: ${paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}\n\nTotal: ${formatPrice(subtotal)}\n\nPlease confirm! 🙏`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    clearCart();
    navigate('/');
  };

  const PayOption = ({ value, icon, label, desc }) => (
    <div
      className={`pay-option ${paymentMethod === value ? 'active' : ''}`}
      onClick={() => setPaymentMethod(value)}
    >
      <div className="pay-radio">
        <div className="pay-dot" />
      </div>
      <div style={{ fontSize: 22, position: 'relative', zIndex: 1 }}>{icon}</div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.gray900 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: T.gray400, marginTop: 2 }}>{desc}</div>}
      </div>
      {paymentMethod === value && (
        <div style={{
          marginLeft: 'auto', width: 22, height: 22, borderRadius: '50%',
          background: T.teal, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'checkPop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          zIndex: 1, flexShrink: 0
        }}>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>
        </div>
      )}
    </div>
  );

  const steps = [
    { label: 'Delivery', icon: '📍' },
    { label: 'Payment', icon: '💳' },
    { label: 'Confirm', icon: '✓' },
  ];

  return (
    <main className="checkout-page" style={{ background: '#F7F6F3', minHeight: '100vh', fontFamily: T.font }}>
      <style>{css}</style>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <div style={{ padding: '32px 16px 80px', maxWidth: 1100, margin: '0 auto' }}>

        {/* ─── Page Header ─── */}
        <div style={{ marginBottom: 28, animation: 'slideInUp 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal }} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: T.teal }}>
              Secure Checkout
            </span>
          </div>
          <h1 style={{
            margin: '0 0 6px', fontFamily: T.fontDisplay,
            fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 900,
            color: T.gray900, letterSpacing: '-.03em'
          }}>
            Complete Your Order
          </h1>
          <p style={{ margin: '0 0 16px', color: T.gray400, fontSize: 14 }}>
            Add your details once. We deliver to your door.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/cart" style={{ fontSize: 13, color: T.teal, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, transition: 'gap 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.gap = '8px'}
              onMouseLeave={e => e.currentTarget.style.gap = '4px'}
            >
              ← Cart
            </Link>
            <span style={{ color: T.gray300, fontSize: 12 }}>·</span>
            <Link to="/products" style={{ fontSize: 13, color: T.gray500, fontWeight: 600, textDecoration: 'none' }}>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* ─── Step Progress ─── */}
        <div className="checkout-steps">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div className={`checkout-step ${currentStep > i + 1 ? 'done' : currentStep === i + 1 ? 'active' : ''}`}>
                <div className="step-circle">
                  {currentStep > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 12, display: 'none', '@media (minWidth: 480px)': { display: 'inline' } }}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`step-line ${currentStep > i + 1 ? 'done' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ─── Login Nudge (if not logged in) ─── */}
        {!user && (
          <div className="login-nudge" style={{ marginBottom: 20 }} onClick={() => setIsLoginModalOpen(true)}>
            <span style={{ fontSize: 18 }}>👋</span>
            <div>
              <div style={{ fontWeight: 800, marginBottom: 1 }}>Returning customer?</div>
              <div style={{ opacity: 0.8 }}>Sign in to auto-fill your delivery details</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: '#92400e', fontWeight: 800 }}>Login →</span>
          </div>
        )}

        <div className="checkout-grid">

          {/* ─── Form ─── */}
          <form ref={formRef} onSubmit={placeOrder} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Delivery Details */}
            <div className="form-card" style={{ animationDelay: '0.1s' }}>
              <div className="form-card-title">
                <span style={{ fontSize: 20 }}>📍</span>
                Delivery Details
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="field-label">Full Name *</label>
                    <input
                      name="name" value={form.name} onChange={handleChange}
                      onFocus={() => setFocus('name')} onBlur={() => setFocus(null)}
                      required placeholder="Your full name"
                      className={`field-input ${form.name ? 'filled' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="field-label">Phone Number *</label>
                    <input
                      name="phone" value={form.phone} onChange={handleChange}
                      onFocus={() => setFocus('phone')} onBlur={() => setFocus(null)}
                      required placeholder="10-digit mobile"
                      className={`field-input ${form.phone ? 'filled' : ''}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="field-label">Street Address *</label>
                  <input
                    name="street" value={form.street} onChange={handleChange}
                    onFocus={() => setFocus('street')} onBlur={() => setFocus(null)}
                    required placeholder="House No, Street, Landmark"
                    className={`field-input ${form.street ? 'filled' : ''}`}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="field-label">City</label>
                    <input value={form.city} disabled className="field-input" />
                  </div>
                  <div>
                    <label className="field-label">Pincode *</label>
                    <input
                      name="pincode" value={form.pincode} onChange={handleChange}
                      onFocus={() => setFocus('pincode')} onBlur={() => setFocus(null)}
                      required placeholder="636xxx"
                      className={`field-input ${form.pincode ? 'filled' : ''}`}
                    />
                  </div>
                </div>
                <div className="info-note">
                  ℹ️ We deliver to pincodes starting with 636 (Dharmapuri & nearby areas)
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="form-card" style={{ animationDelay: '0.18s' }}>
              <div className="form-card-title">
                <span style={{ fontSize: 20 }}>💳</span>
                Payment Method
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <PayOption value="upi" icon="📱" label="UPI Payment" desc="Pay via any UPI app — instant confirmation" />
                <PayOption value="cod" icon="💵" label="Cash on Delivery" desc="Pay when your order arrives at your door" />
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button type="submit" disabled={loading} className="checkout-btn checkout-btn--primary">
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    Placing Order…
                  </>
                ) : '✓ Place Order'}
              </button>
              <button
                type="button"
                disabled={loading || items.length === 0}
                onClick={submitViaWhatsApp}
                className="checkout-btn checkout-btn--wa"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Place & Share on WhatsApp
              </button>
            </div>
          </form>

          {/* ─── Order Summary ─── */}
          <aside>
            <div className="summary-card">
              <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 17, color: T.gray900, marginBottom: 18 }}>
                Order Summary
              </div>

              {items.length === 0
                ? <div style={{ color: T.gray400, fontSize: 14, textAlign: 'center', padding: '24px 0' }}>Your cart is empty</div>
                : items.map((it, idx) => (
                  <div key={it.uid || it._id} className="summary-item" style={{ animation: `slideInUp 0.4s ${idx * 0.06}s cubic-bezier(0.22,1,0.36,1) both` }}>
                    <div className="summary-img">
                      {(it.image || it.images?.[0])
                        ? <img src={it.image || it.images?.[0]} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 20 }}>🧴</span>
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.gray800, lineHeight: 1.35 }}>{it.name}</div>
                      {it.variantDesc && <div style={{ fontSize: 11, color: T.gray400, marginTop: 2 }}>{it.variantDesc}</div>}
                      <div style={{ fontSize: 11, color: T.gray500, marginTop: 3, fontWeight: 600 }}>×{it.qty}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: T.tealDark, fontSize: 14, flexShrink: 0 }}>
                      {formatPrice(it.price * it.qty)}
                    </div>
                  </div>
                ))
              }

              {items.length > 0 && (
                <>
                  <div style={{ margin: '18px 0 12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: T.gray500 }}>Delivery</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: T.teal }}>FREE ✓</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, alignItems: 'center' }}>
                    <span style={{ fontSize: 17, fontWeight: 900, color: T.gray900 }}>Total</span>
                    <span style={{ fontFamily: T.fontDisplay, fontWeight: 900, color: T.tealDark, fontSize: 22 }}>
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="delivery-badge">
                    <span style={{ fontSize: 22, flexShrink: 0 }}>🚀</span>
                    <div>
                      <div style={{ marginBottom: 2 }}>Estimated delivery in ~6 hours</div>
                      <div style={{ opacity: 0.75 }}>Order updates sent via WhatsApp</div>
                    </div>
                  </div>
                </>
              )}

              {/* Trust badges */}
              <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['🔒 Secure', '🌿 Eco', '⚡ Fast'].map(b => (
                  <span key={b} style={{
                    fontSize: 11, fontWeight: 700, padding: '5px 11px',
                    background: '#F2F1EF', borderRadius: 999, color: T.gray600,
                    border: '1px solid #E5E3DE', transition: 'all 0.2s', cursor: 'default'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.tealLight; e.currentTarget.style.color = T.tealDark; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#F2F1EF'; e.currentTarget.style.color = T.gray600; }}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Checkout;