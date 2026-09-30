export function notFound(req, res) {
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists' });
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ message: error.message || 'Server error' });
}
