import axios from 'axios';

const api = axios.create({
  // All requests go to /api which Next.js rewrites to the backend
  // (localhost:5000 in dev, /_/backend in production on Vercel)
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mbndev_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('mbndev_token');
      localStorage.removeItem('mbndev_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Projects
export const projectAPI = {
  create: (data: any) => api.post('/projects', data),
  getMine: () => api.get('/projects/mine'),
  getAll: (params?: any) => api.get('/projects', { params }),
  getOne: (id: string) => api.get(`/projects/${id}`),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  uploadFile: (id: string, formData: FormData) =>
    api.post(`/projects/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getStats: () => api.get('/projects/stats'),
};

// Messages
export const messageAPI = {
  get: (projectId: string) => api.get(`/messages/${projectId}`),
  send: (projectId: string, data: any) => api.post(`/messages/${projectId}`, data),
  getUnread: () => api.get('/messages/unread'),
};

// Payments
export const paymentAPI = {
  checkout: (data: any) => api.post('/payments/checkout', data),
  mock: (data: any) => api.post('/payments/mock', data),
  getAll: () => api.get('/payments'),
};

// Packages
export const packageAPI = {
  getAll: () => api.get('/packages'),
  create: (data: any) => api.post('/packages', data),
  update: (id: string, data: any) => api.put(`/packages/${id}`, data),
  delete: (id: string) => api.delete(`/packages/${id}`),
};

// Admin
export const adminAPI = {
  getClients: () => api.get('/admin/clients'),
  toggleClient: (id: string) => api.put(`/admin/clients/${id}/toggle`),
};

export default api;
