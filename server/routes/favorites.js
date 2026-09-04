import { Router } from 'express';
import { FavoriteController } from '../controllers/favoriteController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', FavoriteController.list);
router.post('/', FavoriteController.add);
router.delete('/:id', FavoriteController.remove);

export default router;
