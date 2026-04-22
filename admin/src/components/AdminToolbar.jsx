import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { FaEdit, FaEye, FaPlus, FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminToolbar = () => {
  const {
    isAdminMode,
    isEditing,
    editingItem,
    isAdmin,
    toggleAdminMode,
    stopEditing,
    saveChanges,
    addItem,
  } = useAdmin();

  if (!isAdmin) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: isAdminMode
          ? 'linear-gradient(135deg, #0b231f 0%, #1a4f47 100%)'
          : 'linear-gradient(135deg, #c8a84b 0%, #b8943b 100%)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: 50,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        zIndex: 9999,
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255,255,255,0.2)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Admin Mode Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: isAdminMode ? '#4ade80' : '#fbbf24',
            animation: 'pulse 2s infinite',
          }}
        />
        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
          {isAdminMode ? 'ADMIN MODE' : 'VIEW MODE'}
        </span>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleAdminMode}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: 20,
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.3)')}
        onMouseLeave={(e) => (e.target.style.background = 'rgba(255,255,255,0.2)')}
      >
        {isAdminMode ? (
          <>
            <FaEye size={14} /> Exit Admin
          </>
        ) : (
          <>
            <FaEdit size={14} /> Edit Site
          </>
        )}
      </button>

      {/* Editing Controls */}
      {isAdminMode && isEditing && (
        <>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.3)' }} />
          
          <button
            onClick={stopEditing}
            style={{
              background: '#ef4444',
              border: 'none',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 20,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FaTimes size={14} /> Cancel
          </button>

           <button
             onClick={async () => {
               if (editingItem) {
                 const success = await saveChanges(editingItem);
                 if (success) {
                   toast.success('Changes saved successfully!');
                 } else {
                   toast.error('Failed to save changes');
                 }
               }
             }}
             style={{
               background: '#22c55e',
               border: 'none',
               color: '#fff',
               padding: '8px 16px',
               borderRadius: 20,
               cursor: 'pointer',
               fontWeight: 700,
               fontSize: '0.8rem',
               display: 'flex',
               alignItems: 'center',
               gap: 6,
             }}
           >
             <FaSave size={14} /> Save Changes
           </button>
        </>
      )}

      {/* Add New Button */}
      {isAdminMode && !isEditing && (
        <>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.3)' }} />
          
           <button
             onClick={() => {
               // Navigate to admin builder / add section
               window.location.href = '/builder';
             }}
             style={{
               background: 'rgba(255,255,255,0.2)',
               border: 'none',
               color: '#fff',
               padding: '8px 16px',
               borderRadius: 20,
               cursor: 'pointer',
               fontWeight: 700,
               fontSize: '0.8rem',
               display: 'flex',
               alignItems: 'center',
               gap: 6,
             }}
           >
             <FaPlus size={14} /> Add New
           </button>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default AdminToolbar;