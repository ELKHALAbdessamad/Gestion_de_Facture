import express from 'express';
import Projet from '../models/Projet.js';
import Facture from '../models/Facture.js';
import { authenticate } from '../middleware/auth.js';
import { addIdField } from '../utils/transformId.js';

const router = express.Router();

// GET tous les projets de l'utilisateur
router.get('/', authenticate, async (req, res) => {
  try {
    const projets = await Projet.find({ user_id: req.userId })
      .populate('client_id', 'nom email tel')
      .sort({ createdAt: -1 });

    const transformed = projets.map(p => {
      const obj = p.toObject();
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

// GET un projet par ID avec ses factures
router.get('/:id', authenticate, async (req, res) => {
  try {
    const projet = await Projet.findOne({
      _id: req.params.id,
      user_id: req.userId
    }).populate('client_id', 'nom email tel adresse');

    if (!projet) {
      return res.status(404).json({ error: 'Projet introuvable' });
    }

    // Récupérer les factures liées à ce projet
    const factures = await Facture.find({
      projet_id: req.params.id,
      user_id: req.userId
    }).select('numero statut total_ttc date_creation');

    const obj = projet.toObject();
    obj.id = obj._id.toString();
    if (obj.client_id && typeof obj.client_id === 'object' && obj.client_id._id) {
      obj.client_id.id = obj.client_id._id.toString();
    }

    // Calculer KPIs du projet
    const facturesTransformed = factures.map(f => ({
      id: f._id.toString(),
      numero: f.numero,
      statut: f.statut,
      total_ttc: f.total_ttc,
      date_creation: f.date_creation
    }));

    const totalFacture = facturesTransformed.reduce((sum, f) => sum + (f.total_ttc || 0), 0);
    const totalEncaisse = facturesTransformed
      .filter(f => f.statut === 'Payée')
      .reduce((sum, f) => sum + (f.total_ttc || 0), 0);

    obj.factures = facturesTransformed;
    obj.kpis = {
      totalFactures: facturesTransformed.length,
      totalFacture,
      totalEncaisse,
      progression: obj.budget > 0 ? Math.round((totalEncaisse / obj.budget) * 100) : 0
    };

    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST créer un projet
router.post('/', authenticate, async (req, res) => {
  try {
    const projet = new Projet({
      ...req.body,
      user_id: req.userId
    });
    await projet.save();
    res.status(201).json(addIdField(projet));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT modifier un projet
router.put('/:id', authenticate, async (req, res) => {
  try {
    const projet = await Projet.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!projet) {
      return res.status(404).json({ error: 'Projet introuvable' });
    }
    res.json(addIdField(projet));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE supprimer un projet
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const projet = await Projet.findOneAndDelete({
      _id: req.params.id,
      user_id: req.userId
    });

    if (!projet) {
      return res.status(404).json({ error: 'Projet introuvable' });
    }
    res.json({ message: 'Projet supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
