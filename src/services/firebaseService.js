import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, get, update, remove, query, orderByChild } from "firebase/database";
// Import du service d'authentification de démo
import * as demoAuth from './demoAuthService';

const firebaseConfig = {
  apiKey: "AIzaSyCzE0DqRUFXzbqDMxOgvsFZqk1wOCpW9ig",
  authDomain: "gestion-des-factures-52d03.firebaseapp.com",
  databaseURL: "https://gestion-des-factures-52d03-default-rtdb.firebaseio.com",
  projectId: "gestion-des-factures-52d03",
  storageBucket: "gestion-des-factures-52d03.firebasestorage.app",
  messagingSenderId: "362567183024",
  appId: "1:362567183024:web:d05e9af88f0dc05cd0a975",
  measurementId: "G-RDK8KRTL6H"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Utiliser l'authentification de démo
export const loginUser = demoAuth.loginUser;
export const logoutUser = demoAuth.logoutUser;
export const getCurrentUser = demoAuth.getCurrentUser;
export const onAuthChange = demoAuth.onAuthChange;
export const getUserRole = demoAuth.getUserRole;

// Initialiser les utilisateurs de démo au démarrage
demoAuth.initDemoUsers(database, set, ref).catch(console.error);

// Client Functions
export const addClient = async (clientData) => {
  const clientRef = ref(database, 'clients');
  const newClientRef = push(clientRef);
  await set(newClientRef, {
    ...clientData,
    createdAt: new Date().toISOString()
  });
  return newClientRef.key;
};

export const getClients = async () => {
  const snapshot = await get(ref(database, 'clients'));
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
  }
  return [];
};

export const updateClient = async (clientId, clientData) => {
  return update(ref(database, `clients/${clientId}`), clientData);
};

export const deleteClient = async (clientId) => {
  return remove(ref(database, `clients/${clientId}`));
};

// Facture Functions
export const addFacture = async (factureData) => {
  const factureRef = ref(database, 'factures');
  const newFactureRef = push(factureRef);
  await set(newFactureRef, {
    ...factureData,
    createdAt: new Date().toISOString()
  });
  return newFactureRef.key;
};

export const getFactures = async () => {
  const snapshot = await get(ref(database, 'factures'));
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([id, data]) => ({ 
      id, 
      ...data,
      articles: data.articles || [] // Assurer que articles existe toujours
    }));
  }
  return [];
};

export const getFactureById = async (factureId) => {
  const snapshot = await get(ref(database, `factures/${factureId}`));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return { 
      id: factureId, 
      ...data,
      articles: data.articles || [] // Assurer que articles existe toujours
    };
  }
  return null;
};

export const updateFacture = async (factureId, factureData) => {
  return update(ref(database, `factures/${factureId}`), factureData);
};

export const deleteFacture = async (factureId) => {
  return remove(ref(database, `factures/${factureId}`));
};

export { database };
