import { NotificationModel } from '../models/Notification.js';
import { asyncHandler } from '../utils/AppError.js';

export const NotificationController = {
  list: asyncHandler(async (req, res) => {
    const data = await NotificationModel.list(req.user.id);
    res.json({ success: true, data });
  }),

  unread: asyncHandler(async (req, res) => {
    const count = await NotificationModel.unreadCount(req.user.id);
    res.json({ success: true, count });
  }),

  read: asyncHandler(async (req, res) => {
    await NotificationModel.markRead(req.params.id, req.user.id);
    res.json({ success: true });
  }),

  readAll: asyncHandler(async (req, res) => {
    await NotificationModel.markAllRead(req.user.id);
    res.json({ success: true });
  }),
};
