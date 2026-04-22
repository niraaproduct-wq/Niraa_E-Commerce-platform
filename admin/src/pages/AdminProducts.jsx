import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSearch } from 'react-icons/fa';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const user = JSON.parse(localStorage.getItem('niraa_user') || 'null');
  const isAdmin = user?.role === 'admin';
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    category: '',
    stock: '',
    images: [],
    isActive: true,
    isFeatured: false,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const token = localStorage.getItem('niraa_token');
      const response = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          images: [data.url]
        }));
        toast.success('Image uploaded successfully to Cloudinary!');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      toast.error('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    fetchProducts();
  }, [isAdmin]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('niraa_token');
      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setReadOnlyMode(false);
      } else {
        const fallback = await fetch(`${API_BASE_URL}/products`);
        const fallbackData = await fallback.json();
        setProducts(fallbackData.products || []);
        setReadOnlyMode(true);
        toast('Database offline: products are in read-only mode', { icon: 'ℹ️' });
      }
    } catch (error) {
      try {
        const fallback = await fetch(`${API_BASE_URL}/products`);
        const fallbackData = await fallback.json();
        setProducts(fallbackData.products || []);
        setReadOnlyMode(true);
      } catch {
        console.error('Error fetching products:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnlyMode) {
      toast.error('Product editing is disabled while database is offline');
      return;
    }
    try {
      const token = localStorage.getItem('niraa_token');
      const url = editingProduct
        ? `${API_BASE_URL}/admin/products/${editingProduct._id}`
        : `${API_BASE_URL}/admin/products`;

      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        fetchProducts();
        resetForm();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to save product');
      }
    } catch (error) {
      toast.error('Error saving product');
      console.error(error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      comparePrice: product.comparePrice || '',
      category: product.category || '',
      stock: product.stock || '',
      images: product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []),
      isActive: product.isActive !== false,
      isFeatured: product.isFeatured || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    if (readOnlyMode) {
      toast.error('Product deletion is disabled while database is offline');
      return;
    }

    try {
      const token = localStorage.getItem('niraa_token');
      const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Product deleted successfully!');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      toast.error('Error deleting product');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      category: '',
      stock: '',
      images: [],
      isActive: true,
      isFeatured: false,
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {!isAdmin && (
        <div style={{ marginBottom: 12, color: '#9f1239', background: '#fff1f2', border: '1px solid #fecdd3', padding: 10, borderRadius: 10, fontWeight: 700 }}>
          Admin access required. Please login with an admin account.
        </div>
      )}
      <div style={styles.header}>
        <h1 style={styles.title}>Product Management</h1>
        <button
          onClick={() => setShowForm(true)}
          style={styles.addButton}
          disabled={readOnlyMode}
        >
          <FaPlus /> Add New Product
        </button>
      </div>

      {readOnlyMode && (
        <div style={{ marginBottom: 12, color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', padding: 10, borderRadius: 10, fontWeight: 700 }}>
          Product management is in read-only mode because database write APIs are currently unavailable.
        </div>
      )}

      {showForm && (
        <div style={styles.formOverlay}>
          <div style={styles.formContainer}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={resetForm} style={styles.closeButton}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                    placeholder="Enter product name"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="floor-cleaner">Floor Cleaner</option>
                    <option value="toilet-cleaner">Toilet Cleaner</option>
                    <option value="dish-wash">Dish Wash</option>
                    <option value="detergent">Detergent</option>
                    <option value="combo">Combo</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Compare Price</label>
                  <input
                    type="number"
                    name="comparePrice"
                    value={formData.comparePrice}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Image URL / Upload</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="url"
                      name="images"
                      value={formData.images[0] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        images: [e.target.value]
                      }))}
                      style={{ ...styles.input, flex: 1 }}
                      placeholder="https://res.cloudinary... or /assets/..."
                    />
                    <label style={{
                      background: 'var(--teal)', color: '#fff', padding: '10px 16px',
                      borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                      opacity: uploadingImage ? 0.7 : 1, whiteSpace: 'nowrap'
                    }}>
                      {uploadingImage ? 'Uploading...' : 'Upload File'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  {formData.images && formData.images[0] && (
                    <img src={formData.images[0]} alt="Current Preview" style={{ width: 50, height: 50, objectFit: 'cover', marginTop: 8, borderRadius: 4 }} />
                  )}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  rows="4"
                  placeholder="Enter product description"
                />
              </div>

              <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    style={styles.checkbox}
                  />
                  Active (Show on website)
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    style={styles.checkbox}
                  />
                  Featured Product
                </label>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={resetForm} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  <FaSave /> {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={styles.searchBar}>
        <FaSearch style={styles.searchIcon} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          style={styles.searchInput}
        />
      </div>

      {loading ? (
        <div style={styles.loading}>Loading products...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product._id}>
                  <td style={styles.td}>
                    <img
                      src={product.images?.[0] || '/placeholder.jpg'}
                      alt={product.name}
                      style={styles.productImage}
                    />
                  </td>
                  <td style={styles.td}>{product.name}</td>
                  <td style={styles.td}>{product.category}</td>
                  <td style={styles.td}>₹{product.price}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.stockBadge,
                      background: product.stock > 10 ? '#16a34a' : product.stock > 0 ? '#f59e0b' : '#ef4444',
                    }}>
                      {product.stock}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      background: product.isActive ? '#16a34a' : '#ef4444',
                    }}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => handleEdit(product)}
                        style={styles.editButton}
                        title="Edit"
                        disabled={readOnlyMode}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        style={styles.deleteButton}
                        title="Delete"
                        disabled={readOnlyMode}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--gray-800)',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--teal)',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  formOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  formContainer: {
    background: '#fff',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: '24px',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  formTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--gray-800)',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: 'var(--gray-500)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--gray-700)',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid var(--gray-300)',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid var(--gray-300)',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  checkboxGroup: {
    display: 'flex',
    gap: '20px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: 'var(--gray-700)',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '20px',
  },
  cancelButton: {
    padding: '10px 20px',
    background: 'var(--gray-200)',
    color: 'var(--gray-700)',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'var(--teal)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  searchBar: {
    position: 'relative',
    marginBottom: '20px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--gray-400)',
  },
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '1px solid var(--gray-300)',
    borderRadius: '8px',
    fontSize: '0.9rem',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--gray-500)',
  },
  tableContainer: {
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '14px 16px',
    background: 'var(--gray-100)',
    fontWeight: '700',
    fontSize: '0.85rem',
    color: 'var(--gray-700)',
    borderBottom: '1px solid var(--gray-200)',
  },
  td: {
    padding: '14px 16px',
    borderBottom: '1px solid var(--gray-100)',
    fontSize: '0.9rem',
  },
  productImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  stockBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#fff',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#fff',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    padding: '6px 10px',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  deleteButton: {
    padding: '6px 10px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
};

export default AdminProducts;