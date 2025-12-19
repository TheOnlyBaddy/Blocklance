// Auth routes
import { Router } from 'express';
import { body, query, oneOf } from 'express-validator';
import { firebaseLogin, metamaskNonce, metamaskVerify, logout, signup } from './auth.controller.js';

const router = Router();

// POST /api/auth/firebase-login
router.post('/firebase-login', firebaseLogin);

// POST /api/auth/signup
router.post(
  '/signup',
  [
    body('email').isString().trim().notEmpty(),
    body('role').isString().trim().isIn(['client', 'freelancer', 'admin']),
  ],
  (req, res, next) => {
    const errors = [];
    if (!req.body?.email) errors.push({ msg: 'Email required', param: 'email' });
    if (!req.body?.role) errors.push({ msg: 'Role required', param: 'role' });
    if (errors.length) return res.status(400).json({ message: 'Invalid input', errors });
    return signup(req, res, next);
  }
);

// POST /api/auth/metamask/nonce
router.post(
  '/metamask/nonce',
  oneOf([
    body('walletAddress').isString().trim().notEmpty(),
    query('walletAddress').isString().trim().notEmpty(),
    query('address').isString().trim().notEmpty(),
  ]),
  metamaskNonce
);

// GET /api/auth/metamask/nonce?address=0x... (convenience for frontend)
router.get(
  '/metamask/nonce',
  [
    // accept either ?walletAddress or ?address
    query('walletAddress').optional().isString().trim().notEmpty(),
    query('address').optional().isString().trim().notEmpty(),
  ],
  metamaskNonce
);

// GET /api/auth/metamask/nonce/:address (path param support)
router.get(
  '/metamask/nonce/:address',
  query('address').optional(),
  (req, res, next) => {
    // Normalize path param into query.address for the controller
    if (!req.query.address && req.params.address) {
      req.query.address = req.params.address;
    }
    return metamaskNonce(req, res, next);
  }
);

// POST /api/auth/metamask/verify
router.post(
  '/metamask/verify',
  oneOf([
    [body('walletAddress').isString().trim().notEmpty(), body('signature').isString().trim().notEmpty()],
    [query('walletAddress').isString().trim().notEmpty(), query('signature').isString().trim().notEmpty()],
  ]),
  metamaskVerify
);

// POST /api/auth/logout
router.post('/logout', logout);

export default router;


