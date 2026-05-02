import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Custom hook to listen for real-time product updates from Firestore
 * @param {Object} options - { category, featured, limit }
 */
export const useFirestoreProducts = (options = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    // Base query: active products
    let q = query(
      collection(db, 'products'),
      where('isActive', '==', true)
    );

    // Apply filters if provided
    if (options.category && options.category !== 'all' && options.category !== 'combo') {
      q = query(q, where('category', '==', options.category));
    }
    
    if (options.featured) {
      q = query(q, where('isFeatured', '==', true));
    }

    // Subscribe to snapshot
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          _id: doc.id,
          ...data,
          stock: data.stock !== undefined ? data.stock : (data.countInStock || 0)
        };
      });

      // In-memory sort by createdAt (DESC)
      productList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      
      setProducts(productList);
      setLoading(false);
    }, (err) => {
      console.error('Firestore onSnapshot error:', err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [options.category, options.featured]);

  return { products, loading, error };
};
