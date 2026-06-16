# 📋 CAHIER DES CHARGES - APPLICATION GESTION DE FACTURES

**Version:** 1.0  
**Date:** Juin 2024  
**Statut:** En cours de développement

---

## 📌 EXECUTIVE SUMMARY

L'application **Gestion de Factures** est une solution web complète et intégrée destinée à optimiser la gestion administrative et commerciale des factures. Elle permet aux entreprises de centraliser la création, la validation, le suivi et le paiement des factures dans un environnement sécurisé et convivial. Le projet cible deux types d'utilisateurs avec des permissions et des responsabilités distinctes : les **administrateurs systèmes** qui configurent et supervisent, et les **comptables/agents commerciaux** qui opérationnalisent la gestion quotidienne.

---

## 🎯 OBJECTIFS DU PROJET

### Objectifs Primaires

L'application poursuit plusieurs objectifs fondamentaux pour améliorer la gestion des factures. Premièrement, centraliser la facturation en fournissant une plateforme unique pour créer, modifier et gérer toutes les factures. Deuxièmement, automatiser les calculs complexes pour éviter les erreurs manuelles et gagner du temps : calcul automatique des montants HT, TVA variable selon la catégorie, remises et TTC. Troisièmement, sécuriser les accès en implémentant un système d'authentification robuste avec différenciation claire des rôles. Quatrièmement, faciliter le suivi des paiements en enregistrant et traçant les paiements partiels et totaux. Enfin, générer des états de synthèse, des rapports analytiques et des factures exportables en PDF pour une meilleure communication avec les clients.

### Objectifs Secondaires

En complément, l'application vise à améliorer la conformité légale avec archivage sécurisé des factures. Elle réduira les erreurs manuelles de saisie grâce à la validation automatique des données. Elle accélèrera le processus de facturation en éliminant les tâches répétitives. Elle fournira une visibilité en temps réel sur l'état des paiements et permettra une meilleure analyse financière de l'activité commerciale.

---

## 👥 ACTEURS, RÔLES ET RESPONSABILITÉS

### 1. ADMINISTRATEUR (ADMIN)

#### Profil et Contexte

L'administrateur est un responsable IT ou opérationnel qui configure l'application pour l'ensemble de l'entreprise. Il supervise les utilisateurs, maintient l'intégrité des données métier et valide les opérations critiques. C'est la personne de confiance responsable de la cohérence et de la sécurité du système.

#### Responsabilités Principales

L'administrateur a pour responsabilité première de configurer le système en paramétrant les informations de l'entreprise (SIRET, adresse, logo, conditions de paiement). Il gère le catalogue produit en créant et en maintenant à jour la liste des articles et des catégories facturables. Il configure les taux de TVA en définissant les taux applicables par catégorie (Informatique 20%, Services 10%, Formation 0%, etc.). 

En tant que superviseur, l'administrateur valide ou rejette les factures créées par les utilisateurs standard, garantissant ainsi la conformité et la qualité. Il génère des rapports analytiques avancés pour suivre l'activité (CA par user, TVA collectée, impayés). Il crée des comptes utilisateurs, assigne des rôles et désactive des comptes selon les besoins. Enfin, il assure le maintien de la conformité légale et l'archivage approprié des factures.

#### Accès et Permissions

L'administrateur bénéficie d'un accès complet à toutes les sections de l'application. Il peut créer, modifier et supprimer tous les articles et catégories sans restriction. Il a l'autorité absolue pour valider ou rejeter toutes les factures du système. Il visualise les factures de tous les utilisateurs et peut générer des rapports personnalisés et des exports complets. Il configures les paramètres entreprise et gère complètement les utilisateurs et leurs permissions. Cependant, il n'a généralement pas à créer lui-même des factures, car cette fonction est déléguée aux utilisateurs standard pour une meilleure traçabilité.

---

### 2. UTILISATEUR - COMPTABLE/AGENT (USER)

#### Profil et Contexte

L'utilisateur standard, appelé "comptable" ou "agent commercial", est la personne opérationnelle qui gère le cycle de vie des factures au quotidien. Il travaille sur ses propres factures et ses propres clients, avec un accès limité aux données des autres utilisateurs pour assurer la confidentialité et la séparation des responsabilités.

#### Responsabilités Principales

L'utilisateur crée les factures en initialisant une nouvelle facture, sélectionnant un client et ajoutant des articles. Il gère les clients en créant, modifiant et maintenant à jour la base de données clients avec les contacts et adresses à jour. Lors de la création d'une facture, il ajoute les articles aux factures en sélectionnant les produits/services, les quantités et les remises si nécessaire.

