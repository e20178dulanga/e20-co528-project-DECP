import React, { createContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import { apiAuth } from '../api/config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadToken = async () => {
    try {
      const token = await storage.getItem('userToken');
      const userData = await storage.getItem('userData');
      if (token && userData) {
        setUserToken(token);
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.error('Failed to load token', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiAuth.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      await storage.setItem('userToken', token);
      await storage.setItem('userData', JSON.stringify(user));
      
      setUserToken(token);
      setUser(user);
    } catch (error) {
      console.error('Login error', error.response?.data || error);
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await apiAuth.post('/auth/register', { name, email, password, role });
      const { token, user: userData, message } = response.data;

      // If backend returns a token (admin auto-approved), log in immediately
      if (token) {
        await storage.setItem('userToken', token);
        await storage.setItem('userData', JSON.stringify(userData));
        setUserToken(token);
        setUser(userData);
      }

      // Return the message so the screen can display it
      return message || 'Registration successful!';
    } catch (error) {
      console.error('Register error', error.response?.data || error);
      throw error;
    }
  };

  const logout = async () => {
    await storage.removeItem('userToken');
    await storage.removeItem('userData');
    setUserToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      userToken, user, isLoading, login, register, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
