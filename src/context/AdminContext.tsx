import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AdminContextType {
  token: string;
  login: (token: string) => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') || '');

  function login(t: string) { setToken(t); sessionStorage.setItem('admin_token', t); }
  function logout() { setToken(''); sessionStorage.removeItem('admin_token'); }

  return <AdminContext.Provider value={{ token, login, logout }}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
