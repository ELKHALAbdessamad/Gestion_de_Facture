// Script pour initialiser des factures de test dans Firebase
// Usage: node scripts/initFactures.js

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, push } = require('firebase/database');

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

const facturesTest = [
  {
    numero: 'FAC-2026-001',
    date_creation: '2026-03-01',
    client_id: 'client1', // Remplacer par un vrai ID client
    statut: 'Payée',
    articles: [
      {
        designation: 'Ordinateur Portable',
        quantite: 2,
        prix_unitaire: 5000,
        tva: 20,
        article_id: '1'
      },
      {
        designation: 'Consultation IT',
        quantite: 5,
        prix_unitaire: 800,
        tva: 10,
        article_id: '3'
      }
    ],
    total_ht: 14000,
    tva: 2400,
    total_ttc: 16400,
    type_virement: 'Virement bancaire'
  },
  {
    numero: 'FAC-2026-002',
    date_creation: '2026-03-10',
    client_id: 'client2', // Remplacer par un vrai ID client
    statut: 'En attente',
    articles: [
      {
        designation: 'Formation React',
        quantite: 1,
        prix_unitaire: 2000,
        tva: 0,
        article_id: '4'
      }
    ],
    total_ht: 2000,
    tva: 0,
    total_ttc: 2000,
    type_virement: 'Chèque'
  }
];

async function initFactures() {
  console.log('🚀 Initialisation des factures de test...');
  
  try {
    for (const facture of facturesTest) {
      const factureRef = ref(database, 'factures');
      const newFactureRef = push(factureRef);
      await set(newFactureRef, {
        ...facture,
        createdAt: new Date().toISOString()
      });
      console.log(`✅ Facture ${facture.numero} créée avec ID: ${newFactureRef.key}`);
    }
    
    console.log('✨ Toutes les factures de test ont été créées avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création des factures:', error);
    process.exit(1);
  }
}

initFactures();
