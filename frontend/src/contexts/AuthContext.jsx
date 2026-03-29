import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const register = async (userData) => {
    setError(null);
    try {
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      const errorMessage = err.errors || err.detail || 'Registration failed';
      setError(errorMessage);
      throw err;
    }
  };

  const login = async (username, password) => {
    setError(null);
    try {
      const response = await authService.login(username, password);
      const userInfo = response.user || authService.getUser();
      setUser(userInfo);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      const errorMessage = err.detail || err.non_field_errors?.[0] || 'Login failed';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      if (response.user) {
        setUser(response.user);
      }
      return response;
    } catch (err) {
      const errorMessage = err.errors || 'Profile update failed';
      setError(errorMessage);
      throw err;
    }
  };

  const changePassword = async (oldPassword, newPassword, newPasswordConfirm) => {
    try {
      const response = await authService.changePassword(oldPassword, newPassword, newPasswordConfirm);
      return response;
    } catch (err) {
      const errorMessage = err.errors || 'Password change failed';
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
