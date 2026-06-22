import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
