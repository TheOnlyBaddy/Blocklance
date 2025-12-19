import Bid from './bid.model.js';
import Project from '../projects/project.model.js';

// POST /api/bids/ — Freelancer creates a bid
export const createBid = async (req, res) => {
  try {
    const { projectId, amount, message } = req.body || {};
    const freelancerId = req.user.id || req.user.userId;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.status !== 'open')
      return res.status(400).json({ message: 'Project is not open for bidding' });

    const existingBid = await Bid.findOne({ projectId, freelancerId });
    if (existingBid)
      return res.status(400).json({ message: 'You already placed a bid for this project' });

    const newBid = await Bid.create({ projectId, freelancerId, amount, message });

    project.bids.push(newBid._id);
    await project.save();

    return res.status(201).json({ message: 'Bid placed successfully', bid: newBid });
  } catch (err) {
    console.error('createBid error:', err);
    return res.status(500).json({ message: 'Error placing bid' });
  }
};

// GET /api/bids/:projectId — Client or Freelancer fetches bids for a project
export const getProjectBids = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const bids = await Bid.find({ projectId })
      .populate('freelancerId', 'username email skills profileImage')
      .sort({ createdAt: -1 });

    return res.status(200).json({ bids });
  } catch (err) {
    console.error('getProjectBids error:', err);
    return res.status(500).json({ message: 'Error fetching bids' });
  }
};

// POST /api/bids/:bidId/accept — Client accepts a freelancer bid
export const acceptBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    const project = await Project.findById(bid.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.clientId.toString() !== (req.user.id || req.user.userId)) {
      return res.status(403).json({ message: 'Unauthorized: You are not the project owner' });
    }

    // Update project and bids
    project.selectedBid = bid._id;
    project.assignedFreelancer = bid.freelancerId;
    project.status = 'in_progress';
    await project.save();

    await Bid.updateMany(
      { projectId: bid.projectId, _id: { $ne: bidId } },
      { $set: { status: 'rejected' } }
    );

    bid.status = 'accepted';
    await bid.save();

    return res.status(200).json({ message: 'Bid accepted successfully', bid, project });
  } catch (err) {
    console.error('acceptBid error:', err);
    return res.status(500).json({ message: 'Error accepting bid' });
  }
};
