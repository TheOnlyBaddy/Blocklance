import express from 'express';
import { createProject, getClientProjects, getAllAvailableProjects, updateProjectStatus } from './project.controller.js';
import { authAny } from '../../middlewares/authAny.js';
import { roleCheck } from '../../middlewares/roleCheck.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary.js';
import Project from './project.model.js';

const router = express.Router();

// Cloudinary storage for project images
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blocklance/project_images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1920, height: 1080, crop: 'limit' }],
  },
});
const upload = multer({ storage });

router.post('/', authAny, roleCheck('client'), createProject);
router.get('/my-projects', authAny, roleCheck('client'), getClientProjects);
router.get('/my-posted-projects', authAny, roleCheck('client'), getClientProjects);
router.get('/available', authAny, roleCheck('freelancer'), getAllAvailableProjects);
router.patch('/:id/status', authAny, roleCheck('client'), updateProjectStatus);

// POST /api/projects/upload-image → returns Cloudinary URL
router.post('/upload-image', authAny, roleCheck('client'), upload.single('image'), async (req, res) => {
  try {
    const url = req.file?.path;
    if (!url) return res.status(400).json({ message: 'No image provided' });
    return res.status(200).json({ message: 'Project image uploaded successfully', imageUrl: url });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error uploading project image:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Optional: attach an image URL to a specific project
router.put('/:projectId/add-image', authAny, roleCheck('client'), async (req, res) => {
  try {
    const { imageUrl } = req.body || {};
    if (!imageUrl) return res.status(400).json({ message: 'imageUrl is required' });
    const updated = await Project.findByIdAndUpdate(
      req.params.projectId,
      { $push: { imageUrls: imageUrl } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Project not found' });
    return res.status(200).json({ message: 'Image added to project', project: updated });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Add image error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
