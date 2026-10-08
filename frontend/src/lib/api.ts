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
export type BroadcastStatus = 'live' | 'upcoming' | 'archived';
export interface BroadcastTemplate {
  key: string;
  kind: 'monthly' | 'evergreen' | 'retired';
  month: string | null;
  monthLabel: string | null;
  label: string;
  description: string;
  status: BroadcastStatus;
  subject: string;
  preheader: string;
}

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
      // A full reload on purpose: this runs outside React (an axios
      // interceptor) and must also drop all in-memory session state.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
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
  offerToken?:    string;
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
  type?:      string;
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
  uploadFile:      (id: string, formData: FormData, onProgress?: (percent: number) => void) =>
    api.post(`/projects/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60_000,
      onUploadProgress: (e) => { if (onProgress && e.total) onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100))); },
    }),
  uploadMode:      ()                                => api.get('/projects/upload-mode'),
  registerFile:    (id: string, data: { url: string; name: string }) => api.post(`/projects/${id}/files`, data),
  getStats:        ()                                => api.get('/projects/stats'),
  generateShare:   (id: string)                      => api.post(`/projects/${id}/share`, {}),
  revokeShare:     (id: string)                      => api.post(`/projects/${id}/share/revoke`, {}),
  getByShareToken: (token: string)                   => api.get(`/projects/share/${token}`),
  delete:          (id: string)                      => api.delete(`/projects/${id}`),
};

export const orderAPI = {
  create:   (data: CreateOrderPayload)      => api.post('/orders', data),
  /** Software product order, e.g. "leads-ai:pro" — priced by the server. */
  buyProduct: (product: string)             => api.post('/orders', { product }),
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
  pushConfig:   ()          => api.get('/notifications/push/config'),
  subscribePush:(subscription: PushSubscriptionJSON) => api.post('/notifications/push/subscribe', subscription),
  unsubscribePush:(endpoint: string) => api.delete('/notifications/push/subscribe', { data: { endpoint } }),
};

export const packageAPI = {
  getAll: ()                                       => api.get('/packages'),
  /** Bypasses the CDN cache on /packages — for the admin editor. */
  getAllFresh: ()                                  => api.get('/packages', { params: { fresh: Date.now() } }),
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
  broadcast:       (template: string)              => api.post('/admin/broadcast', { template }, { timeout: 60_000 }),
  broadcastTemplates: ()                          => api.get<{ templates: BroadcastTemplate[] }>('/admin/broadcast/templates'),
  broadcastPreview: (key: string)                 => api.get<{ subject: string; preheader: string; html: string; status: BroadcastStatus }>(`/admin/broadcast/preview/${encodeURIComponent(key)}`),
  broadcastTest:   (template: string)             => api.post<{ message: string }>('/admin/broadcast/test', { template }, { timeout: 20_000 }),
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

// ─── MBN Leads AI (product) ───────────────────────────────────────────────────
export interface LeadsAiAccount {
  plan: 'starter' | 'pro' | 'agency';
  searches: { used: number; limit: number | null; remaining: number | null };
  hasGoogleKey: boolean;
  hasOpenaiKey: boolean;
}
export interface LeadsAiBusiness {
  placeId: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  email?: string | null;          // only from OpenStreetMap listings; Google never returns one
  rating: number | null;
  reviews: number | null;
  mapsUrl: string | null;
  saved?: boolean;
}
export interface LeadsAiIssue { key: string; label: string; points: number }
export interface LeadsAiAudit {
  hasWebsite: boolean;
  reachable?: boolean;
  https?: boolean;
  mobileFriendly?: boolean;
  responseMs?: number;
  title?: string | null;
  hasMetaDescription?: boolean;
  outdatedSignals?: string[];
  hasBooking?: boolean;
  bookingProviders?: string[];
  thirdPartyBookingOnly?: boolean;
  hasContactForm?: boolean;
  emails?: string[];
  social?: Record<string, string>;
  platform?: string | null;
  copyrightYear?: number | null;
  error?: string;
}
export interface LeadsAiAnalysis { id: string; audit: LeadsAiAudit; score: number; level: 'hot' | 'warm' | 'low'; issues: LeadsAiIssue[] }
export interface LeadsAiProspect extends Omit<LeadsAiBusiness, 'saved'> {
  id: string;
  email: string | null;
  score: number;
  audit: LeadsAiAudit | null;
  message: string | null;
  status: 'new' | 'contacted' | 'replied' | 'won' | 'lost';
  notes: string | null;
  query: string | null;
  issues: LeadsAiIssue[];
  createdAt: string;
}

export const leadsAiAPI = {
  me:        ()                                                   => api.get('/leads-ai/me'),
  saveKeys:  (data: { googleKey?: string; openaiKey?: string })   => api.put('/leads-ai/keys', data),
  // Free OpenStreetMap search (no Google key) can take ~45 s on a busy day.
  search:    (query: string)                                      => api.post('/leads-ai/search', { query }, { timeout: 60_000 }),
  analyze:   (items: { id: string; website: string | null }[])    => api.post('/leads-ai/analyze', { items }),
  message:   (data: { business: LeadsAiBusiness; audit: LeadsAiAudit; lang?: string; tone?: string; senderName?: string; service?: string }) => api.post('/leads-ai/message', data),
  prospects: (status?: string)                                    => api.get('/leads-ai/prospects', { params: status ? { status } : {} }),
  save:      (data: LeadsAiBusiness & { audit?: LeadsAiAudit; message?: string; query?: string }) => api.post('/leads-ai/prospects', data),
  update:    (id: string, data: Partial<Pick<LeadsAiProspect, 'status' | 'notes' | 'message' | 'email'>>) => api.put(`/leads-ai/prospects/${id}`, data),
  remove:    (id: string)                                         => api.delete(`/leads-ai/prospects/${id}`),
  exportCsv: ()                                                   => api.get('/leads-ai/prospects/export', { responseType: 'blob' }),
  adminAccounts:  ()                                              => api.get('/leads-ai/admin/accounts'),
  adminSetAccess: (userId: string, plan: string | null)           => api.put('/leads-ai/admin/access', { userId, plan }),
};

// ─── MBN Local Growth (product) ───────────────────────────────────────────────
export interface LocalGrowthAccount {
  plan: 'starter' | 'pro' | 'agency';
  reports: { used: number; limit: number | null; remaining: number | null };
  hasGoogleKey: boolean;
  hasOpenaiKey: boolean;
  brandName: string;
  brandUrl: string;
}
export interface LocalGrowthAction { priority: 'high' | 'medium' | 'low'; area: 'website' | 'reputation' | 'profile'; title: string; detail: string }
export interface LocalGrowthCompetitor { placeId: string; name: string; rating: number | null; reviews: number; website: string | null; mapsUrl: string | null }
export interface LocalGrowthData {
  business: { name: string; address: string | null; type: string | null; rating: number | null; reviews: number; website: string | null; phone: string | null; hasHours: boolean; photos: number; lastReviewAt: string | null; mapsUrl: string | null };
  scores: { overall: number; reputation: number; website: number; profile: number };
  benchmark: { competitors: number; medianReviews: number | null; avgRating: number | null; withWebsite: number };
  competitors: LocalGrowthCompetitor[];
  websiteAudit: LeadsAiAudit;
  websiteIssues: LeadsAiIssue[];
  actions: LocalGrowthAction[];
  summary?: string;
  generatedAt: string;
}
export interface LocalGrowthReport { id: string; placeId: string; name: string; address: string | null; score: number; shareToken: string; createdAt: string; data?: LocalGrowthData }
export interface ReportBrand { name: string; url: string | null }

export const localGrowthAPI = {
  me:           ()                                   => api.get('/local-growth/me'),
  saveSettings: (data: { googleKey?: string; openaiKey?: string; brandName?: string; brandUrl?: string }) => api.put('/local-growth/settings', data),
  search:       (query: string)                      => api.post('/local-growth/search', { query }),
  create:       (placeId: string, lang: string)      => api.post('/local-growth/reports', { placeId, lang }),
  list:         ()                                   => api.get('/local-growth/reports'),
  get:          (id: string)                         => api.get(`/local-growth/reports/${id}`),
  remove:       (id: string)                         => api.delete(`/local-growth/reports/${id}`),
  publicReport: (token: string)                      => api.get(`/local-growth/public/${token}`),
  adminAccounts:  ()                                 => api.get('/local-growth/admin/accounts'),
  adminSetAccess: (userId: string, plan: string | null) => api.put('/local-growth/admin/access', { userId, plan }),
};

// ─── MBN Support AI (product) ─────────────────────────────────────────────────
export interface SupportAiAccount {
  plan: 'starter' | 'pro' | 'agency';
  bots: { used: number; limit: number };
  messages: { used: number; limit: number };
  hasOpenaiKey: boolean;
}
export interface SupportBot {
  id: string;
  name: string;
  websiteUrl: string;
  welcome: string;
  color: string;
  allowedDomains: string[];
  handoffWhatsapp: string | null;
  handoffEmail: string | null;
  notes: string | null;
  active: boolean;
  pageCount: number;
  trainedAt: string | null;
  createdAt: string;
  _count?: { leads: number; conversations: number };
}
export interface SupportMessage { role: 'user' | 'assistant'; content: string; at: string }
export interface SupportConversation { id: string; visitorId: string; messages: SupportMessage[]; createdAt: string; updatedAt: string }
export interface SupportLead { id: string; name: string | null; email: string | null; phone: string | null; message: string | null; conversationId: string | null; createdAt: string }

export const supportAiAPI = {
  me:            ()                                        => api.get('/support-ai/me'),
  saveSettings:  (openaiKey: string)                       => api.put('/support-ai/settings', { openaiKey }),
  bots:          ()                                        => api.get('/support-ai/bots'),
  createBot:     (name: string, websiteUrl: string)        => api.post('/support-ai/bots', { name, websiteUrl }, { timeout: 90000 }),
  bot:           (id: string)                              => api.get(`/support-ai/bots/${id}`),
  updateBot:     (id: string, data: Partial<Pick<SupportBot, 'name' | 'welcome' | 'color' | 'allowedDomains' | 'handoffWhatsapp' | 'handoffEmail' | 'notes' | 'active'>>) => api.put(`/support-ai/bots/${id}`, data),
  retrain:       (id: string)                              => api.post(`/support-ai/bots/${id}/train`, {}, { timeout: 90000 }),
  deleteBot:     (id: string)                              => api.delete(`/support-ai/bots/${id}`),
  conversations: (id: string)                              => api.get(`/support-ai/bots/${id}/conversations`),
  leads:         (id: string)                              => api.get(`/support-ai/bots/${id}/leads`),
  adminAccounts:  ()                                       => api.get('/support-ai/admin/accounts'),
  adminSetAccess: (userId: string, plan: string | null)    => api.put('/support-ai/admin/access', { userId, plan }),
};

// ─── MBN Review Booster (product) ─────────────────────────────────────────────
export type ReviewLanguage = 'en' | 'fr' | 'ar' | 'es';
export interface ReviewBoosterAccount {
  plan: 'starter' | 'pro' | 'agency';
  businesses: { used: number; limit: number };
  hasGoogleKey: boolean;
  hasOpenaiKey: boolean;
}
export interface ReviewBusiness {
  id: string;
  name: string;
  googleReviewUrl: string;
  color: string;
  language: ReviewLanguage;
  active: boolean;
  views: number;
  googleClicks: number;
  requestsSent: number;
  placeId: string | null;
  rating: number | null;
  ratingCount: number | null;
  monitoredAt: string | null;
  monitorError: string | null;
  createdAt: string;
  _count?: { feedback: number };
}
export interface GoogleReview { id: string; author: string | null; rating: number; text: string | null; language: string | null; publishedAt: string | null; replyDraft: string | null; createdAt: string }
export interface ReviewSnapshot { rating: number | null; ratingCount: number; createdAt: string }
export interface PlaceResult { placeId: string; name: string; address: string | null; rating: number | null; reviews: number | null }
export interface ReviewFeedback { id: string; rating: number | null; message: string; name: string | null; contact: string | null; createdAt: string }

export const reviewBoosterAPI = {
  me:             ()                                       => api.get('/review-booster/me'),
  saveSettings:   (data: { googleKey?: string; openaiKey?: string }) => api.put('/review-booster/settings', data),
  businesses:     ()                                       => api.get('/review-booster/businesses'),
  createBusiness: (data: { name: string; googleReviewUrl: string; language: ReviewLanguage }) => api.post('/review-booster/businesses', data),
  business:       (id: string)                             => api.get(`/review-booster/businesses/${id}`),
  updateBusiness: (id: string, data: Partial<Pick<ReviewBusiness, 'name' | 'googleReviewUrl' | 'color' | 'language' | 'active' | 'placeId'>>) => api.put(`/review-booster/businesses/${id}`, data),
  deleteBusiness: (id: string)                             => api.delete(`/review-booster/businesses/${id}`),
  markSent:       (id: string)                             => api.post(`/review-booster/businesses/${id}/sent`, {}),
  feedback:       (id: string)                             => api.get(`/review-booster/businesses/${id}/feedback`),
  placeSearch:    (id: string, query: string)              => api.post(`/review-booster/businesses/${id}/place-search`, { query }),
  checkNow:       (id: string)                             => api.post(`/review-booster/businesses/${id}/check`, {}, { timeout: 30000 }),
  reviews:        (id: string)                             => api.get(`/review-booster/businesses/${id}/reviews`),
  replyDraft:     (id: string, reviewId: string)           => api.post(`/review-booster/businesses/${id}/reviews/${reviewId}/reply`, {}, { timeout: 40000 }),
  adminAccounts:  ()                                       => api.get('/review-booster/admin/accounts'),
  adminSetAccess: (userId: string, plan: string | null)    => api.put('/review-booster/admin/access', { userId, plan }),
};

// ─── MBN Menu (product) ───────────────────────────────────────────────────────
export type MenuLang = 'en' | 'fr' | 'es' | 'pt' | 'it' | 'de' | 'ar';
export type Localized = Partial<Record<MenuLang, string>>;
export interface MenuChoice { id: string; name: Localized; price: number }
export interface MenuItem {
  id: string; name: Localized; desc: Localized; price: number; photo: string | null; allergens: number[];
  veg: boolean; vegan: boolean; spicy: number; chef: boolean; isNew: boolean; available: boolean; kcal: number | null;
  options: MenuChoice[]; extras: MenuChoice[];
}
export interface MenuCategory { id: string; name: Localized; items: MenuItem[] }
export interface MenuDoc { categories: MenuCategory[] }
export type MenuHours = Record<string, [number, number][]>;
export interface MenuRestaurant {
  id: string; name: string; tagline: Localized; about: Localized; color: string;
  languages: MenuLang[]; defaultLanguage: MenuLang; currency: string; timezone: string;
  address: string | null; phone: string | null; whatsapp: string | null; email: string | null; instagram: string | null; website: string | null;
  wifiName: string | null; wifiPassword: string | null; logoPhotoId: string | null; coverPhotoId: string | null;
  hours: MenuHours; payments: string[]; ordering: boolean; booking: boolean; waiterCall: boolean; coverCharge: number;
  menu: MenuDoc; active?: boolean; views?: number; branding?: boolean; createdAt?: string; updatedAt?: string;
}
export interface MenuRestaurantSummary {
  id: string; name: string; color: string; languages: MenuLang[]; active: boolean; views: number; logoPhotoId: string | null;
  dishes: number; newRequests: number; createdAt: string; updatedAt: string;
}
export interface MenuAccount { plan: 'starter' | 'pro' | 'agency'; restaurants: { used: number; limit: number }; hasOpenaiKey: boolean }
export type MenuRequestKind = 'order' | 'booking' | 'waiter' | 'bill';
export interface MenuOrderLine { itemId: string; name: Localized; qty: number; unit: number; option: { id: string; name: Localized } | null; extras: { id: string; name: Localized }[]; note: string | null }
export interface MenuGuestRequest {
  id: string; kind: MenuRequestKind; status: string; tableLabel: string | null; items: MenuOrderLine[] | null; total: number | null;
  name: string | null; phone: string | null; guests: number | null; date: string | null; time: string | null; notes: string | null;
  language: MenuLang | null; createdAt: string; updatedAt: string;
}

export const menuAPI = {
  me:               ()                                        => api.get('/menu/me'),
  saveSettings:     (openaiKey: string)                       => api.put('/menu/settings', { openaiKey }),
  restaurants:      ()                                        => api.get('/menu/restaurants'),
  createRestaurant: (data: { name: string; sample?: boolean; languages?: MenuLang[]; currency?: string }) => api.post('/menu/restaurants', data),
  restaurant:       (id: string)                              => api.get(`/menu/restaurants/${id}`),
  updateRestaurant: (id: string, data: Partial<MenuRestaurant>) => api.put(`/menu/restaurants/${id}`, data),
  deleteRestaurant: (id: string)                              => api.delete(`/menu/restaurants/${id}`),
  uploadPhoto:      (id: string, data: string)                => api.post(`/menu/restaurants/${id}/photos`, { data }, { timeout: 30000 }),
  translate:        (id: string, from: MenuLang, to: MenuLang) => api.post(`/menu/restaurants/${id}/translate`, { from, to }, { timeout: 60000 }),
  requests:         (id: string, scope: 'open' | 'all' = 'open') => api.get(`/menu/restaurants/${id}/requests`, { params: { scope } }),
  updateRequest:    (id: string, requestId: string, status: string) => api.put(`/menu/restaurants/${id}/requests/${requestId}`, { status }),
  adminAccounts:    ()                                        => api.get('/menu/admin/accounts'),
  adminSetAccess:   (userId: string, plan: string | null)     => api.put('/menu/admin/access', { userId, plan }),
};

// ─── MBN Proposal AI (product) ────────────────────────────────────────────────
export type ProposalLanguage = 'en' | 'fr' | 'ar' | 'es';
export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined';
export interface ProposalAccount {
  plan: 'starter' | 'pro' | 'agency';
  proposals: { used: number; limit: number | null };
  templates: boolean;
  hasOpenaiKey: boolean;
  brandName: string;
  brandColor: string;
  brandEmail: string;
  brandWebsite: string;
  currency: string;
}
export interface ProposalPhase { title: string; description: string; duration: string }
export interface ProposalContent { intro: string; solution: string; phases: ProposalPhase[]; terms: string }
export interface ProposalItem { id: string; name: string; description: string; price: number; optional: boolean }
export interface Proposal {
  id: string;
  title: string;
  clientName: string;
  clientCompany: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  language: ProposalLanguage;
  currency: string;
  content: ProposalContent;
  items: ProposalItem[];
  status: ProposalStatus;
  isTemplate: boolean;
  shareToken: string;
  validUntil: string | null;
  viewCount: number;
  firstViewedAt: string | null;
  lastViewedAt: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
  acceptedName: string | null;
  acceptedItems: string[] | null;
  acceptedTotal: number | null;
  declinedAt: string | null;
  declineReason: string | null;
  createdAt: string;
  updatedAt: string;
}
export type ProposalSummary = Pick<Proposal, 'id' | 'title' | 'clientName' | 'clientCompany' | 'status' | 'isTemplate' | 'currency' | 'viewCount' | 'sentAt' | 'acceptedAt' | 'acceptedTotal' | 'updatedAt' | 'createdAt'> & { total: number };
export interface NewProposal { clientName: string; clientCompany?: string; clientEmail?: string; clientPhone?: string; brief?: string; language: ProposalLanguage; currency: string; templateId?: string; blank?: boolean }

export const proposalAPI = {
  me:             ()                                       => api.get('/proposal-ai/me'),
  saveSettings:   (data: Partial<{ openaiKey: string; brandName: string; brandColor: string; brandEmail: string; brandWebsite: string; currency: string }>) => api.put('/proposal-ai/settings', data),
  list:           ()                                       => api.get('/proposal-ai/proposals'),
  create:         (data: NewProposal)                      => api.post('/proposal-ai/proposals', data, { timeout: 70000 }),
  get:            (id: string)                             => api.get(`/proposal-ai/proposals/${id}`),
  update:         (id: string, data: Partial<Pick<Proposal, 'title' | 'clientName' | 'clientCompany' | 'clientEmail' | 'clientPhone' | 'language' | 'currency' | 'content' | 'items' | 'validUntil' | 'isTemplate'>>) => api.put(`/proposal-ai/proposals/${id}`, data),
  remove:         (id: string)                             => api.delete(`/proposal-ai/proposals/${id}`),
  duplicate:      (id: string)                             => api.post(`/proposal-ai/proposals/${id}/duplicate`, {}),
  markSent:       (id: string)                             => api.post(`/proposal-ai/proposals/${id}/sent`, {}),
  adminAccounts:  ()                                       => api.get('/proposal-ai/admin/accounts'),
  adminSetAccess: (userId: string, plan: string | null)    => api.put('/proposal-ai/admin/access', { userId, plan }),
};

export interface ActivityListParams {
  page?:  number;
  limit?: number;
}

export interface JobApplication {
  id: string;
  role: import('./careers').CareerRole;
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  experienceYears: string;
  availability: string;
  weeklyHours: string | null;
  expectedRate: string | null;
  portfolioUrl: string | null;
  linkedinUrl: string | null;
  languages: string[];
  answers: Record<string, string>;
  message: string | null;
  cvName: string;
  cvSize: number;
  status: import('./careers').ApplicationStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const careersAPI = {
  apply: (form: FormData, onProgress?: (percent: number) => void) =>
    api.post('/careers/apply', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60_000,
      onUploadProgress: (e) => { if (onProgress && e.total) onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100))); },
    }),
  list:     (params: { role?: string; status?: string; q?: string; page?: number }) =>
    api.get<{ applications: JobApplication[]; total: number; counts: Record<string, number> }>('/careers/applications', { params }),
  update:   (id: string, data: { status?: string; adminNotes?: string }) => api.patch<{ application: JobApplication }>(`/careers/applications/${id}`, data),
  remove:   (id: string) => api.delete(`/careers/applications/${id}`),
  cv:       (id: string) => api.get(`/careers/applications/${id}/cv`, { responseType: 'blob' }),
};

export const searchAPI = {
  global:   (q: string)                  => api.get('/search', { params: { q } }),
  activity: (params?: ActivityListParams) => api.get('/search/activity', { params }),
};

export default api;
