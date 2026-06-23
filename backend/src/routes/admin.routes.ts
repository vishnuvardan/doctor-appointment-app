import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

router.post('/login', AdminController.login);

export default router;
