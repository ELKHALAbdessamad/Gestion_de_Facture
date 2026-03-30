// Script pour créer les utilisateurs de test
// Exécuter avec: node scripts/initUsers.js

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getDatabase, ref, set } = require('firebase/database');

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

async function createTestUsers() {
  try {
    // Créer Admin
    console.log('Création de l\'utilisateur admin...');
    const adminCredential = await createUserWithEmailAndPassword(auth, 'admin@test.com', 'admin123');
    await set(ref(database, `users/${adminCredential.user.uid}`), {
      email: 'admin@test.com',
      role: 'admin',
      nom: 'Administrateur',
      createdAt: new Date().toISOString()
    });
    console.log('✓ Admin créé avec succès');

    // Créer User
    console.log('Création de l\'utilisateur standard...');
    const userCredential = await createUserWithEmailAndPassword(auth, 'user@test.com', 'user123');
    await set(ref(database, `users/${userCredential.user.uid}`), {
      email: 'user@test.com',
      role: 'user',
      nom: 'Utilisateur',
      createdAt: new Date().toISOString()
    });
    console.log('✓ User créé avec succès');

    console.log('\n✓ Tous les utilisateurs de test ont été créés !');
    console.log('\nComptes disponibles:');
    console.log('Admin: admin@test.com / admin123');
    console.log('User: user@test.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    if (error.code === 'auth/email-already-in-use') {
      console.log('\nℹ Les utilisateurs existent déjà. Vous pouvez vous connecter avec:');
      console.log('Admin: admin@test.com / admin123');
      console.log('User: user@test.com / user123');
    }
    process.exit(1);
  }
}

createTestUsers();
