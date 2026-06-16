import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  tel: String,
  adresse: String,
  entreprise: String,
  siret: String,
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index pour recherche
clientSchema.index({ nom: 'text', email: 'text' });
clientSchema.index({ user_id: 1 });

export default mongoose.model('Client', clientSchema);
