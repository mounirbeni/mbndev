'use client';

import {
  createContext, useContext, useEffect, useState,
  ReactNode, useCallback, useRef,
} from 'react';
import { authAPI, resetUnauthorizedFlag } from '@/lib/api';
import { User } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user:       User | null;
  token:      string | null;
  loading:    boolean;
  login:      (email: string, password: string) => Promise<void>;
  register:   (data: RegisterData) => Promise<void>;
  logout:     () => void;
  refresh:    () => Promise<void>;
  isAdmin:    boolean;
  isClient:   boolean;
}

interface RegisterData {
  name:     string;
  email:    string;
  password: string;
  company?: string;
  phone?:   string;
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

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Track whether a background /auth/me check is already in-flight
  const checkingRef = useRef(false);

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

    authAPI.getMe()
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
  }, []); // runs once on mount

  // ── persistSession ────────────────────────────────────────────────────────
  const persistSession = useCallback((newToken: string, newUser: User) => {
    resetUnauthorizedFlag();
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setAuthCookie(newUser.role);
    setToken(newToken);
    setUser(newUser);
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const { data } = await authAPI.login({ email, password });
    persistSession(data.token, data.user);
  };

  // ── register ──────────────────────────────────────────────────────────────
  const register = async (registerData: RegisterData) => {
    const { data } = await authAPI.register(registerData);
    persistSession(data.token, data.user);
  };

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearAuthCookie();
    setToken(null);
    setUser(null);
  }, []);

  // ── refresh ───────────────────────────────────────────────────────────────
  // Syncs the cached user object with the latest data from the server.
  // Call after profile updates or plan changes.
  const refresh = useCallback(async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setAuthCookie(data.user.role);
    } catch {
      // 401 interceptor handles redirect — no further action needed here
    }
  }, []);

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
