import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  deck: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck', required: true, index: true },
  front: { type: String, required: true, trim: true, maxlength: 1000 },
  back: { type: String, required: true, trim: true, maxlength: 2000 },
  box: { type: Number, min: 1, max: 5, default: 1 },
  dueDate: { type: Date, default: Date.now, index: true },
  reviewCount: { type: Number, default: 0, min: 0 },
  easyCount: { type: Number, default: 0, min: 0 },
  hardCount: { type: Number, default: 0, min: 0 },
  lastReviewedAt: { type: Date, default: null }
}, { timestamps: true });

cardSchema.index({ user: 1, dueDate: 1 });
cardSchema.index({ deck: 1, dueDate: 1 });
export default mongoose.model('Card', cardSchema);
