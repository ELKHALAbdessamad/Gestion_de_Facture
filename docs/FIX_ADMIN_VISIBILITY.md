# Fix : Visibilité des Factures pour l'Admin

## 🎯 Problème Initial

**Symptôme :** L'administrateur ne pouvait pas voir les factures créées par les utilisateurs (comptables/agents).

**Cause :** Les routes backend filtraient toutes les factures par `user_id`, même pour l'admin.

```javascript
// ❌ AVANT - Admin ne voit que ses propres factures
const factures = await Facture.find({ user_id: req.userId })
```

## ✅ Solution Appliquée

### 1. **Backend - Route GET /api/factures** (Liste des factures)

```javascript
// ✅ APRÈS - Admin voit TOUTES les factures
const filter = req.user.role === 'admin' 
  ? {} 
  : { user_id: req.userId };

const factures = await Facture.find(filter)
  .populate('client_id', 'nom email')
  .populate('user_id', 'email nom prenom')  // ← Nouveau : récupère l'email du créateur
  .sort({ date_creation: -1 });
```

**Résultat :**
- ✅ **Admin** : Voit toutes les factures de tous les utilisateurs
- ✅ **User** : Voit seulement ses propres factures

---

### 2. **Backend - Route GET /api/factures/:id** (Détail d'une facture)

```javascript
// ✅ Admin peut accéder à n'importe quelle facture
const filter = req.user.role === 'admin'
  ? { _id: req.params.id }
  : { _id: req.params.id, user_id: req.userId };

const facture = await Facture.findOne(filter)
  .populate('client_id')
  .populate('user_id', 'email nom prenom');
```

**Résultat :**
- ✅ **Admin** : Peut ouvrir et consulter n'importe quelle facture
- ✅ **User** : Ne peut ouvrir que ses propres factures

---

### 3. **Backend - Route PUT /api/factures/:id** (Modification d'une facture)

```javascript
// ✅ Admin peut modifier n'importe quelle facture
const filter = req.user.role === 'admin'
  ? { _id: req.params.id }
  : { _id: req.params.id, user_id: req.userId };

const facture = await Facture.findOneAndUpdate(filter, { $set: updateData }, ...);
```

**Résultat :**
- ✅ **Admin** : Peut modifier n'importe quelle facture
- ✅ **User** : Ne peut modifier que ses propres factures

---

### 4. **Frontend - Ajout Colonne "Créé par"** (Factures.js)

Pour que l'admin puisse identifier qui a créé chaque facture :

```jsx
// Fonction helper
const getUserName = (userId) => {
  if (!userId) return '—';
  if (typeof userId === 'object' && userId?.email) {
    return userId.email;
  }
  return '—';
};

// Dans le tableau
<TableHead>
  <TableRow>
    {[
      'Numéro', 
      'Date', 
      'Client', 
      ...(isAdmin ? ['Créé par'] : []),  // ← Colonne visible seulement pour admin
      'Total TTC', 
      'Statut', 
      'Validé', 
      'Actions'
    ].map(...)}
  </TableRow>
</TableHead>

// Dans chaque ligne
{isAdmin && (
  <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
    {getUserName(facture.user_id)}
  </TableCell>
)}
```

---

## 📊 Comparaison Avant/Après

### Vue Utilisateur (user@test.com)

#### AVANT ✅ (inchangé)
```
Factures visibles:
  ✓ INV-0616 (créée par user@test.com)
  ✓ INV-0615 (créée par user@test.com)
```

#### APRÈS ✅ (inchangé)
```
Factures visibles:
  ✓ INV-0616 (créée par user@test.com)
  ✓ INV-0615 (créée par user@test.com)
```

---

### Vue Admin (admin@test.com)

#### AVANT ❌ (problème)
```
Factures visibles:
  ✓ INV-0614 (créée par admin@test.com)
  ✗ INV-0616 (créée par user@test.com) ← INVISIBLE
  ✗ INV-0615 (créée par user@test.com) ← INVISIBLE
```

#### APRÈS ✅ (corrigé)
```
Factures visibles:
  ✓ INV-0614 (créée par admin@test.com)
  ✓ INV-0616 (créée par user@test.com) ✓ Visible
  ✓ INV-0615 (créée par user@test.com) ✓ Visible

Colonne supplémentaire "Créé par":
  admin@test.com
  user@test.com
  user@test.com
```

---

## 🎨 Interface Admin Améliorée

### Tableau des Factures (Admin)

