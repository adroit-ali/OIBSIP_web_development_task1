const API_BASE = '/api';

export const getAuthToken = () => {
  return localStorage.getItem('slicecraft_token') || null;
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('slicecraft_token', token);
  } else {
    localStorage.removeItem('slicecraft_token');
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred during request');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Auth endpoints
export const authApi = {
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  verifyEmail: (token) => apiRequest(`/auth/verify-email?token=${token}`, { method: 'GET' }),
  resendVerification: (email) => apiRequest('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  adminLogin: (body) => apiRequest('/auth/admin-login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (email) => apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (body) => apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => apiRequest('/auth/me'),
  getDevEmails: () => apiRequest('/auth/dev-emails'),
};

// Inventory endpoints
export const inventoryApi = {
  getAll: () => apiRequest('/inventory'),
  updateStock: (id, payload) => apiRequest(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  triggerCheckAlerts: () => apiRequest('/inventory/check-alerts', { method: 'POST' }),
};

// Pizza endpoints
export const pizzaApi = {
  getAll: () => apiRequest('/pizzas'),
};

// Order endpoints
export const orderApi = {
  createPaymentOrder: (payload) => apiRequest('/orders/create-payment-order', { method: 'POST', body: JSON.stringify(payload) }),
  placeOrder: (payload) => apiRequest('/orders/place-order', { method: 'POST', body: JSON.stringify(payload) }),
  getMyOrders: () => apiRequest('/orders/my-orders'),
  getOrderById: (id) => apiRequest(`/orders/${id}`),
  getAllOrdersAdmin: () => apiRequest('/orders/admin/all'),
  updateOrderStatusAdmin: (id, payload) => apiRequest(`/orders/admin/status/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
};
