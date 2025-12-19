import { User } from './user.model.js';
import cloudinary from '../../config/cloudinary.js';

/**
 * @desc    Get current logged-in user's profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user._id)
      .select('-password -__v -createdAt -updatedAt')
      .lean();
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      message: 'Error fetching user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/update
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, bio, skills, socials, location } = req.body;

    const updateData = {};
    
    // Only update fields that are provided
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    
    // Handle skills update
    if (skills !== undefined) {
      updateData.skills = Array.isArray(skills) 
        ? skills 
        : skills.split(',').map(skill => skill.trim()).filter(Boolean);
    }

    // Handle socials update
    if (socials) {
      updateData.socials = {
        ...(socials.github !== undefined && { github: socials.github }),
        ...(socials.linkedin !== undefined && { linkedin: socials.linkedin }),
        ...(socials.twitter !== undefined && { twitter: socials.twitter }),
        ...(socials.website !== undefined && { website: socials.website })
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -__v -createdAt -updatedAt');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ 
      message: 'Error updating profile',
      error: error.message 
    });
  }
}

/**
 * @desc    Upload profile image to Cloudinary
 * @route   POST /api/users/upload-profile
 * @access  Private
 */
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const userId = req.user._id;
    
    // Get the current user to check for existing image
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If there's an existing image, delete it from Cloudinary
    if (user.profileImage) {
      try {
        const publicId = user.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`blocklance-profile-images/${publicId}`);
      } catch (error) {
        console.error('Error deleting old profile image:', error);
        // Continue with the update even if deletion fails
      }
    }

    // Update user with new image URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: req.file.path },
      { new: true, select: '-password -__v -createdAt -updatedAt' }
    );

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ 
      message: 'Error uploading profile image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
