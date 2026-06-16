import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion-factures';

// Schémas
const categorieSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  tva: { type: Number, required: true, default: 20 },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const clientSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, trim: true, lowercase: true },
  tel: String,
  adresse: String,
  entreprise: String,
  siret: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const articleSchema = new mongoose.Schema({
  designation: { type: String, required: true },
  prix_unitaire: { type: Number, required: true },
  categorie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const factureArticleSchema = new mongoose.Schema({
  designation: { type: String, required: true },
  quantite: { type: Number, required: true, default: 1 },
  prix_unitaire: { type: Number, required: true },
  remise: { type: Number, default: 0 },
  tva: { type: Number, default: 20 },
  categorie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie' }
}, { _id: false });

const factureSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true },
  date_creation: { type: Date, required: true, default: Date.now },
  date_echeance: Date,
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  articles: [factureArticleSchema],
  statut: { type: String, enum: ['Draft', 'En attente', 'Payée', 'Rejetée'], default: 'Draft' },
  total_ht: { type: Number, required: true },
  remise_globale: { type: Number, default: 0 },
  remise_montant: { type: Number, default: 0 },
  total_apres_remise: { type: Number, required: true },
  tva: { type: Number, required: true },
  total_ttc: { type: Number, required: true },
  mode_paiement: String,
  date_depot: Date,
  date_encaissement: Date,
  type_virement: String,
  validated_by_admin: { type: Boolean, default: false },
  validated_by: String,
  validated_at: Date,
  notes: String
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nom: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
});

const User = mongoose.model('User', userSchema);
const Categorie = mongoose.model('Categorie', categorieSchema);
const Client = mongoose.model('Client', clientSchema);
const Article = mongoose.model('Article', articleSchema);
const Facture = mongoose.model('Facture', factureSchema);

