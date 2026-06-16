import express from 'express';
import User from '../models/User.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET tous les utilisateurs (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET profil de l'utilisateur connecté
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT modifier le profil
router.put('/me', authenticate, async (req, res) => {
  try {
    const { nom, entreprise } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { nom, entreprise },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
