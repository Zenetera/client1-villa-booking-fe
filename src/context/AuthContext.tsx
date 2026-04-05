import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from '../hooks/useAuth';
import { loginApi } from '../api/auth';
import { setToken, clearToken, getToken } from '../api/client';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => getToken() !== null,
  );

  const login = async (username: string, password: string): Promise<void> => {
    const token = await loginApi(username, password);
    setToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearToken();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
