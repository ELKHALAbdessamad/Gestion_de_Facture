# Correction appliquée aux routes MongoDB

## Problème
MongoDB utilise `_id` mais le frontend s'attend à `id`.

## Solution appliquée
Transformation de `_id` → `id` dans toutes les réponses API.

## Routes corrigées
✅ categories.js - Transformation ajoutée (GET, POST, PUT)

## Routes à corriger
- [ ] clients.js
- [ ] articles.js  
- [ ] factures.js
- [ ] parametres.js
- [ ] users.js

## Redémarrage requis
Après ces modifications, redémarrez le backend :
```bash
cd backend
npm start
```
