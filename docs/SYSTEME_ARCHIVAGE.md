# Système d'Archivage des Factures

## 🎯 Vue d'ensemble

Le système d'archivage permet de gérer le cycle de vie des factures en les déplaçant des factures actives vers les archives, et vice-versa.

---

## 📊 Flux d'Archivage

```
┌─────────────────────────────────────────────────────────────────┐
│                      FACTURES ACTIVES                           │
│  (archived: false ou non défini)                               │
│                                                                  │
│  - Visibles dans /factures                                      │
│  - Visibles dans le Dashboard                                   │
│  - Modifiables, validables, payables                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Admin clique "Archiver" 🗄️
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FACTURES ARCHIVÉES                         │
│  (archived: true)                                               │
│                                                                  │
│  - Visibles SEULEMENT dans /archives                           │
│  - Consultables mais non modifiables                           │
│  - Peuvent être désarchivées par Admin                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Admin clique "Désarchiver" ↩️
                           │
                           ▼
                    Retour aux factures actives
```

---

## 🗄️ Modèle de Données

### Nouveau champs ajoutés au modèle `Facture`

```javascript
{
  // ... autres champs
  
  // Archivage
  archived: { type: Boolean, default: false },
  archived_at: Date,           // Date d'archivage
  archived_by: String          // Email de l'admin qui a archivé
}
```

---

## 🔧 Routes Backend

### 1. **GET /api/factures** - Liste des factures actives
```javascript
// AVANT : Toutes les factures
const filter = req.user.role === 'admin' ? {} : { user_id: req.userId };

// APRÈS : Seulement factures NON archivées
const filter = req.user.role === 'admin' 
  ? { archived: { $ne: true } }
  : { user_id: req.userId, archived: { $ne: true } };
```

### 2. **GET /api/factures/archive/:year** - Factures archivées par année
```javascript
// SEULEMENT les factures archivées de l'année sélectionnée
const filter = req.user.role === 'admin'
  ? { archived: true, date_creation: { $gte: startDate, $lt: endDate } }
  : { user_id: req.userId, archived: true, date_creation: { $gte: startDate, $lt: endDate } };
```

### 3. **GET /api/factures/archive-years/list** - Années avec factures archivées
```javascript
// Liste des années contenant au moins une facture archivée
const filter = req.user.role === 'admin' ? { archived: true } : { user_id: req.userId, archived: true };
```

### 4. **POST /api/factures/:id/toggle-archive** - Archiver/Désarchiver (Admin uniquement)
```javascript
// Bascule l'état archived
facture.archived = !facture.archived;
facture.archived_at = facture.archived ? new Date() : null;
facture.archived_by = facture.archived ? req.user.email : null;
```

**Restrictions :**
- ✅ Route protégée : `authenticate` + `requireAdmin`
- ✅ Seul un admin peut archiver/désarchiver

---

## 🎨 Interface Utilisateur

### Page **Factures** (`/factures`)

**Liste affichée :** Factures actives uniquement (`archived: false`)

**Boutons d'actions (pour Admin) :**
```
[👁️ Voir] [✏️ Modifier] [📥 PDF] [🗄️ Archiver] [🗑️ Supprimer]
```

**Nouveau bouton "Archiver" (violet)** :
- Visible uniquement pour l'admin
- Déplace la facture vers les archives
- Confirmation requise avant archivage

---

### Page **Archives** (`/archives`)

**Liste affichée :** Factures archivées uniquement (`archived: true`)

**Filtres :**
- Sélection par année (dropdown)
- Export Excel des factures archivées

**Boutons d'actions (pour Admin) :**
```
[👁️ Voir] [🗄️ Désarchiver]
```

**Nouveau bouton "Désarchiver" (vert)** :
- Visible uniquement pour l'admin
- Remet la facture dans les factures actives
- Confirmation requise avant désarchivage

**Statistiques affichées :**
- Nombre total de factures archivées
- Nombre de factures payées/en attente/rejetées
- Total HT, Total TTC, Total encaissé

---

## 🔒 Permissions et Sécurité

### Utilisateur Normal (role: "user")

**Peut :**
- ✅ Voir ses factures actives dans `/factures`
- ✅ Voir ses factures archivées dans `/archives`

**Ne peut PAS :**
- ❌ Archiver une facture
- ❌ Désarchiver une facture
- ❌ Voir les factures des autres utilisateurs (actives ou archivées)

---

### Administrateur (role: "admin")

**Peut :**
- ✅ Voir **toutes** les factures actives dans `/factures`
- ✅ Voir **toutes** les factures archivées dans `/archives`
- ✅ **Archiver** n'importe quelle facture
- ✅ **Désarchiver** n'importe quelle facture
- ✅ Voir qui a archivé chaque facture et quand

---

## 📋 Cas d'Usage

### Cas 1 : Archiver une facture payée de l'année précédente

**Scénario :**
1. Admin se connecte
2. Va dans `/factures`
3. Trouve la facture `INV-2025-001` (Payée, 2025)
4. Clique sur le bouton 🗄️ **Archiver**
5. Confirme l'archivage

**Résultat :**
- ✅ Facture disparaît de `/factures`
- ✅ Facture apparaît dans `/archives` sous l'année 2025
- ✅ Champs mis à jour :
  - `archived: true`
  - `archived_at: "2026-06-16T14:30:00Z"`
  - `archived_by: "admin@test.com"`

---

### Cas 2 : Désarchiver une facture suite à une erreur

