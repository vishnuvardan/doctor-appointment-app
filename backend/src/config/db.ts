import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log('Using cached MongoDB connection.');
    return;
  }

  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI || mongoURI.includes('<username>') || mongoURI.includes('<password>') || mongoURI.startsWith('your_')) {
    console.error('--------------------------------------------------------------------------');
    console.error('CRITICAL ERROR: MONGODB_URI is not configured in your backend/.env file!');
    console.error('Please configure your MongoDB Atlas connection string before running the server.');
    console.error('See the guides in backend/.env.example and implementation_plan.md.');
    console.error('--------------------------------------------------------------------------');
    throw new Error('MONGODB_URI is not configured');
  }

  try {
    const db = await mongoose.connect(mongoURI);
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB Connected successfully.');
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};
