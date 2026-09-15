import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '../types';
import { api } from '../services/api';
import { authError, errorText, mapApiAuthMessage } from '../utils/authErrors';

export type RegisterPayload = { name: string; email: string; password: string; phone?: string };

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<{ needsConfirmation: boolean; user: User | null }>;
  confirmSignup: (email: string, token: string, payload?: RegisterPayload) => Promise<User>;
  resendSignup: (email: string) => Promise<void>;
  requestPasswordReset: (identifier: string) => Promise<{ email: string }>;
  confirmPasswordReset: (email: string, token: string, password?: string) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthState | null>(null);

function throwMapped(err: unknown): never {
  const key = mapApiAuthMessage(errorText(err));
  if (key) throw authError(key);
  throw err;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ah_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        localStorage.removeItem('ah_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const acceptSession = (data: { token: string; user: User }) => {
    localStorage.setItem('ah_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user as User;
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      return acceptSession(data);
    } catch (err) {
      throwMapped(err);
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      return { needsConfirmation: Boolean(data?.needsConfirmation), user: null };
    } catch (err) {
      throwMapped(err);
    }
  };

  const confirmSignup = async (email: string, token: string) => {
    const code = token.trim();
    if (!code) throw authError('codeRequired');
    try {
      const { data } = await api.post('/auth/register/confirm', { email: email.trim(), code });
      return acceptSession(data);
    } catch (err) {
      throwMapped(err);
    }
  };

  const resendSignup = async (email: string) => {
    try {
      await api.post('/auth/register/resend', { email: email.trim() });
    } catch (err) {
      throwMapped(err);
    }
  };

  const requestPasswordReset = async (identifier: string) => {
    const raw = identifier.trim();
    if (!raw) throw authError('authInvalidEmail');
    try {
      const { data } = await api.post('/auth/recover', { identifier: raw });
      const email = String(data?.email || '').trim();
      if (!email) throw authError('authAccountNotFound');
      return { email };
    } catch (err) {
      throwMapped(err);
    }
  };

  const confirmPasswordReset = async (email: string, token: string, password?: string) => {
    const code = token.trim();
    if (!code) throw authError('codeRequired');
    if (!email) throw authError('authCodeInvalid');
    try {
      const { data } = await api.post('/auth/reset-password', {
        email: email.trim(),
        code,
        password: (password || code).trim() || code,
      });
      return acceptSession(data);
    } catch (err) {
      throwMapped(err);
    }
  };

  const logout = () => {
    localStorage.removeItem('ah_token');
    setToken(null);
    setUser(null);
  };

  const refresh = async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, confirmSignup, resendSignup, requestPasswordReset, confirmPasswordReset, logout, refresh, setUser }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth');
  return ctx;
}