Un rôle important de l'utilisateur est d'enregistrer les paiements reçus, en traçant chaque paiement avec sa date, son montant et son type de virement. Il génère les factures en format PDF pour l'envoi aux clients. Il consulte l'historique complet de ses factures et de ses paiements pour assurer un suivi rigoureux. Enfin, il soumet ses factures pour validation administrative avant leur finalisation.

#### Accès et Permissions

L'utilisateur peut créer et modifier ses propres factures jusqu'au statut "En attente", après quoi elles deviennent verrouillées. Il visualise l'historique complet de ses factures et peut les filtrer par date, client ou statut. Il gère complètement les clients (création, modification, suppression). Il enregistre les paiements sur ses factures et génère des PDF pour ses factures. Il consulte ses statistiques personnelles et peut exporter ses propres données pour reportage personnel.

Cependant, l'utilisateur n'a pas accès aux factures des autres utilisateurs pour respecter la confidentialité. Il ne peut pas modifier les articles ou les catégories, qui sont gérés centralement par l'administrateur. Il n'a pas accès à la configuration des paramètres entreprise. Il ne peut pas valider les factures d'autres utilisateurs, même si elles sont les siennes. Il n'a pas accès aux rapports analytiques avancés qui consolident les données de tous les utilisateurs.

---

## 📊 FONCTIONNALITÉS DÉTAILLÉES

### SECTION 1 : AUTHENTIFICATION ET GESTION DE SESSION

#### 1.1 Authentification Utilisateur

L'application propose un système d'authentification sécurisé basé sur email et mot de passe. Chaque utilisateur dispose d'un compte unique avec ses identifiants.

L'utilisateur accède à la page de connexion et saisit son email et mot de passe. Le système valide les identifiants contre la base de données. Si les identifiants sont valides, un token de session sécurisé est généré et l'utilisateur est redirigé vers le tableau de bord correspondant à son rôle. Si les identifiants sont invalides, un message d'erreur explicite s'affiche pour informer l'utilisateur.

Pour faciliter les tests et la démonstration, deux comptes de test sont fournis : un compte administrateur avec l'email `admin@test.com` et le mot de passe `admin123`, et un compte utilisateur standard avec l'email `user@test.com` et le mot de passe `user123`.

#### 1.2 Gestion de Session

Une fois connecté, la session de l'utilisateur est gérée de manière sécurisée. Le token de session est stocké de façon protégée et reste valide tant que l'utilisateur est actif. Un timeout de session inactif peut être implémenté, par exemple 30 minutes sans activité, après lequel l'utilisateur doit se reconnecter. Lors de la déconnexion, le token est supprimé et l'utilisateur est redirigé vers la page de connexion. Lors de chaque reconnexion, le profil utilisateur est récupéré et les paramètres personnalisés sont restaurés.

#### 1.3 Contrôle d'Accès Basé sur les Rôles

L'application implémente un système de contrôle d'accès basé sur les rôles pour assurer que chaque utilisateur ne peut accéder que aux fonctionnalités autorisées. Les routes de l'application sont protégées par des garde-routes qui vérifient le rôle de l'utilisateur avant de permettre l'accès. Seules les pages autorisées pour chaque rôle sont accessibles. Les tentatives d'accès non autorisé redirigent l'utilisateur vers l'accueil ou affichent un message d'erreur approprié.

---

### SECTION 2 : TABLEAU DE BORD (DASHBOARD)

#### 2.1 Dashboard User (Comptable)

Le tableau de bord utilisateur affiche des statistiques personnelles et les informations pertinentes pour le suivi quotidien de l'activité. Il est conçu pour donner une visibilité immédiate sur la performance de chaque utilisateur.

En haut du dashboard, plusieurs indicateurs clés sont affichés. Le nombre de factures du mois courant montre l'activité opérationnelle. Le chiffre d'affaires du mois indique le montant total HT des factures créées ce mois-ci. La TVA collectée affiche le montant cumulé de TVA pour le mois. Le montant payé du mois montre les encaissements reçus. Une représentation graphique montre l'évolution du chiffre d'affaires sur les 12 derniers mois, permettant de visualiser les tendances.

En dessous, le dashboard affiche les dernières factures créées dans un tableau facilement consultable. Un widget spécial met en évidence les factures en attente de validation par l'administrateur, alertant l'utilisateur sur les actions en suspens. Un autre widget récapitule les factures impayées avec les montants restant à percevoir, permettant une gestion proactive du suivi client.

Les interactions sont intuitives : cliquer sur une facture récente ouvre son détail, cliquer sur "Voir plus" affiche la liste complète des factures. Les utilisateurs peuvent filtrer les données par date, client ou statut pour affiner leur vue.

#### 2.2 Dashboard Admin

Le tableau de bord administrateur combine les statistiques personnelles de l'administrateur avec une vue consolidée de toute l'activité. Cela permet à l'administrateur de superviser l'ensemble du système en un coup d'œil.

