# ✅ Checklist de Déploiement NovaFact

## 📋 Avant de commencer

- [ ] J'ai un compte GitHub (optionnel mais recommandé)
- [ ] J'ai lu le fichier `DEPLOIEMENT_RAPIDE.md`
- [ ] Mon code est prêt et fonctionne en local

---

## 1️⃣ MongoDB Atlas (Base de données) - 5 minutes

- [ ] Compte créé sur https://mongodb.com/cloud/atlas
- [ ] Cluster gratuit M0 créé
- [ ] Utilisateur de base de données créé (username + password)
- [ ] Accès réseau configuré (0.0.0.0/0)
- [ ] Connection string copiée et password remplacé
- [ ] `/novafact` ajouté à la connection string

**Ma connection string :**
```
mongodb+srv://________________:________________@________________.mongodb.net/novafact?retryWrites=true&w=majority
```

---

## 2️⃣ Render (Backend) - 10 minutes

- [ ] Compte créé sur https://render.com
- [ ] "New Web Service" créé
- [ ] Repository connecté (GitHub) ou code uploadé
- [ ] Configuration remplie :
  - [ ] Name: `novafact-backend`
  - [ ] Region: Frankfurt
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
  - [ ] Instance Type: Free

- [ ] Variables d'environnement ajoutées :
  - [ ] `NODE_ENV` = `production`
  - [ ] `PORT` = `5000`
  - [ ] `MONGODB_URI` = (ma connection string MongoDB)
  - [ ] `JWT_SECRET` = (clé aléatoire longue)
  - [ ] `CORS_ORIGIN` = `*`

- [ ] Déploiement lancé
- [ ] Déploiement terminé avec succès
- [ ] Service en ligne (statut vert)

**Mon URL Backend :**
```
https://_______________________________________.onrender.com
```

---

## 3️⃣ Vercel (Frontend) - 5 minutes

- [ ] Compte créé sur https://vercel.com
- [ ] "New Project" créé
- [ ] Repository importé depuis GitHub
- [ ] Configuration :
  - [ ] Framework: Create React App
  - [ ] Root Directory: `./`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `build`

- [ ] Variable d'environnement ajoutée :
  - [ ] `REACT_APP_API_URL` = (mon URL Render + /api)

- [ ] Déploiement lancé
- [ ] Déploiement terminé avec succès

**Mon URL Frontend :**
```
https://_______________________________________.vercel.app
```

---

## 4️⃣ Configuration Backend CORS - 2 minutes

- [ ] Retourné sur Render → Mon service backend
- [ ] Environment → Édité `CORS_ORIGIN`
- [ ] Nouvelle valeur : (mon URL Vercel)
- [ ] Service redémarré automatiquement

---

## 5️⃣ Configuration URL Publique dans l'App - 2 minutes

- [ ] Ouvert mon URL Vercel
- [ ] Connecté avec mes identifiants
- [ ] Allé dans Paramètres
- [ ] Ajouté champ "URL Publique" (si nécessaire)
- [ ] Entré mon URL Vercel
- [ ] Sauvegardé

---

## 6️⃣ Tests Finaux - 5 minutes

### Test Backend
- [ ] Ouvert : `https://mon-backend.onrender.com/api/health`
- [ ] Résultat : `{"status":"OK"}`

### Test Frontend
- [ ] Ouvert : `https://mon-frontend.vercel.app`
- [ ] Page de connexion s'affiche
- [ ] Connexion réussie
- [ ] Dashboard s'affiche correctement

### Test Facture
- [ ] Créé une nouvelle facture
- [ ] Facture sauvegardée
- [ ] Téléchargé le PDF
- [ ] PDF généré correctement
- [ ] QR code visible sur le PDF

### Test QR Code (LE PLUS IMPORTANT)
- [ ] Scanné le QR code avec mon téléphone
- [ ] Page de téléchargement s'ouvre sur le téléphone
- [ ] Téléchargé le PDF depuis le téléphone
- [ ] PDF téléchargé correctement

---

## 🎉 Déploiement Terminé !

Si tous les points sont cochés → **FÉLICITATIONS !** 🎊

Votre application NovaFact est maintenant accessible **partout dans le monde** !

---

## 📊 Mes URLs Finales

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | https://_________________________________ |
| **Backend (Render)** | https://_________________________________ |
| **MongoDB (Atlas)** | (connection string sauvegardée) |

---

## 🆘 En cas de problème

### Backend ne démarre pas
1. Vérifier les logs Render (onglet "Logs")
2. Vérifier `MONGODB_URI` est correct
3. Vérifier que MongoDB Atlas autorise les connexions (0.0.0.0/0)

### Frontend ne se connecte pas
1. Vérifier `REACT_APP_API_URL` dans Vercel
2. Vérifier `CORS_ORIGIN` dans Render
3. Ouvrir Console navigateur (F12) pour voir les erreurs

### QR code ne fonctionne pas
1. Vérifier URL publique dans Paramètres de l'app
2. Tester manuellement : `https://mon-frontend.vercel.app/download-invoice/TEST`
3. Vérifier que la route backend `/download/:id` fonctionne

---

## 📞 Support

Si un problème persiste :
1. Consultez les logs Render (backend)
2. Consultez les logs Vercel (frontend)
3. Ouvrez la console du navigateur (F12)
4. Relisez `DEPLOIEMENT_RAPIDE.md`

---

**Date de déploiement :** _______________

**Tout fonctionne :** ⬜ OUI  ⬜ NON

**Notes personnelles :**
```





```
