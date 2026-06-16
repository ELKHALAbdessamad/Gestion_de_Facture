import api from './api';

// ========== AUTHENTIFICATION ==========

export const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  // Si 2FA requis, ne pas stocker le token — retourner l'état pending
  if (data.requires2fa) {
    return data; // { requires2fa: true, tempToken, user }
  }
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};

// Vérification du code TOTP après login
export const verify2FA = async (tempToken, totpToken) => {
  const { data } = await api.post('/auth/2fa/verify', { tempToken, token: totpToken });
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};

// Setup 2FA — retourne le QR code
export const setup2FA = async () => {
  const { data } = await api.post('/totp/setup');
  return data;
};

// Activer 2FA après scan du QR code
export const confirmSetup2FA = async (token) => {
  const { data } = await api.post('/totp/verify-setup', { token });
  return data;
};

// Désactiver 2FA
export const disable2FA = async (token) => {
  const { data } = await api.post('/totp/disable', { token });
  return data;
};

// Statut 2FA
export const get2FAStatus = async () => {
  const { data } = await api.get('/totp/status');
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// ========== FACTURES ==========

export const getFactures = async () => {
  const { data } = await api.get('/factures');
  return data;
};

export const getFactureById = async (id) => {
  const { data } = await api.get(`/factures/${id}`);
  return data;
};

export const getFacturePublic = async (id) => {
  const { data } = await api.get(`/factures/public/${id}`);
  return data;
};

export const addFacture = async (factureData) => {
  const { data } = await api.post('/factures', factureData);
  return data;
};

export const updateFacture = async (id, factureData) => {
  const { data } = await api.put(`/factures/${id}`, factureData);
  return data;
};

export const deleteFacture = async (id) => {
  const { data } = await api.delete(`/factures/${id}`);
  return data;
};

// ========== CLIENTS ==========

export const getClients = async () => {
  const { data } = await api.get('/clients');
  return data;
};

export const getClientsPublic = async () => {
  // Pour la compatibilité avec factureProxy, utilise la même fonction
  return getClients();
};

export const addClient = async (clientData) => {
  const { data } = await api.post('/clients', clientData);
  return data;
};

export const updateClient = async (id, clientData) => {
  const { data } = await api.put(`/clients/${id}`, clientData);
  return data;
};

export const deleteClient = async (id) => {
  const { data } = await api.delete(`/clients/${id}`);
  return data;
};

// ========== ARTICLES ==========

export const getArticles = async () => {
  const { data } = await api.get('/articles');
  return data;
};

export const addArticle = async (articleData) => {
  const { data } = await api.post('/articles', articleData);
  return data;
};

export const updateArticle = async (id, articleData) => {
  const { data } = await api.put(`/articles/${id}`, articleData);
  return data;
};

export const deleteArticle = async (id) => {
  const { data } = await api.delete(`/articles/${id}`);
  return data;
};

// ========== CATÉGORIES ==========

export const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};

export const addCategorie = async (categorieData) => {
  const { data } = await api.post('/categories', categorieData);
  return data;
};

export const updateCategorie = async (id, categorieData) => {
  const { data } = await api.put(`/categories/${id}`, categorieData);
  return data;
};

export const deleteCategorie = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};

// ========== PARAMÈTRES ==========

export const getParametres = async () => {
  const { data } = await api.get('/parametres');
  return data;
};

export const updateParametres = async (parametresData) => {
  const { data } = await api.put('/parametres', parametresData);
  return data;
};

// ========== UTILISATEURS ==========

export const getUserProfile = async () => {
  const { data } = await api.get('/users/me');
  return data;
};

export const updateUserProfile = async (userData) => {
  const { data } = await api.put('/users/me', userData);
  return data;
};

export const getUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

// ========== PROJETS ==========

export const getProjets = async () => {
  const { data } = await api.get('/projets');
  return data;
};

export const getProjetById = async (id) => {
  const { data } = await api.get(`/projets/${id}`);
  return data;
};

export const addProjet = async (projetData) => {
  const { data } = await api.post('/projets', projetData);
  return data;
};

export const updateProjet = async (id, projetData) => {
  const { data } = await api.put(`/projets/${id}`, projetData);
  return data;
};

export const deleteProjet = async (id) => {
  const { data } = await api.delete(`/projets/${id}`);
  return data;
};

// ========== ARCHIVAGE ==========

export const getArchiveYears = async () => {
  const { data } = await api.get('/factures/archive-years/list');
  return data;
};

export const getFacturesArchive = async (year) => {
  const { data } = await api.get(`/factures/archive/${year}`);
  return data;
};

export const sendFactureEmail = async (id) => {
  const { data } = await api.post(`/factures/${id}/send-email`);
  return data;
};