En plus des éléments du dashboard utilisateur, l'administrateur voit les factures en attente de validation provenant de tous les utilisateurs, avec un indicateur du nombre total. Un widget affiche les factures rejetées récemment avec la raison du rejet. Le chiffre d'affaires global consolide les ventes de tous les utilisateurs pour le mois ou l'année, donnant une vue d'ensemble de la santé financière.

Une représentation graphique montre la répartition du chiffre d'affaires par utilisateur, permettant d'identifier les meilleurs performants. Un breakdown de la TVA par catégorie aide à analyser la composition du chiffre d'affaires. Un système d'alertes signale les factures impayées qui dépassent l'échéance, indiquant les problèmes potentiels de recouvrement. Enfin, un log des derniers audits montre les modifications et validations effectuées dans le système, assurant la traçabilité.

---

### SECTION 3 : GESTION DES FACTURES

#### 3.1 Créer une Nouvelle Facture

Le processus de création d'une facture est conçu pour être intuitif et rapide tout en garantissant la complétude des données.

Tout commence lorsque l'utilisateur accède à "Nouvelle facture". Il doit d'abord sélectionner un client. Un dropdown liste tous les clients existants, ou il peut créer rapidement un nouveau client en remplissant les informations essentielles (nom, email, adresse). Une fois le client sélectionné, l'application propose un paramétrage initial avec la date de création pré-remplie avec la date du jour, et une date d'échéance calculée par défaut 30 jours plus tard. L'utilisateur peut ajuster ces dates et ajouter des notes internes optionnelles.

L'ajout des articles se fait via un tableau dynamique où l'utilisateur peut ajouter autant de lignes que nécessaire. Pour chaque ligne, il sélectionne un article dans le catalogue, saisit la quantité désirée, le prix unitaire s'affiche automatiquement, et il peut appliquer une remise en pourcentage si nécessaire. À mesure que l'utilisateur ajoute ou modifie les articles, l'application calcule automatiquement le montant HT de chaque ligne, applique la TVA selon la catégorie de l'article, et met à jour les totaux en temps réel.

Une fois tous les articles ajoutés, l'utilisateur peut optionnellement appliquer une remise globale sur l'ensemble de la facture en pourcentage. L'application recalcule automatiquement tous les totaux. Enfin, l'utilisateur enregistre la facture. Elle est d'abord enregistrée en statut "Brouillon", et le système auto-génère automatiquement un numéro de facture unique selon un format configurable (par exemple FAC-2024-001).

Plusieurs validations assurent que les données saisies sont correctes : au moins un article doit être présent dans la facture, les quantités et prix unitaires doivent être positifs, la date d'échéance doit être postérieure ou égale à la date de création, et un client doit obligatoirement être sélectionné.

#### 3.2 Modification et Suppression de Factures

Une fois créée, une facture peut être modifiée ou supprimée selon certaines règles pour assurer l'intégrité des données.

Concernant la modification, un utilisateur ne peut modifier que ses propres factures, pas celles des autres utilisateurs. Seules les factures en statut "Brouillon" peuvent être modifiées complètement, y compris tous les articles et montants. Une facture en statut "En attente" ou ultérieur peut avoir ses articles verrouillés, bien que le statut puisse être consulté. L'historique des modifications peut être conservé dans un système d'audit trail pour la traçabilité complète.

Concernant la suppression, un utilisateur ne peut supprimer que ses propres factures en "Brouillon". L'administrateur, lui, peut supprimer n'importe quelle facture du système, mais cette action est enregistrée dans un journal de suppression pour des raisons légales et d'audit. Une facture supprimée n'est pas physiquement effacée de la base de données mais marquée comme supprimée (soft delete) et ne s'affiche plus dans les listes standards.

#### 3.3 Liste et Filtrage des Factures

L'affichage des factures sous forme de tableau permet une gestion efficace et une consultation rapide des informations essentielles.

Le tableau affiche plusieurs colonnes : le numéro de facture unique (FAC-2024-001), le nom du client, la date de création, le montant total TTC, le statut avec un code couleur distinctif, le montant restant dû, et des boutons d'action. Un utilisateur standard ne voit que ses propres factures, tandis qu'un administrateur voit toutes les factures du système.

Plusieurs filtres permettent de trouver rapidement les factures recherchées. L'utilisateur peut filtrer par plage de dates de création, sélectionner un ou plusieurs statuts, choisir un client spécifique, ou filtrer par plage de montants. L'administrateur peut en plus filtrer par utilisateur pour voir uniquement les factures d'une personne donnée.

Le tri des données facilite encore plus la consultation. Les colonnes sont triables par date, par montant, ou par statut, en ordre ascendant ou descendant selon les besoins de l'utilisateur.

