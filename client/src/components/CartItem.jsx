import React, { useState } from 'react';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice, placeholderImage } from '../utils/constants.js';

export default function CartItem({ item }) {
  const { updateQty, removeFromCart } = useCart();
  const [removing, setRemoving] = useState(false);
  const [qtyDir, setQtyDir] = useState(null); // 'up' | 'down'

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => removeFromCart(item.uid), 320);
  };

  const handleQty = (next) => {
    setQtyDir(next > item.qty ? 'up' : 'down');
    setTimeout(() => setQtyDir(null), 250);
    if (next < 1) { handleRemove(); return; }
    updateQty(item.uid, next);
  };

  return (
    <>
      <style>{`
        @keyframes ciSlideOut {
          to { opacity: 0; transform: translateX(40px) scaleY(0.8); max-height: 0; padding: 0; margin: 0; }
        }
        @keyframes ciQtyUp   { 0% { transform: translateY(8px);  opacity:0; } 100% { transform: translateY(0); opacity:1; } }
        @keyframes ciQtyDown { 0% { transform: translateY(-8px); opacity:0; } 100% { transform: translateY(0); opacity:1; } }
        .ci-qty-ctrl {
          width: 30px; height: 30px; border-radius: 50%;
          border: none; display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1),
                      background 0.2s ease, box-shadow 0.2s ease;
        }
        .ci-qty-ctrl:hover { transform: scale(1.15); box-shadow: 0 4px 10px rgba(0,0,0,0.12); }
        .ci-qty-ctrl:active { transform: scale(0.92); }
        .ci-remove {
          background: none; border: none; color: var(--red);
          cursor: pointer; padding: 6px; border-radius: 6px;
          transition: transform 0.2s ease, background 0.2s ease;
          display: flex;
        }
        .ci-remove:hover { transform: scale(1.2) rotate(8deg); background: rgba(220,38,38,0.08); }
        .ci-remove:active { transform: scale(0.9); }
        .ci-img {
          transition: transform 0.3s ease;
        }
        .ci-row:hover .ci-img { transform: scale(1.04); }
      `}</style>

      <div
        className="ci-row"
        style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '16px 0', borderBottom: '1px solid var(--gray-200)',
          transition: 'opacity 0.32s ease, transform 0.32s ease, max-height 0.32s ease',
          animation: removing ? 'ciSlideOut 0.32s ease forwards' : 'none',
          overflow: 'hidden',
        }}
      >
        {/* Image */}
        <img
          src={item.image || placeholderImage(item.name)}
          alt={item.name}
          className="ci-img"
          style={{
            width: 70, height: 70, objectFit: 'contain',
            borderRadius: 10, background: 'var(--cream)',
            padding: 6, flexShrink: 0,
          }}
          onError={e => { e.target.src = placeholderImage(item.name); }}
        />

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: 2 }}>
            {item.name}
          </h4>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
            {item.variantDesc || item.quantity}
          </div>
          <div style={{ fontWeight: 700, color: 'var(--teal-dark)', marginTop: 4 }}>
            {formatPrice(item.price)}
          </div>
        </div>

        {/* Qty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="ci-qty-ctrl"
            style={{ background: 'var(--gray-100)' }}
            onClick={() => handleQty(item.qty - 1)}
          >
            <FiMinus size={13} />
          </button>

          <span style={{
            fontWeight: 700, minWidth: 20, textAlign: 'center',
            display: 'inline-block', overflow: 'hidden',
            animation: qtyDir === 'up' ? 'ciQtyUp 0.2s ease' : qtyDir === 'down' ? 'ciQtyDown 0.2s ease' : 'none',
          }}>
            {item.qty}
          </span>

          <button
            className="ci-qty-ctrl"
            style={{ background: 'var(--teal)', color: '#fff' }}
            onClick={() => handleQty(item.qty + 1)}
          >
            <FiPlus size={13} />
          </button>
        </div>

        {/* Total + Remove */}
        <div style={{ textAlign: 'right', minWidth: 70 }}>
          <div style={{ fontWeight: 700, color: 'var(--gray-800)', marginBottom: 6 }}>
            {formatPrice(item.price * item.qty)}
          </div>
          <button className="ci-remove" onClick={handleRemove}>
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </>
  );
}