import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
      // Always try /auth/me — it works via cookie (httpOnly) or Bearer token header
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
          // Ensure token is set if returned
          if (response.data.token) {
            setToken(response.data.token);
            localStorage.setItem('token', response.data.token);
          }
        } else {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', { email, password, rememberMe });
      if (response.data.success) {
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        if (authToken) {
          localStorage.setItem('token', authToken);
        }
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: response.data.message || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const register = async (email, name, password) => {
    try {
      const response = await api.post('/auth/register', { email, name, password });
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
      return { success: false, error: response.data.message || 'Registration failed' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
        return response.data.user;
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
    return null;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  // Role helpers — aligned with DB role values (citizen, panchayat, admin, verifier, ngo, community)
  const isNCCR = () => user?.role === 'admin' || user?.role === 'verifier' || user?.role === 'nccr';
  const isPanchayat = () => user?.role === 'panchayat';
  const isUser = () => user?.role === 'citizen' || user?.role === 'ngo' || user?.role === 'community';

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,   // Fixed: rely on user, not token (token may not exist with cookie auth)
    isNCCR,
    isPanchayat,
    isUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
