import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { createHash, randomBytes } from 'node:crypto';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
const safeUser = (user) => ({ id: user._id, name: user.name, email: user.email });
const issueToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const resetTokenHash = (token) => createHash('sha256').update(token).digest('hex');

async function sendPasswordResetEmail(user, resetUrl) {
  if (!process.env.SMTP_HOST) return false;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: 'Reset your Flash Card Study App password',
    text: `Hello ${user.name},\n\nUse this link to reset your password. It expires in 30 minutes.\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`
  });
  return true;
}

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (confirmPassword !== undefined && password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });
  const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password: await bcrypt.hash(password, 12) });
  res.status(201).json({ token: issueToken(user), user: safeUser(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Incorrect email or password' });
  res.json({ token: issueToken(user), user: safeUser(user) });
}));

router.post('/forgot-password', asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const genericMessage = 'If an account exists for that email, password reset instructions will be sent.';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: genericMessage });

  const resetToken = randomBytes(32).toString('hex');
  user.passwordResetTokenHash = resetTokenHash(resetToken);
  user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const origin = process.env.CLIENT_ORIGIN || 'http://localhost:5174';
  const resetUrl = `${origin}/reset-password?token=${resetToken}`;
  try {
    const emailSent = await sendPasswordResetEmail(user, resetUrl);
    if (!emailSent && process.env.NODE_ENV !== 'production') return res.json({ message: genericMessage, resetUrl });
  } catch (error) {
    console.error('Password reset email could not be sent:', error.message);
    if (process.env.NODE_ENV !== 'production') return res.status(503).json({ message: 'Could not send reset email. Check SMTP settings and try again.' });
  }
  res.json({ message: genericMessage });
}));

router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Reset link and new password are required.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' });

  const user = await User.findOne({
    passwordResetTokenHash: resetTokenHash(token),
    passwordResetExpiresAt: { $gt: new Date() }
  }).select('+passwordResetTokenHash +passwordResetExpiresAt');
  if (!user) return res.status(400).json({ message: 'This reset link is invalid or has expired. Request a new one.' });

  user.password = await bcrypt.hash(password, 12);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();
  res.json({ message: 'Your password has been reset. You can now log in.' });
}));

router.get('/me', auth, (req, res) => res.json({ user: safeUser(req.user) }));
export default router;
