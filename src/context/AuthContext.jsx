import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = authService.getStoredToken();
    if (storedToken) {
      setToken(storedToken);
      authService.setAuthToken(storedToken);
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      setUser(userData);
    }
    setLoading(false);
  }, []);

  // Shared helper to commit auth state after any login/signup method
  const commitAuth = useCallback((data) => {
    setToken(data.token);
    setUser(data.user);
    authService.setAuthToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    return commitAuth(data);
  };

  const signup = async (userData) => {
    const data = await authService.signup(userData);
    return commitAuth(data);
  };

  const googleLogin = async (credential) => {
    const data = await authService.googleLogin(credential);
    return commitAuth(data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    authService.setAuthToken(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    googleLogin,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
