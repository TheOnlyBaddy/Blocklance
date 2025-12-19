// Nonce model for MetaMask signature verification (single-use + TTL)
import mongoose from 'mongoose';

const NonceSchema = new mongoose.Schema(
  {
    walletAddress: { type: String, index: true },
    nonce: { type: String, required: true },
    used: { type: Boolean, default: false, index: true },
    // TTL field: expires after 10 minutes by default (index declared below)
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

NonceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Nonce = mongoose.model('Nonce', NonceSchema);


