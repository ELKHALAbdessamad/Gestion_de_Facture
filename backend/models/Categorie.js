import mongoose from 'mongoose';

const categorieSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  tva: {
    type: Number,
    required: true,
    default: 20
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

categorieSchema.index({ user_id: 1 });

export default mongoose.model('Categorie', categorieSchema);
