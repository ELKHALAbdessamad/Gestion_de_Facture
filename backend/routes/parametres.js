import express from 'express';
import Parametres from '../models/Parametres.js';
import { authenticate } from '../middleware/auth.js';
import { addIdField } from '../utils/transformId.js';

const router = express.Router();

// GET paramètres de l'utilisateur
router.get('/', authenticate, async (req, res) => {
  try {
    let parametres = await Parametres.findOne({ user_id: req.userId });
    
    if (!parametres) {
      // Créer des paramètres par défaut si inexistants
      parametres = await Parametres.create({
        user_id: req.userId,
        devise: 'MAD',
        entreprise_active: 0,
        entreprises: []
      });
    }
    
    res.json(addIdField(parametres));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT modifier les paramètres
router.put('/', authenticate, async (req, res) => {
  try {
    // Extraire uniquement les champs autorisés pour éviter d'écraser user_id
    console.log('PUT parametres body:', JSON.stringify(req.body, null, 2));
    const { devise, entreprise_active, entreprises, entreprise } = req.body;
    const update = {};
    if (devise !== undefined) update.devise = devise;
    if (entreprise_active !== undefined) update.entreprise_active = entreprise_active;
    if (entreprises !== undefined) update.entreprises = entreprises;
    if (entreprise !== undefined) update.entreprise = entreprise;

    const parametres = await Parametres.findOneAndUpdate(
      { user_id: req.userId },
      { $set: update },
      { new: true, upsert: true }
    );
    
    res.json(addIdField(parametres));
  } catch (error) {
    console.error('Erreur PUT parametres:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
