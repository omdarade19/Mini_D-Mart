import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dmart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error response message
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth Services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

// Category Services
export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

// Product Services
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

// Cart Services
export const cartService = {
  get: () => api.get('/cart'),
  add: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
  update: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  remove: (productId) => api.delete(`/cart/${productId}`)
};

// Order Services
export const orderService = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancel: (id) => api.patch(`/orders/${id}/cancel`)
};

// Return Services
export const returnService = {
  create: (returnData) => api.post('/returns', returnData),
  getAll: (params) => api.get('/returns', { params }),
  process: (id, status) => api.patch(`/returns/${id}`, { status })
};

// User Services (Admin)
export const userService = {
  getAll: () => api.get('/users'),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role })
};

export default api;
