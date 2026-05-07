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
  register:      (data: any)         => api.post('/auth/register', data),
  login:         (data: any)         => api.post('/auth/login', data),
  getMe:         ()                  => api.get('/auth/me'),
  updateProfile: (data: any)         => api.put('/auth/profile', data),
};

// Projects
export const projectAPI = {
  create:     (data: any)                   => api.post('/projects', data),
  getMine:    ()                            => api.get('/projects/mine'),
  getAll:     (params?: any)               => api.get('/projects', { params }),
  getOne:     (id: string)                 => api.get(`/projects/${id}`),
  update:     (id: string, data: any)      => api.put(`/projects/${id}`, data),
  uploadFile: (id: string, formData: FormData) =>
    api.post(`/projects/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getStats:   ()                           => api.get('/projects/stats'),
};

// Orders
export const orderAPI = {
  create:        (data: any)          => api.post('/orders', data),
  getAll:        (params?: any)       => api.get('/orders', { params }),
  getOne:        (id: string)         => api.get(`/orders/${id}`),
  cancel:        (id: string)         => api.put(`/orders/${id}/cancel`),
  getPrice:      (params: any)        => api.get('/orders/price', { params }),
};

// Messages
export const messageAPI = {
  get:       (projectId: string)         => api.get(`/messages/${projectId}`),
  send:      (projectId: string, data: any) => api.post(`/messages/${projectId}`, data),
  getUnread: ()                          => api.get('/messages/unread'),
};

// Payments
export const paymentAPI = {
  orderCheckout:  (data: any)         => api.post('/payments/order-checkout', data),
  checkout:       (data: any)         => api.post('/payments/checkout', data),
  mock:           (data: any)         => api.post('/payments/mock', data),
  submitManual:   (data: any)         => api.post('/payments/manual', data),
  approveManual:  (id: string)        => api.put(`/payments/${id}/approve`, {}),
  getAll:         ()                  => api.get('/payments'),
};

// Notifications
export const notificationAPI = {
  getAll:       ()          => api.get('/notifications'),
  getUnread:    ()          => api.get('/notifications/unread-count'),
  markRead:     (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead:  ()          => api.put('/notifications/read-all'),
};

// Packages
export const packageAPI = {
  getAll:  ()                       => api.get('/packages'),
  create:  (data: any)             => api.post('/packages', data),
  update:  (id: string, data: any) => api.put(`/packages/${id}`, data),
  delete:  (id: string)            => api.delete(`/packages/${id}`),
};

// Admin
export const adminAPI = {
  getClients:    ()           => api.get('/admin/clients'),
  toggleClient:  (id: string) => api.put(`/admin/clients/${id}/toggle`),
  getAnalytics:  ()           => api.get('/admin/analytics'),
};

export default api;
