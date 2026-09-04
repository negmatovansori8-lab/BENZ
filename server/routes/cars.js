import { Router } from 'express';
import { CarController, carCreateRules } from '../controllers/carController.js';
import { validate } from '../middleware/validate.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { uploadImages } from '../middleware/upload.js';

const router = Router();

router.get('/', optionalAuth, CarController.list);
router.get('/featured', optionalAuth, CarController.featured);
router.get('/recent', optionalAuth, CarController.recent);
router.get('/popular', optionalAuth, CarController.popular);
router.get('/mine', requireAuth, CarController.mine);
router.get('/dashboard', requireAuth, CarController.dashboard);
router.get('/:id', optionalAuth, CarController.getOne);
router.post('/', requireAuth, uploadImages, carCreateRules, validate, CarController.create);
router.put('/:id', requireAuth, uploadImages, CarController.update);
router.delete('/:id', requireAuth, CarController.remove);
router.post('/:id/sold', requireAuth, CarController.markSold);
router.post('/:id/pause', requireAuth, CarController.pause);

export default router;
