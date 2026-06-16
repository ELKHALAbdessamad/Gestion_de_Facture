# Workflow de Validation des Factures

## 📋 Vue d'ensemble

Le système de gestion des factures utilise un workflow de validation où les factures créées par les utilisateurs (comptables/agents) doivent être validées par un administrateur avant d'être marquées comme payées.

## 🔄 Flux de Statuts

```
┌─────────────────────────────────────────────────────────────┐
│                     CRÉATION DE FACTURE                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │   Statut: "Draft"     │
                  │   (Brouillon)         │
                  └───────────────────────┘
                              │
                              │ User clique "Envoyer"
                              ▼
                  ┌───────────────────────┐
                  │  Statut: "En attente" │
                  │  (Attente validation) │
                  └───────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
      Admin clique "Valider"      Admin clique "Rejeter"
                │                           │
                ▼                           ▼
    ┌───────────────────────┐   ┌───────────────────────┐
    │   Statut: "Payée"     │   │  Statut: "Rejetée"    │
    │   ✅ Validée          │   │   ❌ Rejetée          │
    │   + Email au client   │   │                       │
    └───────────────────────┘   └───────────────────────┘
```

## 👥 Rôles et Permissions

### 🔹 **Utilisateur (role: "user")** - Comptable / Agent Commercial
**Peut :**
- ✅ Créer des factures (statut: Draft)
- ✅ Soumettre des factures (statut: En attente)
- ✅ Modifier les factures en Draft ou En attente
- ✅ Voir toutes ses factures
- ✅ Télécharger le PDF
- ✅ Envoyer l'email au client

**Ne peut PAS :**
- ❌ Valider une facture (changer statut → Payée)
- ❌ Rejeter une facture (changer statut → Rejetée)
- ❌ Supprimer une facture

### 🔹 **Administrateur (role: "admin")**
**Peut tout faire, PLUS :**
- ✅ **Valider** une facture (En attente → Payée)
- ✅ **Rejeter** une facture (En attente → Rejetée)
- ✅ Supprimer des factures
- ✅ Voir toutes les factures de tous les utilisateurs

## 🛡️ Sécurité Backend

### Protection API - Route `PUT /api/factures/:id`

```javascript
// Vérification côté serveur
if (updateData.statut && ['Payée', 'Rejetée'].includes(updateData.statut)) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Seul un administrateur peut valider ou rejeter une facture.' 
    });
  }
}
```

**Résultat :**
- Un utilisateur normal qui tenterait de forcer le statut en "Payée" recevra une erreur **403 Forbidden**
- Seuls les comptes avec `role: "admin"` peuvent changer le statut vers "Payée" ou "Rejetée"

## 🎨 Interface Utilisateur

### Page de Détail - Boutons visibles selon le rôle

#### Pour les **Utilisateurs** (En attente)
```
┌────────────────────────────────────────────────┐
│  [Retour] [Signer] [Modifier] [Email] [PDF]   │
└────────────────────────────────────────────────┘
```

#### Pour les **Admins** (En attente)
```
┌──────────────────────────────────────────────────────────────────┐
│ [Retour] [Signer] [✅ Valider] [❌ Rejeter] [Modifier] [Email]  │
│ [PDF] [🗑️ Supprimer]                                             │
└──────────────────────────────────────────────────────────────────┘
```

## 📧 Automatisations

### Lors de la validation par l'admin :
1. ✅ Statut passe à "Payée"
2. ✅ Champ `validated_by_admin` = `true`
3. ✅ Champ `validated_by` = email de l'admin
4. ✅ Champ `validated_at` = timestamp actuel
5. ✅ **Email automatique envoyé au client** avec le PDF de la facture

## 🧪 Scénarios de Test

### Test 1 : Création par utilisateur
1. Se connecter avec `user@test.com`
2. Créer une nouvelle facture
3. Cliquer "Envoyer Facture"
4. ✅ Statut = "En attente"
5. ❌ Bouton "Valider" **non visible**

### Test 2 : Validation par admin
1. Se connecter avec `admin@test.com`
2. Ouvrir une facture "En attente"
3. ✅ Bouton "Valider" **visible**
4. Cliquer "Valider"
5. ✅ Statut = "Payée"
6. ✅ Email envoyé au client

### Test 3 : Tentative de contournement (sécurité)
1. Se connecter avec `user@test.com`
2. Créer une facture "En attente"
3. Via DevTools, essayer de forcer `PUT /api/factures/:id` avec `{statut: "Payée"}`
4. ✅ Backend retourne **403 Forbidden**
5. ✅ Message : "Seul un administrateur peut valider ou rejeter une facture."

## 🔑 Comptes de Test

### Admin
```
Email: admin@test.com
Password: admin123
Role: admin
```

### Utilisateur
```
Email: user@test.com
Password: user123
Role: user
```

## 📊 Base de Données - Champs de Validation

Dans le modèle `Facture` :

```javascript
{
  statut: {
    type: String,
    enum: ['Draft', 'En attente', 'Payée', 'Rejetée'],
    default: 'Draft'
  },
  validated_by_admin: { type: Boolean, default: false },
  validated_by: String,        // Email de l'admin validateur
  validated_at: Date           // Date/heure de validation
}
```

## 🚀 Mise en Production

### Recommandations de sécurité

1. **Toujours vérifier le rôle côté backend** (déjà implémenté ✅)
2. **Logger les validations** pour audit
3. **Envoyer des notifications** aux users quand leur facture est validée/rejetée
4. **Limiter les modifications** des factures validées

---

**Dernière mise à jour :** 16 juin 2026  
**Version :** 1.0.0
