import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';

const router = Router();

router.get('/', AppointmentController.getAppointments);
router.post('/', AppointmentController.createAppointment);

export default router;
