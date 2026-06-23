import { Router } from 'express';
import { PtoController } from '../controllers/pto.controller';

const router = Router();

router.get('/', PtoController.getPtos);
router.post('/', PtoController.createPto);
router.delete('/:id', PtoController.deletePto);

export default router;
