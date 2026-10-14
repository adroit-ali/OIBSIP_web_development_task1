import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getAuthToken, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        }
      } catch {
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.token) {
        setAuthToken(res.token);
        setUser(res.user);
        return res;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const adminLogin = async (email, password, adminKey) => {
    setError(null);
    try {
      const res = await authApi.adminLogin({ email, password, adminKey });
      if (res.success && res.token) {
        setAuthToken(res.token);
        setUser(res.user);
        return res;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await authApi.register({ name, email, password });
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        adminLogin,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
