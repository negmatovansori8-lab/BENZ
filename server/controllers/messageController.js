import { body } from 'express-validator';
import { MessageModel } from '../models/Message.js';
import { CarModel } from '../models/Car.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { sanitizeString } from '../utils/helpers.js';
import { notify } from '../services/analyticsService.js';

export const messageRules = [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Message is required'),
];

export const MessageController = {
  list: asyncHandler(async (req, res) => {
    const data = await MessageModel.listForUser(req.user.id);
    res.json({ success: true, data });
  }),

  unread: asyncHandler(async (req, res) => {
    const count = await MessageModel.unreadCount(req.user.id);
    res.json({ success: true, count });
  }),

  get: asyncHandler(async (req, res) => {
    const conv = await MessageModel.getConversation(req.params.id);
    if (!conv) throw new AppError('Conversation not found', 404);
    if (conv.buyer_id !== req.user.id && conv.seller_id !== req.user.id) {
      throw new AppError('Forbidden', 403);
    }
    await MessageModel.markRead(conv.id, req.user.id);
    const messages = await MessageModel.messages(conv.id);
    res.json({ success: true, conversation: conv, messages });
  }),

  start: asyncHandler(async (req, res) => {
    const car = await CarModel.findById(req.body.car_id);
    if (!car) throw new AppError('Car not found', 404);
    if (car.seller_id === req.user.id) throw new AppError('You cannot message yourself', 400);

    const conv = await MessageModel.createConversation({
      buyerId: req.user.id,
      sellerId: car.seller_id,
      carId: car.id,
    });

    if (req.body.content) {
      await MessageModel.send({
        conversationId: conv.id,
        senderId: req.user.id,
        content: sanitizeString(req.body.content, 2000),
      });
      await notify({
        userId: car.seller_id,
        type: 'new_message',
        title: 'New message',
        body: `${req.user.name} messaged you about ${car.brand} ${car.model}.`,
        relatedId: conv.id,
      });
    }

    res.status(201).json({ success: true, conversation: conv });
  }),

  send: asyncHandler(async (req, res) => {
    const conv = await MessageModel.getConversation(req.params.id);
    if (!conv) throw new AppError('Conversation not found', 404);
    if (conv.buyer_id !== req.user.id && conv.seller_id !== req.user.id) {
      throw new AppError('Forbidden', 403);
    }
    const message = await MessageModel.send({
      conversationId: conv.id,
      senderId: req.user.id,
      content: sanitizeString(req.body.content, 2000),
    });
    const otherId = conv.buyer_id === req.user.id ? conv.seller_id : conv.buyer_id;
    await notify({
      userId: otherId,
      type: 'new_message',
      title: 'New message',
      body: `${req.user.name}: ${sanitizeString(req.body.content, 80)}`,
      relatedId: conv.id,
    });
    res.status(201).json({ success: true, message });
  }),
};
