import { Router } from 'express';
import { MessageController, messageRules } from '../controllers/messageController.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', MessageController.list);
router.get('/unread', MessageController.unread);
router.post('/', MessageController.start);
router.get('/:id', MessageController.get);
router.post('/:id', messageRules, validate, MessageController.send);

export default router;
