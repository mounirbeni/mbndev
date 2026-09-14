import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL:         '/api',
  headers:         { 'Content-Type': 'application/json' },
  timeout:         30_000,
  withCredentials: true,
});

// ─── Request interceptor — attach access token ────────────────────────────────

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mbndev_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Refresh-token flow ───────────────────────────────────────────────────────

let _refreshPromise: Promise<string | null> | null = null;

// silentRefresh used to only ever write the rotated token to localStorage.
// AuthContext's React state (and anything derived from it, e.g. useRealtime
// opening the SSE connection with useAuth().token) kept the OLD token until
// a full reload or an explicit refresh()/getMe() call — so a reconnect right
// after a silent refresh used a token that could already be invalidated.
// AuthProvider registers a listener here on mount so both stay in sync.
type TokenRefreshListener = (token: string, user?: unknown) => void;
let _onTokenRefreshed: TokenRefreshListener | null = null;
export function setTokenRefreshedListener(fn: TokenRefreshListener | null) {
  _onTokenRefreshed = fn;
}

async function silentRefresh(): Promise<string | null> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const { data } = await axios.post(
        '/api/auth/refresh',
        {},
        { withCredentials: true, timeout: 10_000 },
      );
      if (data.success && data.token) {
        localStorage.setItem('mbndev_token', data.token);
        if (data.user) {
          localStorage.setItem('mbndev_user', JSON.stringify(data.user));
          const maxAge = 60 * 60 * 24 * 7;
          document.cookie = `mbndev_auth=${data.user.role}; path=/; max-age=${maxAge}; samesite=lax`;
        }
        _onTokenRefreshed?.(data.token, data.user);
        return data.token as string;
      }
      return null;
    } catch {
      return null;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ─── 401 guard ────────────────────────────────────────────────────────────────

let _unauthorizedHandled = false;

export function resetUnauthorizedFlag() {
  _unauthorizedHandled = false;
}

function clearSessionAndRedirect(url: string) {
  if (_unauthorizedHandled) return;
  const isAuthCall = url?.includes('/auth/login') || url?.includes('/auth/register') || url?.includes('/auth/refresh');
  if (isAuthCall) return;

  _unauthorizedHandled = true;

  if (typeof window !== 'undefined') {
    localStorage.removeItem('mbndev_token');
    localStorage.removeItem('mbndev_user');
    document.cookie = 'mbndev_auth=; path=/; max-age=0; samesite=lax';

    const next = encodeURIComponent(window.location.pathname + window.location.search);
    const isPublic = /^\/(login|signup|forgot-password|reset-password|$)/.test(window.location.pathname);
    if (!isPublic) {
      window.location.href = `/login?next=${next}`;
    }
  }
}

// ─── Retry logic ─────────────────────────────────────────────────────────────

const RETRYABLE_METHODS   = new Set(['get', 'head', 'options', 'put', 'delete']);
const MAX_RETRIES         = 2;
const RETRY_BASE_DELAY_MS = 500;

export function shouldRetry(error: AxiosError, retryCount: number): boolean {
  if (retryCount >= MAX_RETRIES) return false;
  const method = error.config?.method?.toLowerCase() ?? '';
  if (!RETRYABLE_METHODS.has(method)) return false;
  if (!error.response) return true;
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
    const config = error.config as AxiosRequestConfig & { _retryCount?: number; _refreshed?: boolean };

    if (status === 401 && typeof window !== 'undefined' && !config._refreshed) {
      const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
      if (!isAuthCall) {
        config._refreshed = true;
        const newToken = await silentRefresh();
        if (newToken) {
          config.headers = { ...(config.headers ?? {}), Authorization: `Bearer ${newToken}` };
          return api(config);
        }
        clearSessionAndRedirect(url);
        return Promise.reject(error);
      }
    }

    if (status === 401 && typeof window !== 'undefined') {
      clearSessionAndRedirect(url);
    }

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

// ─── Request payload types ─────────────────────────────────────────────────────
// Mirrors backend/src/middleware/validate.js — kept intentionally loose where
// the backend itself treats a field as freeform (e.g. arbitrary status enums
// aren't repeated here as literal unions to avoid drifting out of sync).

export interface RegisterPayload {
  name:     string;
  email:    string;
  password: string;
  company?: string;
  phone?:   string;
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface UpdateProfilePayload {
  name?:            string;
  company?:         string;
  phone?:           string;
  currentPassword?: string;
  newPassword?:     string;
}

export interface DesignPreferences {
  style?:      string;
  colors?:     string[];
  references?: string[];
}

export interface CreateProjectPayload {
  title:               string;
  budget:              number;
  description?:        string;
  type?:               string;
  deadline?:           string;
  features?:           string[];
  package?:            string;
  notes?:              string;
  designPreferences?:  DesignPreferences;
}

export interface ProjectListParams {
  status?: string;
  page?:   number;
  limit?:  number;
  search?: string;
}

export interface UpdateProjectPayload {
  status?:   string;
  progress?: number;
  notes?:    string;
  budget?:   number;
  deadline?: string;
}

export interface CreateOrderPayload {
  serviceType:    string;
  title:          string;
  description?:   string;
  pages?:         number;
  features?:      string[];
  addons?:        string[];
  notes?:         string;
  designStyle?:   string;
  designColors?:  string[];
  designRefs?:    string[];
  plan?:          string;
}

export interface OrderListParams {
  status?: string;
  page?:   number;
  limit?:  number;
}

export interface UpdateOrderPayload {
  description?: string;
  notes?:       string;
  pages?:       number;
  features?:    string[];
  addons?:      string[];
}

export interface OrderPriceParams {
  serviceType?: string;
  pages?:       number;
  plan?:        string;
  features?:    string[];
  addons?:      string[];
}

export interface SendMessagePayload {
  content: string;
}

export interface MockPaymentPayload {
  projectId:    string;
  amount:       number;
  description:  string;
}

export interface SubmitManualPaymentPayload {
  orderId:         string;
  method:          'cih_bank' | 'paypal' | 'taptapsend';
  externalRef?:    string;
  idempotencyKey?: string;
}

export interface PaymentListParams {
  status?:  string;
  flagged?: string;
}

export interface PackagePayload {
  name:            string;
  slug:            string;
  price:           number;
  description?:    string;
  features?:       string[];
  pages?:          number;
  revisions?:      number;
  deliveryDays?:   number;
  popular?:        boolean;
}

export interface LeadListParams {
  status?:   string;
  type?:     string;
  priority?: string;
}

export interface CreateLeadPayload {
  name:            string;
  type?:           string;
  city?:           string;
  phone?:          string;
  email?:          string;
  instagram?:      string;
  website?:        string;
  priority?:       string;
  outreachAngle?:  string;
  source?:         string;
  notes?:          string;
}

export interface UpdateLeadPayload {
  status?:    string;
  notes?:     string;
  priority?:  string;
  email?:     string;
  phone?:     string;
  instagram?: string;
}

// ─── API namespaces ───────────────────────────────────────────────────────────

export const authAPI = {
  register:              (data: RegisterPayload)              => api.post('/auth/register', data),
  login:                 (data: LoginPayload)                 => api.post('/auth/login', data),
  logout:                ()                                   => api.post('/auth/logout'),
  refresh:               ()                                   => api.post('/auth/refresh'),
  getMe:                 ()                                   => api.get('/auth/me'),
  updateProfile:         (data: UpdateProfilePayload)         => api.put('/auth/profile', data),
  deleteAccount:         (password: string)                   => api.delete('/auth/account', { data: { password } }),
  cancelDeletionRequest: ()                                   => api.delete('/auth/account/cancel'),
  forgotPassword:        (email: string)                      => api.post('/auth/forgot-password', { email }),
  resetPassword:         (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
  checkEmail:            (email: string)                      => api.post('/auth/check-email', { email }),
  checkPhone:            (phone: string)                      => api.post('/auth/check-phone', { phone }),
};

export const projectAPI = {
  create:          (data: CreateProjectPayload)      => api.post('/projects', data),
  getMine:         ()                                => api.get('/projects/mine'),
  getAll:          (params?: ProjectListParams)      => api.get('/projects', { params }),
  getOne:          (id: string)                      => api.get(`/projects/${id}`),
  update:          (id: string, data: UpdateProjectPayload) => api.put(`/projects/${id}`, data),
  uploadFile:      (id: string, formData: FormData)  =>
    api.post(`/projects/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60_000,
    }),
  getStats:        ()                                => api.get('/projects/stats'),
  generateShare:   (id: string)                      => api.post(`/projects/${id}/share`, {}),
  revokeShare:     (id: string)                      => api.post(`/projects/${id}/share/revoke`, {}),
  getByShareToken: (token: string)                   => api.get(`/projects/share/${token}`),
  delete:          (id: string)                      => api.delete(`/projects/${id}`),
};

export const orderAPI = {
  create:   (data: CreateOrderPayload)      => api.post('/orders', data),
  getAll:   (params?: OrderListParams)      => api.get('/orders', { params }),
  getOne:   (id: string)                    => api.get(`/orders/${id}`),
  update:   (id: string, data: UpdateOrderPayload) => api.put(`/orders/${id}`, data),
  cancel:   (id: string)                    => api.put(`/orders/${id}/cancel`),
  delete:   (id: string)                    => api.delete(`/orders/${id}`),
  getPrice: (params: OrderPriceParams)      => api.get('/orders/price', { params }),
};

export const messageAPI = {
  getThreads: ()                                   => api.get('/messages/threads'),
  get:        (projectId: string, before?: string) =>
    api.get(`/messages/${projectId}`, { params: before ? { before } : {} }),
  send:       (projectId: string, data: SendMessagePayload) => api.post(`/messages/${projectId}`, data),
  getUnread:  ()                                   => api.get('/messages/unread'),
};

export const paymentAPI = {
  mock:           (data: MockPaymentPayload)        => api.post('/payments/mock', data),
  submitManual:   (data: SubmitManualPaymentPayload) => api.post('/payments/manual', data),
  approveManual:  (id: string)                  => api.put(`/payments/${id}/approve`, {}),
  rejectManual:   (id: string, reason?: string) => api.put(`/payments/${id}/reject`, reason ? { reason } : {}),
  getAll:         (params?: PaymentListParams)  => api.get('/payments', { params }),
  getOne:         (id: string)                  => api.get(`/payments/${id}`),
  getEvents:      (id: string)                  => api.get(`/payments/${id}/events`),
  reconcile:      ()                            => api.post('/payments/reconcile', {}),
  getAnalytics:   ()                            => api.get('/payments/meta/analytics'),
};

export const notificationAPI = {
  getAll:      ()           => api.get('/notifications'),
  getUnread:   ()           => api.get('/notifications/unread-count'),
  markRead:    (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: ()           => api.put('/notifications/read-all'),
};

export const packageAPI = {
  getAll: ()                                       => api.get('/packages'),
  create: (data: PackagePayload)                   => api.post('/packages', data),
  update: (id: string, data: Partial<PackagePayload>) => api.put(`/packages/${id}`, data),
  delete: (id: string)                             => api.delete(`/packages/${id}`),
};

export const adminAPI = {
  getClients:      (page = 1, limit = 25)          => api.get('/admin/clients', { params: { page, limit } }),
  toggleClient:    (id: string)                    => api.put(`/admin/clients/${id}/toggle`),
  deleteClient:    (id: string)                    => api.delete(`/admin/clients/${id}`),
  approveDeletion: (id: string)                    => api.post(`/admin/clients/${id}/approve-deletion`),
  rejectDeletion:  (id: string)                    => api.post(`/admin/clients/${id}/reject-deletion`),
  saveNotes:       (id: string, notes: string)     => api.put(`/admin/clients/${id}/notes`, { notes }),
  broadcastCount:  ()                              => api.get('/admin/broadcast-count'),
  getAnalytics:    ()                              => api.get('/admin/analytics'),
  // Long timeout: the backend now awaits the full send (up to ~100
  // recipients paced 350ms apart) instead of responding immediately.
  broadcast:       (template = 'platformUpdate')   => api.post('/admin/broadcast', { template }, { timeout: 60_000 }),
};

export const leadsAPI = {
  getAll:          (params?: LeadListParams)               => api.get('/leads', { params }),
  create:          (data: CreateLeadPayload)               => api.post('/leads', data),
  update:          (id: string, data: UpdateLeadPayload)   => api.put(`/leads/${id}`, data),
  delete:          (id: string)                            => api.delete(`/leads/${id}`),
  sendEmail:       (id: string, data: { subject: string; body: string }) => api.post(`/leads/${id}/email`, data),
  importDefaults:  ()                                      => api.post('/leads/import'),
  syncContacts:    ()                                      => api.post('/leads/sync-contacts'),
  bulkEmail:       ()                                      => api.post('/leads/bulk-email'),
  resetAll:        ()                                      => api.post('/leads/reset-all'),
  testEmail:       (to: string)                            => api.post('/leads/test-email', { to }),
  emailCheck:      ()                                      => api.get('/leads/email-check'),
  getTemplate:     (type: string, name: string)            => api.get('/leads/templates', { params: { type, name } }),
};

export interface ActivityListParams {
  page?:  number;
  limit?: number;
}

export const searchAPI = {
  global:   (q: string)                  => api.get('/search', { params: { q } }),
  activity: (params?: ActivityListParams) => api.get('/search/activity', { params }),
};

export default api;
