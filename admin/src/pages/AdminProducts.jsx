import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaBox, FaTag, FaImage, FaExclamationTriangle } from 'react-icons/fa';
import { useRealtime } from '../context/RealtimeContext.jsx';

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
  amber: '#EF9F27',
  amberLight: '#FAEEDA',
  red: '#E24B4A',
  redLight: '#FCEBEB',
  green: '#639922',
  greenLight: '#EAF3DE',
  blue: '#378ADD',
  blueLight: '#E6F1FB',
  white: '#FFFFFF',
  shadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
  shadowMd: '0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.08)',
  radius: '10px',
  radiusLg: '16px',
  radiusXl: '20px',
};

/* ─── Category Config ────────────────────────────────────────── */
const CATEGORIES = [
  { value: 'floor-cleaner', label: 'Floor Cleaner', color: T.blue, bg: T.blueLight },
  { value: 'toilet-cleaner', label: 'Toilet Cleaner', color: '#993556', bg: '#FBEAF0' },
  { value: 'dish-wash', label: 'Dish Wash', color: T.teal, bg: T.tealLight },
  { value: 'detergent', label: 'Detergent', color: '#854F0B', bg: T.amberLight },
  { value: 'combo', label: 'Combo', color: '#533AB7', bg: '#EEEDFE' },
  { value: 'other', label: 'Other', color: T.gray600, bg: T.gray100 },
];

const getCat = (val, allProducts = []) => {
  const hardcoded = CATEGORIES.find(c => c.value === val);
  if (hardcoded) return hardcoded;
  return { label: val?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), color: T.gray600, bg: T.gray100 };
};

