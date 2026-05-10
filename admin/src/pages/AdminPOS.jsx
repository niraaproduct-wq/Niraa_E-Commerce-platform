import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../utils/constants';
import toast from 'react-hot-toast';
import {
  FaBarcode, FaSearch, FaShoppingCart, FaTrash, FaPlus, FaMinus,
  FaUser, FaChevronRight, FaCheckCircle, FaPrint, FaTimes,
  FaTruck, FaWalking, FaMoneyBillWave, FaMobileAlt
} from 'react-icons/fa';
import Barcode from 'react-barcode';

/* ─── Design Tokens (Sync with AdminProducts) ───────────────── */
const T = {
  font: `'DM Sans', 'Instrument Sans', system-ui, sans-serif`,
  mono: `'DM Mono', monospace`,
  teal: '#0F6E56',
  tealLight: '#E1F5EE',
  tealMid: '#1D9E75',
  tealDark: '#085041',
  gray50: '#FAFAF9',
  gray100: '#F5F4F2',
  gray200: '#E8E6E1',
  gray300: '#D1CFC8',
  gray400: '#A8A59D',
  gray600: '#6B6862',
  gray700: '#4A4845',
  gray800: '#2E2D2A',
  gray900: '#1A1917',
  white: '#FFFFFF',
  shadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
  radius: '10px',
  radiusLg: '16px',
};

