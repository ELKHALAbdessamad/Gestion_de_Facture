import React, { createContext, useContext, useState, useEffect } from 'react';
import { translationsComplete as translations } from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Français par défaut toujours
    return 'fr';
  });

  useEffect(() => {
    // Sauvegarder la langue dans localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Retourner la clé si la traduction n'existe pas
      }
    }
    
    return value || key;
  };

  const changeLanguage = (lang) => {
    if (lang === 'fr' || lang === 'en') {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
