import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion-factures';

// Schémas
const categorieSchema = new mongoose.Schema({
  nom: String,
  tva: Number,
  user_id: mongoose.Schema.Types.ObjectId
});

const clientSchema = new mongoose.Schema({
  nom: String,
  email: String,
  tel: String,
  adresse: String,
  entreprise: String,
  siret: String,
  user_id: mongoose.Schema.Types.ObjectId
});

const articleSchema = new mongoose.Schema({
  designation: String,
  prix_unitaire: Number,
  categorie_id: mongoose.Schema.Types.ObjectId,
  user_id: mongoose.Schema.Types.ObjectId
});

const factureSchema = new mongoose.Schema({
  numero: String,
  date_creation: Date,
  client_id: mongoose.Schema.Types.ObjectId,
  user_id: mongoose.Schema.Types.ObjectId,
  statut: String
});

const parametresSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  devise: String
});

const Categorie = mongoose.model('Categorie', categorieSchema);
const Client = mongoose.model('Client', clientSchema);
const Article = mongoose.model('Article', articleSchema);
const Facture = mongoose.model('Facture', factureSchema);
const Parametres = mongoose.model('Parametres', parametresSchema);

async function main() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    console.log(`   URI: ${MONGODB_URI}\n`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('🗑️  Suppression des données de test...\n');

    // Compter avant suppression
    const countBefore = {
      categories: await Categorie.countDocuments(),
      clients: await Client.countDocuments(),
      articles: await Article.countDocuments(),
      factures: await Facture.countDocuments(),
      parametres: await Parametres.countDocuments()
    };

    console.log('📊 Données AVANT suppression:');
    console.log(`   📂 Catégories: ${countBefore.categories}`);
    console.log(`   👥 Clients: ${countBefore.clients}`);
    console.log(`   📦 Articles: ${countBefore.articles}`);
    console.log(`   📄 Factures: ${countBefore.factures}`);
    console.log(`   ⚙️  Paramètres: ${countBefore.parametres}\n`);

    // Supprimer les données
    const results = await Promise.all([
      Categorie.deleteMany({}),
      Client.deleteMany({}),
      Article.deleteMany({}),
      Facture.deleteMany({}),
      Parametres.deleteMany({})
    ]);

    console.log('✅ Suppression effectuée:\n');
    console.log(`   📂 ${results[0].deletedCount} catégories supprimées`);
    console.log(`   👥 ${results[1].deletedCount} clients supprimés`);
    console.log(`   📦 ${results[2].deletedCount} articles supprimés`);
    console.log(`   📄 ${results[3].deletedCount} factures supprimées`);
    console.log(`   ⚙️  ${results[4].deletedCount} paramètres supprimés\n`);

    // Compter après suppression
    const countAfter = {
      categories: await Categorie.countDocuments(),
      clients: await Client.countDocuments(),
      articles: await Article.countDocuments(),
      factures: await Facture.countDocuments(),
      parametres: await Parametres.countDocuments()
    };

    console.log('📊 Données APRÈS suppression:');
    console.log(`   📂 Catégories: ${countAfter.categories}`);
    console.log(`   👥 Clients: ${countAfter.clients}`);
    console.log(`   📦 Articles: ${countAfter.articles}`);
    console.log(`   📄 Factures: ${countAfter.factures}`);
    console.log(`   ⚙️  Paramètres: ${countAfter.parametres}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ NETTOYAGE TERMINÉ!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('👤 Les utilisateurs (users) ont été CONSERVÉS');
    console.log('🗑️  Toutes les autres données ont été supprimées');
    console.log('\n💡 Vous pouvez maintenant tester l\'ajout de données depuis l\'application!\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

main();
