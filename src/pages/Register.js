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
  Divider,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, Business } from '@mui/icons-material';
import { registerUser } from '../services/firebaseService';
import { LordIcon, Icons } from '../components/LordIcon';
import { AnimatedInput } from '../components/AnimatedInput';
import { Card3D } from '../components/AnimatedCard';
import { ParallaxBackground } from '../components/ParallaxBackground';
import { useLanguage } from '../contexts/LanguageContext';

export const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    entreprise: '',
    telephone: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const steps = [
    t('auth.register.steps.personal'),
    t('auth.register.steps.company'),
    t('auth.register.steps.confirmation'),
  ];

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

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.nom || !formData.email || !formData.password) {
        setError(t('auth.register.errors.fillAll'));
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError(t('auth.register.errors.passwordMismatch'));
        return;
      }
      if (formData.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser({
        email: formData.email.trim(),
        password: formData.password,
        nom: formData.nom.trim(),
        entreprise: formData.entreprise.trim(),
        telephone: formData.telephone.trim(),
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur de création:', err);
      setError(err.message || 'Erreur lors de la création du compte');
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <AnimatedInput
              label={t('auth.register.fields.fullName')}
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
              icon={<Person />}
            />
            <AnimatedInput
              label={t('auth.register.fields.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              icon={<Email />}
            />
            <AnimatedInput
              label={t('auth.register.fields.password')}
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            <AnimatedInput
              label={t('auth.register.fields.confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              icon={<Lock />}
            />
          </>
        );
      case 1:
        return (
          <>
            <AnimatedInput
              label={t('auth.register.fields.company')}
              value={formData.entreprise}
              onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
              icon={<Business />}
            />
            <AnimatedInput
              label={t('auth.register.fields.phone')}
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              icon={<Person />}
            />
          </>
        );
      case 2:
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" sx={{ color: '#D4A853', mb: 3, fontWeight: 700 }}>
              {t('auth.register.summary.title')}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {t('auth.register.summary.name')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                {formData.nom}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {t('auth.register.summary.email')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                {formData.email}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                {t('auth.register.summary.company')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                {formData.entreprise || t('auth.register.summary.notProvided')}
              </Typography>
            </Box>
          </Box>
        );
      default:
        return null;
    }
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
        <Container maxWidth="md">
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
                <Box display="flex" justifyContent="center" mb={3}>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <LordIcon
                      src={Icons.invoice}
                      trigger="loop"
                      size={80}
                      colors="primary:#D4A853,secondary:#F4D03F"
                    />
                  </motion.div>
                </Box>

                <Typography
                  variant="h3"
                  align="center"
                  sx={{ fontWeight: 800, color: '#fff', mb: 1 }}
                >
                  {t('auth.register.title')}
                </Typography>

                <Typography
                  variant="body1"
                  align="center"
                  sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 4 }}
                >
                  {t('auth.register.subtitle')}
                </Typography>

                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel
                        sx={{
                          '& .MuiStepLabel-label': {
                            color: 'rgba(255, 255, 255, 0.5)',
                            '&.Mui-active': { color: '#D4A853' },
                            '&.Mui-completed': { color: '#4ade80' },
                          },
                          '& .MuiStepIcon-root': {
                            color: 'rgba(255, 255, 255, 0.2)',
                            '&.Mui-active': { color: '#D4A853' },
                            '&.Mui-completed': { color: '#4ade80' },
                          },
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {error && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Alert
                      severity="error"
                      sx={{
                        mb: 3,
                        borderRadius: 2,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      {error}
                    </Alert>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                  {renderStepContent(activeStep)}

                  <Box display="flex" gap={2} mt={4}>
                    {activeStep > 0 && (
                      <Button
                        type="button"
                        onClick={handleBack}
                        sx={{
                          flex: 1,
                          py: 1.8,
                          borderRadius: 2,
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          fontWeight: 600,
                          '&:hover': { background: 'rgba(255, 255, 255, 0.05)' },
                        }}
                      >
                        {t('auth.register.buttons.back')}
                      </Button>
                    )}

                    {activeStep < steps.length - 1 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        variant="contained"
                        sx={{
                          flex: 1,
                          py: 1.8,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
                          color: '#080807',
                          fontWeight: 700,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #F4D03F 0%, #D4A853 100%)',
                          },
                        }}
                      >
                        {t('auth.register.buttons.next')}
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                          flex: 1,
                          py: 1.8,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
                          color: '#080807',
                          fontWeight: 700,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #F4D03F 0%, #D4A853 100%)',
                          },
                        }}
                      >
                        {loading ? t('auth.register.buttons.creating') : t('auth.register.buttons.create')}
                      </Button>
                    )}
                  </Box>
                </form>

                <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                <Box textAlign="center">
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {t('auth.register.hasAccount')}{' '}
                    <Button
                      onClick={() => navigate('/login')}
                      sx={{
                        color: '#D4A853',
                        textTransform: 'none',
                        fontWeight: 700,
                        '&:hover': { background: 'rgba(212, 168, 83, 0.1)' },
                      }}
                    >
                      {t('auth.register.loginLink')}
                    </Button>
                  </Typography>
                </Box>
              </Paper>
            </Card3D>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Box display="flex" justifyContent="center" mt={3}>
              <Button
                onClick={() => navigate('/')}
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'none',
                  '&:hover': {
                    color: '#D4A853',
                    background: 'rgba(212, 168, 83, 0.1)',
                  },
                }}
              >
                {t('auth.register.backHome')}
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </ParallaxBackground>
  );
};
