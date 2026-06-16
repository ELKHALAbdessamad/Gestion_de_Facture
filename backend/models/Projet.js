import mongoose from 'mongoose';

const projetSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  statut: {
    type: String,
    enum: ['En cours', 'Terminé', 'En pause', 'Annulé'],
    default: 'En cours'
  },
  date_debut: {
    type: Date,
    default: Date.now
  },
  date_fin_prevue: Date,
  date_fin_reelle: Date,
  budget: {
    type: Number,
    default: 0
  },
  devise: {
    type: String,
    default: 'MAD'
  },
  priorite: {
    type: String,
    enum: ['Faible', 'Normale', 'Haute', 'Urgente'],
    default: 'Normale'
  },
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Index
projetSchema.index({ user_id: 1 });
projetSchema.index({ client_id: 1 });
projetSchema.index({ statut: 1 });

export default mongoose.model('Projet', projetSchema);
