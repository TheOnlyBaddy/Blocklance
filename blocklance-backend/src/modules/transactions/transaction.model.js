import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  txHash: { type: String, default: null, index: true },
  status: { type: String, enum: ['pending', 'funded', 'released', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  dealId: { type: Number },
  releasedAt: { type: Date },
});

export default mongoose.model('Transaction', transactionSchema);
