import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { API_BASE_URL } from '../utils/constants';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import {
  FaBarcode, FaSearch, FaShoppingCart, FaTrash, FaPlus, FaMinus,
  FaCheckCircle, FaPrint, FaPause, FaPlay, FaTimes, FaMoneyBillWave,
  FaMobileAlt, FaCreditCard, FaPercentage, FaRupeeSign, FaKeyboard,
  FaUser, FaReceipt, FaArrowRight, FaHistory, FaTag
} from 'react-icons/fa';
import Barcode from 'react-barcode';

/* ─── Design Tokens ─────────────────────────────────────────── */
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
  red: '#dc2626',
  redLight: '#fee2e2',
  amber: '#d97706',
  shadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
  radius: '10px',
  radiusLg: '16px',
  radiusSm: '6px',
};

/* ─── Helpers ───────────────────────────────────────────────── */
const fmt = (n) => (n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const nowStr = () => new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
const getCashier = () => {
  try { return JSON.parse(localStorage.getItem('niraa_user') || '{}'); } catch { return {}; }
};
const genOrderId = () => 'POS-' + Date.now().toString(36).toUpperCase();

/* ─── Component ─────────────────────────────────────────────── */
const AdminPOS = () => {
  /* ── Data ── */
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ── Cart ── */
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  /* ── Discounts & Tax ── */
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' | 'percent'
  const [taxRate, setTaxRate] = useState(0); // GST %

  /* ── Checkout State ── */
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: 'Walk-in Customer', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [splitPayments, setSplitPayments] = useState({ cash: 0, upi: 0, card: 0 });
  const [processing, setProcessing] = useState(false);
  const [paymentConfirmOpen, setPaymentConfirmOpen] = useState(false);

  /* ── Receipt ── */
  const [lastOrder, setLastOrder] = useState(null);
  const receiptRef = useRef();

  /* ── Keyboard Shortcuts Overlay ── */
  const [showShortcuts, setShowShortcuts] = useState(false);

  /* ── Refs ── */
  const scanRef = useRef(null);
  const searchDebounce = useRef(null);

  /* ─────────────────────────────────────────────────────────── */
  /*  FETCH PRODUCTS                                             */
  /* ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        const list = data.products || [];
        setAllProducts(list);
        setProducts(list.slice(0, 20)); // popular grid
      }
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  /*  SEARCH (Debounced)                                         */
  /* ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!search.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    searchDebounce.current = setTimeout(() => {
      const term = search.trim().toLowerCase();
      const matches = allProducts.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.barcode?.toLowerCase() === term ||
        p.sku?.toLowerCase() === term ||
        p.category?.toLowerCase().includes(term)
      ).slice(0, 12);
      setSearchResults(matches);
      setShowResults(true);
    }, 150);
  }, [search, allProducts]);

  /* ─────────────────────────────────────────────────────────── */
  /*  CART OPERATIONS                                            */
  /* ─────────────────────────────────────────────────────────── */
  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id && item.variantId === product.variantId);
      if (existing) {
        return prev.map(item =>
          item._id === product._id && item.variantId === product.variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`+ ${product.name}`);
    setSearch('');
    setShowResults(false);
    setTimeout(() => scanRef.current?.focus(), 50);
  }, []);

  const updateQty = (id, variantId, delta) => {
    setCart(prev => prev.map(item => {
      if (item._id === id && item.variantId === variantId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const setQtyDirect = (id, variantId, val) => {
    const qty = Math.max(1, parseInt(val) || 1);
    setCart(prev => prev.map(item =>
      item._id === id && item.variantId === variantId ? { ...item, quantity: qty } : item
    ));
  };

  const removeItem = (id, variantId) => {
    setCart(prev => prev.filter(item => !(item._id === id && item.variantId === variantId)));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setCustomer({ name: 'Walk-in Customer', phone: '' });
  };

  /* ─────────────────────────────────────────────────────────── */
  /*  CALCULATIONS                                               */
  /* ─────────────────────────────────────────────────────────── */
  const subtotal = useMemo(() => cart.reduce((s, i) => s + (i.price * i.quantity), 0), [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === 'percent') return Math.min(subtotal * (discountValue / 100), subtotal);
    return Math.min(discountValue, subtotal);
  }, [subtotal, discountValue, discountType]);

  const afterDiscount = subtotal - discountAmount;
  const taxAmount = taxRate > 0 ? afterDiscount * (taxRate / 100) : 0;
  const total = afterDiscount + taxAmount;

  /* ─────────────────────────────────────────────────────────── */
  /*  HOLD / RESUME                                              */
  /* ─────────────────────────────────────────────────────────── */
  const holdCart = () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    const holds = JSON.parse(localStorage.getItem('pos_holds') || '[]');
    holds.push({
      id: Date.now(),
      items: cart,
      customer,
      discountValue,
      discountType,
      taxRate,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('pos_holds', JSON.stringify(holds.slice(-10)));
    clearCart();
    toast.success('Cart held successfully');
  };

  const resumeCart = (hold) => {
    setCart(hold.items);
    setCustomer(hold.customer);
    setDiscountValue(hold.discountValue || 0);
    setDiscountType(hold.discountType || 'fixed');
    setTaxRate(hold.taxRate || 0);
    const holds = JSON.parse(localStorage.getItem('pos_holds') || '[]').filter(h => h.id !== hold.id);
    localStorage.setItem('pos_holds', JSON.stringify(holds));
    toast.success('Cart resumed');
  };

  const [heldCarts, setHeldCarts] = useState([]);
  useEffect(() => {
    setHeldCarts(JSON.parse(localStorage.getItem('pos_holds') || '[]'));
  }, []);

  /* ─────────────────────────────────────────────────────────── */
  /*  CHECKOUT                                                   */
  /* ─────────────────────────────────────────────────────────── */
  const openCheckout = () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    setCheckoutOpen(true);
  };

  const handleCheckout = async () => {
    // Basic validation
    if (cart.length === 0) return;
    
    // Check if it's a walk-in sale to show the UI confirmation modal
    const isWalkin = customer?.name === 'Walk-in Customer' || customer?.phone === '' || customer?.customerType === 'walkin';
    
    if (isWalkin) {
      setPaymentConfirmOpen(true);
      return;
    }

    // For non-walkin (identified customers), proceed directly or show different flow if needed
    // In POS, usually everything is paid immediately
    completeOrder();
  };

  const completeOrder = async () => {
    setProcessing(true);
    try {
      const cashier = getCashier();

      const orderData = {
        customerName: customer.name || 'Walk-in Customer',
        customerPhone: customer.phone || '0000000000',
        items: cart.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variantId: item.variantId || null,
          variantDesc: item.variantDesc || null,
        })),
        subtotal,
        discount: discountAmount,
        taxRate,
        taxAmount,
        total,
        paymentMethod,
        // Explicitly mark POS/walk-in as paid/delivered when confirmed
        paymentStatus: 'paid',
        status: 'delivered',
        deliveryMode: 'pickup',
        deliveryStatus: 'completed',
        address: { street: 'POS Pickup', city: 'Store', pincode: '' },
        customerType: 'walkin',
        source: 'pos',
        orderType: 'POS',
        cashier: cashier.name || cashier.email || 'Staff',
        cashierId: cashier.id || cashier._id || null,
        posOrderId: genOrderId(),
      };
 
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const data = await res.json();
        setLastOrder({ ...orderData, _id: data._id || data.id, createdAt: new Date().toISOString() });
        toast.success('Order completed! 🎉');
        setCheckoutOpen(false);
        setPaymentConfirmOpen(false);
        clearCart();
      } else {
        const err = await res.json().catch(() => ({ message: 'Failed to place order' }));
        toast.error(err.message || 'Failed to place order');
        console.error('Checkout failed:', err);
      }
    } catch (err) {
      toast.error('Network error');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  /*  PRINT RECEIPT                                              */
  /* ─────────────────────────────────────────────────────────── */
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${lastOrder?.posOrderId || 'POS'}`,
    onAfterPrint: () => {
      setLastOrder(null);
      scanRef.current?.focus();
    },
  });

  /* ─────────────────────────────────────────────────────────── */
  /*  KEYBOARD SHORTCUTS                                         */
  /* ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      // F2 = focus search
      if (e.key === 'F2') {
        e.preventDefault();
        scanRef.current?.focus();
        return;
      }
      // F4 = open checkout
      if (e.key === 'F4') {
        e.preventDefault();
        if (!checkoutOpen && cart.length > 0) openCheckout();
        return;
      }
      // F9 = hold cart
      if (e.key === 'F9') {
        e.preventDefault();
        holdCart();
        return;
      }
      // F10 = show shortcuts
      if (e.key === 'F10') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
        return;
      }
      // Escape = close modals
      if (e.key === 'Escape') {
        setCheckoutOpen(false);
        setShowShortcuts(false);
        if (lastOrder) setLastOrder(null);
        return;
      }
      // Enter on search with 1 result = add it
      if (e.key === 'Enter' && document.activeElement === scanRef.current) {
        if (searchResults.length === 1) {
          e.preventDefault();
          addToCart(searchResults[0]);
        }
        return;
      }
      // +/- on focused cart row could be implemented with a selectedIndex state
      // For now, keep it simple
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchResults, checkoutOpen, cart.length, lastOrder, addToCart]);

  /* ─────────────────────────────────────────────────────────── */
  /*  RENDER                                                     */
  /* ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', fontFamily: T.font, background: T.gray50 }}>

      {/* ═══ TOP BAR ═══ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: T.white, borderBottom: `1px solid ${T.gray200}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, background: T.gray50, borderRadius: T.radius, border: `1.5px solid ${T.gray200}`, padding: '8px 14px' }}>
          <FaBarcode color={T.teal} size={18} />
          <input
            ref={scanRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Scan barcode, type product name, or press F2 to focus..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, background: 'transparent', fontFamily: T.font }}
            autoFocus
          />
          {search && (
            <button onClick={() => { setSearch(''); scanRef.current?.focus(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.gray400 }}>
              <FaTimes />
            </button>
          )}
        </div>

        <button onClick={holdCart} title="Hold Cart (F9)" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: T.radiusSm, border: `1px solid ${T.gray200}`, background: T.white, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: T.amber }}>
          <FaPause size={12} /> Hold
        </button>

        {heldCarts.length > 0 && (
          <div style={{ position: 'relative' }}>
            <button onClick={() => document.getElementById('hold-menu').classList.toggle('show')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: T.radiusSm, border: `1px solid ${T.gray200}`, background: T.white, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: T.teal }}>
              <FaPlay size={12} /> Resume ({heldCarts.length})
            </button>
            <div id="hold-menu" style={{ display: 'none', position: 'absolute', top: '110%', right: 0, background: T.white, borderRadius: T.radius, boxShadow: T.shadow, border: `1px solid ${T.gray200}`, zIndex: 50, minWidth: 220, padding: 8 }}>
              {heldCarts.map(h => (
                <button key={h.id} onClick={() => resumeCart(h)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: T.radiusSm, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}>
                  <div style={{ fontWeight: 600 }}>{h.customer.name}</div>
                  <div style={{ fontSize: 11, color: T.gray400 }}>{h.items.length} items · ₹{h.items.reduce((s,i)=>s+i.price*i.quantity,0)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => setShowShortcuts(true)} title="Shortcuts (F10)" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: T.radiusSm, border: `1px solid ${T.gray200}`, background: T.white, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: T.gray600 }}>
          <FaKeyboard size={12} />
        </button>
      </div>

      {/* ═══ SEARCH RESULTS DROPDOWN ═══ */}
      {showResults && searchResults.length > 0 && (
        <div style={{ position: 'absolute', top: 58, left: 20, right: 20, background: T.white, borderRadius: T.radius, boxShadow: T.shadow, border: `1px solid ${T.gray200}`, zIndex: 40, maxHeight: 320, overflowY: 'auto', padding: '8px 0' }}>
          {searchResults.map(p => (
            <div key={p._id} onClick={() => addToCart(p)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', borderBottom: `1px solid ${T.gray100}` }} onMouseEnter={e => e.currentTarget.style.background = T.gray50} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <img src={p.images?.[0] || '/placeholder.png'} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, background: T.gray50 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.gray800 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: T.gray400 }}>{p.category} · Stock: {p.stock ?? 'N/A'}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.teal }}>₹{p.price}</div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ MAIN BODY ═══ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 0 }}>

        {/* ── LEFT: Product Grid ── */}
        <div style={{ flex: 1.4, padding: 20, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: T.gray900 }}>Products</h3>
            <span style={{ fontSize: 12, color: T.gray400 }}>{allProducts.length} items in catalog</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
            {products.map(p => (
              <div key={p._id} onClick={() => addToCart(p)} style={{
                background: T.white, borderRadius: T.radius, border: `1px solid ${T.gray200}`,
                padding: 14, textAlign: 'center', cursor: 'pointer', transition: 'all 0.12s',
              }} onMouseEnter={e => { e.currentTarget.style.borderColor = T.teal; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.gray200; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ height: 70, background: T.gray50, borderRadius: 8, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.images?.[0] ? <img src={p.images[0]} style={{ height: '100%', objectFit: 'contain' }} alt="" /> : <FaBarcode color={T.gray300} />}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.gray800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                  {p.size && <span style={{ fontSize: 9, fontWeight: 700, color: T.teal, background: T.tealLight, padding: '1px 5px', borderRadius: 3 }}>{p.size}</span>}
                  {p.productType === 'combo' && <span style={{ fontSize: 9, fontWeight: 700, color: '#533AB7', background: '#EEEDFE', padding: '1px 5px', borderRadius: 3 }}>🎁</span>}
                </div>
                <div style={{ fontSize: 13, color: T.teal, fontWeight: 700, marginTop: 6 }}>₹{p.price}</div>
                <div style={{ fontSize: 10, color: (p.stock || 0) < 5 ? T.red : T.gray400, marginTop: 2 }}>
                  {(p.stock || 0) < 5 ? `Only ${p.stock} left` : `Stock: ${p.stock}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Cart Panel ── */}
        <div style={{ width: 400, background: T.white, borderLeft: `1px solid ${T.gray200}`, display: 'flex', flexDirection: 'column' }}>
          {/* Cart Header */}
          <div style={{ padding: '16px 20px', background: T.teal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FaShoppingCart />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Cart</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{cart.length}</span>
              {cart.length > 0 && (
                <button onClick={clearCart} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, opacity: 0.8 }}>
                  <FaTrash size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: T.gray400, paddingTop: 60 }}>
                <FaBarcode size={48} style={{ opacity: 0.15, marginBottom: 16 }} />
                <p style={{ fontSize: 14 }}>Scan or search to add items</p>
                <p style={{ fontSize: 12, opacity: 0.7 }}>Press F2 to focus search bar</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cart.map(item => (
                  <div key={`${item._id}-${item.variantId || ''}`} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${T.gray100}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.gray900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: T.gray400, marginTop: 2 }}>₹{item.price} / unit</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => updateQty(item._id, item.variantId, -1)} style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: T.gray100, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaMinus size={9} /></button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => setQtyDirect(item._id, item.variantId, e.target.value)}
                        style={{ width: 32, textAlign: 'center', border: `1px solid ${T.gray200}`, borderRadius: 5, fontSize: 13, padding: '2px 0', fontFamily: T.mono }}
                      />
                      <button onClick={() => updateQty(item._id, item.variantId, 1)} style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: T.gray100, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPlus size={9} /></button>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.gray800, minWidth: 50, textAlign: 'right', fontFamily: T.mono }}>₹{fmt(item.price * item.quantity)}</div>
                    <button onClick={() => removeItem(item._id, item.variantId)} style={{ background: 'none', border: 'none', color: T.red, cursor: 'pointer', padding: 4 }}><FaTrash size={11} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discount & Tax */}
          {cart.length > 0 && (
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.gray100}`, background: T.gray50 }}>
              {/* Discount */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <FaTag size={11} color={T.teal} />
                <span style={{ fontSize: 12, fontWeight: 600, color: T.gray600, flex: 1 }}>Discount</span>
                <button onClick={() => setDiscountType(discountType === 'fixed' ? 'percent' : 'fixed')} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, border: 'none', background: T.gray200, cursor: 'pointer', fontWeight: 600 }}>
                  {discountType === 'fixed' ? <><FaRupeeSign size={9} /> Fixed</> : <><FaPercentage size={9} /> %</>}
                </button>
                <input
                  type="number"
                  min={0}
                  value={discountValue}
                  onChange={e => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                  style={{ width: 70, textAlign: 'right', border: `1px solid ${T.gray200}`, borderRadius: 5, fontSize: 13, padding: '3px 6px', fontFamily: T.mono }}
                />
              </div>
              {/* Tax */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaPercentage size={11} color={T.teal} />
                <span style={{ fontSize: 12, fontWeight: 600, color: T.gray600, flex: 1 }}>GST / Tax</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={taxRate}
                  onChange={e => setTaxRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  style={{ width: 50, textAlign: 'right', border: `1px solid ${T.gray200}`, borderRadius: 5, fontSize: 13, padding: '3px 6px', fontFamily: T.mono }}
                />
                <span style={{ fontSize: 12, color: T.gray400 }}>%</span>
              </div>
            </div>
          )}

          {/* Totals */}
          <div style={{ padding: '14px 16px', borderTop: `1.5px solid ${T.gray200}`, background: T.gray50 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: T.gray600 }}>Subtotal</span>
              <span style={{ fontSize: 13, fontFamily: T.mono }}>₹{fmt(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: T.red }}>Discount</span>
                <span style={{ fontSize: 13, color: T.red, fontFamily: T.mono }}>-₹{fmt(discountAmount)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: T.gray600 }}>Tax ({taxRate}%)</span>
                <span style={{ fontSize: 13, fontFamily: T.mono }}>₹{fmt(taxAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: `2px solid ${T.gray200}` }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: T.gray900 }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: T.teal, fontFamily: T.mono }}>₹{fmt(total)}</span>
            </div>
          </div>

          {/* Complete Sale */}
          <div style={{ padding: '14px 16px', borderTop: `1px solid ${T.gray200}` }}>
            <button
              onClick={openCheckout}
              disabled={cart.length === 0}
              style={{
                width: '100%', background: T.teal, color: '#fff', border: 'none',
                padding: '14px', borderRadius: T.radius, fontWeight: 700, fontSize: 16,
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 4px 12px rgba(15,110,86,0.25)', opacity: cart.length === 0 ? 0.5 : 1
              }}
            >
              <FaCheckCircle /> Complete Sale <span style={{ fontSize: 11, opacity: 0.8, fontWeight: 400 }}>(F4)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ CHECKOUT MODAL ═══ */}
      {checkoutOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setCheckoutOpen(false)}>
          <div style={{ background: T.white, borderRadius: T.radiusLg, width: 460, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.gray100}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, color: T.gray900 }}>Complete Sale</h3>
              <button onClick={() => setCheckoutOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.gray400 }}><FaTimes size={18} /></button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Customer */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.gray400, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Customer</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} placeholder="Name" style={{ flex: 1, padding: '10px 12px', borderRadius: T.radiusSm, border: `1px solid ${T.gray200}`, fontSize: 14 }} />
                  <input value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} placeholder="Phone" style={{ width: 130, padding: '10px 12px', borderRadius: T.radiusSm, border: `1px solid ${T.gray200}`, fontSize: 14 }} />
                </div>
              </div>

              {/* Payment Method */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: T.gray400, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Payment Method</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { key: 'cash', icon: FaMoneyBillWave, label: 'Cash' },
                    { key: 'upi', icon: FaMobileAlt, label: 'UPI' },
                    { key: 'card', icon: FaCreditCard, label: 'Card' },
                    { key: 'split', icon: FaPercentage, label: 'Split' },
                  ].map(m => (
                    <button key={m.key} onClick={() => setPaymentMethod(m.key)} style={{
                      flex: 1, padding: '12px 8px', borderRadius: T.radiusSm, border: `1.5px solid ${paymentMethod === m.key ? T.teal : T.gray200}`,
                      background: paymentMethod === m.key ? T.tealLight : T.white, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      color: paymentMethod === m.key ? T.teal : T.gray600, fontWeight: 600, fontSize: 12
                    }}>
                      <m.icon size={18} />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Payment Inputs */}
              {paymentMethod === 'split' && (
                <div style={{ marginBottom: 20, padding: 14, background: T.gray50, borderRadius: T.radiusSm }}>
                  {['cash', 'upi', 'card'].map(k => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ width: 50, fontSize: 13, fontWeight: 600, textTransform: 'capitalize', color: T.gray700 }}>{k}</span>
                      <input type="number" min={0} value={splitPayments[k]} onChange={e => setSplitPayments(prev => ({ ...prev, [k]: Math.max(0, parseFloat(e.target.value) || 0) }))}
                        style={{ flex: 1, padding: '8px 10px', borderRadius: T.radiusSm, border: `1px solid ${T.gray200}`, fontSize: 14 }} />
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: `1px solid ${T.gray200}`, fontSize: 13 }}>
                    <span style={{ color: T.gray600 }}>Split Total</span>
                    <span style={{ fontWeight: 700, fontFamily: T.mono, color: Object.values(splitPayments).reduce((a,b)=>a+b,0) >= total ? T.teal : T.red }}>
                      ₹{fmt(Object.values(splitPayments).reduce((a,b)=>a+b,0))} / ₹{fmt(total)}
                    </span>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div style={{ background: T.gray50, borderRadius: T.radiusSm, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.gray400, textTransform: 'uppercase', marginBottom: 10 }}>Order Summary</div>
                {cart.map(item => (
                  <div key={`${item._id}-${item.variantId || ''}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: T.gray700 }}>
                    <span>{item.name} x{item.quantity}</span>
                    <span style={{ fontFamily: T.mono }}>₹{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: T.red, marginTop: 6 }}>
                    <span>Discount</span><span>-₹{fmt(discountAmount)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: T.gray600, marginTop: 4 }}>
                    <span>Tax ({taxRate}%)</span><span>₹{fmt(taxAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: `2px solid ${T.gray200}`, fontSize: 18, fontWeight: 800, color: T.teal }}>
                  <span>Total</span>
                  <span style={{ fontFamily: T.mono }}>₹{fmt(total)}</span>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleCheckout}
                disabled={processing || (paymentMethod === 'split' && Math.abs(Object.values(splitPayments).reduce((a,b)=>a+b,0) - total) > 0.01)}
                style={{
                  width: '100%', background: T.teal, color: '#fff', border: 'none',
                  padding: '14px', borderRadius: T.radius, fontWeight: 700, fontSize: 16,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 4px 12px rgba(15,110,86,0.25)', opacity: processing ? 0.7 : 1
                }}
              >
                {processing ? 'Processing...' : <><FaCheckCircle /> Confirm & Print</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PAYMENT CONFIRMATION MODAL (UI Replacement for window.confirm) ═══ */}
      {paymentConfirmOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPaymentConfirmOpen(false)}>
          <div style={{ background: T.white, borderRadius: T.radiusLg, width: 400, padding: '30px 24px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.tealLight, color: T.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <FaMoneyBillWave size={32} />
            </div>
            
            <h3 style={{ margin: '0 0 10px', fontSize: 20, color: T.gray900, fontWeight: 800 }}>Confirm Payment</h3>
            <p style={{ margin: '0 0 24px', fontSize: 15, color: T.gray600, lineHeight: 1.5 }}>
              Have you received the payment of <strong style={{ color: T.teal }}>₹{fmt(total)}</strong> for this walk-in sale?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button 
                onClick={completeOrder}
                disabled={processing}
                style={{
                  width: '100%', background: T.teal, color: '#fff', border: 'none',
                  padding: '14px', borderRadius: T.radius, fontWeight: 700, fontSize: 16,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 4px 12px rgba(15,110,86,0.25)', opacity: processing ? 0.7 : 1
                }}
              >
                {processing ? 'Processing...' : <><FaCheckCircle /> Yes, Payment Received</>}
              </button>
              
              <button 
                onClick={() => setPaymentConfirmOpen(false)}
                disabled={processing}
                style={{
                  width: '100%', background: 'transparent', color: T.gray600, border: `1px solid ${T.gray200}`,
                  padding: '12px', borderRadius: T.radius, fontWeight: 600, fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ RECEIPT OVERLAY ═══ */}
      {lastOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: T.white, borderRadius: T.radiusLg, width: 420, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', background: T.tealLight, textAlign: 'center' }}>
              <FaCheckCircle size={40} color={T.teal} style={{ marginBottom: 10 }} />
              <h3 style={{ margin: 0, color: T.teal, fontSize: 20 }}>Order Confirmed!</h3>
              <p style={{ margin: '6px 0 0', color: T.gray600, fontSize: 13 }}>#{lastOrder.posOrderId}</p>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <p style={{ margin: '0 0 4px', fontSize: 13, color: T.gray600 }}>Total Paid</p>
                <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: T.teal, fontFamily: T.mono }}>₹{fmt(lastOrder.total)}</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: T.gray400 }}>{lastOrder.paymentMethod === 'cash' ? 'Cash' : lastOrder.paymentMethod === 'upi' ? 'UPI' : lastOrder.paymentMethod === 'card' ? 'Card' : 'Split Payment'}</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handlePrint} style={{ flex: 1, padding: '12px', borderRadius: T.radiusSm, border: 'none', background: T.teal, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <FaPrint /> Print Receipt
                </button>
                <button onClick={() => { setLastOrder(null); scanRef.current?.focus(); }} style={{ flex: 1, padding: '12px', borderRadius: T.radiusSm, border: `1.5px solid ${T.gray200}`, background: T.white, color: T.gray700, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  New Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PRINTABLE RECEIPT (Hidden) ═══ */}
      <div style={{ position: 'absolute', left: -9999, top: 0 }}>
        <div ref={receiptRef} style={{ width: 300, padding: 20, fontFamily: T.mono, fontSize: 12, color: '#000' }}>
          {lastOrder && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: '2px dashed #000', paddingBottom: 12 }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 18 }}>NIRAA</h2>
                <p style={{ margin: 0, fontSize: 11 }}>Fresh. Natural. Delivered.</p>
                <p style={{ margin: '8px 0 0', fontSize: 10 }}>{nowStr()}</p>
                <p style={{ margin: '4px 0 0', fontSize: 10 }}>Order: {lastOrder.posOrderId}</p>
              </div>
              <div style={{ marginBottom: 12 }}>
                <p style={{ margin: '0 0 4px', fontSize: 11 }}><strong>Customer:</strong> {lastOrder.customerName}</p>
                {lastOrder.customerPhone && <p style={{ margin: 0, fontSize: 11 }}><strong>Phone:</strong> {lastOrder.customerPhone}</p>}
                <p style={{ margin: '4px 0 0', fontSize: 11 }}><strong>Cashier:</strong> {lastOrder.cashier}</p>
              </div>
              <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', marginBottom: 12 }}>
                {lastOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                    <span style={{ flex: 1 }}>{item.name} x{item.quantity}</span>
                    <span>₹{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Subtotal</span><span>₹{fmt(lastOrder.subtotal)}</span></div>
                {lastOrder.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Discount</span><span>-₹{fmt(lastOrder.discount)}</span></div>}
                {lastOrder.taxAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Tax ({lastOrder.taxRate}%)</span><span>₹{fmt(lastOrder.taxAmount)}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 14, marginTop: 8, borderTop: '1px solid #000', paddingTop: 6 }}>
                  <span>TOTAL</span><span>₹{fmt(lastOrder.total)}</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 11 }}>
                  <span>Payment: {lastOrder.paymentMethod.toUpperCase()}</span>
                </div>
              </div>
              <div style={{ textAlign: 'center', borderTop: '2px dashed #000', paddingTop: 12 }}>
                <p style={{ margin: '0 0 8px', fontSize: 11 }}>Thank you for shopping with us!</p>
                {lastOrder._id && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Barcode value={lastOrder._id} width={1.5} height={40} fontSize={10} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ KEYBOARD SHORTCUTS OVERLAY ═══ */}
      {showShortcuts && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowShortcuts(false)}>
          <div style={{ background: T.white, borderRadius: T.radiusLg, width: 380, padding: '24px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, color: T.gray900 }}>Keyboard Shortcuts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'F2', desc: 'Focus search / scan bar' },
                { key: 'Enter', desc: 'Add single search result to cart' },
                { key: 'F4', desc: 'Open checkout' },
                { key: 'F9', desc: 'Hold current cart' },
                { key: 'Esc', desc: 'Close modals' },
                { key: 'F10', desc: 'Toggle this help' },
              ].map(s => (
                <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${T.gray100}` }}>
                  <span style={{ fontSize: 13, color: T.gray700 }}>{s.desc}</span>
                  <kbd style={{ background: T.gray100, padding: '3px 10px', borderRadius: 4, fontSize: 12, fontFamily: T.mono, fontWeight: 700, border: `1px solid ${T.gray200}` }}>{s.key}</kbd>
                </div>
              ))}
            </div>
            <button onClick={() => setShowShortcuts(false)} style={{ width: '100%', marginTop: 16, padding: '10px', borderRadius: T.radiusSm, border: 'none', background: T.teal, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Got it</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPOS;
