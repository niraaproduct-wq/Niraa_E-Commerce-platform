import React from 'react';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice, placeholderImage } from '../utils/constants.js';

export default function CartItem({ item }) {
  const { updateQty, removeFromCart } = useCart();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px 0', borderBottom: '1px solid var(--gray-200)',
    }}>
      {/* Image */}
      <img
        src={item.image || placeholderImage(item.name)}
        alt={item.name}
        style={{ width: 70, height: 70, objectFit: 'contain', borderRadius: 10, background: 'var(--cream)', padding: 6, flexShrink: 0 }}
        onError={e => { e.target.src = placeholderImage(item.name); }}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: 2 }}>{item.name}</h4>
        <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
          {item.variantDesc ? item.variantDesc : item.quantity}
        </div>
        <div style={{ fontWeight: 700, color: 'var(--teal-dark)', marginTop: 4 }}>{formatPrice(item.price)}</div>
      </div>

      {/* Qty Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => item.qty === 1 ? removeFromCart(item.uid) : updateQty(item.uid, item.qty - 1)}
          style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gray-100)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        ><FiMinus size={13} /></button>
        <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
        <button
          onClick={() => updateQty(item.uid, item.qty + 1)}
          style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--teal)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        ><FiPlus size={13} /></button>
      </div>

      {/* Total + Remove */}
      <div style={{ textAlign: 'right', minWidth: 70 }}>
        <div style={{ fontWeight: 700, color: 'var(--gray-800)', marginBottom: 6 }}>{formatPrice(item.price * item.qty)}</div>
        <button
          onClick={() => removeFromCart(item.uid)}
          style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 4 }}
        ><FiTrash2 size={16} /></button>
      </div>
    </div>
  );
}