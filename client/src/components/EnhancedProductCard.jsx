import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const EnhancedProductCard = ({ product, onEdit, onDelete, compact = false }) => {
  const { isAdminMode, isEditing, editingItem } = useAdmin();
  const [isHovered, setIsHovered] = useState(false);

  const isCurrentlyEditing = isEditing && editingItem?._id === product._id;

  const productLink = (product.productType === 'combo' || product.isCombo)
    ? `/combos/${product.slug}`
    : `/products/${product.slug}`;

  const handleCardClick = (e) => {
    if (isAdminMode && !isEditing) { e.preventDefault(); onEdit(product); }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Delete this product?')) onDelete(product._id);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    console.log('Saving product:', product);
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    onEdit(null);
  };

  const cardContent = (
    <>
      <style>{`
        @keyframes epcIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes epcOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes epcEditBadge {
          from { transform: scale(0.7) translateY(6px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes epcImgHover {
          to { transform: scale(1.06); }
        }
        .epc-ctrl-btn {
          border: none; border-radius: 20px;
          padding: 6px 12px; font-size: 0.75rem; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; gap: 4px;
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1),
                      filter 0.15s ease, box-shadow 0.2s ease;
        }
        .epc-ctrl-btn:hover { transform: translateY(-2px) scale(1.05); filter: brightness(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .epc-ctrl-btn:active { transform: scale(0.95); }
      `}</style>

      <div
        style={{
          position: 'relative', background: '#fff', borderRadius: 16,
          overflow: 'hidden',
          boxShadow: isHovered
            ? '0 12px 32px rgba(0,0,0,0.16)'
            : '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s ease',
          transform: isHovered && !isAdminMode ? 'translateY(-6px)' : 'translateY(0)',
          border: isCurrentlyEditing
            ? '2px solid var(--teal)'
            : '1px solid rgba(42,125,114,0.1)',
          cursor: (isAdminMode && !isEditing) || !isAdminMode ? 'pointer' : 'default',
          minHeight: compact ? 200 : 280,
          height: '100%',
          animation: 'epcIn 0.3s ease',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Admin overlay */}
        {isAdminMode && !isEditing && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(42,125,114,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
            zIndex: 10,
            backdropFilter: isHovered ? 'blur(1px)' : 'none',
          }}>
            <div style={{
              background: 'var(--teal)', color: '#fff',
              padding: '8px 18px', borderRadius: 20,
              fontSize: '0.8rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
              animation: isHovered ? 'epcEditBadge 0.25s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
            }}>
              <FaEdit size={12} /> Edit Product
            </div>
          </div>
        )}

        {/* Editing controls */}
        {isCurrentlyEditing && (
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6, zIndex: 20 }}>
            <button onClick={handleSave} className="epc-ctrl-btn" style={{ background: '#22c55e', color: '#fff' }}>
              <FaSave size={10} /> Save
            </button>
            <button onClick={handleCancel} className="epc-ctrl-btn" style={{ background: '#ef4444', color: '#fff' }}>
              <FaTimes size={10} /> Cancel
            </button>
            <button onClick={handleDelete} className="epc-ctrl-btn" style={{ background: '#6b7280', color: '#fff' }}>
              <FaTrash size={10} /> Delete
            </button>
          </div>
        )}

        {/* Image */}
        <div style={{ position: 'relative', height: compact ? 120 : 160, background: '#f8fafc', overflow: 'hidden' }}>
          <img
            src={product.image || product.images?.[0] || '/placeholder-image.jpg'}
            alt={product.name}
            style={{
              width: '100%', height: '100%', objectFit: 'contain',
              transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              transform: isHovered ? 'scale(1.07)' : 'scale(1)',
            }}
          />
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            background: 'rgba(0,0,0,0.75)',
            color: '#fff', padding: '4px 8px', borderRadius: 12,
            fontSize: '0.75rem', fontWeight: 800,
            backdropFilter: 'blur(4px)',
          }}>
            {product.price ? `₹${product.price}` : 'Price on request'}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: compact ? '12px' : '16px' }}>
          {isCurrentlyEditing ? (
            <input type="text" defaultValue={product.name} style={{
              width: '100%', border: '2px solid var(--teal)', borderRadius: 8,
              padding: '8px', fontSize: compact ? '0.9rem' : '1rem',
              fontWeight: 800, marginBottom: '8px',
              transition: 'box-shadow 0.2s ease',
              outline: 'none',
            }}
              onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(42,125,114,0.2)'}
              onBlur={e => e.target.style.boxShadow = 'none'}
            />
          ) : (
            <h3 style={{
              margin: 0, fontSize: compact ? '0.9rem' : '1rem',
              fontWeight: 800, color: 'var(--gray-800)',
              lineHeight: 1.3, minHeight: compact ? '2.4rem' : '2.8rem',
              transition: 'color 0.2s ease',
            }}>
              {product.name}
            </h3>
          )}

          {isCurrentlyEditing ? (
            <textarea defaultValue={product.description} style={{
              width: '100%', border: '1px solid var(--gray-300)',
              borderRadius: 6, padding: '8px', fontSize: '0.8rem',
              minHeight: '40px', marginBottom: '8px', resize: 'vertical',
              transition: 'border-color 0.2s ease',
            }}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = 'var(--gray-300)'}
            />
          ) : (
            <p style={{
              margin: '6px 0 0', fontSize: '0.75rem',
              color: 'var(--gray-600)', lineHeight: 1.4, minHeight: '2.8rem',
            }}>
              {product.description}
            </p>
          )}

          <div style={{
            display: 'inline-block', background: 'var(--teal-light)',
            color: 'var(--teal-dark)', padding: '4px 8px', borderRadius: 999,
            fontSize: '0.65rem', fontWeight: 800, marginTop: '8px',
            transition: 'transform 0.2s ease, background 0.2s ease',
          }}>
            {product.category}
          </div>

          {product.stock !== undefined && (
            <div style={{
              marginTop: '6px', fontSize: '0.7rem', fontWeight: 700,
              color: product.stock > 10 ? '#16a34a' : '#ef4444',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: product.stock > 10 ? '#16a34a' : '#ef4444',
                display: 'inline-block',
                animation: product.stock > 0 ? 'pulse 2s infinite' : 'none',
              }} />
              {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
            </div>
          )}
        </div>

        {/* Hover border shimmer */}
        <div style={{
          position: 'absolute', inset: 0,
          border: '2px solid var(--teal)',
          borderRadius: 16, pointerEvents: 'none',
          opacity: isHovered ? 0.25 : 0,
          transition: 'opacity 0.3s ease',
        }} />
      </div>
    </>
  );

  return isAdminMode ? cardContent : (
    <Link to={productLink} style={{ textDecoration: 'none', color: 'inherit' }}>
      {cardContent}
    </Link>
  );
};

export default EnhancedProductCard;