// Script pour créer des données de test (clients et factures)
// Exécuter avec: node scripts/initTestData.js

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getDatabase, ref, push, set } = require('firebase/database');

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
const auth = getAuth(app);
const database = getDatabase(app);

async function createTestData() {
  try {
    // Se connecter en tant qu'admin
    console.log('Connexion en tant qu\'admin...');
    await signInWithEmailAndPassword(auth, 'admin@test.com', 'admin123');
    console.log('✓ Connecté');

    // Créer des clients de test
    console.log('\nCréation des clients de test...');
    const clients = [
      {
        nom: 'Entreprise ABC',
        email: 'contact@abc.fr',
        tel: '01 23 45 67 89',
        adresse: '123 Rue de la Paix, 75001 Paris'
      },
      {
        nom: 'Société XYZ',
        email: 'info@xyz.fr',
        tel: '01 98 76 54 32',
        adresse: '456 Avenue des Champs, 75008 Paris'
      },
      {
        nom: 'SARL Martin',
        email: 'martin@sarl.fr',
        tel: '01 11 22 33 44',
        adresse: '789 Boulevard Saint-Germain, 75006 Paris'
      }
    ];

    const clientIds = [];
    for (const client of clients) {
      const clientRef = ref(database, 'clients');
      const newClientRef = push(clientRef);
      await set(newClientRef, {
        ...client,
        createdAt: new Date().toISOString()
      });
      clientIds.push(newClientRef.key);
      console.log(`✓ Client créé: ${client.nom}`);
    }

    // Créer des factures de test
    console.log('\nCréation des factures de test...');
    const factures = [
      {
        numero: 'F20260301-0001',
        date_creation: new Date('2026-03-01').toISOString(),
        client_id: clientIds[0],
        articles: [
          {
            article_id: 1,
            designation: 'Ordinateur Portable',
            quantite: 2,
            prix_unitaire: 5000,
            tva: 20
          },
          {
            article_id: 2,
            designation: 'Souris Sans Fil',
            quantite: 2,
            prix_unitaire: 150,
            tva: 20
          }
        ],
        total_ht: 10300,
        tva: 2060,
        total_ttc: 12360,
        statut: 'Payée',
        date_depot: '2026-03-02',
        date_encaissement: '2026-03-05',
        type_virement: 'Virement bancaire'
      },
      {
        numero: 'F20260305-0002',
        date_creation: new Date('2026-03-05').toISOString(),
        client_id: clientIds[1],
        articles: [
          {
            article_id: 3,
            designation: 'Consultation IT',
            quantite: 5,
            prix_unitaire: 800,
            tva: 10
          }
        ],
        total_ht: 4000,
        tva: 400,
        total_ttc: 4400,
        statut: 'En attente',
        date_depot: '2026-03-06',
        type_virement: 'Chèque'
      },
      {
        numero: 'F20260308-0003',
        date_creation: new Date('2026-03-08').toISOString(),
        client_id: clientIds[2],
        articles: [
          {
            article_id: 4,
            designation: 'Formation React',
            quantite: 1,
            prix_unitaire: 2000,
            tva: 0
          }
        ],
        total_ht: 2000,
        tva: 0,
        total_ttc: 2000,
        statut: 'En attente',
        date_depot: '2026-03-09',
        type_virement: 'Virement bancaire'
      }
    ];

    for (const facture of factures) {
      const factureRef = ref(database, 'factures');
      const newFactureRef = push(factureRef);
      await set(newFactureRef, {
        ...facture,
        createdAt: new Date().toISOString()
      });
      console.log(`✓ Facture créée: ${facture.numero}`);
    }

    console.log('\n✓ Toutes les données de test ont été créées !');
    console.log(`\n${clients.length} clients créés`);
    console.log(`${factures.length} factures créées`);
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

createTestData();
