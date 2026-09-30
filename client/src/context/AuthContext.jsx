import { createContext, useContext, useEffect, useState } from 'react';
import { request, send } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('recall-token')) { setLoading(false); return; }
    request('/auth/me').then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => localStorage.removeItem('recall-token'))
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(path, credentials) {
    const result = await request(path, send('POST', credentials));
    localStorage.setItem('recall-token', result.token);
    setUser(result.user);
    return result.user;
  }

  function logout() {
    localStorage.removeItem('recall-token');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, authenticate, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
