import Project from './project.model.js';
import mongoose from 'mongoose';
import { User } from '../users/user.model.js';

export const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      budget,
      deadline,
      category,
      skills,
      // gig-style fields
      price,
      image,
      images,
      imageUrls,
    } = req.body || {};

    // Basic validation
    if (!title || !description) {
      return res.status(400).json({ message: 'Missing required fields: title, description' });
    }

    // Accept either budget or price
    const rawBudget = budget ?? price;
    const parsedBudget = typeof rawBudget === 'string' ? Number(rawBudget) : rawBudget;
    if (parsedBudget == null || Number.isNaN(parsedBudget)) {
      return res.status(400).json({ message: 'Missing or invalid budget/price' });
    }

    // Normalize image urls array
    const normalizedImages = Array.isArray(imageUrls)
      ? imageUrls
      : Array.isArray(images)
        ? images
        : image
          ? [image]
          : [];

    // Resolve clientId as a valid Mongo ObjectId
    let clientId = req.user?.userId || req.user?.id;
    const isValidObjectId = (v) => typeof v === 'string' && mongoose.Types.ObjectId.isValid(v);
    if (!isValidObjectId(clientId)) {
      // Try to find the user document by firebaseUID or email
      const firebaseUID = req.user?.firebaseUID;
      const email = req.user?.email;
      const found = await User.findOne({
        $or: [
          ...(firebaseUID ? [{ firebaseUID }] : []),
          ...(email ? [{ email }] : []),
        ],
      }).select('_id');
      if (!found) {
        return res.status(400).json({ message: 'User not found for authenticated principal' });
      }
      clientId = found._id.toString();
    }

    const project = await Project.create({
      clientId,
      title,
      description,
      budget: parsedBudget,
      deadline,
      category,
      skills,
      imageUrls: normalizedImages,
    });

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getClientProjects = async (req, res) => {
  try {
    const projects = await Project.find({ clientId: req.user.userId }).populate('bids');
    res.status(200).json({ projects });
  } catch (err) {
    console.error('Get client projects error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllAvailableProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: 'open' }).populate('clientId', 'username email');
    res.status(200).json({ projects });
  } catch (err) {
    console.error('Get available projects error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.clientId.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Unauthorized' });

    project.status = status;
    await project.save();

    res.status(200).json({ message: 'Project updated', project });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
