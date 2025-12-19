import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    deadline: { type: Date },
    category: { type: String },
    skills: [String],
    status: { type: String, enum: ['open', 'in_progress', 'completed'], default: 'open' },
    assignedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    selectedBid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid', default: null },
    bids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bid' }],
    imageUrls: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
