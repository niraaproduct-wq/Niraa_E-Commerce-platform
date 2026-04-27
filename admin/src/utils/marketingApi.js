import { API_BASE_URL } from './constants';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('niraa_token')}`,
});

// ── Broadcast ─────────────────────────────────────────────────────────────────

export const sendBroadcast = async (message, channel = 'sms') => {
  const res = await fetch(`${API_BASE_URL}/marketing/broadcast`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ message, channel }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Broadcast failed');
  return data;
};

export const getBroadcastLogs = async () => {
  const res = await fetch(`${API_BASE_URL}/marketing/broadcast/logs`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch logs');
  return data.logs;
};

// ── Banners ───────────────────────────────────────────────────────────────────

export const getBanners = async () => {
  const res = await fetch(`${API_BASE_URL}/marketing/banners`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch banners');
  return data.banners;
};

export const createBanner = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/marketing/banners`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create banner');
  return data.banner;
};

export const updateBanner = async (id, payload) => {
  const res = await fetch(`${API_BASE_URL}/marketing/banners/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update banner');
  return data.banner;
};

export const deleteBanner = async (id) => {
  const res = await fetch(`${API_BASE_URL}/marketing/banners/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete banner');
  return data;
};

export const toggleBanner = async (id) => {
  const res = await fetch(`${API_BASE_URL}/marketing/banners/${id}/toggle`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to toggle banner');
  return data.banner;
};

export const getMarketingStats = async () => {
  const res = await fetch(`${API_BASE_URL}/marketing/stats`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
  return data.stats;
};