const AdminPOS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState({ name: 'Walk-in Customer', phone: '' });
  const [deliveryMode, setDeliveryMode] = useState('pickup'); // 'pickup' | 'delivery'
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'online'
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [address, setAddress] = useState({ street: '', city: 'Dharmapuri' });
  const [processing, setProcessing] = useState(false);
  const scanInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    // Auto-focus the scan input
    if (scanInputRef.current) scanInputRef.current.focus();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`Added ${product.name}`);
    setSearch('');
    if (scanInputRef.current) scanInputRef.current.focus();
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const handleScan = (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    // Try to find by barcode/SKU first, then by name
    const searchTerm = search.trim().toUpperCase();
    const found = products.find(p =>
      (p.barcode && p.barcode.toUpperCase() === searchTerm) ||
      (p.sku && p.sku.toUpperCase() === searchTerm) ||
      p.name.toLowerCase() === search.trim().toLowerCase()
    );

    if (found) {
      addToCart(found);
    } else {
      toast.error('Product not found');
    }
    setSearch('');
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    if (!paymentConfirmed) return toast.error('Please confirm payment first');
    if (deliveryMode === 'delivery' && !address.street.trim()) return toast.error('Please enter delivery address');

    setProcessing(true);
    try {
      // Auto-status logic
      const orderStatus = deliveryMode === 'pickup' ? 'delivered' : 'placed';
      const deliveryStatus = deliveryMode === 'pickup' ? 'completed' : 'pending';

      const orderData = {
        customerName: customer.name,
        customerPhone: customer.phone || '0000000000',
        items: cart.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: total,
        paymentMethod: paymentMethod,
        paymentStatus: 'paid',
        status: orderStatus,
        address: deliveryMode === 'pickup'
          ? { street: 'POS Pickup', city: 'Store', pincode: '' }
          : { ...address, pincode: '' },
        customerType: 'walkin',
        source: 'shop',
        deliveryMode: deliveryMode,
        deliveryStatus: deliveryStatus
      };

      const token = localStorage.getItem('niraa_token');
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        toast.success('Order completed successfully! 🛒');
        setCart([]);
        setCustomer({ name: 'Walk-in Customer', phone: '' });
        setPaymentConfirmed(false);
        setDeliveryMode('pickup');
        setAddress({ street: '', city: 'Dharmapuri' });
      } else {
        toast.error('Failed to place order');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="pos-container" style={{ display: 'flex', gap: 24, height: 'calc(100vh - 120px)', fontFamily: T.font }}>

      {/* ── Left Side: Scanner & Product Lookup ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Scanner Input */}
        <form onSubmit={handleScan} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: T.white, padding: '12px 20px', borderRadius: T.radiusLg,
            boxShadow: T.shadow, border: `1.5px solid ${T.gray200}`
          }}>
            <FaBarcode style={{ color: T.teal, fontSize: 20 }} />
            <input
              ref={scanInputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Scan Barcode or Type Product Name..."
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontSize: 16, color: T.gray800, background: 'transparent'
              }}
            />
            <button type="submit" style={{
              background: T.teal, color: '#fff', border: 'none',
              padding: '8px 16px', borderRadius: T.radius, fontWeight: 600,
              cursor: 'pointer'
            }}>Add</button>
          </div>
        </form>

        {/* Product Grid / List */}
        <div style={{
          flex: 1, background: T.white, borderRadius: T.radiusLg,
          padding: 20, boxShadow: T.shadow, overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: T.gray900 }}>Fast Add</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {products.slice(0, 12).map(p => (
              <div
                key={p._id}
                onClick={() => addToCart(p)}
                style={{
                  padding: 12, borderRadius: T.radius, border: `1px solid ${T.gray200}`,
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.1s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.teal}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.gray200}
              >
                <div style={{ height: 60, background: T.gray50, borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.images?.[0] ? (
                    <img src={p.images[0]} style={{ height: '100%', objectFit: 'contain' }} />
                  ) : <FaBarcode color={T.gray300} />}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.gray800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 2, marginBottom: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: T.teal, background: T.tealLight, padding: '1px 5px', borderRadius: 3 }}>
                    {p.size || 'N/A'}
                  </span>
                  {p.productType === 'combo' && (
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#533AB7', background: '#EEEDFE', padding: '1px 5px', borderRadius: 3 }}>
                      🎁
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: T.teal, fontWeight: 700 }}>₹{p.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Side: Cart & Checkout ── */}
      <div className="pos-sidebar" style={{
        width: 380, background: T.white, borderRadius: T.radiusLg,
        display: 'flex', flexDirection: 'column', boxShadow: T.shadow, overflow: 'hidden'
      }}>
        <div style={{ padding: '20px 24px', background: T.teal, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FaShoppingCart />
            <h2 style={{ margin: 0, fontSize: 18 }}>Active Cart</h2>
            <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 99, fontSize: 12 }}>
              {cart.length} Items
            </span>
          </div>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: T.gray400, marginTop: 40 }}>
              <FaShoppingCart size={40} style={{ opacity: 0.2, marginBottom: 16 }} />
              <p>Cart is empty. Scan items to start.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cart.map(item => (
                <div key={item._id} style={{ display: 'flex', gap: 12, alignItems: 'center', paddingBottom: 12, borderBottom: `1px solid ${T.gray100}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.gray900 }}>{item.name}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.teal, background: T.tealLight, padding: '1px 6px', borderRadius: 4 }}>
                        {item.size || 'N/A'}
                      </span>
                      {item.productType === 'combo' && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#533AB7', background: '#EEEDFE', padding: '1px 6px', borderRadius: 4 }}>
                          🎁 COMBO ({item.comboItems?.length || 0})
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: T.gray400 }}>₹{item.price} x {item.quantity}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => updateQuantity(item._id, -1)} style={{ border: 'none', background: T.gray100, borderRadius: 6, width: 24, height: 24, cursor: 'pointer' }}><FaMinus size={10} /></button>
                    <span style={{ fontSize: 14, fontWeight: 600, width: 20, textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} style={{ border: 'none', background: T.gray100, borderRadius: 6, width: 24, height: 24, cursor: 'pointer' }}><FaPlus size={10} /></button>
                    <button onClick={() => removeFromCart(item._id)} style={{ border: 'none', background: 'transparent', color: '#ff4444', marginLeft: 8, cursor: 'pointer' }}><FaTrash size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer & Total */}
        <div style={{ padding: 24, background: T.gray50, borderTop: `1.5px solid ${T.gray200}` }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.gray400, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Customer Details</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                placeholder="Name"
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.gray200}`, fontSize: 13 }}
              />
              <input
                value={customer.phone}
                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                placeholder="Phone"
                style={{ width: 120, padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.gray200}`, fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.gray400, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Delivery & Payment</label>

            {/* Delivery Toggle */}
            <div style={{ display: 'flex', background: T.gray100, borderRadius: 8, padding: 3, marginBottom: 10 }}>
              <button
                onClick={() => setDeliveryMode('pickup')}
                style={{ flex: 1, padding: '6px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: deliveryMode === 'pickup' ? T.white : 'transparent', color: deliveryMode === 'pickup' ? T.teal : T.gray600, boxShadow: deliveryMode === 'pickup' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
              >
                <FaWalking size={11} /> Pickup
              </button>
              <button
                onClick={() => setDeliveryMode('delivery')}
                style={{ flex: 1, padding: '6px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: deliveryMode === 'delivery' ? T.white : 'transparent', color: deliveryMode === 'delivery' ? T.teal : T.gray600, boxShadow: deliveryMode === 'delivery' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
              >
                <FaTruck size={11} /> Delivery
              </button>
            </div>

            {/* Address Field if Delivery */}
            {deliveryMode === 'delivery' && (
              <input
                value={address.street}
                onChange={e => setAddress({ ...address, street: e.target.value })}
                placeholder="Delivery Address"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.gray200}`, fontSize: 13, marginBottom: 10 }}
              />
            )}

            {/* Payment Toggle */}
            <div style={{ display: 'flex', background: T.gray100, borderRadius: 8, padding: 3, marginBottom: 12 }}>
              <button
                onClick={() => setPaymentMethod('cash')}
                style={{ flex: 1, padding: '6px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: paymentMethod === 'cash' ? T.white : 'transparent', color: paymentMethod === 'cash' ? T.teal : T.gray600, boxShadow: paymentMethod === 'cash' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
              >
                <FaMoneyBillWave size={11} /> Cash
              </button>
              <button
                onClick={() => setPaymentMethod('online')}
                style={{ flex: 1, padding: '6px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: paymentMethod === 'online' ? T.white : 'transparent', color: paymentMethod === 'online' ? T.teal : T.gray600, boxShadow: paymentMethod === 'online' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
              >
                <FaMobileAlt size={11} /> UPI / Online
              </button>
            </div>

            {/* Confirm Payment Checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', background: paymentConfirmed ? T.tealLight : T.white, border: `1px solid ${paymentConfirmed ? T.teal : T.gray200}`, borderRadius: 8, transition: 'all 0.2s' }}>
              <input
                type="checkbox"
                checked={paymentConfirmed}
                onChange={e => setPaymentConfirmed(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: T.teal }}
              />
              <span style={{ fontSize: 13, fontWeight: 700, color: paymentConfirmed ? T.teal : T.gray700 }}>
                {paymentConfirmed ? 'Payment Confirmed ✅' : 'Confirm Payment'}
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: T.gray600 }}>Total Amount</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: T.teal }}>₹{total}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={processing || cart.length === 0}
            style={{
              width: '100%', background: T.teal, color: '#fff', border: 'none',
              padding: '14px', borderRadius: T.radius, fontWeight: 700, fontSize: 16,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 12px rgba(15,110,86,0.3)', opacity: processing ? 0.7 : 1
            }}
          >
            {processing ? 'Processing...' : (
              <>
                <FaCheckCircle /> Complete Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPOS;
