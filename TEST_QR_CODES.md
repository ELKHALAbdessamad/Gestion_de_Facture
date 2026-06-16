# 🧪 TEST des QR Codes - Guide complet

## ✅ CONFIGURATION FINALE

Tout est maintenant configuré pour que les QR codes fonctionnent partout ! 🌍

### Variables configurées :

**Frontend (.env)** :
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_PUBLIC_URL=https://gestiondefacture-production.up.railway.app
```

**Backend (backend/.env)** :
```
MONGODB_URI=mongodb+srv://novafact_user:NovaFact2024Simple@cluster0.tjfirmb.mongodb.net/novafact?retryWrites=true&w=majority
```

**Railway** :
```
MONGODB_URI=mongodb+srv://novafact_user:NovaFact2024Simple@cluster0.tjfirmb.mongodb.net/novafact?retryWrites=true&w=majority&appName=Cluster0
```

---

## 🚀 DÉMARRAGE DE L'APPLICATION

### Étape 1 : Démarrer le backend local

Ouvrez un **nouveau terminal** (Terminal 1) :

```bash
cd C:\Users\yahya\Gestion_de_Facture\backend
npm start
```

**✅ Vous devriez voir** :
```
✅ Connecté à MongoDB
🚀 Serveur démarré sur le port 5000
📡 API disponible sur http://localhost:5000/api
```

⚠️ **Si vous voyez une erreur de connexion MongoDB** :
- Vérifiez votre connexion Internet
- Vérifiez que le mot de passe est correct dans `backend\.env`

---

### Étape 2 : Démarrer le frontend

Ouvrez un **autre terminal** (Terminal 2) :

```bash
cd C:\Users\yahya\Gestion_de_Facture
npm start
```

**✅ Le navigateur s'ouvre automatiquement sur** : http://localhost:3000

---

## 🧪 TEST COMPLET DES QR CODES

### Test 1 : Backend Railway fonctionne ? ✅

**Ouvrez dans votre navigateur** :
```
https://gestiondefacture-production.up.railway.app/api/health
```

**✅ Vous devez voir** :
```json
{
  "status": "OK",
  "message": "API Gestion de Factures est en ligne",
  "timestamp": "2026-06-16T..."
}
```

❌ **Si ça ne marche pas** :
- Allez sur Railway.app
- Vérifiez que le déploiement est en statut "SUCCESS" (vert)
- Vérifiez les variables d'environnement (surtout MONGODB_URI)

---

### Test 2 : Créer une facture avec QR code 📄

1. **Allez sur** : http://localhost:3000
2. **Connectez-vous** avec vos identifiants
3. **Créez une nouvelle facture** :
   - Sélectionnez un client
   - Ajoutez des articles
   - Sauvegardez
4. **Ouvrez la facture** créée
5. **Téléchargez le PDF**
6. **Ouvrez le PDF** et regardez le QR code en bas

---

### Test 3 : Scanner le QR code depuis votre téléphone 📱

#### Option A : Scanner avec votre téléphone

1. **Ouvrez l'appareil photo** de votre téléphone (iPhone ou Android)
2. **Pointez vers le QR code** dans le PDF
3. **Une notification** devrait apparaître avec un lien
4. **Cliquez sur la notification**

**✅ Vous devez voir** :
- Une page qui se charge : `https://gestiondefacture-production.up.railway.app/download-invoice/123...`
- Le téléchargement du PDF commence automatiquement
- Ou un bouton "Télécharger la facture"

#### Option B : Tester sur PC (sans téléphone)

1. Utilisez un **lecteur de QR code en ligne** : https://webqr.com/
2. **Uploadez** le PDF ou prenez une capture du QR code
3. **Copiez l'URL** qui s'affiche
4. **Collez** l'URL dans votre navigateur
5. Le PDF doit se télécharger !

---

### Test 4 : Depuis un autre appareil (le vrai test !) 🌍

