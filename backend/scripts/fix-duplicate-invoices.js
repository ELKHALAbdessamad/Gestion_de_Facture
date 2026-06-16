import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Facture from '../models/Facture.js';

dotenv.config();

async function fixDuplicateInvoices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver tous les numéros de facture en double
    const duplicates = await Facture.aggregate([
      {
        $group: {
          _id: '$numero',
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    if (duplicates.length === 0) {
      console.log('✅ Aucune facture en double trouvée.');
      process.exit(0);
    }

    console.log(`⚠️  ${duplicates.length} numéro(s) de facture en double détecté(s):`);
    
    for (const dup of duplicates) {
      console.log(`\n📄 Numéro: ${dup._id} (${dup.count} occurrences)`);
      
      // Garder la première facture, renommer les autres
      const [keep, ...toRename] = dup.ids;
      
      console.log(`   Garder: ${keep}`);
      
      for (let i = 0; i < toRename.length; i++) {
        const oldFacture = await Facture.findById(toRename[i]);
        const timestamp = Date.now().toString().slice(-6);
        const newNumero = `${dup._id}-DUP${timestamp + i}`;
        
        await Facture.findByIdAndUpdate(toRename[i], {
          numero: newNumero
        });
        
        console.log(`   Renommé ${toRename[i]}: ${dup._id} → ${newNumero}`);
      }
    }

    console.log('\n✅ Nettoyage terminé !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

fixDuplicateInvoices();
