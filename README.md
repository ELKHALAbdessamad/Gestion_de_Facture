# Application de Gestion des Factures

Application web complète de gestion des factures développée avec React, Material UI, Firebase et JSON Server.

## 🚀 Fonctionnalités

### Pour tous les utilisateurs (USER)
- ✅ Tableau de bord avec statistiques
- ✅ Gestion des clients (CRUD)
- ✅ Création et modification de factures
- ✅ Ajout d'articles aux factures
- ✅ Calcul automatique des totaux (HT, TVA, TTC)
- ✅ Génération de factures PDF
- ✅ Suivi des paiements (statut, dates, type de virement)
- ✅ Historique des factures

### Pour les administrateurs (ADMIN)
- ✅ Toutes les fonctionnalités USER
- ✅ Gestion des articles (CRUD)
- ✅ Gestion des catégories (CRUD)
- ✅ Configuration des paramètres entreprise
- ✅ Validation des factures
- ✅ Tableau de bord analytique avancé

## 📋 Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Compte Firebase (déjà configuré)

## 🛠️ Installation

1. Cloner le projet et installer les dépendances:
```bash
npm install
```

2. Créer les utilisateurs de test dans Firebase:
```bash
node scripts/initUsers.js
```

## 🎯 Démarrage

### Démarrage complet (recommandé)
Lance le serveur JSON et l'application React simultanément:
```bash
npm run dev
```

### Démarrage séparé
Terminal 1 - JSON Server (port 3001):
```bash
npm run server
```

Terminal 2 - Application React (port 3000):
```bash
npm start
```

L'application sera accessible sur: http://localhost:3000

## 👥 Comptes de test

### Administrateur
- Email: `admin@test.com`
- Mot de passe: `admin123`

### Utilisateur standard
- Email: `user@test.com`
- Mot de passe: `user123`

## 📁 Structure du projet

```
src/
├── components/          # Composants réutilisables
│   └── Layout.js       # Layout principal avec navigation
├── contexts/           # Contextes React
│   └── AuthContext.js  # Gestion de l'authentification
├── pages/              # Pages de l'application
│   ├── Login.js
│   ├── Dashboard.js
│   ├── Factures.js
│   ├── FactureForm.js
│   ├── FactureDetail.js
│   ├── Clients.js
│   ├── Articles.js
│   ├── Categories.js
│   └── Parametres.js
├── routes/             # Configuration des routes
│   └── PrivateRoute.js
├── services/           # Services API
│   ├── firebaseService.js
│   └── jsonService.js
├── utils/              # Utilitaires
│   └── pdfGenerator.js
└── App.js              # Point d'entrée principal
```

## 🗄️ Architecture des données

### Firebase Realtime Database
- `users/` - Profils utilisateurs avec rôles
- `clients/` - Informations clients
- `factures/` - Factures avec articles et totaux

### JSON Server (db.json)
- `articles` - Catalogue d'articles
- `categories` - Catégories avec TVA
- `parametres` - Configuration entreprise

## 📊 Méthodes de facturation

L'application supporte plusieurs méthodes de calcul:

1. **Simple HT + TVA**: Calcul basique avec TVA fixe
2. **TVA par catégorie**: TVA différente selon la catégorie d'article
   - Informatique: 20%
   - Services: 10%
   - Formation: 0%

## 📄 Génération PDF

Les factures PDF incluent:
- Logo et coordonnées entreprise
- Informations client
- Tableau détaillé des articles
- Totaux (HT, TVA, TTC)
- Numéro et date de facture

## 🔒 Sécurité

- Authentification Firebase
- Routes protégées par rôle
- Validation des données
- Protection admin pour les paramètres

## 🎨 Technologies utilisées

- **Frontend**: React 19, Material UI
- **Backend**: Firebase Realtime Database, JSON Server
- **Routing**: React Router v6
- **PDF**: jsPDF + jspdf-autotable
- **Charts**: Recharts
- **Forms**: Formik + Yup
- **HTTP**: Axios

## ⚠️ Limites (nécessitent un backend serveur)

| Point | Note |
|-------|------|
| Envoi email automatique sans intervention | Utilise `mailto:` (ou EmailJS optionnel) — suffisant pour démo PFA |
| JWT réel | `localStorage` démo — Firebase Auth activable |
| Archivage annuel | Besoin stockage cloud supplémentaire |
| Multi-devise / Multi-société | Architecture future V2 |

## 📈 Évolutions futures (V2)

- Backend SMTP pour envoi email automatique
- Firebase Auth avec JWT réel
- Archivage légal cloud (10 ans)
- Multi-devise avec taux de change et consolidation multi-société
- Application mobile native

## 🐛 Dépannage

### Le JSON Server ne démarre pas
Vérifiez que le port 3001 est libre:
```bash
lsof -ti:3001 | xargs kill -9
```

### Erreurs Firebase
Vérifiez que les utilisateurs de test sont créés:
```bash
node scripts/initUsers.js
```

### Erreurs de dépendances
Supprimez node_modules et réinstallez:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Licence

Ce projet est un mini-projet éducatif.
# Gestion_de_Facture
