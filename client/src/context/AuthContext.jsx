import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dmart_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch initial profile if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getMe();
        setUser(res.user);
      } catch (err) {
        console.error('Auth verification failed:', err.message);
        localStorage.removeItem('dmart_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    localStorage.setItem('dmart_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    localStorage.setItem('dmart_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('dmart_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    role: user?.role || 'guest',
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
