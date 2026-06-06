import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('niraa_user');
    
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('niraa_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('niraa_user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('niraa_token', token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('niraa_user');
    localStorage.removeItem('niraa_token');
  };

  const updateProfile = (updatedUserData, token) => {
    setUser(updatedUserData);
    localStorage.setItem('niraa_user', JSON.stringify(updatedUserData));
    if (token) {
      localStorage.setItem('niraa_token', token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
