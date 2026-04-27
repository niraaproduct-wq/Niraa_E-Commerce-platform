import { API_BASE_URL } from './constants';

/**
 * Fetch all products with optional filters
 * @param {Object} params - { category, featured, search, page, limit }
 */
export const getProducts = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
  return data;
};

/**
 * Fetch a single product by ID
 * @param {string} id 
 */
export const getProductById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Product not found');
  return data;
};

/**
 * Add a review to a product
 */
export const addProductReview = async (productId, reviewData) => {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add review');
  return data;
};
