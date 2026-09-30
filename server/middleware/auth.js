import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('_id name email');
    if (!user) return res.status(401).json({ message: 'Invalid authentication token' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired authentication token' });
  }
}
