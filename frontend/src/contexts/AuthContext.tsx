'use client';

import {
  createContext, useContext, useEffect, useState,
  ReactNode, useCallback, useRef,
} from 'react';
import type { RegisterPayload } from '@/lib/api';
import { User } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user:       User | null;
  token:      string | null;
  loading:    boolean;
  login:      (email: string, password: string) => Promise<void>;
  register:   (data: RegisterPayload) => Promise<void>;
  logout:     () => void;
  refresh:    () => Promise<void>;
  isAdmin:    boolean;
  isClient:   boolean;
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const TOKEN_KEY  = 'mbndev_token';
const USER_KEY   = 'mbndev_user';
// Role-only cookie consumed by Next.js middleware for SSR route guarding.
// Not a security boundary — the JWT (in localStorage) is the real credential.
const AUTH_COOKIE = 'mbndev_auth';

// Background /auth/me verification timeout — prevents indefinite loading state
// when the network is slow or unreachable.
const AUTH_CHECK_TIMEOUT_MS = 8_000;

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function setAuthCookie(role: string) {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `${AUTH_COOKIE}=${role}; path=/; max-age=${maxAge}; samesite=lax`;
}

function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

type ApiModule = typeof import('@/lib/api');

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Track whether a background /auth/me check is already in-flight
  const checkingRef = useRef(false);

  // ── API client, loaded on demand ──────────────────────────────────────────
  // The axios-based client is only needed for a signed-in session or a
  // login/register, so anonymous visitors never download it.
  const apiRef = useRef<Promise<ApiModule> | null>(null);
  const loadApi = useCallback(() => {
    if (!apiRef.current) {
      apiRef.current = import('@/lib/api').then((mod) => {
        // Stay in sync with a token silently rotated by the axios interceptor.
        // Without this, a 401-triggered refresh updates localStorage but not
        // this component's state — so useAuth().token (and anything built on
        // it, like useRealtime's SSE connection) keeps using the stale token.
        mod.setTokenRefreshedListener((newToken, newUser) => {
          setToken(newToken);
          if (newUser) setUser(newUser as User);
        });
        return mod;
      });
    }
    return apiRef.current;
  }, []);

  useEffect(() => () => {
    apiRef.current?.then((mod) => mod.setTokenRefreshedListener(null));
  }, []);

  // ── Session restore on mount ───────────────────────────────────────────────
  // 1. Optimistically restore cached user (instant, no flash)
  // 2. Verify in background with a timeout so the loading state always resolves
  useEffect(() => {
    if (checkingRef.current) return;
    checkingRef.current = true;

    const storedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    const storedUser  = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY)  : null;

    if (!storedToken || !storedUser) {
      setLoading(false);
      checkingRef.current = false;
      return;
    }

    // Optimistic restore
    try {
      const cached = JSON.parse(storedUser) as User;
      setToken(storedToken);
      setUser(cached);
      setAuthCookie(cached.role);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setLoading(false);
      checkingRef.current = false;
      return;
    }

    // Background verification with timeout
    const timeoutId = setTimeout(() => {
      // If the network check is taking too long, unblock the UI with
      // the cached user. The interceptor will catch 401s on next API call.
      setLoading(false);
    }, AUTH_CHECK_TIMEOUT_MS);

    loadApi()
      .then(({ authAPI }) => authAPI.getMe())
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setAuthCookie(data.user.role);
      })
      .catch(() => {
        // 401 interceptor in api.ts handles the redirect + clear
        // If it was a network error (no 401), keep the cached user —
        // the user shouldn't be logged out just because the network is flaky.
        // The interceptor only redirects on actual 401 responses.
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
        checkingRef.current = false;
      });
  }, [loadApi]); // runs once on mount (loadApi is stable)

  // ── persistSession ────────────────────────────────────────────────────────
  const persistSession = useCallback((api: ApiModule, newToken: string, newUser: User) => {
    api.resetUnauthorizedFlag();
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setAuthCookie(newUser.role);
    setToken(newToken);
    setUser(newUser);
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const api = await loadApi();
    const { data } = await api.authAPI.login({ email, password });
    persistSession(api, data.token, data.user);
  };

  // ── register ──────────────────────────────────────────────────────────────
  const register = async (registerData: RegisterPayload) => {
    const api = await loadApi();
    const { data } = await api.authAPI.register(registerData);
    persistSession(api, data.token, data.user);
  };

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    // Tell the server to clear the httpOnly refresh cookie
    loadApi().then(({ authAPI }) => authAPI.logout()).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearAuthCookie();
    setToken(null);
    setUser(null);
  }, [loadApi]);

  // ── refresh ───────────────────────────────────────────────────────────────
  // Syncs the cached user object with the latest data from the server.
  // Call after profile updates or plan changes.
  const refresh = useCallback(async () => {
    try {
      const { authAPI } = await loadApi();
      const { data } = await authAPI.getMe();
      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setAuthCookie(data.user.role);
    } catch {
      // 401 interceptor handles redirect — no further action needed here
    }
  }, [loadApi]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refresh,
        isAdmin:  user?.role === 'admin',
        isClient: user?.role === 'client',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
