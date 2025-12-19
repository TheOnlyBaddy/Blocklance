// Middleware that accepts either Firebase ID token or backend JWT
import { authFirebase } from './authFirebase.js';
import { authJWT } from './authJWT.js';

export async function authAny(req, res, next) {
  // Try Firebase first
  try {
    await new Promise((resolve, reject) => {
      authFirebase(req, res, (err) => (err ? reject(err) : resolve()));
    });
    return next();
  } catch (_e) {
    // fallthrough to JWT
  }

  try {
    await new Promise((resolve, reject) => {
      authJWT(req, res, (err) => (err ? reject(err) : resolve()));
    });
    return next();
  } catch (_e2) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }
}
