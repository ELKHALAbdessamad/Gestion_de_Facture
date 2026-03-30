import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Articles
export const getArticles = async () => {
  const response = await axios.get(`${API_URL}/articles`);
  return response.data;
};

export const getArticleById = async (id) => {
  const response = await axios.get(`${API_URL}/articles/${id}`);
  return response.data;
};

export const addArticle = async (articleData) => {
  const response = await axios.post(`${API_URL}/articles`, articleData);
  return response.data;
};

export const updateArticle = async (id, articleData) => {
  const response = await axios.put(`${API_URL}/articles/${id}`, articleData);
  return response.data;
};

export const deleteArticle = async (id) => {
  await axios.delete(`${API_URL}/articles/${id}`);
};

// Categories
export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/categories`);
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await axios.get(`${API_URL}/categories/${id}`);
  return response.data;
};

export const addCategory = async (categoryData) => {
  const response = await axios.post(`${API_URL}/categories`, categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await axios.put(`${API_URL}/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  await axios.delete(`${API_URL}/categories/${id}`);
};

// Parametres
export const getParametres = async () => {
  const response = await axios.get(`${API_URL}/parametres`);
  return response.data;
};

export const updateParametres = async (parametresData) => {
  const response = await axios.put(`${API_URL}/parametres`, parametresData);
  return response.data;
};
