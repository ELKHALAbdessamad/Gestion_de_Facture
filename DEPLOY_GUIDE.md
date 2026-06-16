# 🚀 Guide de Déploiement NovaFact

## Préparation complète ✅

Tous les fichiers de configuration ont été créés :
- `backend/render.yaml` - Configuration Render
- `vercel.json` - Configuration Vercel
- `.env.production` - Variables d'environnement production
- `backend/package.json` - Mis à jour avec engines Node.js

---

## 📋 ÉTAPE 1 : Déployer le Backend sur Render

### A. Créer une base de données MongoDB Atlas (GRATUIT)

1. Allez sur https://www.mongodb.com/cloud/atlas
2. Cliquez sur "Try Free"
3. Créez un compte
4. Créez un cluster GRATUIT (M0)
5. Dans "Database Access" → Créez un utilisateur :
   - Username: `novafact`
   - Password: `VotreMotDePasseSecurise123`
6. Dans "Network Access" → Cliquez "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)
7. Cliquez sur "Connect" → "Connect your application"
8. Copiez la connection string :
   ```
   mongodb+srv://novafact:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
9. Remplacez `<password>` par votre mot de passe

**Connection string finale :**
```
mongodb+srv://novafact:VotreMotDePasseSecurise123@cluster0.xxxxx.mongodb.net/novafact?retryWrites=true&w=majority
```

---

### B. Déployer sur Render

1. **Sur Render Dashboard (où vous êtes actuellement)**

2. Cliquez sur **"New +" → "Web Service"**

3. **Option 1 : Avec GitHub (Recommandé)**
   - Cliquez "Connect GitHub"
   - Autorisez Render à accéder à vos repos
   - Sélectionnez votre repository
   
   **OU**
   
   **Option 2 : Sans GitHub**
   - Cliquez "Public Git repository"
   - Entrez l'URL de votre repo public

4. **Configuration du service :**
   ```
   Name: novafact-backend
   Region: Frankfurt (le plus proche du Maroc)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

5. **Variables d'environnement (IMPORTANT)** - Cliquez "Advanced" :
   
   ```env
   NODE_ENV = production
   PORT = 5000
   MONGODB_URI = mongodb+srv://novafact:VotreMotDePasseSecurise123@cluster0.xxxxx.mongodb.net/novafact?retryWrites=true&w=majority
   JWT_SECRET = votre-secret-super-securise-aleatoire-123456789
   EMAIL_USER = votre-email@gmail.com
   EMAIL_PASS = votre-mot-de-passe-app-gmail
   ```

6. Cliquez **"Create Web Service"**

7. **Attendez le déploiement** (5-10 minutes)

8. **Copiez votre URL Backend** :
   ```
   https://novafact-backend.onrender.com
   ```

---

## 📋 ÉTAPE 2 : Déployer le Frontend sur Vercel

### A. Mettre à jour l'URL du backend

1. Ouvrez le fichier `.env.production`
2. Remplacez l'URL par celle obtenue de Render :
   ```
   REACT_APP_API_URL=https://novafact-backend.onrender.com/api
   ```

### B. Déployer sur Vercel

1. Allez sur https://vercel.com
2. Créez un compte avec GitHub
3. Cliquez **"Add New" → "Project"**
4. Importez votre repository GitHub
5. **Configuration :**
   ```
   Framework Preset: Create React App
   Root Directory: ./
   Build Command: npm run build
   Output Directory: build
   ```

6. **Variables d'environnement :**
   ```
   REACT_APP_API_URL = https://novafact-backend.onrender.com/api
   ```

7. Cliquez **"Deploy"**

8. **Attendez le déploiement** (2-5 minutes)

9. **Copiez votre URL Frontend** :
   ```
   https://novafact.vercel.app
   ```

---

## 📋 ÉTAPE 3 : Configuration finale

### A. Mettre à jour l'URL publique dans l'application

1. Connectez-vous à votre application : `https://novafact.vercel.app`
2. Allez dans **Paramètres**
3. Ajoutez un nouveau champ **"URL Publique"**
4. Entrez : `https://novafact.vercel.app`
5. Sauvegardez

### B. Configurer CORS dans le backend

Le backend doit accepter les requêtes de votre frontend Vercel.

Dans `backend/server.js`, vérifiez que CORS accepte votre URL Vercel :
```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://novafact.vercel.app',  // Ajoutez votre URL Vercel
  ],
  credentials: true
};
```

---

## ✅ Vérification

### Backend
- Testez : `https://novafact-backend.onrender.com/api/health`
- Doit retourner : `{"status":"ok"}`

### Frontend
- Ouvrez : `https://novafact.vercel.app`
- Connectez-vous avec vos identifiants

### QR Code
1. Créez une facture
2. Téléchargez le PDF
3. Scannez le QR code avec votre téléphone
4. Doit ouvrir : `https://novafact.vercel.app/download-invoice/xxx`

---

## 🔥 Problèmes courants

### Le backend ne démarre pas
- Vérifiez les logs Render
- Vérifiez que MongoDB_URI est correct
- Vérifiez que toutes les variables d'environnement sont définies

### Le frontend ne se connecte pas au backend
- Vérifiez que REACT_APP_API_URL est correct dans Vercel
- Vérifiez CORS dans server.js
- Vérifiez les logs du navigateur (F12 → Console)

### QR code ne fonctionne pas
- Vérifiez que l'URL publique est configurée dans Paramètres
- Vérifiez que la route `/download-invoice/:id` fonctionne

---

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
1. Les logs Render (backend)
2. Les logs Vercel (frontend)
3. La console du navigateur (F12)

---

## 🎉 Félicitations !

Votre application NovaFact est maintenant accessible **partout dans le monde** !

Les QR codes fonctionneront à Tanger, Casablanca, Paris, New York... partout ! 🌍
