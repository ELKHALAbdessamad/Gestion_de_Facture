import express from 'express';
import Client from '../models/Client.js';
import { authenticate } from '../middleware/auth.js';
import { addIdField, addIdToArray } from '../utils/transformId.js';

const router = express.Router();

// GET tous les clients (partagés entre tous les utilisateurs authentifiés)
router.get('/', authenticate, async (req, res) => {
  try {
    const clients = await Client.find().sort({ nom: 1 });
    res.json(addIdToArray(clients));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST créer un client
router.post('/', authenticate, async (req, res) => {
  try {
    const client = new Client({
      ...req.body,
      user_id: req.userId
    });
    await client.save();
    res.status(201).json(addIdField(client));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT modifier un client
router.put('/:id', authenticate, async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, user_id: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!client) {
      return res.status(404).json({ error: 'Client introuvable' });
    }
    res.json(addIdField(client));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE supprimer un client
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      user_id: req.userId
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client introuvable' });
    }
    res.json({ message: 'Client supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
