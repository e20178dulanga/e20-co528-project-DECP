import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(() => localStorage.getItem('decp_token'));
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async (tkn) => {
    if (!tkn) { setLoading(false); return; }
    try {
      const res = await getProfile(tkn);
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('decp_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(token); }, [token, loadUser]);

  const loginSuccess = (newToken, userData) => {
    localStorage.setItem('decp_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('decp_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginSuccess, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
