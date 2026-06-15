export const translations = {
  fr: {
    // Navigation
    nav: {
      features: 'Fonctionnalités',
      howItWorks: 'Comment ça marche',
      testimonials: 'Avis',
      pricing: 'Tarifs',
      login: 'Connexion',
      register: 'Créer un compte',
      start: 'Démarrer',
    },

    // Landing Page
    landing: {
      badge: 'Facturation Intelligente · 2026',
      title1: 'Facturez vite.',
      title2: 'Soyez payé',
      title2Highlight: 'plus vite.',
      subtitle: 'Créez des factures professionnelles en 60 secondes, suivez chaque paiement en temps réel et automatisez vos relances — tout depuis un seul tableau de bord.',
      ctaStart: 'Commencer Gratuitement →',
      ctaDemo: 'Voir la démo',
      stats: {
        users: 'Utilisateurs actifs',
        invoices: 'Factures créées',
        amount: 'Montant traité',
        satisfaction: 'Satisfaction client',
      },
      howItWorks: {
        badge: '⚡ TÉMOIGNAGES',
        title: 'Simple comme',
        titleItalic: 'bonjour',
        subtitle: 'Trois étapes pour passer de "prestation terminée" à paiement reçu.',
        step1: {
          label: 'ÉTAPE 1',
          title: 'Créez votre facture',
          description: 'Sélectionnez un modèle, ajoutez vos prestations, votre logo et les coordonnées du client. Moins d\'une minute.',
          time: '< 60s',
          timeLabel: 'pour créer',
        },
        step2: {
          label: 'ÉTAPE 2',
          title: 'Envoyez & suivez',
          description: 'Envoyez par email directement depuis InvoiceSite. Recevez une notification dès que votre client ouvre la facture.',
          time: '100%',
          timeLabel: 'traçabilité',
        },
        step3: {
          label: 'ÉTAPE 3',
          title: 'Soyez payé',
          description: 'Votre client paie en ligne, par carte ou virement. L\'argent arrive sur votre compte en 1 à 2 jours ouvrés.',
          time: '1-2j',
          timeLabel: 'délai moyen',
        },
        cta: 'Essayer maintenant — C\'est gratuit →',
      },
      testimonials: {
        badge: '⭐ TÉMOIGNAGES',
        title: 'Ils se font payer à temps.',
        titleHighlight: 'Maintenant',
        rating: '4.9/5 · 2 400+ avis',
      },
      features: {
        title: 'Fonctionnalités Puissantes',
        subtitle: 'Tout ce dont vous avez besoin pour gérer vos factures comme un pro',
        items: {
          invoicing: {
            title: 'Facturation Intelligente',
            description: 'Créez des factures professionnelles en 60 secondes avec notre IA',
          },
          clients: {
            title: 'Gestion Clients',
            description: 'Base de données clients avec historique complet et analytics',
          },
          analytics: {
            title: 'Analytics Avancés',
            description: 'Tableaux de bord en temps réel avec prédictions IA',
          },
          export: {
            title: 'Export Multi-format',
            description: 'PDF, Excel, CSV avec templates personnalisables',
          },
          automation: {
            title: 'Automatisation',
            description: 'Relances automatiques et rappels intelligents',
          },
          payments: {
            title: 'Paiements Rapides',
            description: 'Intégration avec tous les moyens de paiement',
          },
        },
      },
      finalCta: {
        title: 'Prêt à transformer votre facturation ?',
        subtitle: 'Rejoignez-nous gratuitement et commencez à facturer en quelques minutes',
        button: 'Commencer Maintenant →',
      },
      footer: {
        description: 'La solution de facturation la plus moderne et intuitive du marché.',
        product: 'Produit',
        features: 'Fonctionnalités',
        pricing: 'Tarifs',
        demo: 'Démo',
        support: 'Support',
        documentation: 'Documentation',
        contact: 'Contact',
        faq: 'FAQ',
        company: 'Entreprise',
        about: 'À propos',
        blog: 'Blog',
        careers: 'Carrières',
        legal: 'Légal',
        privacy: 'Confidentialité',
        terms: 'CGU',
        mentions: 'Mentions légales',
        copyright: '© 2026 Facture.net - Tous droits réservés',
      },
    },

    // Auth
    auth: {
      login: {
        title: 'Facture.net',
        subtitle: 'Connectez-vous pour accéder à votre espace',
        email: 'Email',
        password: 'Mot de passe',
        submit: 'Se connecter',
        loading: 'Connexion...',
        error: 'Email ou mot de passe incorrect',
        testAccounts: 'Comptes de test',
        admin: 'Admin',
        user: 'User',
        backHome: '← Retour à l\'accueil',
        noAccount: 'Pas encore de compte ?',
        registerLink: 'Créer un compte',
      },
      register: {
        title: 'Créer un compte',
        subtitle: 'Rejoignez des milliers d\'entrepreneurs satisfaits',
        steps: {
          personal: 'Informations personnelles',
          company: 'Informations entreprise',
          confirmation: 'Confirmation',
        },
        fields: {
          fullName: 'Nom complet',
          email: 'Email',
          password: 'Mot de passe',
          confirmPassword: 'Confirmer le mot de passe',
          company: 'Nom de l\'entreprise',
          phone: 'Téléphone',
        },
        summary: {
          title: 'Récapitulatif',
          name: 'Nom',
          email: 'Email',
          company: 'Entreprise',
          notProvided: 'Non renseigné',
        },
        buttons: {
          back: 'Retour',
          next: 'Suivant',
          create: 'Créer mon compte',
          creating: 'Création...',
        },
        errors: {
          fillAll: 'Veuillez remplir tous les champs',
          passwordMismatch: 'Les mots de passe ne correspondent pas',
        },
        hasAccount: 'Vous avez déjà un compte ?',
        loginLink: 'Se connecter',
        backHome: '← Retour à l\'accueil',
      },
    },

    // Dashboard
    dashboard: {
      title: 'Tableau de bord',
      subtitle: 'Vue d\'ensemble de votre activité',
      date: 'Dimanche, 15 Mars 2026',
      newInvoice: 'Nouvelle Facture',
      stats: {
        totalRevenue: 'Revenu Total',
        outstanding: 'En Attente',
        invoicesSent: 'Factures Envoyées',
        activeClients: 'Clients Actifs',
      },
      recentInvoices: {
        title: 'Factures Récentes',
        viewAll: 'Voir tout',
      },
      quickActions: {
        title: 'Actions Rapides',
        createInvoice: 'Créer une Facture',
        addClient: 'Ajouter un Client',
        viewReports: 'Voir les Rapports',
      },
      paymentStatus: {
        title: 'Statut des Paiements',
        paid: 'Payé',
        pending: 'En Attente',
        overdue: 'En Retard',
      },
    },

    // Invoices
    invoices: {
      title: 'Gestion des Factures',
      count: 'factures',
      newInvoice: 'Nouvelle Facture',
      searchPlaceholder: 'Rechercher des factures...',
      table: {
        number: 'Numéro',
        date: 'Date',
        client: 'Client',
        totalTTC: 'Total TTC',
        status: 'Statut',
        actions: 'Actions',
      },
      status: {
        paid: 'Payée',
        pending: 'En attente',
        overdue: 'En retard',
        draft: 'Brouillon',
      },
      actions: {
        view: 'Voir',
        edit: 'Modifier',
        download: 'Télécharger',
      },
    },

    // Invoice Form
    invoiceForm: {
      title: {
        new: 'Nouvelle Facture',
        edit: 'Modifier la Facture',
      },
      status: {
        draft: 'Brouillon',
        notSaved: 'Non sauvegardé',
      },
      buttons: {
        back: '← Retour',
        saveDraft: 'Sauvegarder le Brouillon',
        sendInvoice: 'Envoyer la Facture',
      },
      sections: {
        from: 'DE',
        billTo: 'FACTURER À',
        description: 'DESCRIPTION',
      },
      fields: {
        yourName: 'Votre Nom / Entreprise',
        email: 'Adresse email',
        address: 'Adresse',
        selectClient: 'Sélectionner un client...',
        clientEmail: 'Email du client',
        billingAddress: 'Adresse de facturation',
        invoiceNumber: 'Numéro de Facture',
        issueDate: 'Date d\'Émission',
        dueDate: 'Date d\'Échéance',
        description: 'Description du service ou produit',
        quantity: 'QTÉ',
        rate: 'TARIF (€)',
        total: 'TOTAL',
      },
      addLineItem: 'Ajouter une ligne',
      totals: {
        subtotal: 'Sous-total',
        tax: 'TVA (20%)',
        total: 'Total',
      },
    },

    // Clients
    clients: {
      title: 'Clients',
      count: 'clients',
      addClient: 'Ajouter un Client',
      searchPlaceholder: 'Rechercher des clients...',
      status: {
        active: 'Actif',
        inactive: 'Inactif',
      },
      stats: {
        totalInvoiced: 'Total Facturé',
        invoices: 'Factures',
      },
      invoice: 'Facturer',
      dialog: {
        add: 'Ajouter un Nouveau Client',
        edit: 'Modifier le Client',
        fields: {
          name: 'Nom du Client',
          email: 'Email',
          phone: 'Téléphone',
          address: 'Adresse',
        },
        buttons: {
          cancel: 'Annuler',
          save: 'Sauvegarder',
          add: 'Ajouter le Client',
        },
      },
    },

    // Articles
    articles: {
      title: 'Gestion des Articles',
      newArticle: 'Nouvel Article',
      table: {
        designation: 'Désignation',
        unitPrice: 'Prix Unitaire',
        category: 'Catégorie',
        actions: 'Actions',
      },
      dialog: {
        add: 'Nouvel Article',
        edit: 'Modifier l\'Article',
        fields: {
          designation: 'Désignation',
          unitPrice: 'Prix Unitaire',
          category: 'Catégorie',
        },
        buttons: {
          cancel: 'Annuler',
          save: 'Modifier',
          create: 'Créer',
        },
      },
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cet article ?',
    },

    // Categories
    categories: {
      title: 'Gestion des Catégories',
      newCategory: 'Nouvelle Catégorie',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cette catégorie ?',
    },

    // Common
    common: {
      loading: 'Chargement...',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      search: 'Rechercher',
      actions: 'Actions',
      yes: 'Oui',
      no: 'Non',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      submit: 'Soumettre',
      confirm: 'Confirmer',
    },

    // Menu
    menu: {
      dashboard: 'Tableau de bord',
      invoices: 'Factures',
      clients: 'Clients',
      articles: 'Articles',
      categories: 'Catégories',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      admin: 'Administrateur',
      user: 'Utilisateur',
    },
  },

  en: {
    // Navigation
    nav: {
      features: 'Features',
      howItWorks: 'How it Works',
      testimonials: 'Testimonials',
      pricing: 'Pricing',
      login: 'Login',
      register: 'Sign Up',
      start: 'Get Started',
    },

    // Landing Page
    landing: {
      badge: 'Smart Invoicing · 2026',
      title1: 'Invoice fast.',
      title2: 'Get paid',
      title2Highlight: 'faster.',
      subtitle: 'Create professional invoices in 60 seconds, track every payment in real-time and automate your reminders — all from a single dashboard.',
      ctaStart: 'Start Free →',
      ctaDemo: 'View Demo',
      stats: {
        users: 'Active Users',
        invoices: 'Invoices Created',
        amount: 'Amount Processed',
        satisfaction: 'Client Satisfaction',
      },
      howItWorks: {
        badge: '⚡ TESTIMONIALS',
        title: 'Simple as',
        titleItalic: 'hello',
        subtitle: 'Three steps from "service completed" to payment received.',
        step1: {
          label: 'STEP 1',
          title: 'Create your invoice',
          description: 'Select a template, add your services, logo and client details. Less than a minute.',
          time: '< 60s',
          timeLabel: 'to create',
        },
        step2: {
          label: 'STEP 2',
          title: 'Send & track',
          description: 'Send by email directly from InvoiceSite. Get notified as soon as your client opens the invoice.',
          time: '100%',
          timeLabel: 'traceability',
        },
        step3: {
          label: 'STEP 3',
          title: 'Get paid',
          description: 'Your client pays online, by card or transfer. Money arrives in your account in 1-2 business days.',
          time: '1-2d',
          timeLabel: 'average delay',
        },
        cta: 'Try Now — It\'s Free →',
      },
      testimonials: {
        badge: '⭐ TESTIMONIALS',
        title: 'They get paid on time.',
        titleHighlight: 'Now',
        rating: '4.9/5 · 2,400+ reviews',
      },
      features: {
        title: 'Powerful Features',
        subtitle: 'Everything you need to manage your invoices like a pro',
        items: {
          invoicing: {
            title: 'Smart Invoicing',
            description: 'Create professional invoices in 60 seconds with our AI',
          },
          clients: {
            title: 'Client Management',
            description: 'Client database with complete history and analytics',
          },
          analytics: {
            title: 'Advanced Analytics',
            description: 'Real-time dashboards with AI predictions',
          },
          export: {
            title: 'Multi-format Export',
            description: 'PDF, Excel, CSV with customizable templates',
          },
          automation: {
            title: 'Automation',
            description: 'Automatic reminders and smart notifications',
          },
          payments: {
            title: 'Fast Payments',
            description: 'Integration with all payment methods',
          },
        },
      },
      finalCta: {
        title: 'Ready to transform your invoicing?',
        subtitle: 'Join us for free and start invoicing in minutes',
        button: 'Start Now →',
      },
      footer: {
        description: 'The most modern and intuitive invoicing solution on the market.',
        product: 'Product',
        features: 'Features',
        pricing: 'Pricing',
        demo: 'Demo',
        support: 'Support',
        documentation: 'Documentation',
        contact: 'Contact',
        faq: 'FAQ',
        company: 'Company',
        about: 'About',
        blog: 'Blog',
        careers: 'Careers',
        legal: 'Legal',
        privacy: 'Privacy',
        terms: 'Terms',
        mentions: 'Legal Notice',
        copyright: '© 2026 Facture.net - All rights reserved',
      },
    },

    // Auth
    auth: {
      login: {
        title: 'Facture.net',
        subtitle: 'Sign in to access your account',
        email: 'Email',
        password: 'Password',
        submit: 'Sign In',
        loading: 'Signing in...',
        error: 'Invalid email or password',
        testAccounts: 'Test Accounts',
        admin: 'Admin',
        user: 'User',
        backHome: '← Back to Home',
        noAccount: 'Don\'t have an account?',
        registerLink: 'Create an account',
      },
      register: {
        title: 'Create Account',
        subtitle: 'Join thousands of satisfied entrepreneurs',
        steps: {
          personal: 'Personal Information',
          company: 'Company Information',
          confirmation: 'Confirmation',
        },
        fields: {
          fullName: 'Full Name',
          email: 'Email',
          password: 'Password',
          confirmPassword: 'Confirm Password',
          company: 'Company Name',
          phone: 'Phone',
        },
        summary: {
          title: 'Summary',
          name: 'Name',
          email: 'Email',
          company: 'Company',
          notProvided: 'Not provided',
        },
        buttons: {
          back: 'Back',
          next: 'Next',
          create: 'Create Account',
          creating: 'Creating...',
        },
        errors: {
          fillAll: 'Please fill in all fields',
          passwordMismatch: 'Passwords do not match',
        },
        hasAccount: 'Already have an account?',
        loginLink: 'Sign In',
        backHome: '← Back to Home',
      },
    },

    // Dashboard
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of your activity',
      date: 'Sunday, March 15, 2026',
      newInvoice: 'New Invoice',
      stats: {
        totalRevenue: 'Total Revenue',
        outstanding: 'Outstanding',
        invoicesSent: 'Invoices Sent',
        activeClients: 'Active Clients',
      },
      recentInvoices: {
        title: 'Recent Invoices',
        viewAll: 'View all',
      },
      quickActions: {
        title: 'Quick Actions',
        createInvoice: 'Create Invoice',
        addClient: 'Add Client',
        viewReports: 'View Reports',
      },
      paymentStatus: {
        title: 'Payment Status',
        paid: 'Paid',
        pending: 'Pending',
        overdue: 'Overdue',
      },
    },

    // Invoices
    invoices: {
      title: 'Invoice Management',
      count: 'invoices',
      newInvoice: 'New Invoice',
      searchPlaceholder: 'Search invoices...',
      table: {
        number: 'Number',
        date: 'Date',
        client: 'Client',
        totalTTC: 'Total',
        status: 'Status',
        actions: 'Actions',
      },
      status: {
        paid: 'Paid',
        pending: 'Pending',
        overdue: 'Overdue',
        draft: 'Draft',
      },
      actions: {
        view: 'View',
        edit: 'Edit',
        download: 'Download',
      },
    },

    // Invoice Form
    invoiceForm: {
      title: {
        new: 'New Invoice',
        edit: 'Edit Invoice',
      },
      status: {
        draft: 'Draft',
        notSaved: 'Not saved',
      },
      buttons: {
        back: '← Back',
        saveDraft: 'Save Draft',
        sendInvoice: 'Send Invoice',
      },
      sections: {
        from: 'FROM',
        billTo: 'BILL TO',
        description: 'DESCRIPTION',
      },
      fields: {
        yourName: 'Your Name / Company',
        email: 'Email address',
        address: 'Address',
        selectClient: 'Select client...',
        clientEmail: 'Client email',
        billingAddress: 'Billing address',
        invoiceNumber: 'Invoice Number',
        issueDate: 'Issue Date',
        dueDate: 'Due Date',
        description: 'Service or product description',
        quantity: 'QTY',
        rate: 'RATE (€)',
        total: 'TOTAL',
      },
      addLineItem: 'Add line item',
      totals: {
        subtotal: 'Subtotal',
        tax: 'Tax (20%)',
        total: 'Total',
      },
    },

    // Clients
    clients: {
      title: 'Clients',
      count: 'clients',
      addClient: 'Add Client',
      searchPlaceholder: 'Search clients...',
      status: {
        active: 'Active',
        inactive: 'Inactive',
      },
      stats: {
        totalInvoiced: 'Total Invoiced',
        invoices: 'Invoices',
      },
      invoice: 'Invoice',
      dialog: {
        add: 'Add New Client',
        edit: 'Edit Client',
        fields: {
          name: 'Client Name',
          email: 'Email',
          phone: 'Phone',
          address: 'Address',
        },
        buttons: {
          cancel: 'Cancel',
          save: 'Save Changes',
          add: 'Add Client',
        },
      },
    },

    // Articles
    articles: {
      title: 'Article Management',
      newArticle: 'New Article',
      table: {
        designation: 'Designation',
        unitPrice: 'Unit Price',
        category: 'Category',
        actions: 'Actions',
      },
      dialog: {
        add: 'New Article',
        edit: 'Edit Article',
        fields: {
          designation: 'Designation',
          unitPrice: 'Unit Price',
          category: 'Category',
        },
        buttons: {
          cancel: 'Cancel',
          save: 'Save',
          create: 'Create',
        },
      },
      deleteConfirm: 'Are you sure you want to delete this article?',
    },

    // Categories
    categories: {
      title: 'Category Management',
      newCategory: 'New Category',
      deleteConfirm: 'Are you sure you want to delete this category?',
    },

    // Common
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      actions: 'Actions',
      yes: 'Yes',
      no: 'No',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      confirm: 'Confirm',
    },

    // Menu
    menu: {
      dashboard: 'Dashboard',
      invoices: 'Invoices',
      clients: 'Clients',
      articles: 'Articles',
      categories: 'Categories',
      settings: 'Settings',
      logout: 'Logout',
      admin: 'Administrator',
      user: 'User',
    },
  },
};
