import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import CartItem from '../components/CartItem.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import { WHATSAPP_NUMBER } from '../utils/constants.js';

const Cart = () => {
  const { items, totalItems, subtotal, clearCart } = useCart();

  const whatsappText = totalItems
    ? `Hello NIRAA, I want to order:\n${items
        .map(i => `- ${i.name} ${i.variantDesc ? `(${i.variantDesc})` : ''} x${i.qty}`)
        .join('\n')}\n\nTotal: ${formatPrice(subtotal)}`
    : `Hello NIRAA, I want to place an order from the website.`;

  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/^\+/, '')}?text=${encodeURIComponent(whatsappText)}`;

  return (
    <main className="container page">
      <header className="page-header page-header--cart">
        <div className="page-header__badge">Shopping Cart</div>
        <div className="page-title">Cart</div>
        <div className="page-subtitle">
          {totalItems ? `${totalItems} item(s) ready for checkout` : 'Your cart is empty'}
        </div>
        <div className="page-actions">
          <a className="btn btn--whatsapp" href={waLink} target="_blank" rel="noreferrer">Order via WhatsApp</a>
          <Link className="btn btn--ghost" to="/products">Shop Products</Link>
          {totalItems > 0 && (
            <button type="button" onClick={clearCart} className="btn btn--danger">
              Clear
            </button>
          )}
        </div>
      </header>

      {items.length === 0 ? (
        <div className="card card--soft card--padded">
          <div style={{ fontWeight: 800, color: 'var(--teal-dark)', fontSize: '1.1rem' }}>Start with a clean home.</div>
          <div style={{ marginTop: 6, color: 'var(--gray-600)' }}>Pick a product and add it to your cart in seconds.</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            <Link className="btn btn--primary" to="/products">Shop Products</Link>
            <a className="btn btn--whatsapp" href={waLink} target="_blank" rel="noreferrer">Order via WhatsApp</a>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          <section>
            <div className="card card--padded">
              {items.map(item => (
                <CartItem key={item.uid} item={item} />
              ))}
            </div>
          </section>

          <aside>
            <div className="card card--padded">
              <div style={{ fontWeight: 900, color: 'var(--teal-dark)', fontSize: '1.1rem' }}>Order Summary</div>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', color: 'var(--gray-600)' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 900, color: 'var(--gray-800)' }}>{formatPrice(subtotal)}</span>
              </div>

              <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                <Link className="btn btn--primary" to="/checkout">Proceed to Checkout</Link>
                <a className="btn btn--whatsapp" href={waLink} target="_blank" rel="noreferrer">Order via WhatsApp</a>
              </div>

              <div style={{ marginTop: 14, fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                Serving Dharmapuri & nearby areas. Fast local delivery updates on WhatsApp.
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
};

export default Cart;

