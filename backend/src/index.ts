import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import twilio from 'twilio';
import { connectDB } from './config/db';
import { DoctorPTO } from './models/DoctorPTO';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Define allowed origins
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

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Doctor Appointment API is running' });
});

// A sample route demonstrating how Twilio can be configured and used
app.post('/api/send-sms', async (req, res) => {
  const { to, body } = req.body;

  if (!to) {
    return res.status(400).json({ error: 'Recipient phone number (to) is required.' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber || 
      accountSid.startsWith('your_') || 
      authToken.startsWith('your_') || 
      fromNumber.startsWith('your_')) {
    return res.status(400).json({
      error: 'Twilio credentials are not configured or are still using default placeholders.',
    });
  }

  try {
    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      body: body || 'Hello from Doctor Appointment App!',
      from: fromNumber,
      to,
    });
    res.json({ success: true, messageSid: message.sid });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/doctor-pto', async (req, res) => {
  try {
    const ptos = await DoctorPTO.find({});
    res.json(ptos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin';

  if (username === adminUser && password === adminPass) {
    res.json({ success: true, message: 'Logged in successfully' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.post('/api/doctor-pto', async (req, res) => {
  const { doctorName, date, slot, reason } = req.body;

  if (!doctorName || !doctorName.trim()) {
    return res.status(400).json({ error: 'Doctor name is required.' });
  }
  if (!date) {
    return res.status(400).json({ error: 'Date is required.' });
  }
  if (!slot || (slot !== 'morning' && slot !== 'evening')) {
    return res.status(400).json({ error: 'Slot must be "morning" or "evening".' });
  }

  try {
    const newPto = await DoctorPTO.create({
      doctorName: doctorName.trim(),
      date: new Date(date),
      slot,
      reason: reason || ''
    });
    res.status(201).json(newPto);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        error: 'This doctor is already marked as unavailable for the selected date and slot.'
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.delete('/api/doctor-pto/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPto = await DoctorPTO.findByIdAndDelete(id);
    if (!deletedPto) {
      return res.status(404).json({ error: 'Doctor PTO record not found.' });
    }
    res.json({ success: true, message: 'Doctor PTO removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const startServer = async () => {
  await connectDB();
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
