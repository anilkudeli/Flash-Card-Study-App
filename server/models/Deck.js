import mongoose from 'mongoose';

const deckSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500, default: '' }
}, { timestamps: true });

deckSchema.index({ user: 1, updatedAt: -1 });
export default mongoose.model('Deck', deckSchema);
