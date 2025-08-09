import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Check for existing auth token
    const token = localStorage.getItem('civitens_token');
    const userData = localStorage.getItem('civitens_user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('civitens_token');
        localStorage.removeItem('civitens_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // This would normally be an API call to Django backend
      // For now, we'll simulate a successful login
      const userData = {
        id: 1,
        email,
        name: email.split('@')[0],
        role: 'citizen'
      };
      
      const token = 'mock_jwt_token_' + Date.now();
      
      localStorage.setItem('civitens_token', token);
      localStorage.setItem('civitens_user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (name, email, password, role = 'citizen') => {
    try {
      // This would normally be an API call to Django backend
      const userData = {
        id: Date.now(),
        email,
        name,
        role
      };
      
      const token = 'mock_jwt_token_' + Date.now();
      
      localStorage.setItem('civitens_token', token);
      localStorage.setItem('civitens_user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('civitens_token');
    localStorage.removeItem('civitens_user');
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};