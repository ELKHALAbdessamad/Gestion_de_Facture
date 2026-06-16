import mongoose from 'mongoose';
import Facture from '../models/Facture.js';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

// Agent HTTPS qui ignore les erreurs de certificat (pour développement uniquement)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const syncExistingFactures = async () => {
  try {
    // Connexion à MongoDB local
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB local');

    // Récupérer toutes les factures
    const factures = await Facture.find({});
    console.log(`📦 ${factures.length} facture(s) trouvée(s) en local`);

    const railwayUrl = process.env.RAILWAY_SYNC_URL || 'https://gestiondefacture-production.up.railway.app';

    // Synchroniser chaque facture
    for (const facture of factures) {
      try {
        const factureObj = facture.toObject();
        
        const response = await fetch(`${railwayUrl}/api/factures/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ facture: factureObj }),
          agent: httpsAgent
        });

        const result = await response.json();
        
        if (response.ok) {
          console.log(`✅ Facture ${facture.numero} synchronisée vers Railway/Atlas`);
        } else {
          console.error(`❌ Erreur sync ${facture.numero}:`, result.error);
        }
      } catch (syncError) {
        console.error(`❌ Erreur réseau pour ${facture.numero}:`, syncError.message);
      }
    }

    console.log('\n🎉 Synchronisation terminée !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

syncExistingFactures();
