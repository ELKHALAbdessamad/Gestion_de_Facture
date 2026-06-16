/**
 * Service proxy pour accéder aux factures depuis mobile
 * Permet de charger les factures via HTTP au lieu de Firebase direct
 */

const FIREBASE_DB_URL = 'https://gestion-des-factures-52d03-default-rtdb.firebaseio.com';

export const getFacturePublic = async (factureId) => {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/factures/${factureId}.json`);
    
    if (!response.ok) {
      throw new Error('Facture non trouvée');
    }
    
    const data = await response.json();
    
    if (!data) {
      throw new Error('Facture inexistante');
    }
    
    return {
      id: factureId,
      ...data,
      articles: data.articles || []
    };
  } catch (error) {
    console.error('Erreur getFacturePublic:', error);
    throw error;
  }
};

export const getClientsPublic = async () => {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/clients.json`);
    
    if (!response.ok) {
      throw new Error('Erreur chargement clients');
    }
    
    const data = await response.json();
    
    if (!data) return [];
    
    return Object.entries(data).map(([id, clientData]) => ({
      id,
      ...clientData
    }));
  } catch (error) {
    console.error('Erreur getClientsPublic:', error);
    return [];
  }
};