**Le test ultime** : Envoyez le PDF par WhatsApp/Email à un ami qui est :
- Dans une autre ville (Casablanca, Rabat, Marrakech)
- Dans un autre pays (France, Espagne, etc.)

Demandez-lui de :
1. Ouvrir le PDF
2. Scanner le QR code
3. Télécharger la facture

**✅ Ça doit marcher depuis N'IMPORTE OÙ dans le monde !** 🌍

---

## 📊 CHECKLIST FINALE

- [ ] Backend local démarre sans erreur
- [ ] Frontend local fonctionne (localhost:3000)
- [ ] Railway backend répond à `/api/health`
- [ ] QR code est visible dans le PDF
- [ ] QR code pointe vers `https://gestiondefacture-production.up.railway.app/download-invoice/...`
- [ ] Scanner le QR code télécharge bien le PDF
- [ ] Test depuis un autre appareil/ville fonctionne

---

## 🎉 SUCCÈS !

Si tous les tests passent, **FÉLICITATIONS !** 🎊

Votre système de facturation avec QR codes fonctionne maintenant **partout dans le monde** !

### Ce que vous avez maintenant :

✅ **Gestion sécurisée** : Frontend et backend locaux dans votre entreprise
✅ **QR codes universels** : Fonctionnent partout (Tanger, Casablanca, France, USA...)
✅ **Cloud synchronisé** : Données dans MongoDB Atlas, accessibles de partout
✅ **Coût** : 0€/mois (tout gratuit !)

---

## 🆘 Problèmes courants

### Le backend local ne se connecte pas à MongoDB

**Erreur** : `MongoServerError: bad auth : Authentication failed`

**Solution** :
1. Vérifiez `backend\.env` → Le mot de passe est bien `NovaFact2024Simple`
2. Vérifiez que le username est bien `novafact_user`
3. Testez la connexion dans MongoDB Compass

---

### Le QR code pointe vers localhost

**Problème** : Le QR code contient `http://localhost:3000/download-invoice/...`

**Solution** :
1. Vérifiez `.env` (racine) : `REACT_APP_PUBLIC_URL=https://gestiondefacture-production.up.railway.app`
2. **REDÉMARREZ** l'application React (Ctrl+C puis `npm start`)
3. Recréez une nouvelle facture

---

### Railway ne se connecte pas à MongoDB

**Erreur dans les logs Railway** : `MongoServerError: bad auth`

**Solution** :
1. Railway → Variables → `MONGODB_URI`
2. Vérifiez que le mot de passe est `NovaFact2024Simple`
3. La connexion string complète :
   ```
   mongodb+srv://novafact_user:NovaFact2024Simple@cluster0.tjfirmb.mongodb.net/novafact?retryWrites=true&w=majority&appName=Cluster0
   ```

---

### Le téléchargement depuis le QR code échoue (404)

**Problème** : La facture n'existe pas dans MongoDB Atlas

**Solution** :
1. Assurez-vous que le backend LOCAL est connecté à MongoDB **Atlas** (pas localhost)
2. Vérifiez `backend\.env` : La ligne `MONGODB_URI` pointe bien vers Atlas
3. Recréez une facture pour qu'elle soit dans Atlas

---

## 📝 NOTES IMPORTANTES

### Synchronisation des données

Si vous utilisez MongoDB **Atlas** dans le backend local (recommandé) :
- ✅ Toutes les factures créées localement sont automatiquement dans le cloud
- ✅ Railway peut les servir immédiatement via les QR codes
- ✅ Pas besoin de migration manuelle

Si vous utilisez MongoDB **Local** :
- ❌ Railway ne peut pas accéder aux factures
- ❌ Les QR codes ne fonctionneront pas
- ⚠️ Vous devez migrer les données vers Atlas régulièrement

**→ RECOMMANDATION** : Utilisez toujours Atlas dans `backend\.env` !

---

**Dernière mise à jour** : 2026-06-16  
**Mot de passe MongoDB** : NovaFact2024Simple
