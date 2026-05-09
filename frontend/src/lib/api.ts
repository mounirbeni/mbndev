import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  // Don't auto-throw on 4xx — let callers decide
  timeout: 30_000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mbndev_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 handling — clear session and redirect, but only ONCE per page-life
// to avoid mid-request redirect loops if multiple in-flight calls 401.
let unauthorizedHandled = false;

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && typeof window !== 'undefined' && !unauthorizedHandled) {
      // Don't redirect during the very calls that establish a session
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
      if (!isAuthEndpoint) {
        unauthorizedHandled = true;
        localStorage.removeItem('mbndev_token');
        localStorage.removeItem('mbndev_user');
        // Clear the middleware cookie too
        document.cookie = 'mbndev_auth=; path=/; max-age=0; samesite=lax';

        // Preserve current path so login can redirect back
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        // Don't redirect if we're already on a public page
        if (!/^\/(login|signup|forgot-password|$)/.test(window.location.pathname)) {
          window.location.href = `/login?next=${next}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── API namespaces ──────────────────────────────────────────────────────────

export const authAPI = {
  register:        (data: any)         => api.post('/auth/register', data),
  login:           (data: any)         => api.post('/auth/login', data),
  getMe:           ()                  => api.get('/auth/me'),
  updateProfile:   (data: any)         => api.put('/auth/profile', data),
  forgotPassword:  (email: string)     => api.post('/auth/forgot-password', { email }),
  resetPassword:   (token: string, newPassword: string) =>
                                          api.post('/auth/reset-password', { token, newPassword }),
};

export const projectAPI = {
  create:     (data: any)                       => api.post('/projects', data),
  getMine:    ()                                => api.get('/projects/mine'),
  getAll:     (params?: any)                    => api.get('/projects', { params }),
  getOne:     (id: string)                      => api.get(`/projects/${id}`),
  update:     (id: string, data: any)           => api.put(`/projects/${id}`, data),
  uploadFile: (id: string, formData: FormData)  =>
    api.post(`/projects/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getStats:   ()                                => api.get('/projects/stats'),
};

export const orderAPI = {
  create:        (data: any)    => api.post('/orders', data),
  getAll:        (params?: any) => api.get('/orders', { params }),
  getOne:        (id: string)   => api.get(`/orders/${id}`),
  cancel:        (id: string)   => api.put(`/orders/${id}/cancel`),
  getPrice:      (params: any)  => api.get('/orders/price', { params }),
};

export const messageAPI = {
  getThreads: ()                              => api.get('/messages/threads'),
  get:        (projectId: string)             => api.get(`/messages/${projectId}`),
  send:       (projectId: string, data: any)  => api.post(`/messages/${projectId}`, data),
  getUnread:  ()                              => api.get('/messages/unread'),
};

export const paymentAPI = {
  mock:           (data: any)  => api.post('/payments/mock', data),
  submitManual:   (data: any)  => api.post('/payments/manual', data),
  approveManual:  (id: string) => api.put(`/payments/${id}/approve`, {}),
  getAll:         ()           => api.get('/payments'),
};

export const notificationAPI = {
  getAll:       ()           => api.get('/notifications'),
  getUnread:    ()           => api.get('/notifications/unread-count'),
  markRead:     (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead:  ()           => api.put('/notifications/read-all'),
};

export const packageAPI = {
  getAll:  ()                       => api.get('/packages'),
  create:  (data: any)              => api.post('/packages', data),
  update:  (id: string, data: any)  => api.put(`/packages/${id}`, data),
  delete:  (id: string)             => api.delete(`/packages/${id}`),
};

export const adminAPI = {
  getClients:    ()           => api.get('/admin/clients'),
  toggleClient:  (id: string) => api.put(`/admin/clients/${id}/toggle`),
  getAnalytics:  ()           => api.get('/admin/analytics'),
};

export default api;
