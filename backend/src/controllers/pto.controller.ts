import { Request, Response, NextFunction } from 'express';
import { DoctorPTO } from '../models/DoctorPTO';

export class PtoController {
  static async getPtos(req: Request, res: Response, next: NextFunction) {
    try {
      const ptos = await DoctorPTO.find({});
      res.json(ptos);
    } catch (error) {
      next(error);
    }
  }

  static async createPto(req: Request, res: Response, next: NextFunction) {
    try {
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
        next(error);
      }
    }
  }

  static async deletePto(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedPto = await DoctorPTO.findByIdAndDelete(id);
      if (!deletedPto) {
        return res.status(404).json({ error: 'Doctor PTO record not found.' });
      }
      res.json({ success: true, message: 'Doctor PTO removed successfully.' });
    } catch (error) {
      next(error);
    }
  }
}
