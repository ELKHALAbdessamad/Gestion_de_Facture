import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  designation: {
    type: String,
    required: true
  },
  prix_unitaire: {
    type: Number,
    required: true
  },
  categorie_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categorie',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

articleSchema.index({ user_id: 1 });
articleSchema.index({ categorie_id: 1 });

export default mongoose.model('Article', articleSchema);
