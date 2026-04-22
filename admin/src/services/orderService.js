import { apiService } from './api';

export const orderService = {
  createOrder: (orderData) => apiService('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
};

