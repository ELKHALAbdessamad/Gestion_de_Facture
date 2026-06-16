// Configuration de l'API
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configuration axios par défaut
export const API_CONFIG = {
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
};
