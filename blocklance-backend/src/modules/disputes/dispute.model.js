import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  againstUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['open', 'under_review', 'resolved', 'rejected'], default: 'open' },
  resolutionNote: { type: String },
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
});

export default mongoose.model('Dispute', disputeSchema);
