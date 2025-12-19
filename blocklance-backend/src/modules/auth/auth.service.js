// Auth service: Firebase and MetaMask flows
import crypto from 'crypto';
import { verifyMessage } from 'ethers';
import { Nonce } from '../blockchain/nonce.model.js';
import { upsertFromFirebase, upsertFromMetamask } from '../users/user.service.js';
import { signToken } from '../../utils/jwt.js';
import admin from '../../config/firebaseAdmin.js';

export async function verifyFirebaseIdTokenAndUpsert(idToken) {
  const decoded = await admin.auth().verifyIdToken(idToken);
  const email = decoded.email || null;
  const displayName = decoded.name || null;
  const user = await upsertFromFirebase(decoded.uid, email, displayName);
  return { user, decoded };
}

export async function createNonceForWallet(walletAddress) {
  const normalized = walletAddress.toLowerCase();
  const nonce = `login-${crypto.randomBytes(8).toString('hex')}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const doc = await Nonce.findOneAndUpdate(
    { walletAddress: normalized, used: false },
    { walletAddress: normalized, nonce, expiresAt, used: false },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return { walletAddress: normalized, nonce: doc.nonce };
}

export async function verifyWalletSignatureAndLogin(walletAddress, signature) {
  const normalized = walletAddress.toLowerCase();
  const nonceDoc = await Nonce.findOne({ walletAddress: normalized, used: false }).sort({ createdAt: -1 });
  if (!nonceDoc) {
    const err = new Error('Nonce not found or already used');
    err.status = 400;
    throw err;
  }
  if (nonceDoc.expiresAt.getTime() < Date.now()) {
    const err = new Error('Nonce expired');
    err.status = 400;
    throw err;
  }

  // The message to sign is the nonce string; production may include domain and purpose
  const recovered = verifyMessage(nonceDoc.nonce, signature).toLowerCase();
  if (recovered !== normalized) {
    const err = new Error('Signature does not match wallet address');
    err.status = 401;
    throw err;
  }

  // Mark nonce used (single-use)
  nonceDoc.used = true;
  await nonceDoc.save();

  const user = await upsertFromMetamask(normalized);
  const token = signToken({ userId: user._id.toString(), walletAddress: normalized });
  return { token, user };
}


