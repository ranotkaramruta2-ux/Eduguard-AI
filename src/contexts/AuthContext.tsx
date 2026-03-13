import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/utils/constants';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demo
const MOCK_USERS: (User & { password: string })[] = [
  { id: '1', name: 'Dr. Sarah Mitchell', email: 'teacher@demo.com', password: 'password', role: 'teacher' },
  { id: '2', name: 'Alex Johnson', email: 'student@demo.com', password: 'password', role: 'student' },
  { id: '3', name: 'Dr. Emily Chen', email: 'counselor@demo.com', password: 'password', role: 'counselor' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { user: parsed.user, token: parsed.token, isAuthenticated: true };
      } catch { /* ignore */ }
    }
    return { user: null, token: null, isAuthenticated: false };
  });

  useEffect(() => {
    if (state.isAuthenticated) {
      localStorage.setItem('auth', JSON.stringify({ user: state.user, token: state.token }));
    } else {
      localStorage.removeItem('auth');
    }
  }, [state]);

  const login = useCallback(async (email: string, password: string) => {
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid credentials');
    const { password: _, ...user } = found;
    setState({ user, token: 'mock-jwt-token-' + user.id, isAuthenticated: true });
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string, role: UserRole) => {
    await new Promise(r => setTimeout(r, 800));
    if (MOCK_USERS.find(u => u.email === email)) throw new Error('Email already registered');
    const user: User = { id: Date.now().toString(), name, email, role };
    setState({ user, token: 'mock-jwt-token-' + user.id, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, token: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
