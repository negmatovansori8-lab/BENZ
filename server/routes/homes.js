import { Router } from 'express';
import { PropertyController } from '../controllers/propertyController.js';

const router = Router();
router.get('/', PropertyController.list);
router.get('/:id', PropertyController.getOne);
export default router;
