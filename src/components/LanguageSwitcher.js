import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <Tooltip title="Français">
        <IconButton
          onClick={() => changeLanguage('fr')}
          sx={{
            width: 36,
            height: 36,
            border: language === 'fr' ? '2px solid #D4A853' : '1px solid rgba(255, 255, 255, 0.1)',
            background: language === 'fr' ? 'rgba(212, 168, 83, 0.1)' : 'rgba(255, 255, 255, 0.03)',
            '&:hover': {
              background: 'rgba(212, 168, 83, 0.15)',
              border: '1px solid rgba(212, 168, 83, 0.3)',
            },
          }}
        >
          <span style={{ fontSize: '20px' }}>🇫🇷</span>
        </IconButton>
      </Tooltip>
      <Tooltip title="English">
        <IconButton
          onClick={() => changeLanguage('en')}
          sx={{
            width: 36,
            height: 36,
            border: language === 'en' ? '2px solid #D4A853' : '1px solid rgba(255, 255, 255, 0.1)',
            background: language === 'en' ? 'rgba(212, 168, 83, 0.1)' : 'rgba(255, 255, 255, 0.03)',
            '&:hover': {
              background: 'rgba(212, 168, 83, 0.15)',
              border: '1px solid rgba(212, 168, 83, 0.3)',
            },
          }}
        >
          <span style={{ fontSize: '20px' }}>🇬🇧</span>
        </IconButton>
      </Tooltip>
    </Box>
  );
};
