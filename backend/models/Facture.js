import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  designation: { type: String, required: true },
  quantite: { type: Number, required: true, default: 1 },
  prix_unitaire: { type: Number, required: true },
  remise: { type: Number, default: 0 },
  tva: { type: Number, default: 20 },
  categorie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie' }
}, { _id: false });

const factureSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    unique: true
  },
  date_creation: {
    type: Date,
    required: true,
    default: Date.now
  },
  date_echeance: Date,
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  articles: [articleSchema],
  statut: {
    type: String,
    enum: ['Draft', 'En attente', 'Payée', 'Rejetée'],
    default: 'Draft'
  },
  total_ht: { type: Number, required: true },
  remise_globale: { type: Number, default: 0 },
  remise_montant: { type: Number, default: 0 },
  total_apres_remise: { type: Number, required: true },
  tva: { type: Number, required: true },
  total_ttc: { type: Number, required: true },
  
  // Informations de paiement
  mode_paiement: String,
  date_depot: Date,
  date_encaissement: Date,
  type_virement: String,
  
  // Validation
  validated_by_admin: { type: Boolean, default: false },
  validated_by: String,
  validated_at: Date,
  
  notes: String,
  
  // Signature numérique
  signature: String,
  
  // Méthode de facturation (1=Simple HT+TVA, 2=Remise ligne, 3=Remise globale, 4=Par catégorie)
  methode_facturation: { type: Number, default: 1 },
  
  // Projet associé
  projet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Projet' },
  
  // Devise utilisée
  devise: { type: String, default: 'MAD' },
  
  // Archivage
  archived: { type: Boolean, default: false },
  archived_at: Date,
  archived_by: String
}, {
  timestamps: true
});

// Index pour recherche rapide
factureSchema.index({ numero: 1 });
factureSchema.index({ client_id: 1 });
factureSchema.index({ user_id: 1 });
factureSchema.index({ statut: 1 });
factureSchema.index({ date_creation: -1 });

export default mongoose.model('Facture', factureSchema);
