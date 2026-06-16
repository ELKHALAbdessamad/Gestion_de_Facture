import express from 'express';
import jwt from 'jsonwebtoken';
import { createRequire } from 'module';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Parametres from '../models/Parametres.js';

const require = createRequire(import.meta.url);
const speakeasy = require('speakeasy');

const router = express.Router();

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('nom').notEmpty()
  ],
  async (req, res) => {
    try {
      console.log('📝 Données reçues:', req.body);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Erreurs de validation:', errors.array());
        return res.status(400).json({ 
          error: 'Données invalides',
          details: errors.array() 
        });
      }

      const { email, password, nom, role = 'user', entreprise, telephone } = req.body;

      // Vérifier si l'email existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('❌ Email déjà utilisé:', email);
        return res.status(400).json({ error: 'Email déjà utilisé' });
      }

      console.log('✅ Création utilisateur...', { email, nom, entreprise, telephone });

      // Créer l'utilisateur
      const user = new User({
        email,
        password,
        nom,
        role,
        entreprise: entreprise || '',
        telephone: telephone || ''
      });
      await user.save();

      console.log('✅ Utilisateur créé:', user._id);

      // Créer les paramètres par défaut (simples)
      const parametres = await Parametres.create({
        user_id: user._id,
        devise: 'MAD',
        entreprise_active: 0,
        entreprises: []
      });

      console.log('✅ Paramètres créés:', parametres._id);

      const token = generateToken(user._id);

      console.log('✅ Inscription réussie pour:', email);

      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          nom: user.nom,
          role: user.role
        }
      });
    } catch (error) {
      console.error('❌ Erreur register:', error);
      console.error('Stack:', error.stack);
      res.status(500).json({ 
        error: 'Erreur lors de la création du compte',
        details: error.message 
      });
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      if (!user.active) {
        return res.status(401).json({ error: 'Compte désactivé' });
      }

      const token = generateToken(user._id);

      // Si 2FA activé, retourner un token temporaire au lieu du JWT final
      if (user.totp_enabled) {
        const tempToken = jwt.sign(
          { userId: user._id, pending2fa: true },
          process.env.JWT_SECRET,
          { expiresIn: '5m' }
        );
        return res.json({
          requires2fa: true,
          tempToken,
          user: { id: user._id, email: user.email, nom: user.nom, role: user.role }
        });
      }

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          nom: user.nom,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Erreur login:', error);
      res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
  }
);

// POST /api/auth/2fa/verify — Vérifie le code TOTP après login et retourne le JWT final
router.post('/2fa/verify',
  [body('token').notEmpty(), body('tempToken').notEmpty()],
  async (req, res) => {
    try {
      const { token, tempToken } = req.body;

      let decoded;
      try {
        decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      } catch {
        return res.status(401).json({ error: 'Session expirée, reconnectez-vous' });
      }

      if (!decoded.pending2fa) {
        return res.status(400).json({ error: 'Token invalide' });
      }

      const user = await User.findById(decoded.userId);
      if (!user || !user.totp_enabled) {
        return res.status(400).json({ error: 'Utilisateur introuvable ou 2FA non activé' });
      }

      const verified = speakeasy.totp.verify({
        secret: user.totp_secret,
        encoding: 'base32',
        token,
        window: 1
      });

      if (!verified) {
        return res.status(401).json({ error: 'Code incorrect' });
      }

      const jwtToken = generateToken(user._id);
      res.json({
        token: jwtToken,
        user: { id: user._id, email: user.email, nom: user.nom, role: user.role }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
