import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));

router.get('/stats', AdminController.stats);
router.get('/analytics', AdminController.analytics);
router.get('/users', AdminController.users);
router.get('/users/:id', AdminController.getUser);
router.post('/users/:id/block', AdminController.blockUser);
router.post('/users/:id/unblock', AdminController.unblockUser);
router.delete('/users/:id', AdminController.deleteUser);
router.get('/cars', AdminController.cars);
router.post('/cars/:id/approve', AdminController.approve);
router.post('/cars/:id/reject', AdminController.reject);
router.post('/cars/:id/feature', AdminController.feature);
router.put('/cars/:id', AdminController.updateCar);
router.delete('/cars/:id', AdminController.deleteCar);

export default router;
