import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  AppBar,
  Toolbar,
  Avatar,
  Rating
} from '@mui/material';
import { LordIcon, Icons } from '../components/LordIcon';
import { AnimatedCard, Card3D, FloatingElement } from '../components/AnimatedCard';
import { ParallaxBackground } from '../components/ParallaxBackground';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Icons.invoice,
      title: 'Facturation Intelligente',
      description: 'Créez des factures professionnelles en 60 secondes avec notre IA',
      color: '#D4A853'
    },
    {
      icon: Icons.users,
      title: 'Gestion Clients',
      description: 'Base de données clients avec historique complet et analytics',
      color: '#60a5fa'
    },
    {
      icon: Icons.chart,
      title: 'Analytics Avancés',
      description: 'Tableaux de bord en temps réel avec prédictions IA',
      color: '#4ade80'
    },
    {
      icon: Icons.pdf,
      title: 'Export Multi-format',
      description: 'PDF, Excel, CSV avec templates personnalisables',
      color: '#f59e0b'
    },
    {
      icon: Icons.settings,
      title: 'Automatisation',
      description: 'Relances automatiques et rappels intelligents',
      color: '#8b5cf6'
    },
    {
      icon: Icons.success,
      title: 'Paiements Rapides',
      description: 'Intégration avec tous les moyens de paiement',
      color: '#ec4899'
    }
  ];

  const testimonials = [
    {
      name: 'Sophie Martin',
      role: 'CEO, TechStart',
      avatar: 'S',
      rating: 5,
      text: 'Cette application a transformé notre processus de facturation. Gain de temps incroyable!'
    },
    {
      name: 'Marc Dubois',
      role: 'Freelance Designer',
      avatar: 'M',
      rating: 5,
      text: 'Interface magnifique et intuitive. Je recommande à tous les indépendants.'
    },
    {
      name: 'Julie Renard',
      role: 'Comptable',
      avatar: 'J',
      rating: 5,
      text: 'Les fonctionnalités avancées sont exactement ce dont nous avions besoin.'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Utilisateurs actifs' },
    { value: '500K+', label: 'Factures créées' },
    { value: '€50M+', label: 'Montant traité' },
    { value: '99.9%', label: 'Satisfaction client' }
  ];

  return (
    <ParallaxBackground>
      <Box sx={{ minHeight: '100vh', position: 'relative' }}>
        {/* Cursor follower */}
        <Box
          sx={{
            position: 'fixed',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 168, 83, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
            transform: `translate(${mousePosition.x - 200}px, ${mousePosition.y - 200}px)`,
            transition: 'transform 0.3s ease-out',
            zIndex: 0,
          }}
        />

        {/* Header */}
        <AppBar 
          position="fixed" 
          elevation={0}
          sx={{ 
            background: 'rgba(8, 8, 7, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 1000
          }}
        >
          <Toolbar>
            <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1 }}>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <LordIcon 
                  src={Icons.invoice}
                  trigger="hover"
                  size={40}
                  colors="primary:#D4A853"
                />
              </motion.div>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800,
                  color: '#fff'
                }}
              >
                <span className="gradient-text">Facture</span>.net
              </Typography>
            </Box>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ 
                  mr: 2,
                  color: '#fff',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'rgba(212, 168, 83, 0.5)',
                    background: 'rgba(212, 168, 83, 0.1)'
                  }
                }}
              >
                Connexion
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{ 
                  background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
                  color: '#080807',
                  px: 3,
                  borderRadius: 2,
                  fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(212, 168, 83, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #F4D03F 0%, #D4A853 100%)',
                    boxShadow: '0 8px 24px rgba(212, 168, 83, 0.5)',
                  }
                }}
              >
                Démarrer
              </Button>
            </motion.div>
          </Toolbar>
        </AppBar>

        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div style={{ opacity, scale }}>
            <Box 
              sx={{ 
                pt: { xs: 15, md: 20 },
                pb: { xs: 8, md: 12 },
                textAlign: 'center'
              }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Box 
                  sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 3,
                    py: 1,
                    mb: 4,
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 50,
                    border: '1px solid rgba(212, 168, 83, 0.3)',
                    boxShadow: '0 4px 16px rgba(212, 168, 83, 0.1)'
                  }}
                >
                  <Box 
                    className="pulse-dot"
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)'
                    }} 
                  />
                  <Typography variant="body2" sx={{ color: '#D4A853', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Facturation Intelligente · 2026
                  </Typography>
                </Box>
              </motion.div>

              {/* Main Title */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: { xs: '2.5rem', md: '4rem', lg: '5.5rem' },
                    fontWeight: 400,
                    fontFamily: '"Playfair Display", "Georgia", serif',
                    color: '#fff',
                    mb: 1,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em'
                  }}
                >
                  Facturez vite.
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontSize: { xs: '2rem', md: '3rem', lg: '4.5rem' },
                    fontWeight: 400,
                    fontFamily: '"Playfair Display", "Georgia", serif',
                    fontStyle: 'italic',
                    mb: 3,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em'
                  }}
                >
                  <span className="gradient-text">Soyez payé</span> plus vite.
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    mb: 5,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    maxWidth: '600px',
                    mx: 'auto',
                    lineHeight: 1.6
                  }}
                >
                  Créez des factures professionnelles en 60 secondes, suivez chaque paiement en temps réel et automatisez vos relances — tout depuis un seul tableau de bord.
                </Typography>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/register')}
                      sx={{ 
                        px: 6,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
                        color: '#080807',
                        textTransform: 'none',
                        boxShadow: '0 8px 32px rgba(212, 168, 83, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #F4D03F 0%, #D4A853 100%)',
                          boxShadow: '0 12px 40px rgba(212, 168, 83, 0.6)',
                        },
                      }}
                    >
                      Commencer Gratuitement →
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{ 
                        px: 5,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        color: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: 'rgba(212, 168, 83, 0.5)',
                          background: 'rgba(212, 168, 83, 0.1)',
                        },
                      }}
                    >
                      Voir la démo
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>

              {/* Animated Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 1 }}
              >
                <FloatingElement duration={4}>
                  <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
                    <LordIcon 
                      src={Icons.invoice}
                      trigger="loop"
                      size={200}
                      colors="primary:#D4A853,secondary:#F4D03F"
                    />
                  </Box>
                </FloatingElement>
              </motion.div>
            </Box>
          </motion.div>

          {/* Stats Bar */}
          <AnimatedCard delay={200}>
            <Box 
              className="bento-card"
              sx={{ 
                p: 4, 
                mb: 10,
                background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.1) 0%, rgba(244, 208, 63, 0.05) 100%)',
                borderRadius: 4
              }}
            >
              <Grid container spacing={4}>
                {stats.map((stat, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Box textAlign="center">
                        <Typography 
                          variant="h3" 
                          className="gradient-text"
                          sx={{ fontWeight: 800, mb: 1 }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </AnimatedCard>

          {/* Features Section */}
          <Box sx={{ py: 8 }}>
            <AnimatedCard>
              <Typography 
                variant="h3" 
                align="center" 
                sx={{ 
                  color: '#fff',
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                Fonctionnalités Puissantes
              </Typography>
              <Typography 
                variant="h6" 
                align="center" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  mb: 6,
                  fontWeight: 400
                }}
              >
                Tout ce dont vous avez besoin pour gérer vos factures comme un pro
              </Typography>
            </AnimatedCard>

            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <AnimatedCard delay={index * 100}>
                    <Card3D>
                      <Paper
                        elevation={0}
                        className="bento-card"
                        sx={{
                          p: 4,
                          height: '100%',
                          background: `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}05 100%)`,
                          border: `1px solid ${feature.color}30`,
                          borderRadius: 4,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)`,
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                          },
                          '&:hover::before': {
                            opacity: 1,
                          }
                        }}
                      >
                        <Box display="flex" justifyContent="center" mb={3}>
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <LordIcon 
                              src={feature.icon}
                              trigger="hover"
                              size={64}
                              colors={`primary:${feature.color}`}
                            />
                          </motion.div>
                        </Box>
                        <Typography 
                          variant="h6" 
                          align="center" 
                          sx={{ 
                            color: '#fff',
                            fontWeight: 700,
                            mb: 2
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          align="center" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.6)',
                            lineHeight: 1.6
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </Paper>
                    </Card3D>
                  </AnimatedCard>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* How It Works Section - "Simple comme bonjour" */}
          <Box sx={{ py: 10 }}>
            <AnimatedCard>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box 
                  sx={{ 
                    px: 3, 
                    py: 0.5, 
                    borderRadius: 2,
                    background: 'rgba(212, 168, 83, 0.1)',
                    border: '1px solid rgba(212, 168, 83, 0.3)'
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#D4A853', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                    ⚡ TÉMOIGNAGES
                  </Typography>
                </Box>
              </Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  color: '#fff',
                  fontWeight: 400,
                  fontFamily: '"Playfair Display", "Georgia", serif',
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                Simple comme <span style={{ fontStyle: 'italic' }}>bonjour</span>.
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  mb: 6,
                  fontSize: '1.1rem'
                }}
              >
                Trois étapes pour passer de "prestation terminée" à paiement reçu.
              </Typography>
            </AnimatedCard>

            <Grid container spacing={4}>
              {[
                {
                  step: 'ÉTAPE 1',
                  title: 'Créez votre facture',
                  description: 'Sélectionnez un modèle, ajoutez vos prestations, votre logo et les coordonnées du client. Moins d\'une minute.',
                  time: '< 60s',
                  timeLabel: 'pour créer',
                  icon: Icons.invoice,
                  color: '#D4A853'
                },
                {
                  step: 'ÉTAPE 2',
                  title: 'Envoyez & suivez',
                  description: 'Envoyez par email directement depuis InvoiceSite. Recevez une notification dès que votre client ouvre la facture.',
                  time: '100%',
                  timeLabel: 'traçabilité',
                  icon: Icons.pdf,
                  color: '#60a5fa'
                },
                {
                  step: 'ÉTAPE 3',
                  title: 'Soyez payé',
                  description: 'Votre client paie en ligne, par carte ou virement. L\'argent arrive sur votre compte en 1 à 2 jours ouvrés.',
                  time: '1-2j',
                  timeLabel: 'délai moyen',
                  icon: Icons.success,
                  color: '#4ade80'
                }
              ].map((step, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <AnimatedCard delay={index * 150}>
                    <Card3D>
                      <Paper
                        elevation={0}
                        className="bento-card"
                        sx={{
                          p: 5,
                          height: '100%',
                          background: `linear-gradient(135deg, ${step.color}10 0%, ${step.color}05 100%)`,
                          border: `1px solid ${step.color}30`,
                          borderRadius: 4,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Step number badge */}
                        <Box 
                          sx={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            px: 2,
                            py: 0.5,
                            mb: 3,
                            borderRadius: 2,
                            background: `${step.color}20`,
                            border: `1px solid ${step.color}40`
                          }}
                        >
                          <Typography variant="caption" sx={{ color: step.color, fontWeight: 700, letterSpacing: 1 }}>
                            {step.step}
                          </Typography>
                        </Box>

                        {/* Icon */}
                        <Box display="flex" justifyContent="center" mb={3}>
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 3,
                              background: `${step.color}20`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <LordIcon 
                              src={step.icon}
                              trigger="loop"
                              size={48}
                              colors={`primary:${step.color}`}
                            />
                          </Box>
                        </Box>

                        <Typography 
                          variant="h5" 
                          sx={{ 
                            color: '#fff',
                            fontWeight: 700,
                            mb: 2
                          }}
                        >
                          {step.title}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.6)',
                            lineHeight: 1.7,
                            mb: 3
                          }}
                        >
                          {step.description}
                        </Typography>

                        {/* Time indicator */}
                        <Box 
                          sx={{ 
                            mt: 'auto',
                            pt: 3,
                            borderTop: `1px solid ${step.color}20`
                          }}
                        >
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              color: step.color,
                              fontWeight: 800,
                              mb: 0.5
                            }}
                          >
                            {step.time}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.5)',
                              textTransform: 'uppercase',
                              letterSpacing: 1
                            }}
                          >
                            {step.timeLabel}
                          </Typography>
                        </Box>

                        {/* Decorative element */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -30,
                            right: -30,
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${step.color}20 0%, transparent 70%)`,
                            pointerEvents: 'none',
                          }}
                        />
                      </Paper>
                    </Card3D>
                  </AnimatedCard>
                </Grid>
              ))}
            </Grid>

            {/* CTA Button */}
            <Box display="flex" justifyContent="center" mt={6}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    px: 8,
                    py: 2.5,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
                    color: '#080807',
                    textTransform: 'none',
                    boxShadow: '0 8px 32px rgba(212, 168, 83, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #F4D03F 0%, #D4A853 100%)',
                      boxShadow: '0 12px 40px rgba(212, 168, 83, 0.6)',
                    },
                  }}
                >
                  Essayer maintenant — C'est gratuit →
                </Button>
              </motion.div>
            </Box>
          </Box>

          {/* Testimonials - "Ils se font payer à temps" */}
          <Box sx={{ py: 10 }}>
            <AnimatedCard>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box 
                  sx={{ 
                    px: 3, 
                    py: 0.5, 
                    borderRadius: 2,
                    background: 'rgba(212, 168, 83, 0.1)',
                    border: '1px solid rgba(212, 168, 83, 0.3)'
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#D4A853', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                    ⭐ TÉMOIGNAGES
                  </Typography>
                </Box>
              </Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  color: '#fff',
                  fontWeight: 400,
                  fontFamily: '"Playfair Display", "Georgia", serif',
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                Ils se font payer à temps. <span style={{ fontStyle: 'italic', color: '#D4A853' }}>Maintenant</span>.
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={6}>
                <Rating value={5} readOnly sx={{ color: '#D4A853' }} />
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  4.9/5 · 2 400+ avis
                </Typography>
              </Box>
            </AnimatedCard>

            <Grid container spacing={4}>
              {[
                {
                  stat: '-68%',
                  label: 'DÉLAI DE PAIEMENT',
                  stars: 5,
                  text: '"Avant InvoiceSite, je perdais 2 heures par semaine à relancer mes clients par email. Maintenant, tout est automatisé et je me fais payer en moyenne en 4 jours. Incroyable."',
                  author: 'Sophie Marchand',
                  role: 'Graphiste freelance',
                  location: 'Paris, France'
                },
                {
                  stat: '15h',
                  label: 'ÉCONOMISÉES / MOIS',
                  badge: 'RAS PRO',
                  stars: 5,
                  text: '"Nous gérions 50 clients réguliers. InvoiceSite nous a permis de passer à la facturation automatique et de récupérer 15 heures par mois que nous investissons maintenant dans la prospection."',
                  author: 'Thomas Léger',
                  role: 'Co-fondateur',
                  location: 'Agence Pixel, Lyon'
                },
                {
                  stat: '99%',
                  label: 'TAUX DE RECOUVREMENT',
                  stars: 5,
                  text: '"La fonctionnalité de suivi d\'ouverture change tout. Je sais exactement quand mon client a vu la facture — plus d\'excuse pour les retards. Mon taux de recouvrement est passé à 99%."',
                  author: 'Camille Durand',
                  role: 'Consultante en stratégie',
                  location: 'Bordeaux, France'
                }
              ].map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <AnimatedCard delay={index * 150}>
                    <Card3D>
                      <Paper
                        elevation={0}
                        className="bento-card"
                        sx={{
                          p: 4,
                          height: '100%',
                          borderRadius: 4,
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        {/* Stars */}
                        <Box display="flex" gap={0.5} mb={3}>
                          {[...Array(testimonial.stars)].map((_, i) => (
                            <Box key={i} sx={{ color: '#D4A853', fontSize: '1.2rem' }}>★</Box>
                          ))}
                        </Box>

                        {/* Stat */}
                        <Typography 
                          variant="h2" 
                          sx={{ 
                            color: '#D4A853',
                            fontWeight: 800,
                            mb: 0.5,
                            fontSize: '3.5rem'
                          }}
                        >
                          {testimonial.stat}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mb={3}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.5)',
                              textTransform: 'uppercase',
                              letterSpacing: 1.5,
                              fontWeight: 700
                            }}
                          >
                            {testimonial.label}
                          </Typography>
                          {testimonial.badge && (
                            <Box 
                              sx={{ 
                                px: 1.5, 
                                py: 0.3, 
                                borderRadius: 1,
                                background: 'rgba(212, 168, 83, 0.2)',
                                border: '1px solid rgba(212, 168, 83, 0.3)'
                              }}
                            >
                              <Typography variant="caption" sx={{ color: '#D4A853', fontWeight: 700, fontSize: '0.65rem' }}>
                                {testimonial.badge}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Quote */}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontStyle: 'italic',
                            lineHeight: 1.7,
                            mb: 3,
                            flex: 1
                          }}
                        >
                          {testimonial.text}
                        </Typography>

                        {/* Author */}
                        <Box display="flex" alignItems="center" gap={2} pt={3} borderTop="1px solid rgba(255, 255, 255, 0.1)">
                          <Avatar 
                            sx={{ 
                              width: 48, 
                              height: 48,
                              background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
                              color: '#080807',
                              fontWeight: 700
                            }}
                          >
                            {testimonial.author.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                              {testimonial.author}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              {testimonial.role} · {testimonial.location}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Card3D>
                  </AnimatedCard>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Original Testimonials Section */}
          <Box sx={{ py: 10 }}>
            <AnimatedCard>
              <Typography 
                variant="h3" 
                align="center" 
                sx={{ 
                  color: '#fff',
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                Ce que disent nos clients
              </Typography>
              <Typography 
                variant="h6" 
                align="center" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  mb: 6,
                  fontWeight: 400
                }}
              >
                Rejoignez des milliers d'entrepreneurs satisfaits
              </Typography>
            </AnimatedCard>

            <Grid container spacing={4}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <AnimatedCard delay={index * 150}>
                    <Card3D>
                      <Paper
                        elevation={0}
                        className="bento-card"
                        sx={{
                          p: 4,
                          height: '100%',
                          borderRadius: 4,
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Avatar 
                            sx={{ 
                              width: 56, 
                              height: 56,
                              background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
                              color: '#080807',
                              fontWeight: 700,
                              fontSize: '1.5rem'
                            }}
                          >
                            {testimonial.avatar}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
                              {testimonial.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              {testimonial.role}
                            </Typography>
                          </Box>
                        </Box>
                        <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontStyle: 'italic',
                            lineHeight: 1.6
                          }}
                        >
                          "{testimonial.text}"
                        </Typography>
                      </Paper>
                    </Card3D>
                  </AnimatedCard>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Final CTA */}
          <AnimatedCard>
            <Box 
              className="bento-card"
              sx={{ 
                py: 10,
                px: 4,
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.15) 0%, rgba(244, 208, 63, 0.1) 100%)',
                borderRadius: 4,
                mb: 10
              }}
            >
              <Typography 
                variant="h3" 
                sx={{ 
                  color: '#fff',
                  fontWeight: 800,
                  mb: 3,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                Prêt à transformer votre facturation ?
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  mb: 4,
                  fontWeight: 400
                }}
              >
                Rejoignez-nous gratuitement et commencez à facturer en quelques minutes
              </Typography>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    px: 8,
                    py: 2.5,
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #D4A853 0%, #F4D03F 100%)',
                    color: '#080807',
                    textTransform: 'none',
                    boxShadow: '0 8px 32px rgba(212, 168, 83, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #F4D03F 0%, #D4A853 100%)',
                      boxShadow: '0 12px 40px rgba(212, 168, 83, 0.6)',
                    },
                  }}
                >
                  Commencer Maintenant →
                </Button>
              </motion.div>
            </Box>
          </AnimatedCard>
        </Container>

        {/* Footer */}
        <Box 
          sx={{ 
            py: 6,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(8, 8, 7, 0.5)'
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <LordIcon 
                    src={Icons.invoice}
                    trigger="hover"
                    size={32}
                    colors="primary:#D4A853"
                  />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    <span className="gradient-text">Facture</span>.net
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  La solution de facturation la plus moderne et intuitive du marché.
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" sx={{ color: '#D4A853', mb: 1, fontWeight: 700 }}>
                      Produit
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 0.5 }}>
                      Fonctionnalités
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 0.5 }}>
                      Tarifs
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Démo
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" sx={{ color: '#D4A853', mb: 1, fontWeight: 700 }}>
                      Support
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 0.5 }}>
                      Documentation
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 0.5 }}>
                      Contact
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      FAQ
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" sx={{ color: '#D4A853', mb: 1, fontWeight: 700 }}>
                      Entreprise
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 0.5 }}>
                      À propos
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 0.5 }}>
                      Blog
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Carrières
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" sx={{ color: '#D4A853', mb: 1, fontWeight: 700 }}>
                      Légal
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 0.5 }}>
                      Confidentialité
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 0.5 }}>
                      CGU
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Mentions légales
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Typography 
                variant="body2" 
                align="center" 
                sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
              >
                © 2026 Facture.net - Tous droits réservés
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ParallaxBackground>
  );
};
