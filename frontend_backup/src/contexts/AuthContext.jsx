import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, setAccessToken } from '../services/apiClient';
import * as authApi from '../services/api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing refresh token on app load
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      // Attempt to refresh the token and get user profile
      refresh()
        .then(() => {
          // Successfully refreshed, user state is set
        })
        .catch(() => {
          // Refresh failed, clear any stored tokens
          localStorage.removeItem('refreshToken');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      
      if (response.success) {
        // Store refresh token in localStorage
        // TODO: Replace with secure httpOnly cookies in production
        localStorage.setItem('refreshToken', response.data.refresh);
        
        // Store access token in memory
        setAccessToken(response.data.access);
        
        // Get user profile
        const profileResponse = await authApi.profile();
        if (profileResponse.success) {
          setUser(profileResponse.data);
        }
        
        return { success: true, user: profileResponse.data };
      } else {
        return { success: false, error: response.error?.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (data) => {
    try {
      const response = await authApi.register(data);
      
      if (response.success) {
        // Store refresh token in localStorage
        // TODO: Replace with secure httpOnly cookies in production
        localStorage.setItem('refreshToken', response.data.refresh);
        
        // Store access token in memory
        setAccessToken(response.data.access);
        
        // Get user profile
        const profileResponse = await authApi.profile();
        if (profileResponse.success) {
          setUser(profileResponse.data);
        }
        
        return { success: true, user: profileResponse.data };
      } else {
        return { success: false, error: response.error?.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear tokens regardless of backend response
      localStorage.removeItem('refreshToken');
      setAccessToken(null);
      setUser(null);
    }
  };

  const refresh = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authApi.refresh(refreshToken);
      
      if (response.success) {
        // Update tokens
        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh;
        
        // Update in-memory access token
        setAccessToken(newAccessToken);
        
        // Update refresh token in localStorage
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Get user profile
        const profileResponse = await authApi.profile();
        if (profileResponse.success) {
          setUser(profileResponse.data);
        }
        
        return { success: true };
      } else {
        throw new Error(response.error?.message || 'Token refresh failed');
      }
    } catch (error) {
      // Clear tokens on refresh failure
      localStorage.removeItem('refreshToken');
      setAccessToken(null);
      setUser(null);
      throw error;
    }
  };

  const getAuthHeaders = () => {
    // This function is primarily for use in apiClient.js
    return {};
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    refresh,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};