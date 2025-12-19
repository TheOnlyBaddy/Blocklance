import { Router } from 'express';
import { 
  getCurrentUser, 
  updateUserProfile, 
  uploadProfileImage 
} from './user.controller.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import upload from '../../middlewares/upload.js';

const router = Router();

// Get current user profile
router.get('/me', authMiddleware, getCurrentUser);

// Update user profile
router.put('/update', authMiddleware, updateUserProfile);
router.patch('/update', authMiddleware, updateUserProfile);

// Upload profile image (using Cloudinary)
router.post(
  '/upload-profile', 
  authMiddleware, 
  upload.single('profileImage'), // 'profileImage' is the field name in the form-data
  uploadProfileImage
);

export default router;
