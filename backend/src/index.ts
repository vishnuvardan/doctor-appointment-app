import dotenv from 'dotenv';
dotenv.config(); // Load environment variables first

import { connectDB } from './config/db';
import { app } from './app';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to database
  await connectDB();
  
  // Start server
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
