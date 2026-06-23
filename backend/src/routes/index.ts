import { Router } from 'express';
import adminRouter from './admin.routes';
import ptoRouter from './pto.routes';
import notificationRouter from './notification.routes';
import appointmentRouter from './appointment.routes';

const router = Router();

router.use('/admin', adminRouter);
router.use('/doctor-pto', ptoRouter);
router.use('/appointments', appointmentRouter);
router.use('/', notificationRouter);

export default router;
