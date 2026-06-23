import { Request, Response, NextFunction } from 'express';
import { Appointment } from '../models/Appointment';
import { TwilioService } from '../services/twilio.service';

export class AppointmentController {
  static async getAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;
      let query = {};

      if (date) {
        const searchDate = new Date(date as string);
        const start = new Date(searchDate);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(searchDate);
        end.setUTCHours(23, 59, 59, 999);
        query = { date: { $gte: start, $lte: end } };
      }

      const appointments = await Appointment.find(query).sort({ slot: 1, patientName: 1 });
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  }

  static async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientName, mobileNumber, date, slot } = req.body;

      if (!patientName || !patientName.trim()) {
        return res.status(400).json({ error: 'Patient name is required.' });
      }
      if (!mobileNumber || !mobileNumber.trim()) {
        return res.status(400).json({ error: 'Mobile number is required.' });
      }
      if (!date) {
        return res.status(400).json({ error: 'Date is required.' });
      }
      if (!slot || (slot !== 'morning' && slot !== 'evening')) {
        return res.status(400).json({ error: 'Slot must be "morning" or "evening".' });
      }

      const newAppointment = await Appointment.create({
        patientName: patientName.trim(),
        mobileNumber: mobileNumber.trim(),
        date: new Date(date),
        slot
      });

      // Try sending SMS notification
      try {
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC'
        });
        const slotText = slot === 'morning' ? 'Morning Session (09:00 AM - 12:00 PM)' : 'Evening Session (04:00 PM - 07:00 PM)';
        const smsText = `Hi ${patientName.trim()}, your doctor appointment with Dr. Pradeep is confirmed for ${formattedDate} during the ${slotText}. Thank you!`;
        
        await TwilioService.sendSms(mobileNumber.trim(), smsText);
        console.log(`Appointment confirmation SMS sent to ${mobileNumber}`);
      } catch (smsError: any) {
        console.warn(`SMS dispatch skipped/failed: ${smsError.message}`);
      }

      res.status(201).json(newAppointment);
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({
          error: 'You have already booked an appointment for this slot on this date.'
        });
      } else {
        next(error);
      }
    }
  }
}
