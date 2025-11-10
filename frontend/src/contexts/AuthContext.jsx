import React, { createContext, useState, useContext, useEffect } from 'react';

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
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simulate API call - replace with actual backend endpoint
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user || {
          id: '1',
          email: email,
          name: email.split('@')[0],
          role: data.role || 'ngo', // ngo, community, panchayat, admin
          organization: data.organization || 'Sample Organization',
        };
        
        setUser(userData);
        setToken(data.token || 'mock-token');
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token || 'mock-token');
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Login failed' };
      }
    } catch (error) {
      // Mock login for demo - remove in production
      const mockUser = {
        id: '1',
        email: email,
        name: email.split('@')[0],
        role: 'ngo',
        organization: 'Sample NGO',
      };
      setUser(mockUser);
      setToken('mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-token');
      return { success: true };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Registration failed' };
      }
    } catch (error) {
      // Mock registration for demo
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        role: userData.role || 'ngo',
        organization: userData.organization,
      };
      setUser(newUser);
      setToken('mock-token');
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('token', 'mock-token');
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isAdmin = () => user?.role === 'admin';
  const isNGO = () => user?.role === 'ngo';
  const isCommunity = () => user?.role === 'community';
  const isPanchayat = () => user?.role === 'panchayat';

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isNGO,
    isCommunity,
    isPanchayat,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

