import React, { useState } from 'react';
import { TextField, Box, InputAdornment } from '@mui/material';

export const AnimatedInput = ({ icon, label, error, helperText, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Box
      sx={{
        position: 'relative',
        mb: 3,
      }}
    >
      <TextField
        fullWidth
        label={label}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        error={error}
        helperText={helperText}
        InputProps={{
          startAdornment: icon && (
            <InputAdornment position="start">
              <Box
                sx={{
                  color: isFocused ? '#D4A853' : 'rgba(255, 255, 255, 0.5)',
                  transition: 'color 0.3s ease',
                }}
              >
                {icon}
              </Box>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(212, 168, 83, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#D4A853',
              borderWidth: '2px',
              boxShadow: '0 0 20px rgba(212, 168, 83, 0.2)',
            },
            '&.Mui-focused': {
              background: 'rgba(255, 255, 255, 0.05)',
              transform: 'translateY(-2px)',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.5)',
            '&.Mui-focused': {
              color: '#D4A853',
            },
          },
        }}
        {...props}
      />
      
      {/* Animated underline */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #D4A853, transparent)',
          opacity: isFocused ? 1 : 0,
          transform: isFocused ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'all 0.3s ease',
        }}
      />
    </Box>
  );
};