```
┌────────┬────────────┬────────────┬──────────────────┬───────────┬──────────┬────────┬─────────┐
│ Numéro │    Date    │   Client   │    Créé par      │ Total TTC │  Statut  │ Validé │ Actions │
├────────┼────────────┼────────────┼──────────────────┼───────────┼──────────┼────────┼─────────┤
│ INV-06 │ 16/06/2026 │ Client A   │ user@test.com    │  960 MAD  │ En att.  │   —    │ 👁 ✏️ 📥 🗑 │
│ INV-05 │ 15/06/2026 │ Client B   │ user@test.com    │ 1200 MAD  │ Draft    │   —    │ 👁 ✏️ 📥 🗑 │
│ INV-04 │ 14/06/2026 │ Client C   │ admin@test.com   │  800 MAD  │ Payée    │   ✓    │ 👁 ✏️ 📥 🗑 │
└────────┴────────────┴────────────┴──────────────────┴───────────┴──────────┴────────┴─────────┘
```

### Tableau des Factures (User)

```
┌────────┬────────────┬────────────┬───────────┬──────────┬────────┬─────────┐
│ Numéro │    Date    │   Client   │ Total TTC │  Statut  │ Validé │ Actions │
├────────┼────────────┼────────────┼───────────┼──────────┼────────┼─────────┤
│ INV-06 │ 16/06/2026 │ Client A   │  960 MAD  │ En att.  │   —    │ 👁 ✏️ 📥 │
│ INV-05 │ 15/06/2026 │ Client B   │ 1200 MAD  │ Draft    │   —    │ 👁 ✏️ 📥 │
└────────┴────────────┴────────────┴───────────┴──────────┴────────┴─────────┘
```

---

## 📂 Fichiers Modifiés

### Backend
- ✅ `backend/routes/factures.js`
  - Route `GET /` : Filtre conditionnel selon rôle
  - Route `GET /:id` : Filtre conditionnel selon rôle
  - Route `PUT /:id` : Filtre conditionnel selon rôle
  - Ajout `.populate('user_id', 'email nom prenom')`

### Frontend
- ✅ `src/pages/Factures.js`
  - Ajout fonction `getUserName()`
  - Ajout colonne "Créé par" (admin uniquement)
  - Ajustement `colSpan` pour la ligne vide

---

## 🧪 Tests de Validation

### Test 1 : User crée une facture
1. Se connecter avec `user@test.com`
2. Créer une nouvelle facture "INV-0616"
3. ✅ La facture apparaît dans la liste de l'user

### Test 2 : Admin voit la facture du user
1. Se déconnecter de `user@test.com`
2. Se connecter avec `admin@test.com`
3. ✅ La facture "INV-0616" apparaît dans la liste admin
4. ✅ Colonne "Créé par" affiche "user@test.com"

### Test 3 : Admin valide la facture
1. En tant qu'admin, ouvrir la facture "INV-0616"
2. ✅ Boutons "Valider" et "Rejeter" visibles
3. Cliquer "Valider"
4. ✅ Statut passe à "Payée"
5. ✅ Email envoyé au client

### Test 4 : User voit la validation
1. Se déconnecter de `admin@test.com`
2. Se connecter avec `user@test.com`
3. ✅ Facture "INV-0616" affiche statut "Payée"
4. ✅ Colonne "Validé" affiche "✓"

---

## 🔒 Sécurité Maintenue

**Principe de moindre privilège :**
- ✅ Les users ne voient **jamais** les factures des autres users
- ✅ Les users ne peuvent **jamais** modifier les factures des autres users
- ✅ Seul l'admin a accès à **toutes** les factures
- ✅ Les validations backend empêchent toute tentative de contournement

**Protection API :**
```javascript
// Tentative de modifier une facture d'un autre user
// ❌ ÉCHEC : 404 Not Found (la facture n'est pas dans le filtre user_id)

// Tentative de valider sans être admin
// ❌ ÉCHEC : 403 Forbidden ("Seul un administrateur peut valider")
```

---

## 🚀 Déploiement

### 1. Redémarrer le backend
```bash
cd backend
npm start
```

### 2. Recharger le frontend
```bash
# Le frontend se recharge automatiquement si en mode dev
# Sinon, faire Ctrl+R dans le navigateur
```

### 3. Vérifier les logs backend
```
✅ Connecté à MongoDB
✅ Server running on port 5000
```

### 4. Tester avec les deux comptes
- `user@test.com` / `user123`
- `admin@test.com` / `admin123`

---

## 📈 Améliorations Futures (Optionnelles)

### 1. Filtrer par créateur (Admin)
Ajouter un filtre dropdown "Créé par" pour que l'admin puisse filtrer les factures par utilisateur.

### 2. Statistiques par utilisateur
Dashboard admin avec :
- Nombre de factures par utilisateur
- Total TTC par utilisateur
- Taux de validation par utilisateur

### 3. Notifications
Notifier automatiquement un user quand l'admin valide/rejette sa facture.

### 4. Audit log
Logger toutes les actions admin (validation, rejet, suppression) avec timestamp.

---

**✅ Fix appliqué avec succès !**

L'admin peut maintenant voir et gérer toutes les factures créées par les utilisateurs, avec une colonne indiquant qui a créé chaque facture.

---

**Dernière mise à jour :** 16 juin 2026  
**Version :** 1.1.0
