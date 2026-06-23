import { Request, Response, NextFunction } from 'express';
import { TwilioService } from '../services/twilio.service';

export class NotificationController {
  static async sendSms(req: Request, res: Response, next: NextFunction) {
    try {
      const { to, body } = req.body;

      if (!to) {
        return res.status(400).json({ error: 'Recipient phone number (to) is required.' });
      }

      const sid = await TwilioService.sendSms(to, body);
      res.json({ success: true, messageSid: sid });
    } catch (error: any) {
      // Return 400 for config-related Twilio errors to match original behavior
      if (error.message.includes('credentials') || error.message.includes('placeholder')) {
        return res.status(400).json({ success: false, error: error.message });
      }
      next(error);
    }
  }
}
