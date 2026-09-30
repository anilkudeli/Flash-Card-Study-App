import { Router } from 'express';
import mongoose from 'mongoose';
import Deck from '../models/Deck.js';
import Card from '../models/Card.js';
import auth from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { pagination, pageResult } from '../utils/pagination.js';
import { stageFor } from '../utils/review.js';

const router = Router();
router.use(auth);

async function deckSummary(deck, userId) {
  const cards = await Card.find({ deck: deck._id, user: userId }).select('dueDate box reviewCount');
  const now = new Date();
  const mastered = cards.filter((card) => card.box === 5).length;
  return {
    ...deck.toObject(), cardCount: cards.length,
    dueCount: cards.filter((card) => card.dueDate <= now).length,
    masteredCount: mastered,
    progress: cards.length ? Math.round((mastered / cards.length) * 100) : 0
  };
}

router.post('/', asyncHandler(async (req, res) => {
  const { title, description = '' } = req.body;
  if (!title?.trim()) return res.status(400).json({ message: 'Deck title is required' });
  const deck = await Deck.create({ user: req.user._id, title: title.trim(), description });
  res.status(201).json({ deck: { ...deck.toObject(), cardCount: 0, dueCount: 0, masteredCount: 0, progress: 0 } });
}));

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const [decks, total] = await Promise.all([
    Deck.find({ user: req.user._id }).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Deck.countDocuments({ user: req.user._id })
  ]);
  const data = await Promise.all(decks.map((deck) => deckSummary(deck, req.user._id)));
  res.json(pageResult(data, page, limit, total));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Deck not found' });
  const deck = await Deck.findOne({ _id: req.params.id, user: req.user._id });
  if (!deck) return res.status(404).json({ message: 'Deck not found' });
  res.json({ deck: await deckSummary(deck, req.user._id) });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Deck not found' });
  const changes = {};
  if (req.body.title !== undefined) {
    if (!req.body.title.trim()) return res.status(400).json({ message: 'Deck title is required' });
    changes.title = req.body.title.trim();
  }
  if (req.body.description !== undefined) changes.description = req.body.description;
  const deck = await Deck.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, changes, { new: true, runValidators: true });
  if (!deck) return res.status(404).json({ message: 'Deck not found' });
  res.json({ deck: await deckSummary(deck, req.user._id) });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Deck not found' });
  const deck = await Deck.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!deck) return res.status(404).json({ message: 'Deck not found' });
  await Card.deleteMany({ deck: deck._id, user: req.user._id });
  res.json({ message: 'Deck deleted' });
}));

router.get('/:id/progress', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Deck not found' });
  const deck = await Deck.findOne({ _id: req.params.id, user: req.user._id });
  if (!deck) return res.status(404).json({ message: 'Deck not found' });
  const cards = await Card.find({ deck: deck._id, user: req.user._id }).select('box reviewCount dueDate');
  const progress = { total: cards.length, due: cards.filter((card) => card.dueDate <= new Date()).length, mastered: cards.filter((card) => stageFor(card) === 'mastered').length, learning: cards.filter((card) => stageFor(card) === 'learning').length, reviewing: cards.filter((card) => stageFor(card) === 'reviewing').length, new: cards.filter((card) => stageFor(card) === 'new').length };
  res.json({ progress });
}));

router.get('/:id/study', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Deck not found' });
  const deck = await Deck.findOne({ _id: req.params.id, user: req.user._id });
  if (!deck) return res.status(404).json({ message: 'Deck not found' });
  const cards = await Card.find({ deck: deck._id, user: req.user._id, dueDate: { $lte: new Date() } }).sort({ dueDate: 1, createdAt: 1 });
  res.json({ deck: { id: deck._id, title: deck.title }, cards });
}));

router.get('/summary/dashboard', asyncHandler(async (req, res) => {
  const now = new Date();
  const [decks, cards] = await Promise.all([
    Deck.find({ user: req.user._id }).sort({ updatedAt: -1 }).limit(5),
    Card.find({ user: req.user._id }).select('dueDate box reviewCount')
  ]);
  const mastered = cards.filter((card) => stageFor(card) === 'mastered').length;
  const dueToday = new Date(); dueToday.setHours(23, 59, 59, 999);
  res.json({ stats: { totalDecks: await Deck.countDocuments({ user: req.user._id }), totalCards: cards.length, dueToday: cards.filter((card) => card.dueDate <= dueToday).length, dueNow: cards.filter((card) => card.dueDate <= now).length, mastered, progress: cards.length ? Math.round(mastered / cards.length * 100) : 0 }, recentDecks: await Promise.all(decks.map((deck) => deckSummary(deck, req.user._id))) });
}));

export default router;
