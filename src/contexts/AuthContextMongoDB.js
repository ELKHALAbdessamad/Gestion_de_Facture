import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, register as registerService, logout as logoutService, getCurrentUser } from '../services/mongodbService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté
    const user = getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginService(email, password);
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await registerService(userData);
      setCurrentUser(data.user);
      return data;
    } catch (error) {
      console.error('Erreur register:', error);
      // Extraire le message d'erreur du backend
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.details 
        || error.message 
        || 'Erreur lors de la création du compte';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    logoutService();
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'admin';

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
