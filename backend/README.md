# API Gestion de Factures - Backend MongoDB

## 🚀 Démarrage rapide

```bash
# Installation
npm install

# Configuration
cp .env.example .env
# Modifier .env avec vos paramètres MongoDB

# Démarrage
npm run dev
```

## 📦 Technologies

- **Express.js** - Framework web
- **MongoDB** - Base de données
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification
- **bcryptjs** - Hash des mots de passe
- **express-validator** - Validation des données

## 🏗️ Structure

```
backend/
├── models/          # Modèles Mongoose
│   ├── User.js
│   ├── Facture.js
│   ├── Client.js
│   ├── Article.js
│   ├── Categorie.js
│   └── Parametres.js
├── routes/          # Routes API
│   ├── auth.js
│   ├── factures.js
│   ├── clients.js
│   ├── articles.js
│   ├── categories.js
│   ├── parametres.js
│   └── users.js
├── middleware/      # Middleware personnalisé
│   └── auth.js
├── server.js        # Point d'entrée
└── package.json
```

## 🔐 Authentification

L'API utilise JWT pour l'authentification.

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "nom": "John Doe",
  "role": "user",
  "entreprise": {
    "nom": "Ma Société",
    "siret": "12345678900001",
    "adresse": "123 rue Example"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Réponse :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "nom": "John Doe",
    "role": "user"
  }
}
```

### Utiliser le token

Ajouter le header `Authorization` à toutes les requêtes protégées :

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 📡 Endpoints

### Health Check
```http
GET /api/health
```

### Factures
```http
GET    /api/factures              # Liste des factures
GET    /api/factures/:id          # Une facture
POST   /api/factures              # Créer
PUT    /api/factures/:id          # Modifier
DELETE /api/factures/:id          # Supprimer (admin)
GET    /api/factures/public/:id   # Facture publique (QR code)
```

### Clients
```http
GET    /api/clients               # Liste
GET    /api/clients/:id           # Un client
POST   /api/clients               # Créer
PUT    /api/clients/:id           # Modifier
DELETE /api/clients/:id           # Supprimer
```

### Articles
```http
GET    /api/articles              # Liste
POST   /api/articles              # Créer
PUT    /api/articles/:id          # Modifier
DELETE /api/articles/:id          # Supprimer
```

### Catégories
```http
GET    /api/categories            # Liste
POST   /api/categories            # Créer
PUT    /api/categories/:id        # Modifier
DELETE /api/categories/:id        # Supprimer
```

### Paramètres
```http
GET    /api/parametres            # Paramètres de l'utilisateur
PUT    /api/parametres            # Modifier
```

### Utilisateurs
```http
GET    /api/users                 # Liste (admin)
GET    /api/users/me              # Profil
PUT    /api/users/me              # Modifier profil
```

## 🔧 Configuration

### Variables d'environnement (`.env`)

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/gestion-factures
# Ou Atlas: mongodb+srv://user:pass@cluster.mongodb.net/gestion-factures

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🛡️ Sécurité

- ✅ Authentification JWT
- ✅ Mots de passe hashés (bcrypt, 10 rounds)
- ✅ Validation des données (express-validator)
- ✅ CORS configuré
- ✅ Protection injection MongoDB (Mongoose)
- ✅ Isolement multi-tenant (user_id)

## 📊 Modèles de données

### User
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  nom: String (required),
  role: String ('admin' | 'user'),
  entreprise: {
    nom, siret, adresse, ville, code_postal, tel, email
  },
  active: Boolean
}
```

### Facture
```javascript
{
  numero: String (unique, required),
  date_creation: Date,
  date_echeance: Date,
  client_id: ObjectId (ref: Client),
  user_id: ObjectId (ref: User),
  articles: [{
    designation, quantite, prix_unitaire, remise, tva, categorie_id
  }],
  statut: String ('Draft' | 'En attente' | 'Payée' | 'Rejetée'),
  total_ht, tva, total_ttc: Number,
  remise_globale: Number,
  mode_paiement, date_depot, date_encaissement, type_virement: String,
  validated_by_admin: Boolean,
  notes: String
}
```

## 🚀 Déploiement

### Option 1 : Heroku
```bash
heroku create mon-app-factures
heroku addons:create mongolab
git push heroku main
```

### Option 2 : Railway.app
1. Connecter le repo GitHub
2. Ajouter MongoDB plugin
3. Configurer les variables d'environnement
4. Déploiement automatique

### Option 3 : VPS (DigitalOcean, AWS EC2)
```bash
# Installation PM2
npm install -g pm2

# Démarrer l'app
pm2 start server.js --name api-factures

# Auto-restart au boot
pm2 startup
pm2 save
```

## 📝 Scripts

```bash
npm start       # Démarrer (production)
npm run dev     # Démarrer (développement avec nodemon)
npm run migrate # Migrer depuis Firebase
```

## 🐛 Debug

```bash
# Logs en temps réel
npm run dev

# Vérifier MongoDB
mongo
> show dbs
> use gestion-factures
> show collections
> db.users.find()
```

## 📞 Support

Pour toute question, consultez :
- [Documentation MongoDB](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
