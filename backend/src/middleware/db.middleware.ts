import { Request, Response, NextFunction } from 'express';
import { connectDB } from '../config/db';

export const dbMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error: any) {
    console.error('Database connection middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed: ' + (error.message || error)
    });
  }
};
