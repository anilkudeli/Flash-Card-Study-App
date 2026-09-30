import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import deckRoutes from './routes/decks.js';
import cardRoutes from './routes/cards.js';
import { notFound, errorHandler } from './middleware/errors.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/cards', cardRoutes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required. Set it in server/.env before starting the API.');
  process.exit(1);
}
try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/flashcards');
  app.listen(port, () => console.log(`Flashcards API listening on http://localhost:${port}`));
} catch (error) {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1);
}
