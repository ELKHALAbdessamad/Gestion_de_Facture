# 📱 Configuration QR Codes - Mode Entreprise

## 🎯 Architecture

```
🏢 ENTREPRISE (localhost) :
   ├── Frontend React : http://localhost:3000
   ├── Backend Node.js : http://localhost:5000  
   └── Utilisé par : Employés uniquement

☁️ INTERNET (Railway) :
   ├── Backend API : https://gestiondefacture-production.up.railway.app
   ├── MongoDB Atlas : cluster0.tjfirmb.mongodb.net
   └── Route publique : /download-invoice/:id

📱 CLIENTS :
   └── Scannent QR code → Téléchargent facture (n'importe où dans le monde)
```

---

## ✅ Configuration actuelle

### 1. Frontend (.env dans la racine)

```env
# API locale pour gestion interne
REACT_APP_API_URL=http://localhost:5000/api

# URL publique pour QR codes (Railway)
REACT_APP_PUBLIC_URL=https://gestiondefacture-production.up.railway.app
```

### 2. Backend local (backend/.env)

```env
# Option 1 : MongoDB LOCAL (sans Internet)
# MONGODB_URI=mongodb://localhost:27017/gestion-factures

# Option 2 : MongoDB ATLAS (synchronisé avec Railway - RECOMMANDÉ)
MONGODB_URI=mongodb+srv://novafact_user:NovaFact2024Simple@cluster0.tjfirmb.mongodb.net/novafact?retryWrites=true&w=majority
```

### 3. Railway (production)

Variables configurées :
- `NODE_ENV=production`
- `PORT=5000`
- `MONGODB_URI=mongodb+srv://novafact_user:NovaFact2024Simple@cluster0.tjfirmb.mongodb.net/novafact?retryWrites=true&w=majority&appName=Cluster0`
- `JWT_SECRET=NovaFact2024-SecretKey-SuperSecurise-XyZ789`
- `CORS_ORIGIN=*` (accepte toutes les origines pour la route publique download)

---

## 🚀 Comment ça marche

### Scénario d'utilisation :

1. **Employé crée une facture** (sur localhost:3000)
   - Frontend local → Backend local → MongoDB Atlas
   - Facture sauvegardée dans le cloud

2. **Employé télécharge le PDF**
   - PDF généré avec QR code
   - QR code pointe vers : `https://gestiondefacture-production.up.railway.app/download-invoice/123`

3. **Client scanne le QR code** (depuis Tanger, Casablanca, n'importe où)
   - QR code → Railway backend
   - Railway → MongoDB Atlas
   - Télécharge le PDF

---

## 🔧 Démarrage de l'application

### 1. Démarrer le backend local (Terminal 1) :

```bash
cd backend
npm start
```

Vous devriez voir :
```
✅ Connecté à MongoDB
🚀 Serveur démarré sur le port 5000
```

### 2. Démarrer le frontend (Terminal 2) :

```bash
npm start
```

Navigateur s'ouvre sur : http://localhost:3000

---

## 📋 Checklist de vérification

### Backend Railway fonctionne ?

Testez dans votre navigateur :
```
https://gestiondefacture-production.up.railway.app/api/health
```

Devrait retourner :
```json
{
  "status": "OK",
  "message": "API Gestion de Factures est en ligne"
}
```

### QR codes fonctionnent ?

1. Créez une facture sur localhost:3000
2. Téléchargez le PDF
3. Scannez le QR code avec votre téléphone
4. Doit ouvrir : `https://gestiondefacture-production.up.railway.app/download-invoice/...`
5. Doit télécharger le PDF ! ✅

---

## 🌍 Où les QR codes fonctionnent

✅ Tanger
✅ Casablanca  
✅ Marrakech
✅ France
✅ Espagne
✅ N'IMPORTE OÙ avec Internet !

---

## 🔒 Sécurité

- ✅ Frontend de gestion : Local uniquement (pas sur Internet)
- ✅ Données sensibles : Protégées, pas exposées
- ✅ Route publique : Seulement le téléchargement PDF (lecture seule)
- ✅ Pas d'authentification requise : Le client scanne juste pour télécharger

---

## 🆘 Dépannage

### Le backend local ne se connecte pas à Atlas ?

Vérifiez :
1. Le mot de passe dans `backend/.env` est correct
2. Network Access dans MongoDB Atlas autorise 0.0.0.0/0
3. Votre connexion Internet fonctionne

### Les QR codes pointent vers localhost ?

Vérifiez :
1. `REACT_APP_PUBLIC_URL` est bien défini dans `.env`
2. Vous avez redémarré l'app après avoir modifié `.env`
3. Le frontend utilise bien la variable : `process.env.REACT_APP_PUBLIC_URL`

### Le téléchargement depuis le QR code ne marche pas ?

Vérifiez :
1. Railway backend fonctionne : testez `/api/health`
2. La facture existe dans MongoDB Atlas
3. La route `/api/factures/download/:id` est publique (pas d'auth requise)

---

## 💰 Coûts

**GRATUIT !** 0€/mois

- MongoDB Atlas : M0 Free (512MB)
- Railway : Free tier (750h/mois, 500GB transfert)
- Votre app locale : Gratuit

---

**Dernière mise à jour** : 2026-06-16
