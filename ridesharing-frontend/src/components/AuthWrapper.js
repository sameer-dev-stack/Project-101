import React, { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthWrapper = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userData);
        
        // Validate token with backend
        validateToken(savedToken);
      } catch (err) {
        console.error('Error parsing saved user data:', err);
        logout();
      }
    }
    
    setLoading(false);
  }, []);

  const validateToken = async (authToken) => {
    try {
      const response = await fetch('http://localhost:3001/api/ridesharing/validate-user', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Token validation failed');
      }

      const data = await response.json();
      
      if (data.valid) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Token validation error:', err);
      logout();
    }
  };

  const login = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    
    // Save to localStorage
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    setError(null);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!token && !!user
  };

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to auth service
    window.location.href = 'http://localhost:9002';
    return (
      <div className="auth-redirect">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return children;
};