#### 3.4 Détail d'une Facture

Lorsqu'un utilisateur clique sur une facture pour la consulter, une page détaillée s'affiche avec toutes les informations complètes.

L'en-tête affiche le logo et les informations de l'entreprise, le numéro et la date de facture, et le statut actuel avec la date de changement. Directement sous l'en-tête, les informations du client sont affichées de manière claire : nom ou raison sociale, adresse complète, email et téléphone.

Le corps principal contient un tableau détaillé de tous les articles facturés avec les colonnes suivantes : désignation du produit/service, catégorie associée (déterminant la TVA), quantité, prix unitaire, remise appliquée en pourcentage, montant HT calculé, taux de TVA applicable, et montant TTC. Ce tableau donne une vue complète de la composition de la facture.

Après le tableau des articles, un récapitulatif financier présente les calculs : total HT, détail de la TVA par catégorie (par exemple TVA Informatique à 20%, TVA Services à 10%), total TVA cumulé, remise globale si applicable, et le montant total TTC en évidence.

Si des paiements ont été enregistrés, un historique est affiché listant chaque paiement avec sa date, son montant, son type de virement, et ses notes. Le total payé et le reste dû sont calculés et affichés de façon claire. Des observations ou le motif de rejet (si applicable) sont affichés à titre informatif.

Concernant les actions possibles depuis cette page, l'utilisateur peut modifier la facture si elle est en brouillon, enregistrer un nouveau paiement, générer un PDF, soumettre la facture pour validation, ou la supprimer si elle est en brouillon.

#### 3.5 Statuts des Factures

Les factures suivent un cycle de vie bien défini avec des statuts distincts qui décrivent l'avancement du processus.

Une facture commence en statut "Brouillon" lorsqu'elle est créée. C'est l'état initial, la facture est en cours de création et n'est pas finalisée. À ce stade, l'utilisateur peut la modifier complètement ou la supprimer.

Lorsque l'utilisateur considère que la facture est prête, il la passe en statut "En attente". À ce stade, la facture est finalisée et en attente de validation de la part de l'administrateur. Elle ne peut plus être modifiée par l'utilisateur standard.

L'administrateur examinera la facture et prendra une décision. S'il valide, la facture passe en statut "Validée", ce qui signifie qu'elle est approuvée et conforme aux normes de l'entreprise. Une facture validée ne peut plus être modifiée par quiconque sauf l'administrateur en cas de nécessité exceptionnelle.

Si l'administrateur rejette la facture, elle passe en statut "Rejetée" avec un motif expliquant les raisons. L'utilisateur peut alors corriger la facture et la renvoyer en "En attente" pour une nouvelle validation, ou la supprimer.

Enfin, une facture est marquée comme "Payée" lorsque tous les paiements ont été reçus et que le montant total payé atteint le montant TTC. Le système peut passer automatiquement une facture à ce statut lorsque le dernier paiement manquant est enregistré.

---

### SECTION 4 : GESTION DES PAIEMENTS

#### 4.1 Enregistrement des Paiements

L'enregistrement des paiements est un processus simple et sécurisé permettant de tracker le recouvrement des factures.

