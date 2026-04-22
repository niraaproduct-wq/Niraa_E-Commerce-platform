import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const EnhancedProductCard = ({ product, onEdit, onDelete, compact = false }) => {
  const { isAdminMode, isEditing, editingItem } = useAdmin();
  const [isHovered, setIsHovered] = useState(false);

  const isCurrentlyEditing = isEditing && editingItem?._id === product._id;

  // Handle click for admin mode
  const handleCardClick = (e) => {
    if (isAdminMode && !isEditing) {
      e.preventDefault();
      onEdit(product);
    }
  };

  // Handle delete
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this product?')) {
      onDelete(product._id);
    }
  };

  // Handle save
  const handleSave = (e) => {
    e.stopPropagation();
    // Save logic would go here
    console.log('Saving product:', product);
  };

  // Handle cancel
  const handleCancel = (e) => {
    e.stopPropagation();
    onEdit(null); // Cancel editing
  };

  return (
    <div
      style={{
        position: 'relative',
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        border: isCurrentlyEditing ? '2px solid var(--teal)' : '1px solid rgba(42,125,114,0.1)',
        cursor: isAdminMode && !isEditing ? 'pointer' : 'default',
        minHeight: compact ? 200 : 280,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Admin Mode Overlay */}
      {isAdminMode && !isEditing && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(42,125,114,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: 'var(--teal)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            <FaEdit size={12} /> Edit Product
          </div>
        </div>
      )}

      {/* Editing Controls */}
      {isCurrentlyEditing && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            gap: 6,
            zIndex: 20,
          }}
        >
          <button
            onClick={handleSave}
            style={{
              background: '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: 20,
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <FaSave size={10} /> Save
          </button>
          <button
            onClick={handleCancel}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 20,
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <FaTimes size={10} /> Cancel
          </button>
          <button
            onClick={handleDelete}
            style={{
              background: '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: 20,
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <FaTrash size={10} /> Delete
          </button>
        </div>
      )}

      {/* Product Image */}
      <div style={{ position: 'relative', height: compact ? 120 : 160, background: '#f8fafc' }}>
        <img
          src={product.image || '/placeholder-image.jpg'}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />
        
        {/* Price Tag */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 12,
            fontSize: '0.75rem',
            fontWeight: 800,
          }}
        >
          {product.price ? `₹${product.price}` : 'Price on request'}
        </div>
      </div>

      {/* Product Content */}
      <div style={{ padding: compact ? '12px' : '16px' }}>
        {/* Product Name */}
        {isCurrentlyEditing ? (
          <input
            type="text"
            defaultValue={product.name}
            style={{
              width: '100%',
              border: '2px solid var(--teal)',
              borderRadius: 8,
              padding: '8px',
              fontSize: compact ? '0.9rem' : '1rem',
              fontWeight: 800,
              marginBottom: '8px',
            }}
          />
        ) : (
          <h3
            style={{
              margin: 0,
              fontSize: compact ? '0.9rem' : '1rem',
              fontWeight: 800,
              color: 'var(--gray-800)',
              lineHeight: 1.3,
              minHeight: compact ? '2.4rem' : '2.8rem',
            }}
          >
            {product.name}
          </h3>
        )}

        {/* Product Description */}
        {isCurrentlyEditing ? (
          <textarea
            defaultValue={product.description}
            style={{
              width: '100%',
              border: '1px solid var(--gray-300)',
              borderRadius: 6,
              padding: '8px',
              fontSize: '0.8rem',
              minHeight: '40px',
              marginBottom: '8px',
            }}
          />
        ) : (
          <p
            style={{
              margin: '6px 0 0',
              fontSize: '0.75rem',
              color: 'var(--gray-600)',
              lineHeight: 1.4,
              minHeight: '2.8rem',
            }}
          >
            {product.description}
          </p>
        )}

        {/* Category Badge */}
        <div
          style={{
            display: 'inline-block',
            background: 'var(--teal-light)',
            color: 'var(--teal-dark)',
            padding: '4px 8px',
            borderRadius: 999,
            fontSize: '0.65rem',
            fontWeight: 800,
            marginTop: '8px',
          }}
        >
          {product.category}
        </div>

        {/* Stock Status */}
        {product.stock !== undefined && (
          <div
            style={{
              marginTop: '6px',
              fontSize: '0.7rem',
              color: product.stock > 10 ? '#16a34a' : '#ef4444',
              fontWeight: 700,
            }}
          >
            {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
          </div>
        )}
      </div>

      {/* Hover Effect Border */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '2px solid var(--teal)',
            borderRadius: 16,
            pointerEvents: 'none',
            opacity: 0.3,
          }}
        />
      )}
    </div>
  );
};

export default EnhancedProductCard;