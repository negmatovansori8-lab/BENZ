import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { MetaController, ReviewController, ProfileController } from '../controllers/metaController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

export const notificationRouter = Router();
notificationRouter.use(requireAuth);
notificationRouter.get('/', NotificationController.list);
notificationRouter.get('/unread', NotificationController.unread);
notificationRouter.post('/read-all', NotificationController.readAll);
notificationRouter.post('/:id/read', NotificationController.read);

export const metaRouter = Router();
metaRouter.get('/brands', MetaController.brands);
metaRouter.get('/locations', MetaController.locations);
metaRouter.get('/rates', MetaController.rates);
metaRouter.get('/convert', MetaController.convert);

export const reviewRouter = Router();
reviewRouter.get('/seller/:sellerId', ReviewController.list);
reviewRouter.post('/', requireAuth, ReviewController.create);

export const profileRouter = Router();
profileRouter.get('/:id', ProfileController.public);
profileRouter.post('/viewed', optionalAuth, ProfileController.viewed);
