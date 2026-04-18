import React, { useEffect, useMemo, useState } from 'react';
import { formatPrice } from '../../utils/formatPrice.js';
import { API_BASE_URL } from '../../utils/constants.js';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'floor-cleaner',
    price: '',
    originalPrice: '',
    discount: '',
    quantity: '1 litre',
    image: '',
    features: 'Eco-friendly, Safe clean, Family friendly',
    usage: 'Use as directed on label.',
    isCombo: false,
    isFeatured: true,
    stock: '100',
  });

  const getToken = () => JSON.parse(localStorage.getItem('niraa_user') || 'null')?.token;

  const categories = useMemo(
    () => ['floor-cleaner', 'toilet-cleaner', 'dish-wash', 'detergent', 'tiles-cleaner', 'combo'],
    []
  );

  const slugify = (s) =>
    String(s || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/products`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        setProducts(data.products || data || []);
      } catch (err) { setProducts([]); }
    })();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Remove this product?')) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setProducts(p => p.filter(x => x._id !== id));
      alert('Product removed');
    } catch (err) { alert(err.message || 'Error'); }
  };

  const handleEdit = async (p) => {
    const name = prompt('Name', p.name);
    if (name === null) return;
    const priceRaw = prompt('Price (₹)', String(p.price));
    if (priceRaw === null) return;
    const price = Number(priceRaw || p.price);

    const originalPriceRaw = prompt('Original price (₹) for offer (optional)', p.originalPrice ? String(p.originalPrice) : '');
    if (originalPriceRaw === null) return;
    const discountRaw = prompt('Discount % (optional)', p.discount ? String(p.discount) : '');
    if (discountRaw === null) return;
    const image = prompt('Image URL (optional)', p.image || '') || '';

    const originalPrice = originalPriceRaw ? Number(originalPriceRaw) : undefined;
    const discount = discountRaw ? Number(discountRaw) : undefined;

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/products/${p._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name,
          price,
          ...(typeof originalPrice === 'number' && !Number.isNaN(originalPrice) ? { originalPrice } : {}),
          ...(typeof discount === 'number' && !Number.isNaN(discount) ? { discount } : {}),
          image,
        }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.message || 'Update failed');
      setProducts(list => list.map(x => x._id === updated._id ? updated : x));
      alert('Product updated');
    } catch (err) { alert(err.message || 'Error'); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return alert('Please login again.');

    const slug = form.slug.trim() ? form.slug.trim() : slugify(form.name);
    if (!form.name.trim() || !slug || !form.description.trim()) return alert('Please fill Name, Slug and Description.');
    if (!form.category) return alert('Please select a category.');
    if (!form.price || Number(form.price) <= 0) return alert('Please enter a valid price.');

    const payload = {
      name: form.name.trim(),
      slug,
      description: form.description.trim(),
      category: form.category,
      price: Number(form.price),
      quantity: form.quantity || '1 litre',
      image: form.image || '',
      usage: form.usage || '',
      features: (form.features || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      isCombo: Boolean(form.isCombo),
      isFeatured: Boolean(form.isFeatured),
      stock: form.stock ? Number(form.stock) : undefined,
    };

    const originalPrice = form.originalPrice ? Number(form.originalPrice) : undefined;
    const discount = form.discount ? Number(form.discount) : undefined;
    if (typeof originalPrice === 'number' && !Number.isNaN(originalPrice)) payload.originalPrice = originalPrice;
    if (typeof discount === 'number' && !Number.isNaN(discount)) payload.discount = discount;

    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const created = await res.json();
      if (!res.ok) throw new Error(created.message || 'Create failed');
      setProducts(prev => [created, ...prev]);
      alert('Product added');
      setForm(f => ({ ...f, name: '', slug: '', description: '', price: '', originalPrice: '', discount: '', image: '' }));
    } catch (err) {
      alert(err.message || 'Error while adding product');
    }
  };

  return (
    <div className="admin-products container" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Product Management</h2>
        <div style={{ color: 'var(--gray-600)', fontWeight: 700 }}>{products.length} products</div>
      </div>

      <div style={{ marginTop: 14, background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 16, padding: 14 }}>
        <div style={{ fontWeight: 900, color: 'var(--teal-dark)', fontSize: '1.1rem' }}>Add Product</div>
        <form onSubmit={handleAdd} style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
          <input
            placeholder="Name*"
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value, slug: prev.slug || slugify(e.target.value) }))}
            style={{ padding: 12, borderRadius: 14, border: '1px solid var(--gray-200)' }}
          />
          <input
            placeholder="Slug* (unique) e.g. floor-cleaner-1lt"
            value={form.slug}
            onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
            style={{ padding: 12, borderRadius: 14, border: '1px solid var(--gray-200)' }}
          />
          <textarea
            placeholder="Description*"
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            style={{ padding: 12, borderRadius: 14, border: '1px solid var(--gray-200)' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <select
              value={form.category}
              onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
              style={{ padding: 12, borderRadius: 14, border: '1px solid var(--gray-200)' }}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              placeholder="Quantity"
              value={form.quantity}
              onChange={e => setForm(prev => ({ ...prev, quantity: e.target.value }))}
              style={{ padding: 12, borderRadius: 14, border: '1px solid var(--gray-200)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input
              placeholder="Price* (₹)"
              value={form.price}
              onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
              style={{ padding: 12, borderRadius: 14, border: '1px solid var(--gray-200)' }}
            />
            <input
              placeholder="Image URL (optional)"
              value={form.image}
              onChange={e => setForm(prev => ({ ...prev, image: e.target.value }))}
              style={{ padding: 12, borderRadius: 14, border: '1px solid var(--gray-200)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input
              placeholder="Original price (₹) optional"
              value={form.originalPrice}
              onChange={e => setForm(prev => ({ ...prev, originalPrice: e.target.value }))}
              style={{ padding: 12, borderRadius: 14, border: '1px solid var(--gray-200)' }}
            />
            <input
              placeholder="Discount % optional"
              value={form.discount}
              onChange={e => setForm(prev => ({ ...prev, discount: e.target.value }))}
              style={{ padding: 12, borderRadius: 14, border: '1px solid var(--gray-200)' }}
            />
          </div>

          <input
            placeholder="Features (comma separated)"
            value={form.features}
            onChange={e => setForm(prev => ({ ...prev, features: e.target.value }))}
            style={{ padding: 12, borderRadius: 14, border: '1px solid var(--gray-200)' }}
          />
          <input
            placeholder="Usage instructions"
            value={form.usage}
            onChange={e => setForm(prev => ({ ...prev, usage: e.target.value }))}
            style={{ padding: 12, borderRadius: 14, border: '1px solid var(--gray-200)' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 10, borderRadius: 14, border: '1px solid var(--gray-200)' }}>
              <input
                type="checkbox"
                checked={form.isCombo}
                onChange={e => setForm(prev => ({ ...prev, isCombo: e.target.checked }))}
              />
              Is Combo
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 10, borderRadius: 14, border: '1px solid var(--gray-200)' }}>
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={e => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
              />
              Is Featured
            </label>
          </div>

          <input
            placeholder="Stock (optional)"
            value={form.stock}
            onChange={e => setForm(prev => ({ ...prev, stock: e.target.value }))}
            style={{ padding: 12, borderRadius: 14, border: '1px solid var(--gray-200)' }}
          />

          <button
            type="submit"
            style={{ background: 'var(--teal)', color: '#fff', padding: '12px 14px', borderRadius: 12, fontWeight: 900 }}
          >
            Add Product
          </button>

          <div style={{ color: 'var(--gray-600)', fontSize: '0.92rem' }}>
            Note: backend supports image URLs, not file uploads (no multer endpoint for products).
          </div>
        </form>
      </div>

      <div style={{ marginTop: 14 }}>
        {products.map(p => (
          <div key={p._id} style={{ padding: 12, background: '#fff', marginBottom: 10, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, color: 'var(--teal-dark)' }}>{p.name}</div>
              <div style={{ color: 'var(--gray-600)', fontWeight: 700, marginTop: 4, fontSize: '0.9rem' }}>
                {p.category} • {p.quantity}
                {p.isCombo ? ' • Combo' : ''}
              </div>
              <div style={{ marginTop: 6, fontWeight: 900 }}>{formatPrice(p.price)}</div>
              {p.originalPrice && p.discount ? (
                <div style={{ marginTop: 2, color: 'var(--green)', fontWeight: 800, fontSize: '0.9rem' }}>
                  Save {formatPrice(p.originalPrice - p.price)} ({p.discount}% OFF)
                </div>
              ) : null}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => handleEdit(p)} style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid var(--gray-200)', background: 'var(--cream)', fontWeight: 900 }}>Edit</button>
              <button onClick={() => handleDelete(p._id)} style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid var(--red)', background: 'transparent', color: 'var(--red)', fontWeight: 900 }}>Delete</button>
            </div>
          </div>
        ))}
        {products.length === 0 && <div style={{ color: 'var(--gray-600)' }}>No products</div>}
      </div>
    </div>
  );
}
