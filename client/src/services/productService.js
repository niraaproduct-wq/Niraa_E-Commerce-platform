import { apiService } from './api';

export const productService = {
  getAllProducts: () => apiService.getProducts(),
  getProductById: (id) => apiService.getProduct(id),
};

