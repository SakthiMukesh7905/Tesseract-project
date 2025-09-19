// src/utils/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken'));
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('adminInfo');
    return userData ? JSON.parse(userData) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    setIsAuthenticated(!!token);
    if (token) {
      localStorage.setItem('adminToken', token);
    } else {
      localStorage.removeItem('adminToken');
    }
  }, [token]);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('adminToken', newToken);
    localStorage.setItem('adminInfo', JSON.stringify(userData));
  };

  // Helper function to get user role
  const getUserRole = () => {
    return user?.role || null;
  };

  // Helper function to check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Helper function to check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      getUserRole, 
      hasRole, 
      hasAnyRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
