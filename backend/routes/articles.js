import express from 'express';
import Article from '../models/Article.js';
import { authenticate } from '../middleware/auth.js';
import { addIdField, addIdToArray } from '../utils/transformId.js';

const router = express.Router();

// GET tous les articles
router.get('/', authenticate, async (req, res) => {
  try {
    const articles = await Article.find({ user_id: req.userId })
      .populate('categorie_id', 'nom tva');
    
    // Transform _id to id for each article and populated categorie
    const transformed = articles.map(article => {
      const obj = article.toObject ? article.toObject() : article;
      obj.id = obj._id.toString();
      
      // If categorie_id is populated, also add id field to it
      if (obj.categorie_id && typeof obj.categorie_id === 'object' && obj.categorie_id._id) {
        obj.categorie_id.id = obj.categorie_id._id.toString();
      }
      
      return obj;
    });
    
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST créer un article
router.post('/', authenticate, async (req, res) => {
  try {
    const article = new Article({
      ...req.body,
      user_id: req.userId
    });
    await article.save();
    res.status(201).json(addIdField(article));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT modifier un article
router.put('/:id', authenticate, async (req, res) => {
  try {
    const article = await Article.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!article) {
      return res.status(404).json({ error: 'Article introuvable' });
    }
    res.json(addIdField(article));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE supprimer un article
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const article = await Article.findOneAndDelete({
      _id: req.params.id,
      user_id: req.userId
    });
    
    if (!article) {
      return res.status(404).json({ error: 'Article introuvable' });
    }
    res.json({ message: 'Article supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
