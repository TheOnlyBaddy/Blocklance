// User model schema for MongoDB (Mongoose)
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    firebaseUID: { type: String, index: true, sparse: true },
    walletAddress: { type: String },
    authProvider: { type: String, enum: ['firebase_email', 'firebase_google', 'metamask'], index: true },
    email: { type: String, unique: true },
    name: { type: String },
    username: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ['client', 'freelancer', 'admin'], default: 'client', required: true },
    // Profile fields
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    location: { type: String, default: '' },
    profileImage: { type: String },
    socials: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      website: { type: String, default: '' }
    },
    rating: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ walletAddress: 1 }, { unique: true, sparse: true });

export const User = mongoose.model('User', UserSchema);


