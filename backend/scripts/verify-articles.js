import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Article from '../models/Article.js';
import Categorie from '../models/Categorie.js';
import User from '../models/User.js';

dotenv.config();

const verifyArticles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gestion-factures');
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer tous les articles
    const articles = await Article.find().populate('categorie_id user_id');
    
    console.log(`📦 Nombre total d'articles : ${articles.length}\n`);
    
    if (articles.length === 0) {
      console.log('❌ Aucun article trouvé dans MongoDB');
    } else {
      console.log('📋 Liste des articles :\n');
      articles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.designation}`);
        console.log(`   Prix : ${article.prix_unitaire} MAD`);
        console.log(`   Catégorie : ${article.categorie_id?.nom || 'Non définie'}`);
        console.log(`   TVA catégorie : ${article.categorie_id?.tva || 'N/A'}%`);
        console.log(`   User : ${article.user_id?.email || 'Non défini'}`);
        console.log(`   ID : ${article._id}`);
        console.log('');
      });
    }

    // Vérifier aussi les catégories
    const categories = await Categorie.find();
    console.log(`\n🏷️  Nombre total de catégories : ${categories.length}`);
    categories.forEach(cat => {
      console.log(`   - ${cat.nom} (TVA ${cat.tva}%)`);
    });

    // Vérifier les users
    const users = await User.find();
    console.log(`\n👤 Nombre total d'utilisateurs : ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Vérification terminée');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

verifyArticles();
