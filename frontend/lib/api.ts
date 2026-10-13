import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ourstore_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('ourstore_token');
      localStorage.removeItem('ourstore_user');
    }
    return Promise.reject(err);
  }
);

export default api;

// API helpers
export const productsApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/products', { params }),
  getOne: (id: string) => api.get(`/products/${id}`),
  create: (data: unknown) => api.post('/products', data),
  update: (id: string, data: unknown) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  addReview: (id: string, data: unknown) => api.post(`/products/${id}/reviews`, data),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data: unknown) => api.post('/categories', data),
  update: (id: string, data: unknown) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const authApi = {
  login: (data: unknown) => api.post('/auth/login', data),
  register: (data: unknown) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data: unknown) => api.put('/auth/me', data),
};

export const ordersApi = {
  create: (data: unknown) => api.post('/orders', data),
  getMy: () => api.get('/orders/my'),
  getOne: (id: string) => api.get(`/orders/${id}`),
  getAll: (params?: Record<string, string | number>) => api.get('/orders', { params }),
  updateStatus: (id: string, data: unknown) => api.patch(`/orders/${id}/status`, data),
  getStats: () => api.get('/orders/admin/stats'),
};

export const uploadApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const usersApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/users', { params }),
  updateRole: (id: string, role: string) => api.put(`/users/${id}/role`, { role }),
  toggleStatus: (id: string, isActive: boolean) => api.put(`/users/${id}/status`, { isActive }),
  toggleWishlist: (productId: string) => api.post(`/users/wishlist/${productId}`),
  getWishlist: () => api.get('/users/wishlist'),
};
