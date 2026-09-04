import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { UserModel } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { sanitizeString } from '../utils/helpers.js';

export const registerRules = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name must be 2–120 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8, max: 72 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().isLength({ max: 40 }),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const AuthController = {
  register: asyncHandler(async (req, res) => {
    const email = req.body.email.toLowerCase();
    const existing = await UserModel.findByEmail(email);
    if (existing) throw new AppError('An account with this email already exists', 409);

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await UserModel.create({
      name: sanitizeString(req.body.name, 120),
      email,
      passwordHash,
      phone: sanitizeString(req.body.phone, 40),
      role: 'USER',
      avatar: null,
    });

    const token = signToken({ id: user.id, role: user.role });
    const publicUser = await UserModel.recordLogin(user.id);
    res.status(201).json({ success: true, token, user: publicUser });
  }),

  login: asyncHandler(async (req, res) => {
    const user = await UserModel.findByEmail(req.body.email.toLowerCase());
    if (!user) throw new AppError('Invalid email or password', 401);
    if (user.is_blocked) throw new AppError('Account is blocked', 403);

    const ok = await bcrypt.compare(req.body.password, user.password_hash);
    if (!ok) throw new AppError('Invalid email or password', 401);

    const publicUser = await UserModel.recordLogin(user.id);
    const token = signToken({ id: user.id, role: user.role });
    res.json({ success: true, token, user: publicUser });
  }),

  me: asyncHandler(async (req, res) => {
    res.json({ success: true, user: req.user });
  }),

  updateMe: asyncHandler(async (req, res) => {
    const user = await UserModel.update(req.user.id, {
      name: req.body.name != null ? sanitizeString(req.body.name, 120) : undefined,
      phone: req.body.phone != null ? sanitizeString(req.body.phone, 40) : undefined,
      avatar: req.body.avatar,
    });
    res.json({ success: true, user });
  }),
};