/* ─── Shared Field styles ────────────────────────────────────── */
const field = {
  display: 'flex', flexDirection: 'column', gap: 6,
};
const label = {
  fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
  color: T.gray600, fontFamily: T.font,
};
const input = {
  padding: '10px 14px', border: `1.5px solid ${T.gray200}`, borderRadius: T.radius,
  fontSize: 14, fontFamily: T.font, color: T.gray800, background: T.white,
  outline: 'none', transition: 'border 0.15s',
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const { lastEvent } = useRealtime();

  const user = JSON.parse(localStorage.getItem('niraa_user') || 'null');
  const isAdmin = user?.role === 'admin';

  const emptyForm = {
    name: '', description: '', price: '', comparePrice: '',
    category: '', stock: '', images: [], isActive: true, isFeatured: false,
    variants: [],
    shortBenefit: '', highlightBadge: '', salesCount: '', rating: '4.8',
  };
  const [formData, setFormData] = useState(emptyForm);

  /* ── Fetch ── */
  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    fetchProducts();
  }, [isAdmin]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('niraa_token');
      if (!token) {
        toast.error('Session expired. Please login again.');
        setReadOnlyMode(true);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setReadOnlyMode(false);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Admin Fetch Error:', res.status, errorData);
        
        if (res.status === 401 || res.status === 403) {
          toast.error('Permission denied. Admin access required.');
          setReadOnlyMode(true);
        } else {
          // Fallback to public products if admin fetch fails for other reasons
          const fb = await fetch(`${API_BASE_URL}/products`);
          const fbData = await fb.json();
          setProducts(fbData.products || []);
          setReadOnlyMode(true);
          toast.error('Server error. Switching to read-only mode.');
        }
      }
    } catch (err) {
      console.error('Network Error:', err);
      try {
        const fb = await fetch(`${API_BASE_URL}/products`);
        const fbData = await fb.json();
        setProducts(fbData.products || []);
        setReadOnlyMode(true);
      } catch (e) { console.error('Fallback Fetch Error:', e); }
    } finally { setLoading(false); }
  };

  /* ── Realtime updates ── */
  useEffect(() => {
    if (lastEvent?.event === 'products.changed' || lastEvent?.event === 'orders.changed') {
      fetchProducts();
    }
  }, [lastEvent]);

  /* ── Image upload ── */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append('image', file);
    try {
      const token = localStorage.getItem('niraa_token');
      const res = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadData,
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(p => ({ ...p, images: [...(p.images || []), data.url] }));
        toast.success('Image uploaded! ✨');
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(`Upload failed: ${errData.message || 'Server error'}`);
      }
    } catch (err) {
      console.error('Upload Error:', err);
      toast.error('Upload network error');
    } finally {
      setUploadingImage(false);
    }
  };

  /* ── Form ── */
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnlyMode) { toast.error('Editing disabled in read-only mode'); return; }
    try {
      const token = localStorage.getItem('niraa_token');
      const url = editingProduct
        ? `${API_BASE_URL}/admin/products/${editingProduct._id}`
        : `${API_BASE_URL}/admin/products`;
      const res = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success(editingProduct ? 'Product updated!' : 'Product created!');
        fetchProducts(); resetForm();
      } else {
        const d = await res.json();
        toast.error(d.message || 'Save failed');
      }
    } catch { toast.error('Error saving'); }
  };

  const handleEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '', description: p.description || '',
      price: p.price || '', comparePrice: p.comparePrice || '',
      category: p.category || '', stock: p.stock || '',
      images: p.images?.length ? p.images : p.image ? [p.image] : [],
      isActive: p.isActive !== false, isFeatured: p.isFeatured || false,
      variants: p.variants || [],
      shortBenefit: p.shortBenefit || '',
      highlightBadge: p.highlightBadge || '',
      salesCount: p.salesCount || '',
      rating: p.rating || '4.8',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (readOnlyMode) { toast.error('Deletion disabled in read-only mode'); return; }
    try {
      const token = localStorage.getItem('niraa_token');
      const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) { toast.success('Product deleted'); fetchProducts(); }
      else { toast.error('Delete failed'); }
    } catch { toast.error('Error deleting'); }
    finally { setDeleteConfirm(null); }
  };

  const resetForm = () => { 
    setFormData(emptyForm); 
    setEditingProduct(null); 
    setShowForm(false); 
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
                         p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = showInactive || p.isActive !== false;
    return matchesSearch && matchesStatus;
  });

  const activeCount = products.filter(p => p.isActive).length;
  const lowStockCount = products.filter(p => p.stock <= 10 && p.stock > 0).length;
  const outCount = products.filter(p => p.stock === 0).length;

  /* ══════════════ RENDER ══════════════ */
  return (
    <div style={{ fontFamily: T.font, color: T.gray800, minHeight: '100vh', background: T.gray50, padding: '32px 32px 64px' }}>

      {/* ─ Not Admin Banner ─ */}
      {!isAdmin && (
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, background: T.redLight, border: `1.5px solid #F7C1C1`, borderRadius: T.radius, padding: '12px 16px' }}>
          <FaExclamationTriangle style={{ color: T.red, fontSize: 14 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#A32D2D' }}>Admin access required. Please login with an admin account.</span>
        </div>
      )}

      {/* ─ Read-only Banner ─ */}
      {readOnlyMode && (
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, background: T.amberLight, border: `1.5px solid #FAC775`, borderRadius: T.radius, padding: '12px 16px' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#854F0B' }}>Database offline — product management is in read-only mode.</span>
        </div>
      )}

      {/* ─── Page Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.tealMid, marginBottom: 6 }}>
            Niraa Admin
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: T.gray900, letterSpacing: '-0.02em' }}>
            Product Management
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: T.gray400 }}>
            {products.length} total products · {activeCount} active
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={readOnlyMode}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: T.teal, color: '#fff',
            border: 'none', padding: '11px 20px', borderRadius: T.radius,
            fontWeight: 600, cursor: readOnlyMode ? 'not-allowed' : 'pointer',
            fontSize: 14, fontFamily: T.font, letterSpacing: '-0.01em',
            opacity: readOnlyMode ? 0.5 : 1,
            boxShadow: `0 1px 2px rgba(15,110,86,0.2), 0 4px 12px rgba(15,110,86,0.18)`,
            transition: 'transform 0.1s',
          }}
          onMouseEnter={e => { if (!readOnlyMode) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
        >
          <FaPlus style={{ fontSize: 12 }} />
          Add Product
        </button>
      </div>

      {/* ─── Stat Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Products', value: products.length, color: T.teal, bg: T.tealLight },
          { label: 'Low Stock', value: lowStockCount, color: '#854F0B', bg: T.amberLight },
          { label: 'Out of Stock', value: outCount, color: T.red, bg: T.redLight },
        ].map(s => (
          <div key={s.label} style={{ background: T.white, border: `1.5px solid ${T.gray200}`, borderRadius: T.radiusLg, padding: '18px 20px', boxShadow: T.shadow }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.gray400, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.gray400, fontSize: 13, pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products by name or description…"
            style={{
              ...input, width: '100%', boxSizing: 'border-box',
              paddingLeft: 40, fontSize: 14,
              border: `1.5px solid ${T.gray200}`,
              boxShadow: T.shadow,
              borderRadius: T.radiusLg,
            }}
          />
        </div>
        
        <button
          onClick={() => setShowInactive(!showInactive)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: T.radiusLg,
            border: `1.5px solid ${showInactive ? T.teal : T.gray200}`,
            background: showInactive ? T.tealLight : T.white,
            color: showInactive ? T.tealDark : T.gray600,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            boxShadow: T.shadow,
          }}
        >
          {showInactive ? 'Showing All' : 'Showing Active'}
          <div style={{
            width: 32, height: 18, borderRadius: 99,
            background: showInactive ? T.teal : T.gray300,
            position: 'relative', transition: 'background 0.2s'
          }}>
            <div style={{
              position: 'absolute', top: 3, left: showInactive ? 16 : 3,
              width: 12, height: 12, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s'
            }} />
          </div>
        </button>
      </div>

      {/* ─── Table ─── */}
      <div style={{ background: T.white, border: `1.5px solid ${T.gray200}`, borderRadius: T.radiusLg, boxShadow: T.shadow, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: T.gray400, fontSize: 14 }}>
            Loading products…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <FaBox style={{ fontSize: 28, color: T.gray300, marginBottom: 12 }} />
            <p style={{ margin: 0, color: T.gray400, fontSize: 14 }}>No products found</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.gray50, borderBottom: `1.5px solid ${T.gray200}` }}>
                {['Product', 'Category', 'Price', 'Stock', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.gray400, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, i) => {
                const cat = getCat(product.category);
                const stockColor = product.stock > 10 ? T.green : product.stock > 0 ? '#BA7517' : T.red;
                const stockBg = product.stock > 10 ? T.greenLight : product.stock > 0 ? T.amberLight : T.redLight;
                return (
                  <tr
                    key={product._id}
                    style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.gray100}` : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = T.gray50}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Product */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${T.gray200}`, flexShrink: 0, background: T.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {product.images?.[0] || product.image
                            ? <img src={product.images?.[0] || product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <FaImage style={{ color: T.gray300, fontSize: 14 }} />
                          }
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: T.gray900, letterSpacing: '-0.01em' }}>{product.name}</div>
                          {product.isFeatured && (
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#533AB7', background: '#EEEDFE', padding: '2px 7px', borderRadius: 99, display: 'inline-block', marginTop: 3 }}>Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: cat.color, background: cat.bg, padding: '4px 10px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                        {cat.label}
                      </span>
                    </td>
                    {/* Price */}
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: T.gray900, letterSpacing: '-0.01em' }}>₹{product.price}</div>
                      {product.comparePrice && (
                        <div style={{ fontSize: 12, color: T.gray400, textDecoration: 'line-through', marginTop: 1 }}>₹{product.comparePrice}</div>
                      )}
                    </td>
                    {/* Stock */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: stockColor, background: stockBg, padding: '4px 10px', borderRadius: 99 }}>
                        {product.stock}
                      </span>
                    </td>
                    {/* Status */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: product.isActive ? T.tealMid : T.gray300 }} />
                        <span style={{ fontSize: 13, color: product.isActive ? T.tealDark : T.gray400, fontWeight: 500 }}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <ActionBtn
                          onClick={() => handleEdit(product)}
                          disabled={readOnlyMode}
                          color={T.blue} bg={T.blueLight}
                          title="Edit"
                        ><FaEdit style={{ fontSize: 12 }} /></ActionBtn>
                        <ActionBtn
                          onClick={() => setDeleteConfirm(product._id)}
                          disabled={readOnlyMode}
                          color={T.red} bg={T.redLight}
                          title="Delete"
                        ><FaTrash style={{ fontSize: 12 }} /></ActionBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Delete Confirm Modal ─── */}
      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)}>
          <div style={{ padding: '32px', textAlign: 'center', maxWidth: 360 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: T.redLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FaTrash style={{ color: T.red, fontSize: 18 }} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: T.gray900 }}>Delete Product?</h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: T.gray400, lineHeight: 1.6 }}>This action cannot be undone. The product will be permanently removed.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ padding: '10px 20px', borderRadius: T.radius, border: `1.5px solid ${T.gray200}`, background: T.white, color: T.gray700, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: T.font }}
              >Cancel</button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{ padding: '10px 20px', borderRadius: T.radius, border: 'none', background: T.red, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: T.font }}
              >Delete</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Form Drawer Modal ─── */}
      {showForm && (
        <Modal onClose={resetForm} wide>
          {/* Header */}
          <div style={{ padding: '24px 28px 20px', borderBottom: `1.5px solid ${T.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.tealMid, marginBottom: 4 }}>
                {editingProduct ? 'Edit Product' : 'New Product'}
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.gray900, letterSpacing: '-0.02em' }}>
                {editingProduct ? editingProduct.name : 'Add to Catalogue'}
              </h2>
            </div>
            <button onClick={resetForm} style={{ width: 36, height: 36, borderRadius: 99, border: `1.5px solid ${T.gray200}`, background: T.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.gray500 }}>
              <FaTimes style={{ fontSize: 13 }} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, maxHeight: 'calc(90vh - 160px)', overflowY: 'auto' }}>

              {/* Name + Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Product Name *" focusedField={focusedField} id="name">
                  <input type="text" name="name" value={formData.name} onChange={handleInput} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} required placeholder="e.g. Niraa Floor Magic" style={{ ...input, border: `1.5px solid ${focusedField === 'name' ? T.tealMid : T.gray200}` }} />
                </Field>
                <Field label="Category *" focusedField={focusedField} id="category">
                  {!isAddingCategory ? (
                    <div style={{ position: 'relative' }}>
                      <select 
                        name="category" 
                        value={formData.category} 
                        onChange={(e) => {
                          if (e.target.value === 'ADD_NEW') {
                            setIsAddingCategory(true);
                          } else {
                            handleInput(e);
                          }
                        }} 
                        onFocus={() => setFocusedField('category')} 
                        onBlur={() => setFocusedField(null)} 
                        required 
                        style={{ ...input, width: '100%', border: `1.5px solid ${focusedField === 'category' ? T.tealMid : T.gray200}`, cursor: 'pointer', appearance: 'none' }}
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        
                        {/* Dynamic categories from existing products */}
                        {[...new Set(products.map(p => p.category))].filter(c => !CATEGORIES.some(hc => hc.value === c) && c).map(c => (
                          <option key={c} value={c}>{c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                        ))}

                        <option value="ADD_NEW" style={{ fontWeight: 'bold', color: T.teal }}>+ Add New Category</option>
                      </select>
                      <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: T.gray400 }}>▼</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input 
                        type="text" 
                        placeholder="New category name..." 
                        value={newCategoryName}
                        onChange={(e) => {
                          setNewCategoryName(e.target.value);
                          setFormData(p => ({ ...p, category: e.target.value.toLowerCase().replace(/\s+/g, '-') }));
                        }}
                        style={{ ...input, flex: 1, border: `1.5px solid ${T.tealMid}` }}
                        autoFocus
                      />
                      <button 
                        type="button" 
                        onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); setFormData(p => ({ ...p, category: '' })); }}
                        style={{ background: T.gray100, border: 'none', padding: '0 12px', borderRadius: T.radius, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: T.gray600 }}
                      >Cancel</button>
                    </div>
                  )}
                </Field>
              </div>

              {/* Price + Compare + Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <Field label="Price (₹) *" focusedField={focusedField} id="price">
                  <input type="number" name="price" value={formData.price} onChange={handleInput} onFocus={() => setFocusedField('price')} onBlur={() => setFocusedField(null)} required placeholder="0.00" min="0" step="0.01" style={{ ...input, border: `1.5px solid ${focusedField === 'price' ? T.tealMid : T.gray200}` }} />
                </Field>
                <Field label="Compare Price" focusedField={focusedField} id="comparePrice">
                  <input type="number" name="comparePrice" value={formData.comparePrice} onChange={handleInput} onFocus={() => setFocusedField('comparePrice')} onBlur={() => setFocusedField(null)} placeholder="0.00" min="0" step="0.01" style={{ ...input, border: `1.5px solid ${focusedField === 'comparePrice' ? T.tealMid : T.gray200}` }} />
                </Field>
                <Field label="Stock Qty *" focusedField={focusedField} id="stock">
                  <input type="number" name="stock" value={formData.stock} onChange={handleInput} onFocus={() => setFocusedField('stock')} onBlur={() => setFocusedField(null)} required placeholder="0" min="0" style={{ ...input, border: `1.5px solid ${focusedField === 'stock' ? T.tealMid : T.gray200}` }} />
                </Field>
              </div>

              {/* Image */}
              <Field label="Product Image" focusedField={focusedField} id="images">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="url"
                    value={formData.images[0] || ''}
                    onChange={e => setFormData(p => ({ ...p, images: [e.target.value] }))}
                    onFocus={() => setFocusedField('images')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="https://res.cloudinary.com/..."
                    style={{ ...input, flex: 1, border: `1.5px solid ${focusedField === 'images' ? T.tealMid : T.gray200}` }}
                  />
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                    background: uploadingImage ? T.gray100 : T.tealLight, color: T.tealDark,
                    border: `1.5px solid ${T.tealMid}20`, borderRadius: T.radius,
                    cursor: uploadingImage ? 'wait' : 'pointer', fontWeight: 600, fontSize: 13,
                    whiteSpace: 'nowrap', fontFamily: T.font, transition: 'all 0.15s',
                  }}>
                    <FaImage style={{ fontSize: 12 }} />
                    {uploadingImage ? 'Uploading…' : 'Upload'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImage} />
                  </label>
                </div>
                {formData.images[0] && (
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={formData.images[0]} alt="Preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: `1.5px solid ${T.gray200}` }} />
                    <span style={{ fontSize: 12, color: T.gray400 }}>Preview</span>
                  </div>
                )}
              </Field>

              {/* Description */}
              <Field label="Description" focusedField={focusedField} id="description">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInput}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField(null)}
                  rows={4}
                  placeholder="Describe the product, its benefits, usage…"
                  style={{ ...input, resize: 'vertical', lineHeight: 1.6, border: `1.5px solid ${focusedField === 'description' ? T.tealMid : T.gray200}` }}
                />
              </Field>

              {/* Marketing & Persuasion */}
              <div style={{ borderTop: `1.5px solid ${T.gray100}`, paddingTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.tealDark, marginBottom: 16 }}>Marketing & Trust Signals</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <Field label="Short Benefit (Emotional Hook)" id="shortBenefit">
                    <input type="text" name="shortBenefit" value={formData.shortBenefit} onChange={handleInput} placeholder="e.g. Best for tough stains" style={input} />
                  </Field>
                  <Field label="Highlight Badge" id="highlightBadge">
                    <select name="highlightBadge" value={formData.highlightBadge} onChange={handleInput} style={{ ...input, cursor: 'pointer' }}>
                      <option value="">No Badge</option>
                      <option value="🔥 Bestseller">🔥 Bestseller</option>
                      <option value="🛡️ Germ Protection">🛡️ Germ Protection</option>
                      <option value="🌿 Eco-Friendly">🌿 Eco-Friendly</option>
                      <option value="✨ New Arrival">✨ New Arrival</option>
                      <option value="💎 Premium Quality">💎 Premium Quality</option>
                    </select>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="Trust Signal (e.g. 500+ Sold)" id="salesCount">
                    <input type="text" name="salesCount" value={formData.salesCount} onChange={handleInput} placeholder="500+" style={input} />
                  </Field>
                  <Field label="Rating (0-5)" id="rating">
                    <input type="number" name="rating" value={formData.rating} onChange={handleInput} step="0.1" min="0" max="5" style={input} />
                  </Field>
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: 16, borderTop: `1.5px solid ${T.gray100}`, paddingTop: 20 }}>
                {[
                  { name: 'isActive', label: 'Active', sub: 'Visible on website' },
                  { name: 'isFeatured', label: 'Featured', sub: 'Show on homepage' },
                ].map(tog => (
                  <label key={tog.name} style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: T.radius,
                    border: `1.5px solid ${formData[tog.name] ? T.tealMid + '60' : T.gray200}`,
                    background: formData[tog.name] ? T.tealLight : T.white,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <div style={{
                      width: 40, height: 22, borderRadius: 99,
                      background: formData[tog.name] ? T.tealMid : T.gray200,
                      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}>
                      <div style={{
                        position: 'absolute', top: 3, left: formData[tog.name] ? 21 : 3,
                        width: 16, height: 16, borderRadius: '50%', background: '#fff',
                        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                    <input type="checkbox" name={tog.name} checked={formData[tog.name]} onChange={handleInput} style={{ display: 'none' }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.gray800 }}>{tog.label}</div>
                      <div style={{ fontSize: 12, color: T.gray400 }}>{tog.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 28px', borderTop: `1.5px solid ${T.gray200}`, display: 'flex', justifyContent: 'flex-end', gap: 10, background: T.gray50 }}>
              <button type="button" onClick={resetForm} style={{ padding: '10px 20px', borderRadius: T.radius, border: `1.5px solid ${T.gray200}`, background: T.white, color: T.gray700, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: T.font }}>
                Cancel
              </button>
              <button type="submit" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 22px', borderRadius: T.radius,
                border: 'none', background: T.teal, color: '#fff',
                fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: T.font,
                boxShadow: `0 2px 8px rgba(15,110,86,0.25)`,
              }}>
                <FaSave style={{ fontSize: 12 }} />
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

/* ─── Sub-components ──────────────────────────────────────────── */

const Field = ({ label: lbl, id, children }) => (
  <div style={field}>
    <label htmlFor={id} style={label}>{lbl}</label>
    {children}
  </div>
);

const ActionBtn = ({ children, onClick, disabled, color, bg, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      width: 32, height: 32, borderRadius: 8, border: 'none',
      background: disabled ? T.gray100 : bg,
      color: disabled ? T.gray400 : color,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'transform 0.1s, opacity 0.1s',
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'scale(1.08)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
  >
    {children}
  </button>
);

const Modal = ({ children, onClose, wide }) => (
  <div
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15, 14, 13, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)',
      padding: 24,
    }}
  >
    <div style={{
      background: T.white,
      borderRadius: T.radiusXl,
      width: '100%',
      maxWidth: wide ? 640 : 420,
      maxHeight: '90vh',
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      display: 'flex', flexDirection: 'column',
    }}>
      {children}
    </div>
  </div>
);

const T2 = { gray300: '#D1CFC8', gray400: '#A8A59D', gray500: '#888680' };
Object.assign(T, T2);

export default AdminProducts;