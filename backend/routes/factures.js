import express from 'express';
import Facture from '../models/Facture.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { addIdField, addIdToArray } from '../utils/transformId.js';

const router = express.Router();

// GET toutes les factures de l'utilisateur
router.get('/', authenticate, async (req, res) => {
  try {
    const factures = await Facture.find({ user_id: req.userId })
      .populate('client_id', 'nom email')
      .sort({ date_creation: -1 });
    
    // Transform _id to id for each facture and populated client
    const transformed = factures.map(facture => {
      const obj = facture.toObject ? facture.toObject() : facture;
      obj.id = obj._id.toString();
      
      if (obj.client_id && typeof obj.client_id === 'object' && obj.client_id._id) {
        obj.client_id.id = obj.client_id._id.toString();
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
    const facture = await Facture.findOne({ 
      _id: req.params.id,
      user_id: req.userId 
    }).populate('client_id');
    
    if (!facture) {
      return res.status(404).json({ error: 'Facture introuvable' });
    }
    
    const obj = facture.toObject();
    obj.id = obj._id.toString();
    
    if (obj.client_id && typeof obj.client_id === 'object' && obj.client_id._id) {
      obj.client_id.id = obj.client_id._id.toString();
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
    res.status(201).json(addIdField(facture));
  } catch (error) {
    console.error('Erreur POST facture:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// PUT mettre à jour une facture
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Exclure les champs immutables pour éviter l'erreur Mongoose
    const { _id, id, __v, user_id, createdAt, ...updateData } = req.body;

    const facture = await Facture.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!facture) {
      return res.status(404).json({ error: 'Facture introuvable' });
    }
    res.json(addIdField(facture));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE supprimer une facture (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const facture = await Facture.findOneAndDelete({
      _id: req.params.id,
      user_id: req.userId
    });
    
    if (!facture) {
      return res.status(404).json({ error: 'Facture introuvable' });
    }
    res.json({ message: 'Facture supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET facture publique (pour QR code)
router.get('/public/:id', async (req, res) => {
  try {
    const facture = await Facture.findById(req.params.id)
      .populate('client_id', 'nom email tel adresse');
    
    if (!facture) {
      return res.status(404).json({ error: 'Facture introuvable' });
    }
    
    const obj = facture.toObject();
    obj.id = obj._id.toString();
    
    if (obj.client_id && typeof obj.client_id === 'object' && obj.client_id._id) {
      obj.client_id.id = obj.client_id._id.toString();
    }
    
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET factures archivées par année
router.get('/archive/:year', authenticate, async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    const factures = await Facture.find({
      user_id: req.userId,
      date_creation: { $gte: startDate, $lt: endDate }
    }).populate('client_id', 'nom email').sort({ date_creation: -1 });

    const transformed = factures.map(facture => {
      const obj = facture.toObject();
      obj.id = obj._id.toString();
      if (obj.client_id && typeof obj.client_id === 'object' && obj.client_id._id) {
        obj.client_id.id = obj.client_id._id.toString();
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

// GET liste des années disponibles
router.get('/archive-years/list', authenticate, async (req, res) => {
  try {
    const factures = await Facture.find({ user_id: req.userId }, 'date_creation');
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

export default router;

