// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import config from '../config/config';

const AuthContext = createContext();

// ✅ FIX: Safer useAuth hook
export const useAuth = () => {
  try {
    const context = useContext(AuthContext);
    if (!context) {
      console.warn('useAuth used outside AuthProvider');
      // Return a fallback context instead of throwing
      return {
        user: null,
        loading: false,
        authError: null,
        login: () => Promise.reject(new Error('Not authenticated')),
        loginWithCredentials: () => Promise.reject(new Error('Not authenticated')),
        register: () => Promise.reject(new Error('Not authenticated')),
        logout: () => {},
        updateProfile: () => {},
        checkPermission: () => false,
        isCourseAccessible: () => false,
        isAuthenticated: false,
        isAdmin: false,
        isStudent: false
      };
    }
    return context;
  } catch (error) {
    console.error('Error in useAuth hook:', error);
    throw new Error('Invalid credentials');
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check localStorage on app start
    try {
      const savedUser = localStorage.getItem(config.AUTH.USER_KEY);
      const savedToken = localStorage.getItem(config.AUTH.TOKEN_KEY);
      
      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading auth from localStorage:', error);
      // Clear invalid data
      localStorage.removeItem(config.AUTH.TOKEN_KEY);
      localStorage.removeItem(config.AUTH.USER_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIX: Simpler login function
  const login = async (userData, token) => {
    try {
      setAuthError(null);
      
      if (!userData || !token) {
        throw new Error('Invalid login data');
      }
      
      // Store in localStorage
      localStorage.setItem(config.AUTH.TOKEN_KEY, token);
      localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(userData));
      setUser(userData);
      
      return { user: userData, token };
      
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  const loginWithCredentials = async (email, password) => {
    try {
      setAuthError(null);
      
      const response = await fetch('https://study-portal-ill8.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(config.AUTH.TOKEN_KEY, data.access_token);
        localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
        return data;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login with credentials error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      setAuthError(null);
      
      const response = await fetch('https://study-portal-ill8.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(config.AUTH.TOKEN_KEY);
    localStorage.removeItem(config.AUTH.USER_KEY);
    setUser(null);
    setAuthError(null);
    window.location.href = '/';
  };

  const updateProfile = (updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData };
      localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const checkPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(permission) || false;
  };

  const isCourseAccessible = (courseId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.role === 'student' || user.role === 'user';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      authError,
      login, 
      loginWithCredentials,
      register,
      logout,
      updateProfile,
      checkPermission,
      isCourseAccessible,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isStudent: user?.role === 'student' || user?.role === 'user'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
