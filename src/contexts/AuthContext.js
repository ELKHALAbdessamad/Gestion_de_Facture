import React, { createContext, useState, useEffect, useContext } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { onAuthChange, getUserRole, logoutUser } from '../services/firebaseService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const AuthLoadingScreen = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080807',
    }}
  >
    <CircularProgress sx={{ color: '#D4A853' }} />
  </Box>
);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const finishLoading = () => {
      if (mounted) setLoading(false);
    };

    const unsubscribe = onAuthChange(async (user) => {
      if (!mounted) return;
      setCurrentUser(user);
      try {
        if (user) {
          const role = await getUserRole(user.uid);
          if (mounted) setUserRole(role);
        } else if (mounted) {
          setUserRole(null);
        }
      } catch (err) {
        console.error('Erreur chargement rôle:', err);
        if (mounted) setUserRole(null);
      } finally {
        finishLoading();
      }
    });

    const timeout = setTimeout(finishLoading, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setUserRole(null);
  };

  const value = {
    currentUser,
    userRole,
    loading,
    logout,
    isAdmin: userRole === 'admin',
    isUser: userRole === 'user'
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <AuthLoadingScreen /> : children}
    </AuthContext.Provider>
  );
};
