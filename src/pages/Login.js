import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { loginUser } from '../services/firebaseService';
import { LordIcon, Icons } from '../components/LordIcon';
import { AnimatedInput } from '../components/AnimatedInput';
import { Card3D, FloatingElement } from '../components/AnimatedCard';
import { ParallaxBackground } from '../components/ParallaxBackground';
import { useLanguage } from '../contexts/LanguageContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      console.log('Tentative de connexion avec:', email);
      const result = await loginUser(email, password);
      console.log('Connexion réussie:', result);
      
      setTimeout(() => {
        console.log('Redirection vers /dashboard');
        navigate('/dashboard');
      }, 100);
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err.message || t('auth.login.error'));
      setLoading(false);
    }
  };

  const testAccounts = [
    {
      type: t('auth.login.admin'),
      email: 'admin@test.com',
      password: 'admin123',
      icon: 'https://cdn.lordicon.com/lecprnjb.json',
      color: '#D4A853'
    },
    {
      type: t('auth.login.user'),
      email: 'user@test.com',
      password: 'user123',
      icon: Icons.user,
      color: '#60a5fa'
    }
  ];

  const fillTestAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <ParallaxBackground lockScroll>
      <Box
        sx={{
          minHeight: '100vh',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card3D disableTilt>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 5, 
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  zIndex: 1,
                  '&:hover': {
                    transform: 'none',
                    boxShadow: 'none',
                  },
                }}
              >
                {/* Animated background gradient */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '200px',
                    background: 'radial-gradient(circle at 50% 0%, rgba(212, 168, 83, 0.2) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Logo animé */}
                <Box display="flex" justifyContent="center" mb={2} position="relative">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <LordIcon 
                      src={Icons.invoice}
                      trigger="loop"
                      size={100}
                      colors="primary:#D4A853,secondary:#F4D03F"
                    />
                  </motion.div>
                </Box>

                <Typography 
                  variant="h3" 
                  align="center" 
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    color: '#fff',
                    mb: 1,
                    position: 'relative'
                  }}
                >
                  <span className="gradient-text">{t('auth.login.title').split('.')[0]}</span>.{t('auth.login.title').split('.')[1] || 'net'}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  align="center" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    mb: 4,
                    position: 'relative'
                  }}
                >
                  {t('auth.login.subtitle')}
                </Typography>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        '& .MuiAlert-icon': {
                          color: '#ef4444'
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <AnimatedInput
                      label={t('auth.login.email')}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      icon={<Email />}
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <AnimatedInput
                      label={t('auth.login.password')}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      icon={<Lock />}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ 
                          mt: 2,
                          py: 1.8,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
                          color: '#080807',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          boxShadow: '0 4px 16px rgba(212, 168, 83, 0.3)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #F4D03F 0%, #D4A853 100%)',
                            boxShadow: '0 8px 24px rgba(212, 168, 83, 0.5)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                            transition: 'left 0.5s ease',
                          },
                          '&:hover::before': {
                            left: '100%',
                          }
                        }}
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            ⟳
                          </motion.div>
                        ) : (
                          t('auth.login.submit') + ' →'
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>

                <Box textAlign="center" mt={2}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {t('auth.login.noAccount')}{' '}
                    <Button
                      onClick={() => navigate('/register')}
                      sx={{
                        color: '#D4A853',
                        textTransform: 'none',
                        fontWeight: 700,
                        p: 0,
                        minWidth: 'auto',
                        verticalAlign: 'baseline',
                        '&:hover': {
                          background: 'transparent',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {t('auth.login.registerLink')}
                    </Button>
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', px: 2 }}>
                    OU
                  </Typography>
                </Divider>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Box 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.1) 0%, rgba(244, 208, 63, 0.05) 100%)',
                      border: '1px solid rgba(212, 168, 83, 0.2)'
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      align="center" 
                      className="gradient-text"
                      sx={{ mb: 3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}
                    >
                      {t('auth.login.testAccounts')}
                    </Typography>
                    
                    <Box display="flex" gap={2} flexWrap="wrap">
                      {testAccounts.map((account, index) => (
                        <motion.div
                          key={index}
                          style={{ flex: 1, minWidth: '200px' }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Box
                            onClick={() => fillTestAccount(account)}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${account.color}50`,
                              }
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <LordIcon 
                                src={account.icon}
                                trigger="hover"
                                size={24}
                                colors={`primary:${account.color}`}
                              />
                              <Typography variant="body2" fontWeight={700} sx={{ color: account.color }}>
                                {account.type}
                              </Typography>
                            </Box>
                            <Typography variant="caption" display="block" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              {account.email}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              {account.password}
                            </Typography>
                          </Box>
                        </motion.div>
                      ))}
                    </Box>
                  </Box>
                </motion.div>

                {/* Decorative elements */}
                <FloatingElement duration={3} delay={0}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(212, 168, 83, 0.1) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                </FloatingElement>

                <FloatingElement duration={4} delay={1}>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 20,
                      left: 20,
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(244, 208, 63, 0.1) 0%, transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />
                </FloatingElement>
              </Paper>
            </Card3D>
          </motion.div>

          {/* Back to home button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Box display="flex" justifyContent="center" mt={3}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => navigate('/')}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    textTransform: 'none',
                    '&:hover': {
                      color: '#D4A853',
                      background: 'rgba(212, 168, 83, 0.1)',
                    }
                  }}
                >
                  {t('auth.login.backHome')}
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </ParallaxBackground>
  );
};
