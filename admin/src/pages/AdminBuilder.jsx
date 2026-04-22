import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaArrowsAlt, FaEye, FaColumns } from 'react-icons/fa';
import { API_BASE_URL } from '../../utils/constants';
import toast from 'react-hot-toast';
import { useAdmin } from '../../context/AdminContext';

// Section types
const SECTION_TYPES = {
  BANNER: 'banner',
  PRODUCT_LIST: 'product_list',
  SINGLE_PRODUCT: 'single_product',
  OFFER: 'offer',
};

const AdminBuilder = () => {
  const { isAdminMode, toggleAdminMode } = useAdmin();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Undo/Redo History
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const MAX_HISTORY = 50;
  
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      setShowRightPanel(true);
    } else {
      setShowRightPanel(false);
    }
  }, [selectedSection]);

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem('niraa_token');
      const response = await fetch(`${API_BASE_URL}/admin/sections`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSection = (type) => {
    const newSection = {
      id: Date.now().toString(),
      type,
      title: type === SECTION_TYPES.BANNER ? 'New Banner' : type === SECTION_TYPES.PRODUCT_LIST ? 'New Product List' : 'New Offer',
      order: sections.length,
      data: {},
    };

    setSections(prev => [...prev, newSection]);
    setSelectedSection(newSection);
  };

  const deleteSection = (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      setSections(prev => prev.filter(s => s.id !== sectionId));
      setSelectedSection(null);
    }
  };

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
  };

  const handleItemSelect = (item) => {
    setEditingItem(item);
  };

  const handleDragStart = (e, section) => {
    e.dataTransfer.setData('section', JSON.stringify(section));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedSection = JSON.parse(e.dataTransfer.getData('section'));
    const draggedSection = sections.find(s => s.id === droppedSection.id);
    const currentIndex = sections.indexOf(draggedSection);
    const targetIndex = Array.from(canvasRef.current.children).indexOf(e.target.closest('.section'));

    if (targetIndex >= 0 && currentIndex >= 0) {
      const newSections = [...sections];
      const [removed] = newSections.splice(currentIndex, 1);
      newSections.splice(targetIndex, 0, removed);
      setSections(newSections);
    }
  };

  const saveSections = async () => {
    try {
      const token = localStorage.getItem('niraa_token');
      const response = await fetch(`${API_BASE_URL}/admin/sections`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sections }),
      });

      if (response.ok) {
        toast.success('Sections saved successfully!');
      } else {
        toast.error('Failed to save sections');
      }
    } catch (error) {
      toast.error('Error saving sections');
      console.error(error);
    }
  };

  const renderSection = (section) => {
    switch (section.type) {
      case SECTION_TYPES.BANNER:
        return (
          <div
            key={section.id}
            className="section banner-section"
            style={styles.section}
            onClick={() => handleSectionSelect(section)}
          >
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>{section.title}</h3>
              <div style={styles.sectionActions}>
                <button onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }} style={styles.deleteButton}>
                  <FaTrash />
                </button>
              </div>
            </div>
            <div style={styles.bannerPlaceholder}>
              <div style={styles.bannerImagePlaceholder}>Banner Image</div>
              <div style={styles.bannerTextPlaceholder}>Banner Text</div>
            </div>
          </div>
        );
      case SECTION_TYPES.PRODUCT_LIST:
        return (
          <div
            key={section.id}
            className="section product-list-section"
            style={styles.section}
            onClick={() => handleSectionSelect(section)}
          >
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>{section.title}</h3>
              <div style={styles.sectionActions}>
                <button onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }} style={styles.deleteButton}>
                  <FaTrash />
                </button>
              </div>
            </div>
            <div style={styles.productGrid}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={styles.productCardPlaceholder}>
                  <div style={styles.productImagePlaceholder}>Product Image</div>
                  <div style={styles.productNamePlaceholder}>Product Name</div>
                  <div style={styles.productPricePlaceholder}>₹0.00</div>
                </div>
              ))}
            </div>
          </div>
        );
      case SECTION_TYPES.SINGLE_PRODUCT:
        return (
          <div
            key={section.id}
            className="section single-product-section"
            style={styles.section}
            onClick={() => handleSectionSelect(section)}
          >
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>{section.title}</h3>
              <div style={styles.sectionActions}>
                <button onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }} style={styles.deleteButton}>
                  <FaTrash />
                </button>
              </div>
            </div>
            <div style={styles.singleProduct}>
              <div style={styles.singleProductImagePlaceholder}>Product Image</div>
              <div style={styles.singleProductDetails}>
                <div style={styles.productNamePlaceholder}>Product Name</div>
                <div style={styles.productDescriptionPlaceholder}>Product Description</div>
                <div style={styles.productPricePlaceholder}>₹0.00</div>
              </div>
            </div>
          </div>
        );
      case SECTION_TYPES.OFFER:
        return (
          <div
            key={section.id}
            className="section offer-section"
            style={styles.section}
            onClick={() => handleSectionSelect(section)}
          >
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>{section.title}</h3>
              <div style={styles.sectionActions}>
                <button onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }} style={styles.deleteButton}>
                  <FaTrash />
                </button>
              </div>
            </div>
            <div style={styles.offerPlaceholder}>
              <div style={styles.offerTextPlaceholder}>Special Offer Text</div>
              <div style={styles.offerButtonPlaceholder}>View Deal</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPropertiesPanel = () => {
    if (!selectedSection) return null;

    return (
      <div style={styles.propertiesPanel}>
        <div style={styles.propertiesHeader}>
          <h3 style={styles.propertiesTitle}>Section Properties</h3>
          <button onClick={() => setSelectedSection(null)} style={styles.closePropertiesButton}>
            <FaTimes />
          </button>
        </div>

        <div style={styles.propertiesContent}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Section Type</label>
            <select
              value={selectedSection.type}
              onChange={(e) => {
                const updatedSections = sections.map(s =>
                  s.id === selectedSection.id ? { ...s, type: e.target.value } : s
                );
                setSections(updatedSections);
                // Get the actual updated object from sections array, not create new object
                const updatedSection = updatedSections.find(s => s.id === selectedSection.id);
                setSelectedSection(updatedSection);
              }}
              style={styles.input}
            >
              <option value={SECTION_TYPES.BANNER}>Banner</option>
              <option value={SECTION_TYPES.PRODUCT_LIST}>Product List</option>
              <option value={SECTION_TYPES.SINGLE_PRODUCT}>Single Product</option>
              <option value={SECTION_TYPES.OFFER}>Offer</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Section Title</label>
            <input
              type="text"
              value={selectedSection.title}
              onChange={(e) => {
                const updatedSections = sections.map(s =>
                  s.id === selectedSection.id ? { ...s, title: e.target.value } : s
                );
                setSections(updatedSections);
                // Get the actual updated object from sections array, not create new object
                const updatedSection = updatedSections.find(s => s.id === selectedSection.id);
                setSelectedSection(updatedSection);
              }}
              style={styles.input}
              placeholder="Enter section title"
            />
          </div>

          {selectedSection.type === SECTION_TYPES.PRODUCT_LIST && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Products</label>
              <div style={styles.productsList}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={styles.productItem}>
                    <div style={styles.productItemImage}>Product {i}</div>
                    <div style={styles.productItemActions}>
                      <button style={styles.productEditButton}>Edit</button>
                      <button style={styles.productDeleteButton}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
              <button style={styles.addProductButton}>
                + Add Product
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Left Panel */}
      <div style={{ ...styles.leftPanel, display: showLeftPanel ? 'block' : 'none' }}>
        <div style={styles.leftPanelHeader}>
          <h3 style={styles.leftPanelTitle}>Add Section</h3>
          <button onClick={() => setShowLeftPanel(!showLeftPanel)} style={styles.toggleLeftPanelButton}>
            <FaTimes />
          </button>
        </div>
        <div style={styles.sectionTypes}>
          <button onClick={() => addSection(SECTION_TYPES.BANNER)} style={styles.sectionTypeButton}>
            <div style={styles.sectionTypeIcon}>🎞️</div>
            <div>Banner</div>
          </button>
          <button onClick={() => addSection(SECTION_TYPES.PRODUCT_LIST)} style={styles.sectionTypeButton}>
            <div style={styles.sectionTypeIcon}>🛍️</div>
            <div>Product List</div>
          </button>
          <button onClick={() => addSection(SECTION_TYPES.SINGLE_PRODUCT)} style={styles.sectionTypeButton}>
            <div style={styles.sectionTypeIcon}>⭐</div>
            <div>Single Product</div>
          </button>
          <button onClick={() => addSection(SECTION_TYPES.OFFER)} style={styles.sectionTypeButton}>
            <div style={styles.sectionTypeIcon}>🎁</div>
            <div>Offer</div>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={styles.canvasContainer}>
        <div style={styles.canvasHeader}>
          <div style={styles.canvasTitle}>Website Builder</div>
          <div style={styles.canvasActions}>
            <button onClick={toggleAdminMode} style={styles.customerViewButton}>
              <FaEye /> Customer View
            </button>
            <button onClick={saveSections} style={styles.saveButton}>
              <FaSave /> Save Sections
            </button>
            <button onClick={() => setShowLeftPanel(!showLeftPanel)} style={styles.openLeftPanelButton}>
              <FaColumns />
            </button>
          </div>
        </div>

        <div
          ref={canvasRef}
          style={styles.canvas}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {sections.map(renderSection)}
        </div>
      </div>

      {/* Right Panel */}
      {renderPropertiesPanel()}

      {/* Mobile controls */}
      <div style={{ ...styles.mobileControls, display: window.innerWidth > 768 ? 'none' : 'flex' }}>
        <button onClick={() => setShowLeftPanel(!showLeftPanel)} style={styles.mobileButton}>
          <FaColumns />
        </button>
        <button onClick={saveSections} style={styles.mobileButton}>
          <FaSave />
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    background: '#f8f9fa',
  },
  leftPanel: {
    width: 250,
    background: '#2d9a8e',
    color: '#fff',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  leftPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  leftPanelTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 700,
  },
  toggleLeftPanelButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1.2rem',
  },
  sectionTypes: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  sectionTypeButton: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'background 0.2s',
    textDecoration: 'none',
  },
  sectionTypeIcon: {
    fontSize: '1.5rem',
  },
  canvasContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  canvasHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 30px',
    borderBottom: '1px solid #e5e7eb',
    background: '#fff',
  },
  canvasTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--gray-800)',
  },
  canvasActions: {
    display: 'flex',
    gap: 10,
  },
  customerViewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#c8a84b',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 8,
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--teal)',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 8,
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  openLeftPanelButton: {
    background: 'var(--gray-200)',
    color: 'var(--gray-700)',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  canvas: {
    flex: 1,
    padding: '30px',
    overflowY: 'auto',
  },
  section: {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    cursor: 'move',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--gray-800)',
  },
  sectionActions: {
    display: 'flex',
    gap: 8,
  },
  deleteButton: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  bannerPlaceholder: {
    background: '#f8f9fa',
    border: '2px dashed #e5e7eb',
    borderRadius: 12,
    padding: 40,
    textAlign: 'center',
    color: '#9ca3af',
  },
  bannerImagePlaceholder: {
    fontSize: '1.2rem',
    fontWeight: 700,
    marginBottom: 8,
  },
  bannerTextPlaceholder: {
    fontSize: '0.9rem',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
  },
  productCardPlaceholder: {
    background: '#f8f9fa',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
  },
  productImagePlaceholder: {
    height: 120,
    background: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
  },
  productNamePlaceholder: {
    fontWeight: 700,
    color: 'var(--gray-800)',
    marginBottom: 8,
  },
  productPricePlaceholder: {
    color: 'var(--teal)',
    fontWeight: 800,
    fontSize: '1.1rem',
  },
  singleProduct: {
    display: 'flex',
    gap: 24,
  },
  singleProductImagePlaceholder: {
    width: 200,
    height: 200,
    background: '#f8f9fa',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    flexShrink: 0,
  },
  singleProductDetails: {
    flex: 1,
  },
  productDescriptionPlaceholder: {
    color: 'var(--gray-600)',
    marginBottom: 16,
  },
  offerPlaceholder: {
    background: 'linear-gradient(135deg, #c8a84b 0%, #b8943b 100%)',
    color: '#fff',
    padding: 24,
    borderRadius: 12,
    textAlign: 'center',
  },
  offerTextPlaceholder: {
    fontSize: '1.2rem',
    fontWeight: 700,
    marginBottom: 16,
  },
  offerButtonPlaceholder: {
    background: '#fff',
    color: '#c8a84b',
    padding: '10px 20px',
    borderRadius: 20,
    fontWeight: 700,
    display: 'inline-block',
  },
  propertiesPanel: {
    width: 300,
    background: '#fff',
    borderLeft: '1px solid #e5e7eb',
    padding: 24,
  },
  propertiesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  propertiesTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--gray-800)',
  },
  closePropertiesButton: {
    background: 'none',
    border: 'none',
    color: 'var(--gray-400)',
    cursor: 'pointer',
    fontSize: '1.2rem',
  },
  propertiesContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--gray-700)',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid var(--gray-300)',
    borderRadius: 8,
    fontSize: '0.9rem',
  },
  productsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  productItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#f8f9fa',
    borderRadius: 8,
    border: '1px solid var(--gray-200)',
  },
  productItemImage: {
    background: '#e5e7eb',
    width: 40,
    height: 40,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
  },
  productItemActions: {
    display: 'flex',
    gap: 8,
  },
  productEditButton: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  productDeleteButton: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  addProductButton: {
    background: 'var(--teal)',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  mobileControls: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    display: 'flex',
    gap: 10,
    zIndex: 1000,
  },
  mobileButton: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: 'var(--teal)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
};

export default AdminBuilder;