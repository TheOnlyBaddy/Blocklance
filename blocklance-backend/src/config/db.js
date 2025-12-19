// MongoDB connection using Mongoose
// Exports: connectToDatabase()
import mongoose from 'mongoose';

export async function connectToDatabase() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set');
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGO_DB || undefined,
    });
    // eslint-disable-next-line no-console
    console.log('\n🗄️ Database\n  ✔ Connected to MongoDB');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to MongoDB:', err);
    throw err;
  }
}


