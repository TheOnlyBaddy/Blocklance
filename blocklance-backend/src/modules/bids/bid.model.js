import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    // Keep proposal for backward compatibility; prefer message going forward
    proposal: { type: String },
    message: { type: String },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.model('Bid', bidSchema);
