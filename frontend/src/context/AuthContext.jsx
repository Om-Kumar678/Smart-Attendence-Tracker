import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login as authenticate, MOCK_MODE } from '../services/authService.js';
import { setApiToken, setUnauthorizedHandler } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setApiToken(null);
  }, []);

  useEffect(() => setUnauthorizedHandler(logout), [logout]);

  const signIn = useCallback(async (credentials) => {
    const result = await authenticate(credentials);
    setToken(result.token);
    setApiToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const updateUser = useCallback((updates) => setUser((current) => current ? { ...current, ...updates } : current), []);
  const value = useMemo(() => ({ user, token, ready, signIn, logout, updateUser, mockMode: MOCK_MODE }), [user, token, ready, signIn, logout, updateUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
