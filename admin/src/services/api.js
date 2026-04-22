import { API_BASE_URL } from '../utils/constants';

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
};

export const apiService = {
  getProducts: () => apiCall('/products'),
  getProduct: (id) => apiCall(`/products/${id}`),
};

