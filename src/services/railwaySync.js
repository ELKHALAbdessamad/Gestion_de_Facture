/**
 * Service de synchronisation vers Railway/Atlas via le navigateur
 * Contourne les restrictions réseau en utilisant le navigateur au lieu de Node.js
 */

const RAILWAY_URL = process.env.REACT_APP_PUBLIC_URL || 'https://gestiondefacture-production.up.railway.app';

/**
 * Synchronise une facture vers Railway/Atlas (avec client et parametres)
 * @param {Object} facture - La facture à synchroniser
 * @param {Object} client - Le client associé (optionnel)
 * @param {Object} parametres - Les paramètres entreprise (optionnel)
 * @returns {Promise<boolean>} - true si succès, false si échec
 */
export const syncFactureToRailway = async (facture, client = null, parametres = null) => {
  try {
    console.log('🔄 Synchronisation facture vers Railway/Atlas:', facture.numero);
    
    const response = await fetch(`${RAILWAY_URL}/api/factures/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ facture, client, parametres })
    });

    if (response.ok) {
      console.log('✅ Facture synchronisée vers Railway/Atlas:', facture.numero);
      return true;
    } else {
      const error = await response.json();
      console.error('❌ Erreur synchronisation Railway:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur réseau synchronisation:', error);
    return false;
  }
};

/**
 * Supprime une facture sur Railway/Atlas
 * @param {string} factureId - L'ID de la facture à supprimer
 * @returns {Promise<boolean>} - true si succès, false si échec
 */
export const deleteFactureFromRailway = async (factureId) => {
  try {
    console.log('🗑️ Suppression facture sur Railway/Atlas:', factureId);
    
    const response = await fetch(`${RAILWAY_URL}/api/factures/sync-delete/${factureId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      console.log('✅ Facture supprimée sur Railway/Atlas');
      return true;
    } else {
      console.error('❌ Erreur suppression Railway');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur réseau suppression:', error);
    return false;
  }
};
