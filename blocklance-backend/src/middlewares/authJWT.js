// Middleware to verify backend JWT for MetaMask-authenticated users
import { verifyToken } from '../utils/jwt.js';

export function authJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;

    if (!token) {
      return res.status(401).json({ error: { message: 'Missing Authorization token' } });
    }

    const payload = verifyToken(token);
    req.user = {
      // Standardized shape
      id: payload.userId || payload.id,
      email: payload.email || null,
      role: payload.role || 'client',
      authType: 'metamask',
      // Backward-compat fields
      userId: payload.userId || payload.id,
      walletAddress: payload.walletAddress || null,
    };
    return next();
  } catch (err) {
    err.status = 401;
    err.message = 'Invalid or expired token';
    return next(err);
  }
}



