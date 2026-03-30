import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

export const ParallaxBackground = ({ children }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Animated Background Layers */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: '#080807',
        }}
      >
        {/* Layer 1 - Slow moving gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: `${-scrollY * 0.5}px`,
            left: 0,
            right: 0,
            height: '200vh',
            background: 'radial-gradient(circle at 20% 50%, rgba(212, 168, 83, 0.15) 0%, transparent 50%)',
            opacity: 0.5,
          }}
        />
        
        {/* Layer 2 - Medium speed */}
        <Box
          sx={{
            position: 'absolute',
            top: `${-scrollY * 0.3}px`,
            left: 0,
            right: 0,
            height: '200vh',
            background: 'radial-gradient(circle at 80% 80%, rgba(244, 208, 63, 0.1) 0%, transparent 50%)',
            opacity: 0.5,
          }}
        />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              borderRadius: '50%',
              background: 'rgba(212, 168, 83, 0.3)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              '@keyframes float': {
                '0%, 100%': {
                  transform: 'translateY(0px)',
                },
                '50%': {
                  transform: 'translateY(-30px)',
                },
              },
            }}
          />
        ))}

        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(212, 168, 83, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212, 168, 83, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            opacity: 0.3,
          }}
        />
      </Box>

      {children}
    </Box>
  );
};
