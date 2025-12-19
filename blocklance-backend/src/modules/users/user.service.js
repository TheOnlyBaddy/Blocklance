// User service: upsert helpers for Firebase and MetaMask
import { User } from './user.model.js';

export async function upsertFromFirebase(firebaseUID, email, displayName) {
  const provider = email && email.endsWith('@gmail.com') ? 'firebase_google' : 'firebase_email';
  const update = {
    firebaseUID,
    email: email || undefined,
    authProvider: provider,
    username: displayName || undefined,
  };
  const user = await User.findOneAndUpdate(
    { $or: [{ firebaseUID }, ...(email ? [{ email }] : [])] },
    { $setOnInsert: { createdAt: new Date() }, $set: update },
    { new: true, upsert: true }
  );
  return user;
}

export async function upsertFromMetamask(walletAddress) {
  const normalized = walletAddress.toLowerCase();
  const user = await User.findOneAndUpdate(
    { walletAddress: normalized },
    { $setOnInsert: { createdAt: new Date() }, $set: { walletAddress: normalized, authProvider: 'metamask' } },
    { new: true, upsert: true }
  );
  return user;
}



