import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const initialState = {
  items: JSON.parse(localStorage.getItem('niraa_cart') || '[]'),
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const uid = action.product.variantId ? `${action.product._id}-${action.product.variantId}` : action.product._id;
      const exists = state.items.find(i => i.uid === uid);
      if (exists) {
        return {
          items: state.items.map(i =>
            i.uid === uid ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...action.product, uid, qty: 1 }] };
    }
    case 'REMOVE':
      return { items: state.items.filter(i => i.uid !== action.id) };
    case 'UPDATE_QTY':
      return {
        items: state.items.map(i =>
          i.uid === action.id ? { ...i, qty: Math.max(1, action.qty) } : i
        ),
      };
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    localStorage.setItem('niraa_cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart    = (product)     => dispatch({ type: 'ADD', product });
  const removeFromCart = (id)        => dispatch({ type: 'REMOVE', id });
  const updateQty    = (id, qty)     => dispatch({ type: 'UPDATE_QTY', id, qty });
  const clearCart    = ()            => dispatch({ type: 'CLEAR' });

  const totalItems   = state.items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal     = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      addToCart, removeFromCart, updateQty, clearCart,
      totalItems, subtotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);