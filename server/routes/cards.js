import { Router } from 'express';
import mongoose from 'mongoose';
import Card from '../models/Card.js';
import Deck from '../models/Deck.js';
import auth from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { pagination, pageResult } from '../utils/pagination.js';
import { applyReview } from '../utils/review.js';

const router = Router();
router.use(auth);

router.post('/', asyncHandler(async (req, res) => {
  const { deckId, front, back } = req.body;
  if (!deckId || !mongoose.isValidObjectId(deckId)) return res.status(400).json({ message: 'Choose a valid deck' });
  if (!front?.trim() || !back?.trim()) return res.status(400).json({ message: 'Front and back are required' });
  const deck = await Deck.findOne({ _id: deckId, user: req.user._id });
  if (!deck) return res.status(404).json({ message: 'Deck not found' });
  const card = await Card.create({ user: req.user._id, deck: deck._id, front: front.trim(), back: back.trim(), box: 1, dueDate: new Date() });
  res.status(201).json({ card });
}));

router.get('/due', asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const dueToday = new Date();
  dueToday.setHours(23, 59, 59, 999);
  const filter = { user: req.user._id, dueDate: { $lte: dueToday } };
  const [data, total] = await Promise.all([Card.find(filter).populate('deck', 'title').sort({ dueDate: 1 }).skip(skip).limit(limit), Card.countDocuments(filter)]);
  res.json(pageResult(data, page, limit, total));
}));

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { user: req.user._id };
  if (req.query.deckId && mongoose.isValidObjectId(req.query.deckId)) filter.deck = req.query.deckId;
  const [data, total] = await Promise.all([Card.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit), Card.countDocuments(filter)]);
  res.json(pageResult(data, page, limit, total));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Card not found' });
  const card = await Card.findOne({ _id: req.params.id, user: req.user._id });
  if (!card) return res.status(404).json({ message: 'Card not found' });
  res.json({ card });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Card not found' });
  const card = await Card.findOne({ _id: req.params.id, user: req.user._id });
  if (!card) return res.status(404).json({ message: 'Card not found' });
  for (const key of ['front', 'back']) {
    if (req.body[key] !== undefined) {
      if (!req.body[key].trim()) return res.status(400).json({ message: `${key === 'front' ? 'Front' : 'Back'} is required` });
      card[key] = req.body[key].trim();
    }
  }
  if (req.body.deckId !== undefined) {
    if (!mongoose.isValidObjectId(req.body.deckId)) return res.status(400).json({ message: 'Choose a valid deck' });
    const deck = await Deck.findOne({ _id: req.body.deckId, user: req.user._id });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });
    card.deck = deck._id;
  }
  await card.save();
  res.json({ card });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Card not found' });
  const card = await Card.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!card) return res.status(404).json({ message: 'Card not found' });
  res.json({ message: 'Card deleted' });
}));

router.post('/:id/review', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Card not found' });
  const card = await Card.findOne({ _id: req.params.id, user: req.user._id });
  if (!card) return res.status(404).json({ message: 'Card not found' });
  const { result } = req.body;
  if (result !== 'easy' && result !== 'hard') return res.status(400).json({ message: 'result must be "easy" or "hard"' });
  applyReview(card, result);
  await card.save();
  res.json({ card });
}));

export default router;
