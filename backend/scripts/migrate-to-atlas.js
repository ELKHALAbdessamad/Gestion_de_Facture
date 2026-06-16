/**
 * Script de migration MongoDB Local → MongoDB Atlas
 * 
 * Ce script copie TOUTES vos données (clients, factures, articles, etc.)
 * depuis votre MongoDB local vers MongoDB Atlas (cloud)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// 🔹 MongoDB LOCAL (source)
const LOCAL_URI = 'mongodb://localhost:27017/gestion-factures';

// 🔹 MongoDB ATLAS (destination)
// Vous pouvez modifier le mot de passe ici si nécessaire
const ATLAS_PASSWORD = process.env.ATLAS_PASSWORD || 'NovaFact2024Simple';
const ATLAS_URI = `mongodb+srv://novafact_user:${ATLAS_PASSWORD}@cluster0.tjfirmb.mongodb.net/novafact?retryWrites=true&w=majority&appName=Cluster0`;

// Collections à migrer
const COLLECTIONS = [
  'users',
  'clients',
  'articles',
  'categories',
  'factures',
  'projets',
  'parametres'
];

async function migrateData() {
  console.log('🚀 Début de la migration...\n');

  try {
    // 1️⃣ Connexion à MongoDB LOCAL
    console.log('📍 Connexion à MongoDB LOCAL...');
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connecté à MongoDB LOCAL\n');

    // 2️⃣ Connexion à MongoDB ATLAS
    console.log('☁️  Connexion à MongoDB ATLAS...');
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Connecté à MongoDB ATLAS\n');

    // 3️⃣ Migration de chaque collection
    for (const collectionName of COLLECTIONS) {
      try {
        console.log(`📦 Migration de la collection: ${collectionName}`);
        
        // Vérifier si la collection existe dans local
        const collections = await localConn.db.listCollections({ name: collectionName }).toArray();
        
        if (collections.length === 0) {
          console.log(`   ⚠️  Collection "${collectionName}" n'existe pas dans local, ignorée.\n`);
          continue;
        }

        // Récupérer les données depuis local
        const localCollection = localConn.db.collection(collectionName);
        const documents = await localCollection.find({}).toArray();
        
        console.log(`   📊 ${documents.length} documents trouvés`);

        if (documents.length > 0) {
          // Insérer dans Atlas (supprimer d'abord les anciennes données si elles existent)
          const atlasCollection = atlasConn.db.collection(collectionName);
          
          // Vider la collection Atlas avant d'importer
          await atlasCollection.deleteMany({});
          
          // Insérer les nouveaux documents
          await atlasCollection.insertMany(documents);
          
          console.log(`   ✅ ${documents.length} documents migrés vers Atlas\n`);
        } else {
          console.log(`   ℹ️  Aucun document à migrer\n`);
        }
      } catch (error) {
        console.error(`   ❌ Erreur lors de la migration de ${collectionName}:`, error.message, '\n');
      }
    }

    // 4️⃣ Fermer les connexions
    await localConn.close();
    await atlasConn.close();

    console.log('🎉 Migration terminée avec succès !');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Vérifiez vos données dans MongoDB Atlas (via Compass ou le site web)');
    console.log('2. Mettez à jour la variable MONGODB_URI dans Railway avec:');
    console.log('   mongodb+srv://novafact_user:NovaFact2024Simple@cluster0.tjfirmb.mongodb.net/novafact?retryWrites=true&w=majority');
    console.log('3. Railway va redémarrer automatiquement');
    console.log('4. Testez votre application déployée !');
    console.log('\n✅ Vos données sont maintenant dans le CLOUD ! 🌍\n');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Lancer la migration
migrateData();
