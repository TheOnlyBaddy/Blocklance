import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Verify required environment variables are present
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required Cloudinary environment variables: ${missingVars.join(', ')}`);
  console.error('Please check your .env file and ensure all Cloudinary credentials are set.');
}

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // ensure HTTPS
});

// Test the configuration
cloudinary.api.ping()
  .then(() => console.log('✅ Cloudinary connection successful'))
  .catch(err => console.error('❌ Cloudinary connection failed:', err.message));

export default cloudinary;
