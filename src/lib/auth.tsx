import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from './models';

const USERS_KEY = 'cc_users';
const SESSION_KEY = 'cc_session';

interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  getInitials: (name: string) => string;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadSession(): User | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function getUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(loadSession);

  const setSession = useCallback((user: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const user = getUsers().find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, error: 'Correo o contraseña incorrectos' };
    setSession(user);
    return { ok: true };
  }, [setSession]);

  const register = useCallback((name: string, email: string, password: string) => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return { ok: false, error: 'Este correo ya está registrado' };
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      name, email, password,
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    setSession(newUser);
    return { ok: true };
  }, [setSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  const getInitials = useCallback((name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isLoggedIn: !!currentUser, login, register, logout, getInitials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
