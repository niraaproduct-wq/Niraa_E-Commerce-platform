// Base URL for all API calls.
// In development Vite proxies /api → localhost:5000, so no absolute URL is needed.
// In production set VITE_API_BASE_URL to your deployed backend URL in client/.env
const rawApiUrl = import.meta.env.VITE_API_BASE_URL || '';
export const API_BASE_URL = rawApiUrl 
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`) 
  : '/api';

console.log("API URL Final:", API_BASE_URL);

export const PHONE_1 = '+91 94433 67890';
export const PHONE_2 = '+91 94432 12345';
export const WHATSAPP_NUMBER = '+91 94433 67890';

export { formatPrice } from './formatPrice.js';
export { placeholderImage } from './placeholderImage.js';
