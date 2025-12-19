// JWT utilities: sign and verify backend tokens for MetaMask sessions
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

export function signToken(payload) {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, secret);
}



