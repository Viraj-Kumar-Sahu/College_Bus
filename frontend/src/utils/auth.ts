import { User } from '@/contexts/AuthContext';

export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const getUserRole = (): string | null => {
  const user = getUser();
  return user?.role || null;
};

export const logout = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
