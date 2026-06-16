import express from 'express';
import Categorie from '../models/Categorie.js';
import { authenticate } from '../middleware/auth.js';
import { transformMongoId } from '../middleware/transformId.js';

const router = express.Router();

// GET toutes les catégories (catalogue partagé — tous les utilisateurs authentifiés)
router.get('/', authenticate, async (req, res) => {
  try {
    const categories = await Categorie.find().sort({ nom: 1 });
    const transformed = categories.map(cat => {
      const obj = cat.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST créer une catégorie
router.post('/', authenticate, async (req, res) => {
  try {
    const categorie = new Categorie({
      ...req.body,
      user_id: req.userId
    });
    await categorie.save();
    const obj = categorie.toObject();
    obj.id = obj._id.toString();
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT modifier une catégorie
router.put('/:id', authenticate, async (req, res) => {
  try {
    const categorie = await Categorie.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!categorie) {
      return res.status(404).json({ error: 'Catégorie introuvable' });
    }
    const obj = categorie.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE supprimer une catégorie
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const categorie = await Categorie.findOneAndDelete({
      _id: req.params.id,
      user_id: req.userId
    });
    
    if (!categorie) {
      return res.status(404).json({ error: 'Catégorie introuvable' });
    }
    res.json({ message: 'Catégorie supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