async function main() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    console.log(`   URI: ${MONGODB_URI}\n`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer les utilisateurs existants
    const users = await User.find();
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé. Exécutez d\'abord create-users.js');
      process.exit(1);
    }

    const adminUser = users.find(u => u.role === 'admin');
    const regularUser = users.find(u => u.role === 'user');

    if (!adminUser && !regularUser) {
      console.log('❌ Aucun utilisateur trouvé');
      process.exit(1);
    }

    const userId = adminUser ? adminUser._id : regularUser._id;
    const userName = adminUser ? adminUser.nom : regularUser.nom;

    console.log(`📝 Création des données de test pour: ${userName} (${userId})\n`);

    // 1. CRÉER DES CATÉGORIES
    console.log('📂 Création des catégories...');
    const categories = await Categorie.insertMany([
      { nom: 'Services de conseil', tva: 20, user_id: userId },
      { nom: 'Développement web', tva: 20, user_id: userId },
      { nom: 'Formation', tva: 20, user_id: userId },
      { nom: 'Maintenance', tva: 20, user_id: userId },
      { nom: 'Hébergement', tva: 20, user_id: userId }
    ]);
    console.log(`✅ ${categories.length} catégories créées\n`);

    // 2. CRÉER DES CLIENTS
    console.log('👥 Création des clients...');
    const clients = await Client.insertMany([
      {
        nom: 'ACME Corporation',
        email: 'contact@acme.ma',
        tel: '+212 5 22 12 34 56',
        adresse: '123 Rue Mohammed V',
        entreprise: 'ACME Corp',
        siret: '12345678901234',
        user_id: userId
      },
      {
        nom: 'Tech Solutions',
        email: 'info@techsolutions.ma',
        tel: '+212 5 22 98 76 54',
        adresse: '456 Boulevard Anfa',
        entreprise: 'Tech Solutions SARL',
        siret: '98765432109876',
        user_id: userId
      },
      {
        nom: 'Digital Services',
        email: 'contact@digital.ma',
        tel: '+212 5 22 11 22 33',
        adresse: '789 Avenue Hassan II',
        entreprise: 'Digital Services',
        siret: '11223344556677',
        user_id: userId
      }
    ]);
    console.log(`✅ ${clients.length} clients créés\n`);

    // 3. CRÉER DES ARTICLES
    console.log('📦 Création des articles...');
    const articles = await Article.insertMany([
      { designation: 'Audit technique', prix_unitaire: 5000, categorie_id: categories[0]._id, user_id: userId },
      { designation: 'Développement site web', prix_unitaire: 15000, categorie_id: categories[1]._id, user_id: userId },
      { designation: 'Application mobile', prix_unitaire: 25000, categorie_id: categories[1]._id, user_id: userId },
      { designation: 'Formation React.js (1 jour)', prix_unitaire: 3000, categorie_id: categories[2]._id, user_id: userId },
      { designation: 'Maintenance mensuelle', prix_unitaire: 2000, categorie_id: categories[3]._id, user_id: userId },
      { designation: 'Hébergement annuel', prix_unitaire: 1200, categorie_id: categories[4]._id, user_id: userId }
    ]);
    console.log(`✅ ${articles.length} articles créés\n`);

    // 4. CRÉER DES FACTURES
    console.log('📄 Création des factures...');
    
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    // Facture 1 - Payée
    const facture1Articles = [
      { designation: 'Développement site web', quantite: 1, prix_unitaire: 15000, remise: 0, tva: 20 }
    ];
    const f1_total_ht = 15000;
    const f1_tva = f1_total_ht * 0.20;
    const f1_total_ttc = f1_total_ht + f1_tva;

    await Facture.create({
      numero: 'FAC-2024-001',
      date_creation: lastMonth,
      date_echeance: now,
      client_id: clients[0]._id,
      user_id: userId,
      articles: facture1Articles,
      statut: 'Payée',
      total_ht: f1_total_ht,
      remise_globale: 0,
      remise_montant: 0,
      total_apres_remise: f1_total_ht,
      tva: f1_tva,
      total_ttc: f1_total_ttc,
      mode_paiement: 'Virement bancaire',
      date_encaissement: now,
      notes: 'Projet site vitrine - Payé en totalité'
    });

    // Facture 2 - En attente
    const facture2Articles = [
      { designation: 'Audit technique', quantite: 1, prix_unitaire: 5000, remise: 0, tva: 20 },
      { designation: 'Formation React.js (1 jour)', quantite: 2, prix_unitaire: 3000, remise: 10, tva: 20 }
    ];
    const f2_total_ht = 5000 + (3000 * 2 * 0.9);
    const f2_tva = f2_total_ht * 0.20;
    const f2_total_ttc = f2_total_ht + f2_tva;

    await Facture.create({
      numero: 'FAC-2024-002',
      date_creation: now,
      date_echeance: nextWeek,
      client_id: clients[1]._id,
      user_id: userId,
      articles: facture2Articles,
      statut: 'En attente',
      total_ht: f2_total_ht,
      remise_globale: 0,
      remise_montant: 0,
      total_apres_remise: f2_total_ht,
      tva: f2_tva,
      total_ttc: f2_total_ttc,
      mode_paiement: 'Chèque',
      notes: 'Échéance: 7 jours'
    });

    // Facture 3 - Draft
    const facture3Articles = [
      { designation: 'Application mobile', quantite: 1, prix_unitaire: 25000, remise: 0, tva: 20 }
    ];
    const f3_total_ht = 25000;
    const f3_tva = f3_total_ht * 0.20;
    const f3_total_ttc = f3_total_ht + f3_tva;

    await Facture.create({
      numero: 'FAC-2024-003',
      date_creation: now,
      date_echeance: nextMonth,
      client_id: clients[2]._id,
      user_id: userId,
      articles: facture3Articles,
      statut: 'Draft',
      total_ht: f3_total_ht,
      remise_globale: 0,
      remise_montant: 0,
      total_apres_remise: f3_total_ht,
      tva: f3_tva,
      total_ttc: f3_total_ttc,
      notes: 'Brouillon - À valider avec le client'
    });

    // Facture 4 - Payée (mois dernier)
    const facture4Articles = [
      { designation: 'Maintenance mensuelle', quantite: 3, prix_unitaire: 2000, remise: 0, tva: 20 },
      { designation: 'Hébergement annuel', quantite: 1, prix_unitaire: 1200, remise: 0, tva: 20 }
    ];
    const f4_total_ht = (2000 * 3) + 1200;
    const f4_tva = f4_total_ht * 0.20;
    const f4_total_ttc = f4_total_ht + f4_tva;

    await Facture.create({
      numero: 'FAC-2024-004',
      date_creation: lastMonth,
      date_echeance: now,
      client_id: clients[0]._id,
      user_id: userId,
      articles: facture4Articles,
      statut: 'Payée',
      total_ht: f4_total_ht,
      remise_globale: 5,
      remise_montant: f4_total_ht * 0.05,
      total_apres_remise: f4_total_ht * 0.95,
      tva: (f4_total_ht * 0.95) * 0.20,
      total_ttc: (f4_total_ht * 0.95) * 1.20,
      mode_paiement: 'Virement bancaire',
      date_encaissement: lastMonth,
      notes: 'Maintenance trimestrielle - Remise fidélité 5%'
    });

    console.log(`✅ 4 factures créées\n`);

    // RÉSUMÉ
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DONNÉES DE TEST CRÉÉES AVEC SUCCÈS!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📊 Récapitulatif:');
    console.log(`   👤 Utilisateur: ${userName}`);
    console.log(`   📂 ${categories.length} catégories`);
    console.log(`   👥 ${clients.length} clients`);
    console.log(`   📦 ${articles.length} articles`);
    console.log(`   📄 4 factures:`);
    console.log(`      - 2 Payées (${f1_total_ttc.toFixed(2)} + ${(f4_total_ht * 0.95 * 1.20).toFixed(2)} MAD)`);
    console.log(`      - 1 En attente (${f2_total_ttc.toFixed(2)} MAD)`);
    console.log(`      - 1 Draft (${f3_total_ttc.toFixed(2)} MAD)`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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
