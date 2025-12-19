import Review from './review.model.js';
import Project from '../projects/project.model.js';
import { User } from '../users/user.model.js';

// POST /api/reviews — create a review
export const createReview = async (req, res) => {
  try {
    const { projectId, revieweeId, rating, comment } = req.body || {};
    const reviewerId = req.user.id || req.user.userId;

    if (!projectId || !revieweeId || typeof rating === 'undefined') {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed projects' });
    }

    const existing = await Review.findOne({ projectId, reviewerId, revieweeId });
    if (existing) {
      return res.status(400).json({ message: 'You already reviewed this user for this project' });
    }

    const review = await Review.create({ projectId, reviewerId, revieweeId, rating, comment });

    const userReviews = await Review.find({ revieweeId });
    const avgRating = userReviews.length
      ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length
      : 0;

    await User.findByIdAndUpdate(revieweeId, { averageRating: avgRating });

    return res.status(201).json({ message: 'Review added successfully', review });
  } catch (err) {
    console.error('createReview error:', err);
    return res.status(500).json({ message: 'Error creating review' });
  }
};

// GET /api/reviews/user/:userId — get all reviews for a user
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ revieweeId: userId })
      .populate('reviewerId', 'username email role')
      .populate('projectId', 'title status')
      .sort({ createdAt: -1 });

    return res.json({ reviews });
  } catch (err) {
    console.error('getUserReviews error:', err);
    return res.status(500).json({ message: 'Error fetching user reviews' });
  }
};

// GET /api/reviews/project/:projectId — get all reviews for a project
export const getProjectReviews = async (req, res) => {
  try {
    const { projectId } = req.params;
    const reviews = await Review.find({ projectId })
      .populate('reviewerId', 'username email')
      .populate('revieweeId', 'username email')
      .sort({ createdAt: -1 });

    return res.json({ reviews });
  } catch (err) {
    console.error('getProjectReviews error:', err);
    return res.status(500).json({ message: 'Error fetching project reviews' });
  }
};
