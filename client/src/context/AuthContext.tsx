import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '../types';
import { api } from '../services/api';
import { getSupabase, isSupabaseConfigured } from '../services/supabase';
import { authError, errorText, isUnconfirmedAuthError, isUnverifiedText, mapSupabaseAuthError } from '../utils/authErrors';

export type RegisterPayload = { name: string; email: string; password: string; phone?: string };

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<{ needsConfirmation: boolean; user: User | null }>;
  confirmSignup: (email: string, token: string, payload: RegisterPayload) => Promise<User>;
  resendSignup: (email: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthState | null>(null);

function requireSupabase() {
  const supabase = getSupabase();
  if (!supabase) throw authError('authNotConfigured');
  return supabase;
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

  const finishLocalAccount = async (payload: RegisterPayload) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      return acceptSession(data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        const { data } = await api.post('/auth/login', { email: payload.email, password: payload.password });
        return acceptSession(data);
      }
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      return acceptSession(data);
    } catch (err) {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (isUnconfirmedAuthError(error) || isUnverifiedText(error?.message) || (data.user && !data.user.email_confirmed_at)) {
          throw authError('authEmailNotConfirmed', { needsConfirmation: true, email });
        }
        if (!error && data.user?.email_confirmed_at) {
          const meta = data.user.user_metadata || {};
          return finishLocalAccount({
            name: String(meta.name || email.split('@')[0]),
            email,
            password,
            phone: meta.phone ? String(meta.phone) : undefined,
          });
        }
      }
      if (isUnverifiedText(errorText(err))) {
        throw authError('authEmailNotConfirmed', { needsConfirmation: true, email });
      }
      throw err;
    }
  };

  const register = async (payload: RegisterPayload) => {
    if (!isSupabaseConfigured()) throw authError('authNotConfigured');
    const supabase = requireSupabase();
    const email = payload.email.trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: payload.password,
      options: {
        data: { name: payload.name, phone: payload.phone || '' },
      },
    });

    if (error) throw authError(mapSupabaseAuthError(error));
    if (data.user?.identities && data.user.identities.length === 0) {
      throw authError('authEmailTaken');
    }

    if (data.session && data.user?.email_confirmed_at) {
      const user = await finishLocalAccount({ ...payload, email });
      return { needsConfirmation: false, user };
    }

    return { needsConfirmation: true, user: null };
  };

  const confirmSignup = async (email: string, token: string, payload: RegisterPayload) => {
    const code = token.trim();
    if (!code) throw authError('codeRequired');
    const supabase = requireSupabase();
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: 'signup',
    });
    if (error) throw authError(mapSupabaseAuthError(error));
    if (!data.user?.email_confirmed_at && !data.session) {
      throw authError('authCodeInvalid');
    }
    return finishLocalAccount({ ...payload, email: email.trim() });
  };

  const resendSignup = async (email: string) => {
    const supabase = requireSupabase();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });
    if (error) throw authError(mapSupabaseAuthError(error));
  };

  const logout = () => {
    localStorage.removeItem('ah_token');
    setToken(null);
    setUser(null);
    const supabase = getSupabase();
    if (supabase) void supabase.auth.signOut();
  };

  const refresh = async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, confirmSignup, resendSignup, logout, refresh, setUser }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth');
  return ctx;
}
