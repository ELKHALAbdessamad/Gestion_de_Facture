import mongoose from 'mongoose';

const entrepriseSchema = new mongoose.Schema({
  nom: String,
  siret: String,
  adresse: String,
  ville: String,
  code_postal: String,
  pays: String,
  tel: String,
  email: String,
  logo: String,
  identifiant_fiscal: String,
  ice: String,
  rc: String,
  patente: String,
  cnss: String
}, { _id: false });

const parametresSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  devise: {
    type: String,
    default: 'MAD'
  },
  entreprise_active: {
    type: Number,
    default: 0
  },
  entreprises: [entrepriseSchema],
  entreprise: { type: entrepriseSchema, default: undefined }
}, {
  timestamps: true
});

export default mongoose.model('Parametres', parametresSchema);