**Scénario :**
1. Admin se rend compte qu'une facture a été archivée par erreur
2. Va dans `/archives`
3. Sélectionne l'année 2025
4. Trouve la facture `INV-2025-001`
5. Clique sur le bouton 🗄️ **Désarchiver**
6. Confirme le désarchivage

**Résultat :**
- ✅ Facture disparaît de `/archives`
- ✅ Facture réapparaît dans `/factures`
- ✅ Champs mis à jour :
  - `archived: false`
  - `archived_at: null`
  - `archived_by: null`

---

### Cas 3 : Consultation des archives par un utilisateur

**Scénario :**
1. User (`user@test.com`) se connecte
2. Va dans `/archives`
3. Sélectionne l'année 2025

**Résultat :**
- ✅ Voit uniquement ses factures archivées de 2025
- ✅ Ne voit PAS les factures archivées des autres utilisateurs
- ❌ Bouton "Désarchiver" non visible (pas admin)

---

## 🔍 Différence : Archive vs Suppression

| Action | Archive | Suppression |
|--------|---------|-------------|
| **Réversible ?** | ✅ Oui (désarchiver) | ❌ Non (définitif) |
| **Données perdues ?** | ❌ Non | ✅ Oui |
| **Visible dans DB ?** | ✅ Oui (`archived: true`) | ❌ Non (document supprimé) |
| **Utilité** | Archivage comptable, nettoyage UI | Supprimer erreurs, doublons |
| **Qui peut le faire ?** | Admin uniquement | Admin uniquement |

**Recommandation :** Privilégier **l'archivage** pour la gestion normale des factures anciennes. La **suppression** est réservée aux cas exceptionnels.

---

## 📊 Export et Conformité

### Export Excel des Archives

Le bouton **Export Excel** dans `/archives` génère un fichier Excel contenant :
- Toutes les factures archivées de l'année sélectionnée
- Colonnes : Numéro, Date, Client, Total HT, TVA, Total TTC, Statut, Validé Admin

### Génération d'Archive ZIP

La fonction d'archivage ZIP (bouton "Archiver" dans le header) génère un fichier ZIP contenant :
- 📄 PDF de chaque facture archivée
- 📊 Récapitulatif Excel
- 💾 Backup JSON (conformité légale)
- 📝 README.txt

**Important :** Cette fonction génère une archive **des factures archivées** de l'année sélectionnée, pas des factures actives.

---

## 🧪 Tests de Validation

### Test 1 : Archiver une facture (Admin)
1. Se connecter avec `admin@test.com`
2. Aller dans `/factures`
3. Cliquer sur 🗄️ **Archiver** sur une facture
4. ✅ Facture disparaît de la liste
5. Aller dans `/archives` et sélectionner l'année
6. ✅ Facture apparaît dans les archives

### Test 2 : Tentative d'archivage par User (Sécurité)
1. Se connecter avec `user@test.com`
2. Aller dans `/factures`
3. ❌ Bouton "Archiver" non visible
4. Si on force la route API : ❌ 403 Forbidden

### Test 3 : Désarchiver une facture (Admin)
1. Se connecter avec `admin@test.com`
2. Aller dans `/archives`
3. Cliquer sur 🗄️ **Désarchiver** sur une facture
4. ✅ Facture disparaît des archives
5. Aller dans `/factures`
6. ✅ Facture réapparaît dans les factures actives

### Test 4 : Visibilité des factures archivées (User)
1. Admin archive une facture créée par `user@test.com`
2. Se connecter avec `user@test.com`
3. Aller dans `/factures`
4. ✅ Facture archivée n'apparaît pas
5. Aller dans `/archives`
6. ✅ Facture archivée apparaît bien

---

## 🚀 Déploiement

### 1. Redémarrer le Backend
```bash
cd backend
npm start
```

### 2. Vérifier la connexion MongoDB
```
✅ Connecté à MongoDB
🚀 Serveur démarré sur le port 5000
```

### 3. Tester dans le navigateur
- Recharger la page `/factures` (Ctrl+R)
- Vérifier que les boutons "Archiver" sont visibles (admin uniquement)
- Tester l'archivage d'une facture
- Vérifier dans `/archives` que la facture apparaît

---

## 📈 Améliorations Futures

### 1. Archivage Automatique
Ajouter une tâche CRON qui archive automatiquement les factures de plus de 2 ans.

### 2. Statistiques d'Archivage
Dashboard admin avec :
- Nombre de factures archivées par mois
- Espace disque économisé
- Factures les plus anciennes non archivées

### 3. Filtres Avancés
Dans `/archives`, ajouter des filtres :
- Par statut (Payée, Rejetée, etc.)
- Par client
- Par montant (plage)

### 4. Export Comptable
Générer un export comptable (format FEC) des factures archivées pour conformité fiscale.

---

## ✅ Résumé des Modifications

### Backend
- ✅ Modèle `Facture` : Ajout champs `archived`, `archived_at`, `archived_by`
- ✅ Route `GET /factures` : Filtre `archived: { $ne: true }`
- ✅ Route `GET /factures/archive/:year` : Filtre `archived: true`
- ✅ Route `GET /factures/archive-years/list` : Filtre `archived: true`
- ✅ Route `POST /factures/:id/toggle-archive` : Toggle archivage (admin only)

### Frontend
- ✅ `mongodbService.js` : Fonction `toggleArchiveFacture(id)`
- ✅ `Factures.js` : Bouton "Archiver" (admin uniquement)
- ✅ `Archive.js` : Bouton "Désarchiver" (admin uniquement)
- ✅ `Archive.js` : Import `toggleArchiveFacture`

---

**Dernière mise à jour :** 16 juin 2026  
**Version :** 2.0.0
