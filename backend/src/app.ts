import express from 'express';
import cors from 'cors';
import apiRouter from './routes';
import { errorHandler } from './middleware/error.middleware';
import { dbMiddleware } from './middleware/db.middleware';

const app = express();

// CORS configurations
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // In development or if allowedOrigins contains '*', allow all
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // If the origin is explicitly allowed
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Default fallback: allow the requesting origin, but log it to help debugging
    console.log(`CORS request allowed from origin: ${origin}`);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Body parser
app.use(express.json());

// Database connection check
app.use(dbMiddleware);

// Root status check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Doctor Appointment API is running' });
});

// Mounting main router
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

export { app };
