import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000, // 30 s — matches Vercel function timeout
});

// ─── Request interceptor — attach JWT ────────────────────────────────────────

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mbndev_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── 401 guard ────────────────────────────────────────────────────────────────
// Only redirect ONCE per session. Multiple in-flight calls that all 401
// simultaneously would otherwise each trigger a redirect.

let _unauthorizedHandled = false;

/** Re-arm after a successful login. */
export function resetUnauthorizedFlag() {
  _unauthorizedHandled = false;
}

function handle401(url: string) {
  if (_unauthorizedHandled) return;
  // Never redirect during auth establishment calls
  const isAuthCall = url?.includes('/auth/login') || url?.includes('/auth/register');
  if (isAuthCall) return;

  _unauthorizedHandled = true;

  // Clear all auth state
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mbndev_token');
    localStorage.removeItem('mbndev_user');
    document.cookie = 'mbndev_auth=; path=/; max-age=0; samesite=lax';

    const next = encodeURIComponent(window.location.pathname + window.location.search);
    const isPublic = /^\/(login|signup|forgot-password|reset-password|$)/.test(
      window.location.pathname,
    );
    if (!isPublic) {
      window.location.href = `/login?next=${next}`;
    }
  }
}

// ─── Retry logic ─────────────────────────────────────────────────────────────
// Retry on network errors and 5xx responses, with exponential back-off.
// Only idempotent methods are retried automatically.

const RETRYABLE_METHODS   = new Set(['get', 'head', 'options', 'put', 'delete']);
const MAX_RETRIES         = 2;
const RETRY_BASE_DELAY_MS = 500;

function shouldRetry(error: AxiosError, retryCount: number): boolean {
  if (retryCount >= MAX_RETRIES) return false;
  const method = error.config?.method?.toLowerCase() ?? '';
  if (!RETRYABLE_METHODS.has(method)) return false;
  // Retry network errors (no response at all)
  if (!error.response) return true;
  // Retry server errors (502/503/504 — transient gateway/lambda issues)
  const status = error.response.status;
  return status === 502 || status === 503 || status === 504;
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// ─── Response interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url    = error.config?.url ?? '';

    // 401 → clear session + redirect
    if (status === 401 && typeof window !== 'undefined') {
      handle401(url);
    }

    // Retry transient failures
    const config = error.config as AxiosRequestConfig & { _retryCount?: number };
    const retryCount = config._retryCount ?? 0;

    if (shouldRetry(error, retryCount)) {
      config._retryCount = retryCount + 1;
      const backoff = RETRY_BASE_DELAY_MS * Math.pow(2, retryCount);
      await delay(backoff);
      return api(config);
    }

    return Promise.reject(error);
  },
);

// ─── API namespaces ───────────────────────────────────────────────────────────

export const authAPI = {
  register:      (data: any)                          => api.post('/auth/register', data),
  login:         (data: any)                          => api.post('/auth/login', data),
  getMe:         ()                                   => api.get('/auth/me'),
  updateProfile:  (data: any)                          => api.put('/auth/profile', data),
  deleteAccount:  (password: string)                   => api.delete('/auth/account', { data: { password } }),
  forgotPassword:(email: string)                      => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
  checkEmail:    (email: string)                      => api.post('/auth/check-email', { email }),
  checkPhone:    (phone: string)                      => api.post('/auth/check-phone', { phone }),
};

export const projectAPI = {
  create:          (data: any)                       => api.post('/projects', data),
  getMine:         ()                                => api.get('/projects/mine'),
  getAll:          (params?: any)                    => api.get('/projects', { params }),
  getOne:          (id: string)                      => api.get(`/projects/${id}`),
  update:          (id: string, data: any)           => api.put(`/projects/${id}`, data),
  uploadFile:      (id: string, formData: FormData)  =>
    api.post(`/projects/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60_000, // file uploads get a longer timeout
    }),
  getStats:        ()                                => api.get('/projects/stats'),
  generateShare:   (id: string)                      => api.post(`/projects/${id}/share`, {}),
  getByShareToken: (token: string)                   => api.get(`/projects/share/${token}`),
  delete:          (id: string)                      => api.delete(`/projects/${id}`),
};

export const orderAPI = {
  create:    (data: any)    => api.post('/orders', data),
  getAll:    (params?: any) => api.get('/orders', { params }),
  getOne:    (id: string)   => api.get(`/orders/${id}`),
  cancel:    (id: string)   => api.put(`/orders/${id}/cancel`),
  getPrice:  (params: any)  => api.get('/orders/price', { params }),
};

export const messageAPI = {
  getThreads: ()                                         => api.get('/messages/threads'),
  get:        (projectId: string, before?: string)       =>
    api.get(`/messages/${projectId}`, { params: before ? { before } : {} }),
  send:       (projectId: string, data: any)             => api.post(`/messages/${projectId}`, data),
  getUnread:  ()                                         => api.get('/messages/unread'),
};

export const paymentAPI = {
  mock:          (data: any)  => api.post('/payments/mock', data),
  submitManual:  (data: any)  => api.post('/payments/manual', data),
  approveManual: (id: string) => api.put(`/payments/${id}/approve`, {}),
  getAll:        ()           => api.get('/payments'),
  getOne:        (id: string) => api.get(`/payments/${id}`),
};

export const notificationAPI = {
  getAll:      ()           => api.get('/notifications'),
  getUnread:   ()           => api.get('/notifications/unread-count'),
  markRead:    (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: ()           => api.put('/notifications/read-all'),
};

export const packageAPI = {
  getAll: ()                       => api.get('/packages'),
  create: (data: any)              => api.post('/packages', data),
  update: (id: string, data: any)  => api.put(`/packages/${id}`, data),
  delete: (id: string)             => api.delete(`/packages/${id}`),
};

export const adminAPI = {
  getClients:   ()                         => api.get('/admin/clients'),
  toggleClient: (id: string)               => api.put(`/admin/clients/${id}/toggle`),
  deleteClient: (id: string)               => api.delete(`/admin/clients/${id}`),
  getAnalytics: ()                         => api.get('/admin/analytics'),
  broadcast:    (template = 'platformUpdate') => api.post('/admin/broadcast', { template }),
};

export default api;
