import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

export const AnimatedCard = ({ children, delay = 0, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  return (
    <Box
      ref={cardRef}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export const Card3D = ({ children, ...props }) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <Box
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      sx={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d',
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export const FloatingElement = ({ children, duration = 3, delay = 0, ...props }) => {
  return (
    <Box
      sx={{
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
        '@keyframes float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export const GlowingBorder = ({ children, color = '#D4A853', ...props }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: -2,
          borderRadius: 'inherit',
          padding: '2px',
          background: `linear-gradient(135deg, ${color}, transparent)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        },
        '&:hover::before': {
          opacity: 1,
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
