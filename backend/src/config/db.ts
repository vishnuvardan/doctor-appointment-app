import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI || mongoURI.includes('<username>') || mongoURI.includes('<password>') || mongoURI.startsWith('your_')) {
    console.error('--------------------------------------------------------------------------');
    console.error('CRITICAL ERROR: MONGODB_URI is not configured in your backend/.env file!');
    console.error('Please configure your MongoDB Atlas connection string before running the server.');
    console.error('See the guides in backend/.env.example and implementation_plan.md.');
    console.error('--------------------------------------------------------------------------');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected successfully.');
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};
