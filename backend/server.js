import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Pour obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import authRoutes from './routes/auth.js';
import factureRoutes from './routes/factures.js';
import clientRoutes from './routes/clients.js';
import articleRoutes from './routes/articles.js';
import categorieRoutes from './routes/categories.js';
import parametresRoutes from './routes/parametres.js';
import userRoutes from './routes/users.js';
import projetRoutes from './routes/projets.js';
import totpRoutes from './routes/totp.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (HTML)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categorieRoutes);
app.use('/api/parametres', parametresRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projets', projetRoutes);
app.use('/api/totp', totpRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Gestion de Factures est en ligne',
    timestamp: new Date().toISOString(),
    version: '1.0.1'
  });
});

// Page de téléchargement de facture (QR code)
app.get('/download-invoice/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'download-invoice.html'));
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connecté à MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
  });
})
.catch((error) => {
  console.error('❌ Erreur de connexion MongoDB:', error);
  process.exit(1);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
  process.exit(1);
});
