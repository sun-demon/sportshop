import { useState, useEffect, createContext, useContext } from 'react';
import {
  getMe,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  updateMe as apiUpdateMe,
  sendFeedback as apiSendFeedback,
} from '../services/api';
import type { IUser } from '@sportshop/shared-types';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { email?: string; name?: string; password?: string }) => Promise<void>;
  sendFeedback: (data: { subject: string; message: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incomingAccessToken = params.get('accessToken');
    const incomingRefreshToken = params.get('refreshToken');
    if (incomingAccessToken) localStorage.setItem('accessToken', incomingAccessToken);
    if (incomingAccessToken) {
      if (incomingRefreshToken) localStorage.setItem('refreshToken', incomingRefreshToken);
      else localStorage.removeItem('refreshToken');
    }
    if (incomingAccessToken || incomingRefreshToken) {
      const nextUrl = `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      getMe()
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'accessToken' && e.key !== 'refreshToken') return;
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        return;
      }
      void getMe().then(({ data }) => setUser(data)).catch(() => setUser(null));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await apiLogin(email, password);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name?: string) => {
    const { data } = await apiRegister(email, password, name);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await apiLogout(refreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const updateProfile = async (data: { email?: string; name?: string; password?: string }) => {
    const { data: response } = await apiUpdateMe(data);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setUser(response.user);
  };

  const sendFeedback = async (data: { subject: string; message: string }) => {
    await apiSendFeedback(data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, sendFeedback }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
