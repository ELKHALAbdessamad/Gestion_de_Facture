import express from 'express';
import Facture from '../models/Facture.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { addIdField, addIdToArray } from '../utils/transformId.js';
import Parametres from '../models/Parametres.js';
import Client from '../models/Client.js';

const router = express.Router();

// Route publique pour téléchargement via QR code (doit être AVANT les routes authentifiées)
router.get('/download/:id', async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id)
      .populate('client_id', 'nom email tel adresse');
    
    if (!facture) {
      return res.status(404).json({ error: 'Facture introuvable' });
    }

    // Charger les paramètres pour le PDF
    const parametres = await Parametres.findOne();
    
    const factureObj = facture.toObject();
    factureObj.id = factureObj._id.toString();
    
    if (factureObj.client_id && typeof factureObj.client_id === 'object' && factureObj.client_id._id) {
      factureObj.client_id.id = factureObj.client_id._id.toString();
    }
    
    res.json({
      facture: factureObj,
      client: factureObj.client_id,
      parametres: parametres ? parametres.toObject() : null,
    });
  } catch (error) {
    console.error('Erreur route download:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route publique pour synchronisation depuis backend local vers Atlas
// Permet au backend local d'envoyer les factures vers Railway/Atlas
router.post('/sync', async (req, res) => {
  try {
    const { facture, client } = req.body;
    
    if (!facture || !facture._id) {
      return res.status(400).json({ error: 'Données de facture invalides' });
    }

    // Vérifier si la facture existe déjà (par _id)
    const existing = await Facture.findById(facture._id);
    
    if (existing) {
      // Mettre à jour la facture existante
      const { _id, __v, createdAt, updatedAt, ...updateData } = facture;
      await Facture.findByIdAndUpdate(facture._id, updateData);
      console.log(`✅ Facture ${facture.numero} synchronisée (mise à jour)`);
    } else {
      // Créer une nouvelle facture avec l'ID exact
      const newFacture = new Facture(facture);
      newFacture._id = facture._id; // Forcer le même ID
      newFacture.isNew = true;
      await newFacture.save();
      console.log(`✅ Facture ${facture.numero} synchronisée (création)`);
    }

    res.json({ success: true, message: 'Facture synchronisée vers Atlas' });
  } catch (error) {
    console.error('❌ Erreur synchronisation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route publique pour synchronisation des suppressions depuis backend local vers Atlas
router.delete('/sync-delete/:id', async (req, res) => {
  try {
    const facture = await Facture.findByIdAndDelete(req.params.id);
    
    if (!facture) {
      console.log(`⚠️ Facture ${req.params.id} déjà supprimée sur Atlas`);
      return res.json({ success: true, message: 'Facture déjà supprimée' });
    }
    
    console.log(`🗑️ Facture ${facture.numero} supprimée sur Atlas via sync`);
    res.json({ success: true, message: 'Facture supprimée sur Atlas' });
  } catch (error) {
    console.error('❌ Erreur synchronisation suppression:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET toutes les factures de l'utilisateur (ou toutes si admin) - EXCLUT les archivées
router.get('/', authenticate, async (req, res) => {
  try {
    // Si admin, voir toutes les factures non archivées. Sinon, seulement celles de l'utilisateur non archivées
    const filter = req.user.role === 'admin' 
      ? { archived: { $ne: true } }
      : { user_id: req.userId, archived: { $ne: true } };
    
    const factures = await Facture.find(filter)
      .populate('client_id', 'nom email')
      .populate('user_id', 'email nom prenom')
      .sort({ date_creation: -1 });
    
    // Transform _id to id for each facture and populated client
    const transformed = factures.map(facture => {
      const obj = facture.toObject ? facture.toObject() : facture;
      obj.id = obj._id.toString();
      
      if (obj.client_id && typeof obj.client_id === 'object' && obj.client_id._id) {
        obj.client_id.id = obj.client_id._id.toString();
      }
      
      if (obj.user_id && typeof obj.user_id === 'object' && obj.user_id._id) {
        obj.user_id.id = obj.user_id._id.toString();
      }
      
      return obj;
    });
    
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET une facture par ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Si admin, peut accéder à toute facture. Sinon, seulement les siennes
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, user_id: req.userId };
    
    const facture = await Facture.findOne(filter)
      .populate('client_id')
      .populate('user_id', 'email nom prenom');
    
    if (!facture) {
      return res.status(404).json({ error: 'Facture introuvable' });
    }
    
    const obj = facture.toObject();
    obj.id = obj._id.toString();
    
    if (obj.client_id && typeof obj.client_id === 'object' && obj.client_id._id) {
      obj.client_id.id = obj.client_id._id.toString();
    }
    
    if (obj.user_id && typeof obj.user_id === 'object' && obj.user_id._id) {
      obj.user_id.id = obj.user_id._id.toString();
    }
    
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST créer une facture
router.post('/', authenticate, async (req, res) => {
  try {
    const facture = new Facture({
      ...req.body,
      user_id: req.userId
    });
    await facture.save();
    
    // ✨ Synchronisation automatique vers Railway/Atlas
    try {
      const railwayUrl = process.env.RAILWAY_SYNC_URL || 'https://gestiondefacture-production.up.railway.app';
      const factureObj = facture.toObject();
      
      await fetch(`${railwayUrl}/api/factures/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facture: factureObj })
      });
      
      console.log(`✅ Facture ${facture.numero} synchronisée vers Railway`);
    } catch (syncError) {
      console.error('⚠️ Erreur synchronisation (non bloquante):', syncError.message);
      // On ne bloque pas la création même si la sync échoue
    }
    
    res.status(201).json(addIdField(facture));
  } catch (error) {
    console.error('Erreur POST facture:', error.message);
    
    // Gestion spécifique de l'erreur de duplication
    if (error.code === 11000 && error.keyPattern?.numero) {
      return res.status(400).json({ 
        error: `Le numéro de facture "${req.body.numero}" existe déjà. Veuillez utiliser un numéro différent.` 
      });
    }
    
    res.status(400).json({ error: error.message });
  }
});

// PUT mettre à jour une facture
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Exclure les champs immutables pour éviter l'erreur Mongoose
    const { _id, id, __v, user_id, createdAt, ...updateData } = req.body;

    // Vérification : seul l'admin peut changer le statut en "Payée" ou "Rejetée"
    if (updateData.statut && ['Payée', 'Rejetée'].includes(updateData.statut)) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Seul un administrateur peut valider ou rejeter une facture.' 
        });
      }
    }

    // Si admin, peut modifier toute facture. Sinon, seulement les siennes
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, user_id: req.userId };

    const facture = await Facture.findOneAndUpdate(
      filter,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!facture) {
      return res.status(404).json({ error: 'Facture introuvable' });
    }
    
    // ✨ Synchronisation automatique vers Railway/Atlas
    try {
      const railwayUrl = process.env.RAILWAY_SYNC_URL || 'https://gestiondefacture-production.up.railway.app';
      const factureObj = facture.toObject();
      
      await fetch(`${railwayUrl}/api/factures/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facture: factureObj })
      });
      
      console.log(`✅ Facture ${facture.numero} re-synchronisée vers Railway`);
    } catch (syncError) {
      console.error('⚠️ Erreur synchronisation (non bloquante):', syncError.message);
    }
    
    res.json(addIdField(facture));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE supprimer une facture (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    console.log(`🔍 Tentative de suppression de facture avec ID: ${req.params.id}`);
    console.log(`👤 Utilisateur: ${req.user.email}, Role: ${req.user.role}`);
    
    // Admin peut supprimer n'importe quelle facture
    const facture = await Facture.findByIdAndDelete(req.params.id);
    
    if (!facture) {
      console.log(`❌ Facture non trouvée avec l'ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Facture introuvable' });
    }
    
    console.log(`🗑️ Facture ${facture.numero} supprimée localement par ${req.user.email}`);
    
    // ✨ Synchronisation de la suppression vers Railway/Atlas
    try {
      const railwayUrl = process.env.RAILWAY_SYNC_URL || 'https://gestiondefacture-production.up.railway.app';
      
      await fetch(`${railwayUrl}/api/factures/sync-delete/${req.params.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`✅ Facture ${facture.numero} supprimée aussi sur Railway/Atlas`);
    } catch (syncError) {
      console.error('⚠️ Erreur synchronisation suppression (non bloquante):', syncError.message);
      // On ne bloque pas la suppression locale même si la sync échoue
    }
    
    res.json({ message: 'Facture supprimée' });
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression:`, error);
    res.status(500).json({ error: error.message });
  }
});

// GET factures archivées par année - SEULEMENT les archivées
router.get('/archive/:year', authenticate, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    // Si admin, voir toutes les factures archivées de l'année. Sinon, seulement celles de l'utilisateur
    const filter = req.user.role === 'admin'
      ? { archived: true, date_creation: { $gte: startDate, $lt: endDate } }
      : { user_id: req.userId, archived: true, date_creation: { $gte: startDate, $lt: endDate } };

    const factures = await Facture.find(filter)
      .populate('client_id', 'nom email')
      .populate('user_id', 'email nom prenom')
      .sort({ date_creation: -1 });

    const transformed = factures.map(facture => {
      const obj = facture.toObject();
      obj.id = obj._id.toString();
      if (obj.client_id && typeof obj.client_id === 'object' && obj.client_id._id) {
        obj.client_id.id = obj.client_id._id.toString();
      }
      if (obj.user_id && typeof obj.user_id === 'object' && obj.user_id._id) {
        obj.user_id.id = obj.user_id._id.toString();
      }
      return obj;
    });

    const totalHT = transformed.reduce((s, f) => s + (f.total_ht || 0), 0);
    const totalTTC = transformed.reduce((s, f) => s + (f.total_ttc || 0), 0);
    const totalEncaisse = transformed.filter(f => f.statut === 'Payée').reduce((s, f) => s + (f.total_ttc || 0), 0);

    res.json({
      year,
      factures: transformed,
      stats: {
        count: transformed.length,
        totalHT,
        totalTTC,
        totalEncaisse,
        payees: transformed.filter(f => f.statut === 'Payée').length,
        enAttente: transformed.filter(f => f.statut === 'En attente').length,
        rejetees: transformed.filter(f => f.statut === 'Rejetée').length,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET liste des années disponibles - SEULEMENT factures archivées
router.get('/archive-years/list', authenticate, async (req, res) => {
  try {
    // Si admin, toutes les années de factures archivées. Sinon, seulement les années de l'utilisateur
    const filter = req.user.role === 'admin' ? { archived: true } : { user_id: req.userId, archived: true };
    const factures = await Facture.find(filter, 'date_creation');
    const years = [...new Set(factures.map(f => new Date(f.date_creation).getFullYear()))];
    years.sort((a, b) => b - a);
    res.json(years);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST send-email
router.post('/:id/send-email', authenticate, async (req, res) => {
  try {
    const facture = await Facture.findOne({
      _id: req.params.id,
      user_id: req.userId
    }).populate('client_id');

    if (!facture) {
      return res.status(404).json({ error: 'Facture introuvable' });
    }

    // Simulation d'envoi d'email
    console.log(`[Email Backend] Envoi de la facture ${facture.numero} à ${facture.client_id?.email}`);

    res.json({
      success: true,
      message: `Email envoyé avec succès à ${facture.client_id?.email || 'le client'}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST archiver/désarchiver une facture (admin only)
router.post('/:id/toggle-archive', authenticate, requireAdmin, async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id);
    
    if (!facture) {
      return res.status(404).json({ error: 'Facture introuvable' });
    }

    // Toggle archived status
    facture.archived = !facture.archived;
    facture.archived_at = facture.archived ? new Date() : null;
    facture.archived_by = facture.archived ? req.user.email : null;
    
    await facture.save();
    
    const action = facture.archived ? 'archivée' : 'désarchivée';
    res.json({ 
      success: true, 
      message: `Facture ${facture.numero} ${action}`,
      facture: addIdField(facture)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

