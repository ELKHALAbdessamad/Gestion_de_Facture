import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion-factures';

// Schéma User (copie du modèle)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  nom: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  entreprise: { type: String, default: '' },
  telephone: { type: String, default: '' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Schéma Parametres (copie du modèle)
const parametresSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  devise: { type: String, default: 'MAD' },
  tva_defaut: { type: Number, default: 20 },
  entreprise_active: { type: Number, default: 0 },
  entreprises: [{ type: Object }]
}, { timestamps: true });

const Parametres = mongoose.model('Parametres', parametresSchema);

// Fonction pour créer un utilisateur
async function createUser(email, password, nom, role, entreprise = '', telephone = '') {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`⚠️  L'utilisateur ${email} existe déjà (ID: ${existing._id}, Role: ${existing.role})`);
      return existing;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await User.create({
      email,
      password: hashedPassword,
      nom,
      role,
      entreprise,
      telephone,
      active: true
    });

    console.log(`✅ Utilisateur créé: ${email}`);
    console.log(`   - ID: ${user._id}`);
    console.log(`   - Nom: ${nom}`);
    console.log(`   - Role: ${role}`);

    // Créer les paramètres par défaut
    const parametres = await Parametres.create({
      user_id: user._id,
      devise: 'MAD',
      tva_defaut: 20,
      entreprise_active: 0,
      entreprises: []
    });

    console.log(`✅ Paramètres créés (ID: ${parametres._id})`);

    return user;
  } catch (error) {
    console.error(`❌ Erreur lors de la création de ${email}:`, error.message);
    throw error;
  }
}

// Fonction principale
async function main() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    console.log(`   URI: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('👥 Création des utilisateurs...\n');

    // Créer un compte ADMIN
    await createUser(
      'admin@test.com',
      'admin123',
      'Administrateur',
      'admin',
      'Mon Entreprise',
      '+212 6 12 34 56 78'
    );

    console.log('');

    // Créer un compte USER
    await createUser(
      'user@test.com',
      'user123',
      'Utilisateur Test',
      'user',
      'Entreprise Test',
      '+212 6 98 76 54 32'
    );

    console.log('\n✅ Tous les utilisateurs ont été créés avec succès!\n');
    console.log('📋 Récapitulatif:');
    console.log('   ADMIN: admin@test.com / admin123');
    console.log('   USER:  user@test.com / user123');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

main();
