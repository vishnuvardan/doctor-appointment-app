import { app } from '../src/app';
import { connectDB } from '../src/config/db';

// Ensure database connection is established before serving requests
const start = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to establish database connection during serverless init:', error);
  }
};

start();

export default app;
