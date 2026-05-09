'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { authAPI } from '@/lib/api';
import { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  isAdmin: boolean;
  isClient: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  company?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'mbndev_token';
const USER_KEY  = 'mbndev_user';
// Cookie consumed by Next.js middleware for SSR-level route guarding.
// Stores ONLY the role ('client' | 'admin'), not the JWT. JWT stays in
// localStorage; this cookie just signals "is logged in" to the edge.
const AUTH_COOKIE = 'mbndev_auth';

function setAuthCookie(role: string) {
  if (typeof document === 'undefined') return;
  // 7 days, samesite=lax, path=/
  // No httpOnly flag because middleware reads it; not a security boundary.
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${AUTH_COOKIE}=${role}; path=/; max-age=${maxAge}; samesite=lax`;
}

function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session + verify token freshness on mount.
  // Calling /auth/me catches: revoked tokens, deactivated accounts,
  // server-side profile changes (e.g. plan upgrade) made by admin.
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem(USER_KEY);
    if (!storedToken || !storedUser) {
      setLoading(false);
      return;
    }

    // Optimistic: show cached user immediately
    try {
      const cached = JSON.parse(storedUser) as User;
      setToken(storedToken);
      setUser(cached);
      setAuthCookie(cached.role);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    // Then verify against backend in the background
    authAPI.getMe()
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setAuthCookie(data.user.role);
      })
      .catch(() => {
        // 401 interceptor in api.ts handles the redirect
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = useCallback((token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setAuthCookie(user.role);
    setToken(token);
    setUser(user);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await authAPI.login({ email, password });
    persistSession(data.token, data.user);
  };

  const register = async (registerData: RegisterData) => {
    const { data } = await authAPI.register(registerData);
    persistSession(data.token, data.user);
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearAuthCookie();
    setToken(null);
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setAuthCookie(data.user.role);
    } catch {
      // Interceptor will handle 401
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
        isAdmin: user?.role === 'admin',
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
