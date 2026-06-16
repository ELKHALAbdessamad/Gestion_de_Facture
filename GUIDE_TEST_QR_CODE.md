# 🧪 Guide de Test - QR Code Mobile

Ce guide vous permet de tester le téléchargement de factures via QR code depuis votre téléphone.

## ✅ Prérequis

- **Backend local** : en cours d'exécution sur `http://localhost:5000` ✅
- **Frontend local** : en cours d'exécution sur `http://localhost:3000` ✅
- **Railway** : déployé sur `https://gestiondefacture-production.up.railway.app` ✅
- **MongoDB Atlas** : configuré et accessible depuis Railway ✅

## 📱 Étapes de Test

### 1. Créer/Modifier une Facture

1. Ouvrez l'application sur votre navigateur : `http://localhost:3000`
2. Connectez-vous avec votre compte admin
3. Créez une nouvelle facture OU modifiez une facture existante
4. Remplissez les informations (client, articles, etc.)
5. **Sauvegardez la facture**

> ⚡ La synchronisation automatique vers Railway/Atlas se fait en arrière-plan

### 2. Générer le PDF avec QR Code

1. Ouvrez la facture que vous venez de créer/modifier
2. Cliquez sur le bouton **"Télécharger PDF"**
3. Le PDF sera généré avec :
   - ✅ Logo NovaFact
   - ✅ Design professionnel (doré/noir)
   - ✅ QR Code en bas à droite
   - ✅ Signature numérique (si ajoutée)

### 3. Scanner le QR Code depuis votre Téléphone

1. **Ouvrez le PDF** que vous venez de télécharger
2. **Scannez le QR code** avec votre téléphone :
   - iPhone : Utilisez l'appareil photo natif
   - Android : Utilisez l'appareil photo ou Google Lens

3. **Le QR code vous redirigera vers** :
   ```
   https://gestiondefacture-production.up.railway.app/download-invoice/[ID]
   ```

4. **Vous verrez une page mobile professionnelle** avec :
   - 🎨 Design NovaFact (doré/noir)
   - 🆔 Numéro de facture
   - 👤 Nom du client
   - 📅 Date de création
   - 💰 Montant TTC
   - 📥 Bouton "Télécharger le PDF"

### 4. Télécharger le PDF depuis votre Téléphone

1. Cliquez sur le bouton **"📥 Télécharger le PDF"**
2. Le PDF sera généré **EXACTEMENT comme dans l'application** avec :
   - ✅ Logo NovaFact
   - ✅ Tableau des articles
   - ✅ Totaux (HT, TVA, TTC)
   - ✅ Signature numérique (si présente)
   - ❌ **SANS QR code** (pour éviter de re-scanner)

3. Le PDF sera téléchargé sur votre téléphone
4. Ouvrez-le et vérifiez qu'il est identique à celui de l'application

## 🔍 Vérifications

### Backend Local
```bash
# Vérifier que le backend tourne
curl http://localhost:5000/api/health
# Devrait retourner : {"status":"OK","message":"API Gestion de Factures est en ligne"}
```

### Railway (Production)
```bash
# Vérifier que Railway est accessible
curl https://gestiondefacture-production.up.railway.app/api/health
# Devrait retourner : {"status":"OK","message":"API Gestion de Factures est en ligne"}
```

### MongoDB Atlas
```bash
# Ouvrir MongoDB Compass et vérifier :
# 1. Connexion à Atlas : mongodb+srv://novafact_user:NovaFact2024Simple@cluster0.tjfirmb.mongodb.net/novafact
# 2. Collection 'factures' contient vos factures
# 3. Les factures créées localement sont bien synchronisées
```

## ❌ Problèmes Courants

### QR Code affiche "Facture introuvable"
**Cause** : La facture n'a pas été synchronisée vers Railway/Atlas

**Solution** :
1. Vérifiez que votre réseau permet l'accès à Railway depuis le navigateur
2. Ouvrez la console du navigateur (F12) et vérifiez les logs de synchronisation
3. Vous devriez voir : `✅ Facture synchronisée vers Railway`
4. Si l'erreur persiste, vérifiez dans MongoDB Compass que la facture existe bien dans Atlas

### Le PDF du scan est différent de l'application
**Cause** : Le code de génération PDF dans `download-invoice.html` n'est pas à jour

**Solution** :
1. Vérifiez que le fichier `backend/public/download-invoice.html` est bien commité
2. Vérifiez que Railway a bien redéployé (2-3 minutes après le push)
3. Videz le cache de votre navigateur mobile

### Le backend local ne démarre pas (port 5000 déjà utilisé)
**Cause** : Une instance du backend tourne déjà

**Solution** :
```bash
# Windows - Tuer le processus sur le port 5000
netstat -ano | findstr :5000
# Note le PID (dernier numéro)
taskkill /PID [PID] /F

# Redémarrer le backend
cd backend
npm start
```

## 🎯 Checklist Finale

- [ ] Backend local tourne sur port 5000
- [ ] Frontend local tourne sur port 3000
- [ ] Railway est accessible en ligne
- [ ] Facture créée/modifiée localement
- [ ] PDF généré avec QR code
- [ ] QR code scanné depuis téléphone
- [ ] Page mobile s'affiche correctement
- [ ] PDF téléchargé depuis mobile
- [ ] PDF mobile identique à l'application
- [ ] Signature numérique visible dans PDF mobile
- [ ] Pas de QR code dans le PDF mobile

## 🚀 Architecture Technique

```
┌─────────────────────────────────────────────────────────────┐
│                   ARCHITECTURE GLOBALE                      │
└─────────────────────────────────────────────────────────────┘

Frontend (localhost:3000)
    ↓ Crée/Modifie facture
Backend Local (localhost:5000) → MongoDB Local (localhost:27017)
    ↓ Synchronisation navigateur (fetch)
Railway (https://gestiondefacture-production.up.railway.app)
    ↓ Stockage cloud
MongoDB Atlas (cluster0.tjfirmb.mongodb.net/novafact)
    ↓ Accessible via QR code
📱 Téléphone (n'importe où dans le monde)
```

## 💡 Notes Importantes

1. **Synchronisation automatique** : Chaque création/modification/suppression de facture locale déclenche automatiquement une synchronisation vers Railway/Atlas via le navigateur

2. **QR codes globaux** : Les QR codes pointent vers Railway, donc ils fonctionnent de **n'importe où** (Tanger, Casablanca, Paris, etc.)

3. **Pas de déploiement frontend** : Seul le backend est déployé publiquement sur Railway pour les QR codes. Le frontend reste local pour la sécurité

4. **PDF identiques** : Le PDF généré depuis le scan est **EXACTEMENT identique** à celui de l'application (même mise en page, même contenu, même signature)

5. **Pas de QR dans le scan** : Le PDF téléchargé depuis le QR code ne contient pas de QR code (évite de re-scanner)

## 📞 Support

En cas de problème, vérifiez :
- Les logs du backend local : `npm start` dans le dossier `backend`
- Les logs du navigateur : F12 → Console
- Les logs de Railway : Dashboard Railway → Logs
- MongoDB Compass : Connexion à Atlas et vérification des données

---

✨ **NovaFact** - Gestion de Factures Professionnelle
