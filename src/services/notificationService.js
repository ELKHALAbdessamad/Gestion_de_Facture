// Service de notifications toast
// Utilise react-toastify pour les alertes workflow (création, validation, rejet)
import { toast } from 'react-toastify';

const defaultOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const notify = {
  // Succès
  success: (message) => toast.success(message, defaultOptions),

  // Erreur
  error: (message) => toast.error(message, { ...defaultOptions, autoClose: 6000 }),

  // Info
  info: (message) => toast.info(message, defaultOptions),

  // Warning
  warning: (message) => toast.warning(message, defaultOptions),

  // --- Notifications métier ---

  factureCreee: (numero) =>
    toast.success(`✅ Facture ${numero} créée avec succès`, defaultOptions),

  factureSoumise: (numero) =>
    toast.info(`📤 Facture ${numero} soumise — en attente de validation admin`, defaultOptions),

  factureValidee: (numero) =>
    toast.success(`✔️ Facture ${numero} validée par l'administrateur`, defaultOptions),

  factureRejetee: (numero) =>
    toast.error(`❌ Facture ${numero} rejetée`, { ...defaultOptions, autoClose: 6000 }),

  facturePayee: (numero) =>
    toast.success(`💰 Facture ${numero} marquée comme payée`, defaultOptions),

  factureModifiee: (numero) =>
    toast.success(`✏️ Facture ${numero} modifiée avec succès`, defaultOptions),

  factureSupprimee: (numero) =>
    toast.warning(`🗑️ Facture ${numero} supprimée`, defaultOptions),

  clientCree: (nom) =>
    toast.success(`👤 Client "${nom}" ajouté avec succès`, defaultOptions),

  clientModifie: (nom) =>
    toast.success(`✏️ Client "${nom}" mis à jour`, defaultOptions),

  clientSupprime: (nom) =>
    toast.warning(`🗑️ Client "${nom}" supprimé`, defaultOptions),

  pdfGenere: (numero) =>
    toast.success(`📄 PDF de la facture ${numero} téléchargé`, defaultOptions),

  excelExporte: () =>
    toast.success(`📊 Export Excel téléchargé avec succès`, defaultOptions),

  parametresSauvegardes: () =>
    toast.success(`⚙️ Paramètres enregistrés avec succès`, defaultOptions),

  articleCree: (nom) =>
    toast.success(`📦 Article "${nom}" ajouté`, defaultOptions),

  articleSupprime: (nom) =>
    toast.warning(`🗑️ Article "${nom}" supprimé`, defaultOptions),

  categorieCree: (nom) =>
    toast.success(`🏷️ Catégorie "${nom}" ajoutée`, defaultOptions),

  echeaniceProche: (numero, jours) =>
    toast.warning(`⚠️ Facture ${numero} : échéance dans ${jours} jour(s)`, {
      ...defaultOptions,
      autoClose: 8000,
    }),

  emailEnvoye: (email) =>
    toast.success(`📧 Email envoyé automatiquement à ${email}`, defaultOptions),
  
  emailMailto: (email) =>
    toast.info(`📧 Client mail ouvert pour ${email} — Cliquez sur Envoyer dans votre client`, { ...defaultOptions, autoClose: 6000 }),
};