Depuis le détail d'une facture, l'utilisateur clique sur "Enregistrer un paiement". Une modale ou une page dédiée s'ouvre avec un formulaire. L'utilisateur saisit le montant du paiement, qui est validé pour s'assurer qu'il ne dépasse pas le reste dû (une alerte s'affiche si le montant dépasse le reste dû, permettant à l'utilisateur de confirmer s'il s'agit d'un trop-payé intentionnel). La date de paiement est demandée, pré-remplie avec la date du jour, mais peut être ajustée pour les paiements rétroactifs ou futurs.

L'utilisateur sélectionne le type de virement parmi une liste prédéfinie : virement bancaire, chèque, espèces, prélèvement, ou autre. Des champs optionnels permettent de saisir la date d'encaissement réelle si elle est différente de la date de paiement (par exemple pour les chèques), une référence de paiement (numéro de chèque, référence virement, etc.), et des notes internes pour documenter le paiement.

Une fois les informations saisies et validées, le paiement est enregistré. Le système recalcule automatiquement plusieurs valeurs : le montant total payé est mis à jour en ajoutant le nouveau paiement, le reste dû est recalculé comme TTC moins le total payé, et si le reste dû atteint zéro, le statut de la facture passe automatiquement à "Payée". L'historique des paiements est enrichi avec cette nouvelle entrée.

#### 4.2 Suivi des Paiements

Un suivi efficace des paiements aide à gérer la trésorerie et à identifier les retards de recouvrement.

Une vue synthétique permet de consulter tous les paiements reçus dans un tableau avec la possibilité de filtrer par date ou type de virement. Un graphique montre la tendance des paiements dans le temps, permettant de visualiser la trésorerie entrante. L'application détecte automatiquement les factures impayées au-delà de l'échéance et les signale avec des alertes visuelles.

Les alertes aident l'utilisateur à prioriser son travail. Une alerte rouge signale une facture impayée dont la date d'échéance est dépassée. Une alerte jaune indique une facture partiellement payée, le reste dû étant dû. Une alerte verte montre une facture complètement payée.

---

### SECTION 5 : GESTION DES CLIENTS

#### 5.1 Liste et Recherche des Clients

La gestion des clients commence par la consultation efficace de la liste existante.

Les clients sont affichés dans un tableau contenant plusieurs colonnes essentielles : le nom ou raison sociale du client, l'adresse email, le numéro de téléphone, l'adresse postale, la localité, le nombre de factures émises envers ce client, et le chiffre d'affaires total cumulé avec ce client. Des boutons d'action permettent de voir le détail, d'éditer, ou de supprimer.

Plusieurs filtres facilitent la recherche. L'utilisateur peut rechercher par nom, email ou téléphone en utilisant une barre de recherche. Il peut filtrer par ville. Il peut trier par chiffre d'affaires, par nombre de factures, ou par date de création. Ces fonctionnalités permettent de retrouver rapidement un client spécifique ou d'identifier les clients principaux.

#### 5.2 Créer/Modifier un Client

La création et la modification de clients se font via un formulaire structuré et validé.

Les champs obligatoires incluent le nom ou raison sociale du client (au minimum 3 caractères), l'email (format email valide et unique dans le système), et l'adresse (au minimum 5 caractères). Les champs optionnels incluent le numéro de téléphone (format validé), le code postal et la ville, le secteur d'activité choisi dans une liste pré-définie, le nom du contact référent chez le client, les conditions de paiement par défaut (30, 45, 60 jours ou autre), et des notes internes.

Lors de la création d'un client, tous les champs optionnels peuvent être laissés vides et complétés ultérieurement. Lors de la modification, l'utilisateur ne peut modifier que les informations du client, pas les factures déjà émises.

#### 5.3 Suppression et Archivage

La suppression d'un client suit un processus sécurisé pour préserver l'historique.

Le système implémente une suppression logique appelée "soft delete", où le client est marqué comme inactif plutôt que physiquement supprimé de la base de données. Avant de supprimer, le système vérifie qu'aucune facture non payée n'est associée au client, sinon une erreur l'empêche. Un client supprimé conserve tout l'historique des factures et des paiements associés pour les besoins légaux et d'audit. L'administrateur peut restaurer un client supprimé si nécessaire.

---

### SECTION 6 : GESTION DES ARTICLES (ADMIN UNIQUEMENT)

#### 6.1 Catalogue des Articles

L'administrateur gère le catalogue centralisé des articles disponibles pour la facturation.

Les articles sont listés dans un tableau affichant la désignation du produit ou service, la catégorie associée qui détermine la TVA applicable, le prix unitaire en HT, la quantité en stock, un statut actif/inactif, et des boutons d'action pour voir, éditer ou supprimer.

L'administrateur peut filtrer cette liste par catégorie pour voir uniquement les articles d'une catégorie donnée. Il peut filtrer par statut pour voir uniquement les articles actifs ou inactifs. Il peut rechercher par désignation pour trouver rapidement un article spécifique.

#### 6.2 Créer/Modifier un Article

La création d'articles s'effectue via un formulaire complet permettant de capturer toutes les informations nécessaires.

La désignation est un champ obligatoire contenant le nom du produit ou service. Une description optionnelle permet d'ajouter des détails supplémentaires. La catégorie est obligatoire et détermine le taux de TVA appliqué. Le prix unitaire en HT est obligatoire et doit être strictement positif. Un stock initial optionnel enregistre la quantité disponible. Un code article optionnel permet de référencer l'article de manière interne. Le fournisseur optionnel enregistre le fournisseur principal de cet article. Un statut booléen indique si l'article est actif ou inactif, pré-configuré à actif par défaut.

Lors de la modification d'un article existant, le prix peut être mis à jour, ce qui affectera les futures factures utilisant cet article. Les anciennes factures conservent les prix historiques pour l'audit.

#### 6.3 Suppression d'Articles

La suppression d'articles est contrôlée pour éviter des incohérences dans l'historique.

Un article ne peut être supprimé que s'il ne figure dans aucune facture existante. Si un article apparaît dans des factures, une erreur l'indique avec le nombre de factures. Dans ce cas, l'article doit plutôt être passé au statut "Inactif" pour empêcher son utilisation dans les futures factures. Un article inactif reste visible à titre de référence et dans les rapports d'audit, mais n'apparaît plus dans les listes de sélection pour créer de nouvelles factures.

---

### SECTION 7 : GESTION DES CATÉGORIES (ADMIN UNIQUEMENT)

#### 7.1 Vue des Catégories

Les catégories regroupent les articles et définissent les taux de TVA applicables.

Une liste affiche le nom de chaque catégorie, le taux de TVA en pourcentage appliqué aux articles de cette catégorie, une description optionnelle de la catégorie, le nombre d'articles actuellement classés dans cette catégorie, et des boutons d'action pour éditer ou supprimer.

#### 7.2 Créer/Modifier une Catégorie

La création d'une catégorie est simple mais importante car elle affecte tous les calculs de TVA.

Le nom de la catégorie est obligatoire et unique dans le système (par exemple "Informatique", "Services", "Formation"). Le taux de TVA est obligatoire et exprimé en pourcentage (par exemple 20 pour 20%, 10 pour 10%, 0 pour 0%, 5.5 pour 5.5%). Une description optionnelle explique la catégorie et ses critères d'utilisation.

Plusieurs catégories sont pré-créées par défaut : Informatique avec 20% de TVA pour les logiciels et matériels, Services avec 10% de TVA pour le consulting et la maintenance, Formation avec 0% de TVA, Maintenance avec 5.5% de TVA, et Autres avec 20% de TVA. L'administrateur peut ajouter d'autres catégories selon ses besoins.

#### 7.3 Suppression de Catégories

Une catégorie ne peut être supprimée que si elle est vide d'articles.

Si aucun article n'est associé à la catégorie, la suppression est possible. Si des articles utilisent la catégorie, un message d'erreur l'indique avec le nombre d'articles concernés. Dans ce cas, l'administrateur doit d'abord réaffecter les articles à une autre catégorie ou les passer au statut inactif avant de pouvoir supprimer la catégorie.

---

### SECTION 8 : CONFIGURATION ENTREPRISE (ADMIN UNIQUEMENT)

#### 8.1 Paramètres Généraux

L'administrateur configure les informations de base de l'entreprise qui s'affichent sur toutes les factures et rapports.

Le logo de l'entreprise peut être uploadé (format PNG ou JPG, taille maximale 5MB) et s'affichera en haut à gauche des factures PDF. Le nom de l'entreprise contient la raison sociale complète. Le numéro SIRET à 14 chiffres identifie légalement l'entreprise. Le code APE indique l'activité principale de l'entreprise. L'adresse complète inclut le numéro et la rue. Le code postal à 5 chiffres et la ville complètent l'adresse. Le numéro de téléphone et l'adresse email permettent aux clients de contacter l'entreprise. L'URL du site web est optionnelle mais recommandée.

#### 8.2 Paramètres Bancaires

Les informations bancaires permettent aux clients de savoir où envoyer les paiements.

Le titulaire du compte correspond au nom d'immatriculation bancaire. L'IBAN est validé pour s'assurer de sa conformité au standard international. Le code BIC est optionnel mais facilite les virements internationaux. Le nom de la banque et la localité de l'agence bancaire complètent les informations.

#### 8.3 Paramètres de Facturation

Ces paramètres contrôlent le processus et la présentation des factures.

Le format de numérotation définit le pattern des numéros de factures auto-générés (par exemple FAC-YYYY-#### génère FAC-2024-0001, FAC-2024-0002, etc., ou FAC-MM-#### pour réinitialiser chaque mois). Le prochain numéro à attribuer est suivi automatiquement par le système. Les conditions de paiement par défaut s'appliquent à toutes les nouvelles factures (30, 45, 60 jours, ou autre délai personnalisé). La devise affichée (EUR, USD, GBP, etc.) s'applique à tous les montants. Une mention légale optionnelle s'affiche en bas de chaque facture PDF pour afficher les conditions générales ou des mentions de conformité.

---

### SECTION 9 : VALIDATION DES FACTURES (ADMIN UNIQUEMENT)

#### 9.1 Workflow de Validation

Le processus de validation des factures assure la conformité et la qualité avant la facturation aux clients.

L'administrateur accède à un tableau spécialisé "Factures en attente de validation" qui affiche toutes les factures créées par les utilisateurs et passées en statut "En attente". Ce tableau affiche le numéro de facture, le nom de l'utilisateur qui l'a créée, le client concerné, la date de création, le montant total, et des boutons d'action.

Lorsque l'administrateur clique sur "Valider" pour un paire de facture, le détail complet s'affiche. L'administrateur procède à une vérification minutieuse : il s'assure que les montants et les calculs sont corrects, que tous les articles et quantités sont appropriés, que la TVA est appliquée correctement selon les catégories, et que toutes les informations du client sont complètes et exactes.

Une fois l'examen complété, l'administrateur a deux choix. S'il approuve la facture, il clique sur "Valider", le statut passe immédiatement à "Validée" avec un timestamp de validation, et l'utilisateur est optionnellement notifié. Si l'administrateur identifie des problèmes, il clique sur "Rejeter", un formulaire s'affiche pour saisir le motif du rejet, et la facture revient au statut "En attente" pour que l'utilisateur la corrige.

Les motifs de rejet possibles incluent les erreurs de calcul, les informations client incomplètes, des montants jugés anormaux, des articles invalides, ou un motif personnalisé avec détails spécifiques.

#### 9.2 Après Validation

Une fois validée, la facture peut être utilisée librement.

La facture est marquée comme "Validée" et cette information est visible partout dans l'application. L'utilisateur est notifié de la validation et peut maintenant envoyer la facture au client ou la générer en PDF. Les paiements peuvent être enregistrés contre cette facture sans restriction.

---

### SECTION 10 : RAPPORTS ET ANALYSES

#### 10.1 Rapports Utilisateur (USER)

Les utilisateurs standards ont accès à des rapports básicos focalisés sur leur propre activité.

Le rapport personnel affiche un récapitulatif du mois courant avec le nombre de factures créées, le chiffre d'affaires total, la TVA collectée, et les paiements reçus. Un graphique linéaire ou en barres affiche l'évolution du chiffre d'affaires mensuel sur les 12 derniers mois pour identifier les tendances. Un tableau des top 5 clients par chiffre d'affaires cumul identifie les clients principaux. Une liste des factures impayées avec les montants restant dus aide au suivi du recouvrement. L'utilisateur peut exporter ce rapport en PDF ou Excel pour l'archivage ou la présentation.

#### 10.2 Rapports Administrateur (ADMIN)

L'administrateur dispose de rapports analytiques avancés consolidant les données de toute l'entreprise.

Le rapport de chiffre d'affaires montre le CA par utilisateur, permettant d'identifier les meilleurs vendeurs. Il affiche le CA par client pour identifier les clients stratégiques. Il détaille le CA par catégorie de produits/services. Il trace l'évolution mensuelle du CA. Tous les éléments sont présentés en graphiques et tableaux.

Le rapport de TVA collectée indique la TVA par catégorie, aidant à la déclaration fiscale. Il montre la TVA par utilisateur. Il calcule le cumul mensuel et annuel.

Le rapport de paiements affiche les paiements à temps, les paiements en retard, et les factures impayées. Des graphiques radar ou circulaires montrent la répartition des types de paiement.

Un widget de factures non validées affiche le nombre et le montant des factures en attente, signalant tout bouchon dans le processus de validation.

Un rapport des clients inactifs identifie les clients sans factures depuis 6 mois ou plus, permettant une relance commerciale.

Un rapport des articles peu utilisés identifie les articles n'apparaissant dans aucune facture, suggérant une suppression ou un retrait du catalogue.

Un audit trail chronologique enregistre toutes les actions importantes : validations, rejets, suppressions, modifications, avec l'utilisateur responsable et l'horodatage.

Tous ces rapports peuvent être exportés en Excel pour traitement ultérieur, en PDF pour présentation, ou en CSV pour importation dans un système BI.

---

### SECTION 11 : GÉNÉRATION DE PDF

#### 11.1 Contenu du PDF Facture

La génération de factures PDF crée des documents professionnels et légaux prêts à l'envoi.

L'en-tête contient le logo de l'entreprise dans le coin supérieur gauche, le titre "FACTURE" en grande police, le numéro de facture unique, la date d'émission, et le statut actuel.

Le bloc entreprise sur la gauche affiche le nom complet de l'entreprise, le SIRET, l'adresse postale complète, le téléphone et l'email. Le bloc client sur la droite affiche "Facturé à :" suivi du nom du client, son adresse, la ville et code postal, le téléphone et l'email.

Le tableau central liste tous les articles avec les colonnes : désignation du produit/service, catégorie, quantité, prix unitaire, remise appliquée, montant HT, taux de TVA en pourcentage, montant TTC. Une ligne de total pour chaque colonne facilite la lecture.

Le récapitulatif financier affiche le total HT, puis chaque taux de TVA avec son montant (par exemple TVA Informatique 20% = 500€, TVA Services 10% = 100€), le total TVA global, puis le montant total TTC en évidence avec plus grande police.

Si plusieurs paiements ont été enregistrés, un historique des paiements affiche la date, le montant, et le type pour chaque paiement. Le total payé et le reste dû sont affichés.

Le pied de page contient les conditions de paiement configurées, une mention légale ou des conditions générales, la référence bancaire, l'IBAN, et la date d'édition du PDF.

#### 11.2 Actions PDF

L'utilisateur peut télécharger le PDF sur son ordinateur pour l'envoyer par email ou l'imprimer. L'impression directe est possible depuis le navigateur. L'envoi par email optionnel (nécessitant un backend mail) envoie automatiquement la facture au client ou à une adresse de contact.

---

## 🔄 FLUX ET PROCESSUS PRINCIPAUX

### FLUX 1 : Création d'une Facture Complète

Le processus complet de création d'une facture est bien défini. L'utilisateur accède à la section des factures et clique sur "Nouvelle facture". Il sélectionne ou crée un client. Il ajoute des articles dans le tableau dynamique, en saisissant quantité et prix. L'application calcule automatiquement HT, TVA par catégorie et TTC pour chaque article. L'utilisateur peut ajouter une remise globale et des notes. Il enregistre la facture qui passe en statut "Brouillon". Un numéro unique est auto-généré. L'utilisateur peut maintenant éditer, supprimer, ou bien envoyer la facture en statut "En attente". Une fois en "En attente", la facture est figée et attend validation de l'administrateur.

### FLUX 2 : Validation Administrative

L'administrateur accède au tableau des factures en attente. Il sélectionne une facture pour l'examiner. Il vérifie tous les détails : montants, articles, informations client. Si tout est correct, il clique "Valider" et la facture passe en "Validée". Si un problème est identifié, il clique "Rejeter" et saisit un motif. La facture revient alors à l'utilisateur pour correction et renvoie.

### FLUX 3 : Enregistrement de Paiements

L'utilisateur consulte une facture validée. Il clique sur "Enregistrer un paiement". Il saisit le montant, la date et le type de paiement. Le système valide que le montant n'excède pas le reste dû. Une fois confirmé, le paiement est enregistré. Les totaux sont recalculés automatiquement. Si le paiement égale le reste dû, le statut passe automatiquement à "Payée". Sinon, la facture reste en attente des paiements complémentaires.

### FLUX 4 : Configuration par Administrateur

L'administrateur accède à la section configuration. Il remplit les informations entreprise, les paramètres bancaires, et les paramètres de facturation. Il accède ensuite à la gestion des articles et crée les articles du catalogue. Il définit les catégories et leurs taux de TVA. Il configure les conditions de paiement par défaut et le format de numérotation. Ces configurations sont maintenant disponibles pour tous les utilisateurs qui créent des factures.

---

## 📋 GLOSSAIRE

Ce glossaire explicite les termes clés utilisés dans le cahier des charges pour assurer une compréhension commune.

Une **facture** est un document commercial qui récapitule une transaction, listant les articles vendus, les quantités, les prix, les remises, et les montants avec TVA.

**HT** signifie "Hors Taxes" et représente le montant avant application de la TVA.

**TVA** signifie "Taxe à la Valeur Ajoutée" et est un impôt sur la consommation appliqué selon le type de produit/service.

**TTC** signifie "Toutes Taxes Comprises" et représente le montant final HT + TVA, le montant total à payer par le client.

Le statut **"Brouillon"** indique qu'une facture est en cours de création et non finalisée.

Le statut **"En attente"** indique qu'une facture est finalisée mais en attente de validation administrative.

Le statut **"Validée"** indique qu'une facture a été approuvée par l'administrateur.

Le statut **"Rejetée"** indique qu'une facture n'a pas été acceptée, généralement avec un motif à corriger.

Le statut **"Payée"** indique qu'une facture a été entièrement payée.

**"Reste dû"** est la différence entre le montant TTC et les paiements reçus à ce jour.

**"RBAC"** signifie "Role-Based Access Control" et décrit un système où les accès dépendent du rôle de l'utilisateur.

**"JWT"** signifie "JSON Web Token" et est un format standard de jeton d'authentification.

**"SIRET"** est le "Système d'Identification du Répertoire des Établissements", un numéro de 14 chiffres identifiant légalement une entreprise.

**"Soft delete"** ou suppression logique consiste à marquer des données comme supprimées sans les effacer physiquement de la base de données, préservant ainsi l'historique.

**"Audit trail"** ou journal d'audit enregistre l'historique de toutes les modifications et actions importantes effectuées dans le système, avec l'utilisateur responsable et l'horodatage.

---

## 🎯 CONCLUSION

Ce cahier des charges fournit une feuille de route complète pour le développement et la maintenance de l'application Gestion de Factures. Il définit clairement les deux rôles principaux avec leurs permissions spécifiques, détaille toutes les fonctionnalités de l'application de manière compréhensible, décrit les flux de travail et les processus métier, et établit les critères de succès pour validation.

L'application vise à simplifier et à automatiser la gestion administrative des factures tout en assurant la conformité légale, la sécurité des données sensibles, et une excellente expérience utilisateur pour les comptables et administrateurs.

---

**Document rédigé le : Juin 2024**  
**Version : 1.0**  
**Statut : Documentation complète**

