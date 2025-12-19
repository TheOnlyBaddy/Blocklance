import Portfolio from './portfolio.model.js';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload.js';

// POST /api/portfolio — Create portfolio item (freelancer)
export const createPortfolio = async (req, res) => {
  try {
    const { title, description, projectLink } = req.body || {};
    const freelancerId = req.user.id || req.user.userId;
    let imageUrl = null;

    if (!title) return res.status(400).json({ message: 'Title is required' });

    if (req.file?.buffer) {
      imageUrl = await uploadToCloudinary(req.file.buffer, 'blocklance/portfolio');
    }

    const newItem = await Portfolio.create({
      freelancerId,
      title,
      description,
      projectLink,
      imageUrl,
    });

    return res.status(201).json({ message: 'Portfolio item created', portfolio: newItem });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('createPortfolio error:', err);
    return res.status(500).json({ message: 'Error creating portfolio item' });
  }
};

// GET /api/portfolio/me — Get current freelancer’s portfolio
export const getMyPortfolio = async (req, res) => {
  try {
    const freelancerId = req.user.id || req.user.userId;
    const items = await Portfolio.find({ freelancerId }).sort({ createdAt: -1 });
    return res.json({ portfolio: items });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('getMyPortfolio error:', err);
    return res.status(500).json({ message: 'Error fetching portfolio' });
  }
};

// GET /api/portfolio/user/:id — Get a specific freelancer’s portfolio
export const getUserPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const items = await Portfolio.find({ freelancerId: id }).sort({ createdAt: -1 });
    return res.json({ portfolio: items });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('getUserPortfolio error:', err);
    return res.status(500).json({ message: 'Error fetching user portfolio' });
  }
};

// PUT /api/portfolio/:id — Update portfolio item
export const updatePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const freelancerId = req.user.id || req.user.userId;
    const { title, description, projectLink } = req.body || {};

    const portfolioItem = await Portfolio.findById(id);
    if (!portfolioItem) return res.status(404).json({ message: 'Portfolio item not found' });

    if (portfolioItem.freelancerId.toString() !== freelancerId)
      return res.status(403).json({ message: 'Unauthorized: Not owner' });

    if (req.file?.buffer) {
      portfolioItem.imageUrl = await uploadToCloudinary(req.file.buffer, 'blocklance/portfolio');
    }

    if (title) portfolioItem.title = title;
    if (description) portfolioItem.description = description;
    if (projectLink) portfolioItem.projectLink = projectLink;

    await portfolioItem.save();
    return res.json({ message: 'Portfolio item updated', portfolio: portfolioItem });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('updatePortfolio error:', err);
    return res.status(500).json({ message: 'Error updating portfolio' });
  }
};

// DELETE /api/portfolio/:id — Delete portfolio item
export const deletePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const freelancerId = req.user.id || req.user.userId;

    const portfolioItem = await Portfolio.findById(id);
    if (!portfolioItem) return res.status(404).json({ message: 'Portfolio item not found' });

    if (portfolioItem.freelancerId.toString() !== freelancerId)
      return res.status(403).json({ message: 'Unauthorized: Not owner' });

    await portfolioItem.deleteOne();
    return res.json({ message: 'Portfolio item deleted successfully' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('deletePortfolio error:', err);
    return res.status(500).json({ message: 'Error deleting portfolio' });
  }
};
