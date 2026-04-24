import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import toast from 'react-hot-toast';

import { API_BASE_URL, WHATSAPP_NUMBER } from '../utils/constants.js';
import LoginModal from '../components/LoginModal.jsx';

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const whatsAppOverrideRef = useRef(false);

  const [form, setForm] = useState({ 
    name: user?.name || user?.firstName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : '', 
    phone: user?.phone || '', 
    street: user?.address?.street || '', 
    city: user?.address?.city || 'Dharmapuri', 
    pincode: user?.address?.pincode || '' 
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync state if user logs in during checkout session
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        street: user.address?.street || prev.street,
        city: user.address?.city || prev.city,
        pincode: user.address?.pincode || prev.pincode
      }));
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login or signup to place an order');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (!form.name || !form.phone || !form.street || !form.pincode) return toast.error('Please fill required fields');
    
    // Strict Pin Code Validation for Dharmapuri (Assuming 636xxx range)
    if (!form.pincode.startsWith('636')) {
      return toast.error('Sorry, we currently only deliver to Dharmapuri & nearby areas (Pincode starting with 636).');
    }

    if (items.length === 0) return toast.error('Cart is empty');

    const sendViaWhatsApp = Boolean(whatsAppOverrideRef.current);
    whatsAppOverrideRef.current = false;

    const payload = {
      customerName: form.name,
      customerPhone: form.phone.replace(/\D/g, '').slice(-10),
      address: { street: form.street, city: form.city, pincode: form.pincode },
      items: items.map(i => ({ 
        product: i._id, 
        variantId: i.variantId, 
        name: i.name, 
        variantDesc: i.variantDesc, 
        image: i.image || i.images?.[0] || '', 
        price: i.price, 
        quantity: i.qty 
      })),
      subtotal,
      discount: 0,
      total: subtotal,
      paymentMethod,
      viaWhatsApp: sendViaWhatsApp,
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order failed');
      toast.success('Order placed! It will reach you in 6 hours.');
      clearCart();

      if (sendViaWhatsApp) {
        const itemsText = payload.items.map(it => `${it.name} ${it.variantDesc ? `(${it.variantDesc})` : ''} x${it.quantity}`).join(', ');
        const waText = `New order (ID: ${data._id})\nName: ${payload.customerName}\nPhone: ${payload.customerPhone}\nPayment: ${payload.paymentMethod.toUpperCase()}\nItems: ${itemsText}\nTotal: ${formatPrice(payload.total)}\nCity: ${payload.address.city}\nNote: Please deliver within 6 hours.`;
        const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(waText)}`;
        window.open(waLink, '_blank');
      }

    } catch (err) {
      toast.error(err.message || 'Order failed');
    } finally { setLoading(false); }
  };

  const submitOrderViaWhatsApp = () => {
    if (!formRef.current) return;
    whatsAppOverrideRef.current = true;
    formRef.current.requestSubmit();
  };

  return (
    <main className="container page" style={{ paddingTop: 18 }}>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <header className="page-header page-header--checkout">
        <div className="page-header__badge">Checkout</div>
        <div className="page-title">Checkout</div>
        <div className="page-subtitle">Add your details once. Order in seconds.</div>
        <div className="page-actions">
          <Link className="btn btn--ghost" to="/cart">Back to Cart</Link>
          <Link className="btn btn--ghost" to="/products">Continue Shopping</Link>
        </div>
      </header>

      <div className="grid-2">
        <form
          ref={formRef}
          onSubmit={placeOrder}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <input className="field" name="name" value={form.name} onChange={handleChange} placeholder="Name*" />
          <input className="field" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone*" />
          <input className="field" name="street" value={form.street} onChange={handleChange} placeholder="Address (Street / House No)*" />
          <div style={{ color: 'var(--gray-600)', fontSize: '0.92rem', fontWeight: 700, marginTop: -2 }}>
            City: {form.city}
          </div>
          <input className="field" name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode*" />

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 800, color: 'var(--teal-dark)' }}>Payment</div>
            <label style={{ display: 'block', marginTop: 6, color: 'var(--gray-600)', fontWeight: 700 }}>
              <input type="radio" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} /> UPI (Recommended)
            </label>
            <label style={{ display: 'block', color: 'var(--gray-600)', fontWeight: 700 }}>
              <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /> Cash on Delivery
            </label>
            <div style={{ marginTop: 6, color: 'var(--gray-600)', fontSize: '0.9rem' }}>
              UPI keeps confirmation fast. We will coordinate on WhatsApp if you choose it.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginTop: 4 }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn--primary"
              style={{ border: 'none' }}
            >
              {loading ? 'Placing...' : 'Place Order (Website Checkout)'}
            </button>
            <button
              type="button"
              disabled={loading || items.length === 0}
              onClick={submitOrderViaWhatsApp}
              className="btn btn--whatsapp"
              style={{ border: 'none' }}
            >
              {loading ? 'Placing...' : 'Order via WhatsApp'}
            </button>
          </div>
        </form>

        <aside>
          <div className="card card--padded">
          <div style={{ fontWeight: 900, color: 'var(--teal-dark)', fontSize: '1.1rem' }}>Order Summary</div>
          {items.length === 0 && <div style={{ marginTop: 10 }}>Your cart is empty</div>}
          {items.map(it => (
            <div key={it._id} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <div style={{ color: 'var(--gray-800)', fontWeight: 700 }}>{it.name} x{it.qty}</div>
              <div style={{ color: 'var(--teal-dark)', fontWeight: 900 }}>{formatPrice(it.price * it.qty)}</div>
            </div>
          ))}
          {items.length > 0 && (
            <>
              <div style={{ marginTop: 14, height: 1, background: 'var(--gray-200)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, marginTop: 12 }}>
                <div style={{ color: 'var(--gray-600)' }}>Total</div>
                <div style={{ color: 'var(--gray-800)' }}>{formatPrice(subtotal)}</div>
              </div>
            </>
          )}
          <div style={{ marginTop: 12, color: 'var(--gray-600)', fontSize: '0.92rem' }}>
            Serving Dharmapuri & nearby areas.
            <div style={{ marginTop: 8, padding: 8, background: '#e6f4f2', borderRadius: 8, color: 'var(--teal-dark)', fontWeight: 700 }}>
              🚀 Local Delivery Tracker: Order will reach in ~6 hours.
            </div>
          </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Checkout;

