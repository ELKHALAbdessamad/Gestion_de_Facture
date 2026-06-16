import express from 'express';
import { createRequire } from 'module';
import QRCode from 'qrcode';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';

const require = createRequire(import.meta.url);
const speakeasy = require('speakeasy');

const router = express.Router();

// POST /api/totp/setup — Génère un secret et retourne le QR code
router.post('/setup', authenticate, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `GestionFactures (${req.user.email})`,
      length: 20
    });

    // Sauvegarder le secret temporairement (pas encore activé)
    await User.findByIdAndUpdate(req.userId, {
      totp_secret: secret.base32,
      totp_enabled: false
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/totp/verify-setup — Vérifie le code et active le 2FA
router.post('/verify-setup', authenticate, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.userId);

    if (!user.totp_secret) {
      return res.status(400).json({ error: 'TOTP non configuré. Lancez /setup d\'abord.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ error: 'Code incorrect' });
    }

    await User.findByIdAndUpdate(req.userId, { totp_enabled: true });
    res.json({ success: true, message: '2FA activé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/totp/disable — Désactive le 2FA
router.post('/disable', authenticate, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.userId);

    if (!user.totp_enabled) {
      return res.status(400).json({ error: '2FA non activé' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ error: 'Code incorrect' });
    }

    await User.findByIdAndUpdate(req.userId, {
      totp_secret: null,
      totp_enabled: false
    });

    res.json({ success: true, message: '2FA désactivé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/totp/status — Statut 2FA de l'utilisateur
router.get('/status', authenticate, async (req, res) => {
  res.json({ totp_enabled: req.user.totp_enabled });
});

export default router;
