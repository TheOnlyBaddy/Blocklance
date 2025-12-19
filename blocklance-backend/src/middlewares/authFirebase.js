// Middleware to verify Firebase ID token and attach user context
import admin from '../config/firebaseAdmin.js';
import { User } from '../modules/users/user.model.js';

export async function authFirebase(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : (req.body && req.body.idToken) || null;

    if (!token) {
      return res.status(401).json({ error: { message: 'Missing Firebase ID token' } });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    let dbUser = null;
    try {
      dbUser = await User.findOne({ $or: [{ firebaseUID: decoded.uid }, { email: decoded.email }] }).select('role email');
    } catch (_e) {}

    req.user = {
      // Standardized shape
      id: dbUser?._id?.toString() || decoded.uid,
      email: (dbUser?.email || decoded.email) || null,
      role: dbUser?.role || 'client',
      authType: 'firebase',
      // Backward-compat fields
      userId: dbUser?._id?.toString() || decoded.uid,
      firebaseUID: decoded.uid,
    };
    return next();
  } catch (err) {
    err.status = 401;
    err.message = 'Invalid Firebase token';
    return next(err);
  }
}



