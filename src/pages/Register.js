import React, { useState } from 'react';
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
import { LordIcon, Icons } from '../components/LordIcon';
import { AnimatedInput } from '../components/AnimatedInput';
import { Card3D } from '../components/AnimatedCard';
import { ParallaxBackground } from '../components/ParallaxBackground';

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

  const steps = ['Informations personnelles', 'Informations entreprise', 'Confirmation'];

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.nom || !formData.email || !formData.password) {
        setError('Veuillez remplir tous les champs');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Simulation de création de compte
      setTimeout(() => {
        console.log('Compte créé:', formData);
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Erreur de création:', err);
      setError('Erreur lors de la création du compte');
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <AnimatedInput
              label="Nom complet"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
              icon={<Person />}
            />
            <AnimatedInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              icon={<Email />}
            />
            <AnimatedInput
              label="Mot de passe"
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
              label="Confirmer le mot de passe"
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
              label="Nom de l'entreprise"
              value={formData.entreprise}
              onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
              required
              icon={<Business />}
            />
            <AnimatedInput
              label="Téléphone"
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
              Récapitulatif
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Nom
              </Typography>
              <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                {formData.nom}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Email
              </Typography>
              <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                {formData.email}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Entreprise
              </Typography>
              <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                {formData.entreprise || 'Non renseigné'}
              </Typography>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <ParallaxBackground>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card3D>
              <Paper 
                elevation={0}
                className="bento-card"
                sx={{ 
                  p: 5, 
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Logo */}
                <Box display="flex" justifyContent="center" mb={3}>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
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
                  sx={{
                    fontWeight: 800,
                    color: '#fff',
                    mb: 1
                  }}
                >
                  Créer un compte
                </Typography>
                
                <Typography 
                  variant="body1" 
                  align="center" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    mb: 4
                  }}
                >
                  Rejoignez des milliers d'entrepreneurs satisfaits
                </Typography>

                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel
                        sx={{
                          '& .MuiStepLabel-label': {
                            color: 'rgba(255, 255, 255, 0.5)',
                            '&.Mui-active': {
                              color: '#D4A853',
                            },
                            '&.Mui-completed': {
                              color: '#4ade80',
                            },
                          },
                          '& .MuiStepIcon-root': {
                            color: 'rgba(255, 255, 255, 0.2)',
                            '&.Mui-active': {
                              color: '#D4A853',
                            },
                            '&.Mui-completed': {
                              color: '#4ade80',
                            },
                          },
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
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
                        onClick={handleBack}
                        sx={{
                          flex: 1,
                          py: 1.8,
                          borderRadius: 2,
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.05)',
                          }
                        }}
                      >
                        Retour
                      </Button>
                    )}
                    
                    {activeStep < steps.length - 1 ? (
                      <Button
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
                          }
                        }}
                      >
                        Suivant
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
                          }
                        }}
                      >
                        {loading ? 'Création...' : 'Créer mon compte'}
                      </Button>
                    )}
                  </Box>
                </form>
                
                <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                <Box textAlign="center">
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Vous avez déjà un compte ?{' '}
                    <Button
                      onClick={() => navigate('/login')}
                      sx={{
                        color: '#D4A853',
                        textTransform: 'none',
                        fontWeight: 700,
                        '&:hover': {
                          background: 'rgba(212, 168, 83, 0.1)',
                        }
                      }}
                    >
                      Se connecter
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
                  }
                }}
              >
                ← Retour à l'accueil
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </ParallaxBackground>
  );
};
