import Dispute from './dispute.model.js';
import Project from '../projects/project.model.js';
import Notification from '../notifications/notification.model.js';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload.js';

export const raiseDispute = async (req, res) => {
  try {
    const { projectId, reason, description, againstUser } = req.body || {};
    const raisedBy = req.user.id || req.user.userId;

    if (!projectId || !reason) {
      return res.status(400).json({ message: 'Project ID and reason are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    let attachments = [];
    if (Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, 'blocklance/disputes');
        attachments.push(url);
      }
    }

    const dispute = await Dispute.create({
      projectId,
      raisedBy,
      againstUser,
      reason,
      description,
      attachments,
    });

    if (againstUser) {
      await Notification.create({
        receiver: againstUser,
        type: 'project_update',
        message: `A dispute has been raised for project "${project.title || project._id}"`,
        projectId,
        relatedUser: raisedBy,
      });
    }

    return res.status(201).json({ message: 'Dispute raised successfully', dispute });
  } catch (err) {
    console.error('Raise dispute error:', err);
    res.status(500).json({ message: 'Error creating dispute' });
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNote, status } = req.body || {};
    const user = req.user;

    const dispute = await Dispute.findById(id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });

    const project = await Project.findById(dispute.projectId);
    const isAdmin = user.role === 'admin';
    const isClient = project && project.clientId?.toString() === (user.id || user.userId);
    const isFreelancer = project && project.assignedFreelancer?.toString() === (user.id || user.userId);
    const isRaiser = dispute.raisedBy.toString() === (user.id || user.userId);

    if (!(isAdmin || isClient || isFreelancer || isRaiser)) {
      return res.status(403).json({ message: 'Unauthorized to resolve this dispute' });
    }

    dispute.status = status || 'resolved';
    dispute.resolutionNote = resolutionNote || 'Resolved';
    dispute.resolvedAt = new Date();
    await dispute.save();

    // Notify both parties
    await Notification.create({
      receiver: dispute.raisedBy,
      type: 'project_update',
      message: `Your dispute on project has been marked as ${dispute.status}`,
      projectId: dispute.projectId,
    });

    if (dispute.againstUser) {
      await Notification.create({
        receiver: dispute.againstUser,
        type: 'project_update',
        message: `A dispute involving you was marked as ${dispute.status}`,
        projectId: dispute.projectId,
      });
    }

    return res.status(200).json({ message: 'Dispute resolved successfully', dispute });
  } catch (err) {
    console.error('Resolve dispute error:', err);
    res.status(500).json({ message: 'Error resolving dispute' });
  }
};

export const getProjectDisputes = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Validate projectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID format' });
    }
    
    // Verify project exists (optional but recommended)
    const project = await Project.findById(projectId).select('_id');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const disputes = await Dispute.find({ projectId })
      .populate('raisedBy', 'username email role')
      .populate('againstUser', 'username email role')
      .sort({ createdAt: -1 });
      
    return res.status(200).json({ disputes });
  } catch (err) {
    console.error('Get disputes error:', err);
    res.status(500).json({ message: 'Error fetching disputes' });
  }
};

