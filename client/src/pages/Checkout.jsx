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
  gray300: '#C9C6BF', gray400: '#A8A59D', gray500: '#87847C', gray600: '#6B6862',
  gray700: '#4A4845', gray800: '#2E2D2A', gray900: '#1A1917', white: '#FFFFFF',
  font: `'DM Sans', system-ui, sans-serif`,
  fontDisplay: `'Fraunces', Georgia, serif`,
  shadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
  
  .checkout-page * { box-sizing: border-box; }

  .checkout-grid {
    display: grid; gap: 24px;
    grid-template-columns: 1fr;
  }
  @media (min-width: 900px) {
    .checkout-grid { grid-template-columns: 1fr 360px; }
  }

  .form-card {
    background: ${T.white};
    border: 1.5px solid ${T.gray200};
    border-radius: 20px;
    padding: 28px;
    box-shadow: ${T.shadow};
  }
  .form-card-title {
    font-weight: 800; font-size: 15px; color: ${T.gray900};
    margin-bottom: 20px; padding-bottom: 16px;
    border-bottom: 1px solid ${T.gray100};
    display: flex; align-items: center; gap: 8px;
  }

  .field-label {
    display: block; margin-bottom: 6px;
    font-size: 11px; font-weight: 700;
    letter-spacing: .07em; text-transform: uppercase;
    color: ${T.gray500};
  }
  .field-input {
    width: 100%; padding: 13px 16px;
    border: 1.5px solid ${T.gray200}; border-radius: 12px;
    font-size: 14px; font-family: ${T.font}; color: ${T.gray800};
    background: ${T.white}; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }
  .field-input:focus {
    border-color: ${T.teal};
    box-shadow: 0 0 0 3px rgba(29,158,117,0.12);
  }
  .field-input:disabled {
    background: ${T.gray50}; color: ${T.gray400}; cursor: not-allowed;
  }

  .pay-option {
    display: flex; align-items: center; gap: 14px;
    padding: 16px; border-radius: 14px;
    border: 1.5px solid ${T.gray200};
    background: ${T.white}; cursor: pointer;
    transition: all 0.2s;
  }
  .pay-option:hover { border-color: rgba(29,158,117,0.4); }
  .pay-option.active {
    border-color: ${T.teal};
    background: ${T.tealLight};
    box-shadow: 0 0 0 3px rgba(29,158,117,0.1);
  }

  .checkout-btn {
    width: 100%; padding: 15px; border: none; border-radius: 12px;
    font-weight: 800; font-size: 15px; cursor: pointer;
    font-family: ${T.font}; display: flex; align-items: center;
    justify-content: center; gap: 8px; transition: all 0.2s;
  }
  .checkout-btn--primary {
    background: ${T.teal}; color: #fff;
    box-shadow: 0 4px 16px rgba(29,158,117,0.35);
  }
  .checkout-btn--primary:hover:not(:disabled) {
    background: ${T.tealDark};
    box-shadow: 0 8px 24px rgba(29,158,117,0.45);
    transform: translateY(-1px);
  }
  .checkout-btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .checkout-btn--wa {
    background: #25D366; color: #fff;
    box-shadow: 0 4px 16px rgba(37,211,102,0.25);
  }
  .checkout-btn--wa:hover:not(:disabled) {
    background: #1da851; transform: translateY(-1px);
  }
  .checkout-btn--wa:disabled { opacity: 0.6; cursor: not-allowed; }

  .summary-card {
    background: ${T.white}; border: 1.5px solid ${T.gray200};
    border-radius: 20px; padding: 24px;
    box-shadow: ${T.shadow}; position: sticky; top: 20px;
  }
  .summary-item {
    display: flex; gap: 12px; align-items: center;
    padding: 10px 0; border-bottom: 1px solid ${T.gray100};
  }
  .summary-img {
    width: 48px; height: 48px; border-radius: 10px;
    background: ${T.gray100}; overflow: hidden; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }

  .step-badge {
    width: 28px; height: 28px; border-radius: 50%;
    background: ${T.tealLight}; color: ${T.teal};
    font-weight: 800; font-size: 13px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .delivery-badge {
    background: linear-gradient(135deg, #E8F8F1 0%, #f0fff8 100%);
    border: 1px solid rgba(29,158,117,0.2);
    border-radius: 12px; padding: 14px 16px;
    margin-top: 16px; font-size: 12px;
    color: ${T.tealDark}; font-weight: 700;
    display: flex; align-items: center; gap: 10px;
  }
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

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const placeOrder = async e => {
    e.preventDefault();
    if (!user) { toast.error('Please login to place an order'); navigate('/login', { state: { from: '/checkout' } }); return; }
    if (!form.name || !form.phone || !form.street || !form.pincode) return toast.error('Please fill all required fields');
    if (!form.pincode.startsWith('636')) return toast.error('Sorry, we only deliver to Dharmapuri & nearby areas (636xxx).');
    if (items.length === 0) return toast.error('Cart is empty');

    const sendViaWhatsApp = Boolean(whatsAppOverrideRef.current);
    whatsAppOverrideRef.current = false;

    const payload = {
      customerName: form.name, customerPhone: form.phone.replace(/\D/g, '').slice(-10),
      address: { street: form.street, city: form.city, pincode: form.pincode },
      items: items.map(i => ({ product: i._id, variantId: i.variantId, name: i.name, variantDesc: i.variantDesc, image: i.image || i.images?.[0] || '', price: i.price, quantity: i.qty })),
      subtotal, discount: 0, total: subtotal, paymentMethod, viaWhatsApp: sendViaWhatsApp,
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order failed');
      toast.success('🎉 Order placed! Delivery within ~6 hours.');
      clearCart();
      if (sendViaWhatsApp) {
        const itemsText = payload.items.map(it => `${it.name}${it.variantDesc ? ` (${it.variantDesc})` : ''} ×${it.quantity}`).join(', ');
        const waText = `✅ New Order (ID: ${data._id})\nName: ${payload.customerName}\nPhone: ${payload.customerPhone}\nPayment: ${payload.paymentMethod.toUpperCase()}\nItems: ${itemsText}\nTotal: ${formatPrice(payload.total)}\nCity: ${payload.address.city}`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(waText)}`, '_blank');
      }
    } catch (err) {
      toast.error(err.message || 'Order failed');
    } finally { setLoading(false); }
  };

  const submitViaWhatsApp = () => {
    if (!formRef.current) return;
    whatsAppOverrideRef.current = true;
    formRef.current.requestSubmit();
  };

  const PayOption = ({ value, icon, label, desc }) => (
    <div className={`pay-option ${paymentMethod === value ? 'active' : ''}`} onClick={() => setPaymentMethod(value)}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        border: `2px solid ${paymentMethod === value ? T.teal : T.gray300}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {paymentMethod === value && <div style={{ width: 10, height: 10, borderRadius: '50%', background: T.teal }} />}
      </div>
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.gray900 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: T.gray400, marginTop: 2 }}>{desc}</div>}
      </div>
    </div>
  );

  return (
    <main className="checkout-page" style={{ background: T.gray50, minHeight: '100vh', fontFamily: T.font }}>
      <style>{css}</style>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <div className="container" style={{ padding: '32px 16px 80px', maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.teal }}>Checkout</span>
          </div>
          <h1 style={{ margin: '0 0 6px', fontFamily: T.fontDisplay, fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 900, color: T.gray900, letterSpacing: '-.03em' }}>
            Complete Your Order
          </h1>
          <p style={{ margin: '0 0 16px', color: T.gray400, fontSize: 14 }}>Add your details once. We deliver to your door.</p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/cart" style={{ fontSize: 13, color: T.teal, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              ← Cart
            </Link>
            <span style={{ color: T.gray300, fontSize: 12 }}>·</span>
            <Link to="/products" style={{ fontSize: 13, color: T.gray500, fontWeight: 600, textDecoration: 'none' }}>Continue Shopping</Link>
          </div>
        </div>

        <div className="checkout-grid">

          {/* ─── Form ─── */}
          <form ref={formRef} onSubmit={placeOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Delivery Details */}
            <div className="form-card">
              <div className="form-card-title">
                <span style={{ fontSize: 18 }}>📍</span>
                Delivery Details
              </div>
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="field-label">Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange}
                      onFocus={() => setFocus('name')} onBlur={() => setFocus(null)}
                      required placeholder="Your full name" className="field-input" />
                  </div>
                  <div>
                    <label className="field-label">Phone Number *</label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      onFocus={() => setFocus('phone')} onBlur={() => setFocus(null)}
                      required placeholder="10-digit mobile" className="field-input" />
                  </div>
                </div>
                <div>
                  <label className="field-label">Street Address *</label>
                  <input name="street" value={form.street} onChange={handleChange}
                    onFocus={() => setFocus('street')} onBlur={() => setFocus(null)}
                    required placeholder="House No, Street, Landmark" className="field-input" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="field-label">City</label>
                    <input value={form.city} disabled className="field-input" />
                  </div>
                  <div>
                    <label className="field-label">Pincode *</label>
                    <input name="pincode" value={form.pincode} onChange={handleChange}
                      onFocus={() => setFocus('pincode')} onBlur={() => setFocus(null)}
                      required placeholder="636xxx" className="field-input" />
                  </div>
                </div>
                <div style={{ background: T.tealLight, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: T.tealDark, fontWeight: 600 }}>
                  ℹ️ We deliver to pincodes starting with 636 (Dharmapuri & nearby areas)
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="form-card">
              <div className="form-card-title">
                <span style={{ fontSize: 18 }}>💳</span>
                Payment Method
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <PayOption value="upi" icon="📱" label="UPI Payment" desc="Pay via any UPI app — instant confirmation" />
                <PayOption value="cod" icon="💵" label="Cash on Delivery" desc="Pay when your order arrives" />
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="submit" disabled={loading} className="checkout-btn checkout-btn--primary">
                {loading ? '⏳ Placing Order…' : '✓ Place Order'}
              </button>
              <button type="button" disabled={loading || items.length === 0} onClick={submitViaWhatsApp} className="checkout-btn checkout-btn--wa">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Place & Share on WhatsApp
              </button>
            </div>
          </form>

          {/* ─── Order Summary ─── */}
          <aside>
            <div className="summary-card">
              <div style={{ fontWeight: 800, fontSize: 16, color: T.gray900, marginBottom: 16 }}>Order Summary</div>

              {items.length === 0
                ? <div style={{ color: T.gray400, fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Your cart is empty</div>
                : items.map(it => (
                  <div key={it.uid || it._id} className="summary-item">
                    <div className="summary-img">
                      {(it.image || it.images?.[0]) ? (
                        <img src={it.image || it.images?.[0]} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 20 }}>🧴</span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.gray800, lineHeight: 1.3 }}>{it.name}</div>
                      {it.variantDesc && <div style={{ fontSize: 11, color: T.gray400, marginTop: 2 }}>{it.variantDesc}</div>}
                      <div style={{ fontSize: 12, color: T.gray500, marginTop: 2 }}>×{it.qty}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: T.tealDark, fontSize: 14 }}>{formatPrice(it.price * it.qty)}</div>
                  </div>
                ))
              }

              {items.length > 0 && (
                <>
                  <div style={{ margin: '16px 0 12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, color: T.gray500 }}>Delivery</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: T.teal }}>FREE</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 20, fontWeight: 900, color: T.gray900 }}>
                    <span>Total</span>
                    <span style={{ color: T.tealDark, fontFamily: T.fontDisplay }}>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="delivery-badge">
                    <span style={{ fontSize: 20, flexShrink: 0 }}>🚀</span>
                    <div>
                      <div>Delivery within ~6 hours</div>
                      <div style={{ opacity: 0.8, marginTop: 2 }}>Updates via WhatsApp</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Checkout;