// Auth controllers for Firebase and MetaMask flows
import { validationResult } from 'express-validator';
import { createNonceForWallet, verifyWalletSignatureAndLogin } from './auth.service.js';
import admin from '../../config/firebaseAdmin.js';
import { upsertFromFirebase } from '../users/user.service.js';
import { signToken } from '../../utils/jwt.js';
import { User } from '../users/user.model.js';

/**
 * Maps Firebase sign_in_provider values to our User model enum values
 * Firebase providers: google.com, password, facebook.com, etc.
 * Our enum: firebase_email, firebase_google, metamask
 */
function mapFirebaseProviderToEnum(firebaseProvider) {
  const providerMap = {
    'google.com': 'firebase_google',
    'password': 'firebase_email',
    'facebook.com': 'firebase_email', // Can add more specific mappings if needed
    'twitter.com': 'firebase_email',
    'github.com': 'firebase_email',
    'apple.com': 'firebase_email',
  };
  return providerMap[firebaseProvider] || 'firebase_email';
}

export async function signup(req, res) {
  try {
    const { email, username, role, password, firebaseUID } = req.body || {};
    if (!email) return res.status(400).json({ message: 'Email required' });
    if (!role) return res.status(400).json({ message: 'Role required' });

    let existing = null;
    if (email) existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const user = new User({
      email,
      username,
      role: role || 'client',
      firebaseUID: firebaseUID || undefined,
      // authProvider intentionally omitted if unknown to avoid enum mismatch
      // password is currently not stored in schema; ignored here
    });
    await user.save();

    const token = signToken({ userId: user._id.toString(), role: user.role });
    return res.status(201).json({
      message: 'Signup successful',
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error('❌ Signup error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function firebaseLogin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ Missing or invalid Firebase token header');
      return res.status(400).json({ message: 'Missing or invalid Firebase token header' });
    }
    const idToken = authHeader.split(' ')[1];
    console.log('🪙 Received Firebase token:', idToken.slice(0, 20), '...');

    const decoded = await admin.auth().verifyIdToken(idToken);
    console.log('✅ Firebase token decoded:', {
      uid: decoded.uid,
      email: decoded.email,
      projectId: decoded.aud,
      issuer: decoded.iss,
      signInProvider: decoded.firebase?.sign_in_provider,
    });

    const { uid, email, name } = decoded;
    const firebaseProvider = decoded.firebase?.sign_in_provider;
    const mappedProvider = mapFirebaseProviderToEnum(firebaseProvider);

    // Upsert by firebaseUID or email to avoid duplicate email constraint
    let user = await upsertFromFirebase(uid, email, name);

    // First-time login detection: createdAt === updatedAt is a good signal for a fresh upsert
    const isNewUser = user?.createdAt && user?.updatedAt && user.createdAt.getTime() === user.updatedAt.getTime();
    const requestedRole = req.body?.role;

    console.log('📩 Role received from frontend:', requestedRole, 'isNewUser:', isNewUser);

    // If this is the first login and a valid role is provided, set it
    if (
      isNewUser &&
      typeof requestedRole === 'string' &&
      ['client', 'freelancer', 'admin'].includes(requestedRole)
    ) {
      user.role = requestedRole;
      await user.save();
    }

    // Ensure provider is up to date
    if (mappedProvider && user.authProvider !== mappedProvider) {
      user.authProvider = mappedProvider;
      await user.save();
    }

    const token = signToken({ userId: user._id.toString(), firebaseUID: uid, role: user.role });

    console.log('🔐 Login successful:', { uid, email, provider: mappedProvider, role: user.role });
    return res.status(200).json({
      message: 'Authenticated via Firebase',
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        firebaseUID: user.firebaseUID,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error('❌ Firebase token verification failed:', err.message);
    console.error('Error details:', {
      code: err.code,
      message: err.message,
    });
    return res.status(401).json({ message: 'Invalid Firebase token' });
  }
}

export async function metamaskNonce(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: { message: 'Invalid input', details: errors.array() } });
    const walletAddress =
      req.body?.walletAddress || req.query?.walletAddress || req.query?.address;
    if (!walletAddress) return res.status(400).json({ error: { message: 'walletAddress is required' } });
    const result = await createNonceForWallet(walletAddress);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

export async function metamaskVerify(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: { message: 'Invalid input', details: errors.array() } });
    const walletAddress = req.body?.walletAddress || req.query?.walletAddress || req.query?.address;
    const signature = req.body?.signature || req.query?.signature;
    if (!walletAddress || !signature) return res.status(400).json({ error: { message: 'walletAddress and signature are required' } });
    const { token, user } = await verifyWalletSignatureAndLogin(walletAddress, signature);
    return res.status(200).json({ token, user });
  } catch (err) {
    return next(err);
  }
}

export async function logout(_req, res) {
  // Placeholder: with refresh tokens, we could blacklist or rotate
  return res.status(200).json({ message: 'Logged out (placeholder)' });
}


