import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { UserModel } from '../models/User.js';
import { EmailCodeModel, randomCode } from '../models/EmailCode.js';
import { signToken } from '../utils/jwt.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { sanitizeString } from '../utils/helpers.js';
import { isMailConfigured, sendCodeEmail } from '../utils/mailer.js';

export const registerRules = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name must be 2–120 characters'),
  body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }).withMessage('Valid email is required'),
  body('password').optional({ values: 'falsy' }).isLength({ min: 4, max: 72 }).withMessage('Code must be at least 4 characters'),
  body('phone').optional().isLength({ max: 40 }),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }),
  body('password').notEmpty(),
];

export const emailCodeRules = [
  body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }),
];

export const confirmCodeRules = [
  body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }),
  body('code').trim().isLength({ min: 6, max: 6 }),
];

export const recoverRules = [
  body('identifier').trim().isLength({ min: 5, max: 80 }),
];

export const resetPasswordRules = [
  body('email').isEmail().normalizeEmail({ gmail_remove_dots: false }),
  body('code').trim().isLength({ min: 6, max: 6 }),
  body('password').isLength({ min: 8, max: 72 }).withMessage('Password must be at least 8 characters'),
];

async function issueCode(email, purpose, payload) {
  if (!isMailConfigured()) throw new AppError('Mail is not configured', 503);
  const existing = await EmailCodeModel.find(email, purpose);
  if (EmailCodeModel.tooSoon(existing)) throw new AppError('Too many attempts. Please try again later.', 429);
  const code = randomCode();
  await EmailCodeModel.save({ email, purpose, code, payload });
  try {
    await sendCodeEmail(email, code);
  } catch (err) {
    await EmailCodeModel.markUnsent(email, purpose);
    throw new AppError(err.message || 'Email was not sent', err.statusCode || 502, err.details || null);
  }
}

function sessionPayload(user) {
  const token = signToken({ id: user.id, role: user.role });
  return { success: true, token, user };
}

export const AuthController = {
  register: asyncHandler(async (req, res) => {
    const email = req.body.email.toLowerCase();
    const existing = await UserModel.findByEmail(email);
    if (existing) throw new AppError('An account with this email already exists', 409);

    const ownCode = String(req.body.password || '').trim();
    await issueCode(email, 'signup', {
      name: sanitizeString(req.body.name, 120),
      passwordHash: ownCode ? await bcrypt.hash(ownCode, 12) : null,
      useEmailCode: !ownCode,
      phone: sanitizeString(req.body.phone, 40) || null,
    });

    res.status(200).json({ success: true, needsConfirmation: true, email });
  }),

  confirmRegister: asyncHandler(async (req, res) => {
    const email = req.body.email.toLowerCase();
    const result = await EmailCodeModel.verify(email, 'signup', req.body.code);
    if (!result) throw new AppError('Invalid code', 400);
    if (result.expired) throw new AppError('Code expired', 400);
    if (result.invalid) throw new AppError('Invalid code', 400);

    if (await UserModel.findByEmail(email)) throw new AppError('An account with this email already exists', 409);

    let payload = {};
    try {
      payload = JSON.parse(result.row.payload || '{}');
    } catch {
      payload = {};
    }
    if (!payload.name) throw new AppError('Invalid code', 400);
    const passwordHash = payload.passwordHash
      || (payload.useEmailCode ? await bcrypt.hash(String(req.body.code), 12) : null);
    if (!passwordHash) throw new AppError('Invalid code', 400);

    const user = await UserModel.create({
      name: payload.name,
      email,
      passwordHash,
      phone: payload.phone || null,
      role: 'USER',
      avatar: null,
    });
    await EmailCodeModel.remove(email, 'signup');
    const publicUser = await UserModel.recordLogin(user.id);
    res.status(201).json(sessionPayload(publicUser));
  }),

  resendRegister: asyncHandler(async (req, res) => {
    const email = req.body.email.toLowerCase();
    const existing = await EmailCodeModel.find(email, 'signup');
    if (!existing) throw new AppError('Invalid code', 400);
    let payload = {};
    try {
      payload = JSON.parse(existing.payload || '{}');
    } catch {
      payload = {};
    }
    await issueCode(email, 'signup', payload);
    res.json({ success: true });
  }),

  login: asyncHandler(async (req, res) => {
    const user = await UserModel.findByEmail(req.body.email.toLowerCase());
    if (!user) throw new AppError('Invalid email or password', 401);
    if (user.is_blocked) throw new AppError('Account is blocked', 403);

    const ok = await bcrypt.compare(req.body.password, user.password_hash);
    if (!ok) throw new AppError('Invalid email or password', 401);

    const publicUser = await UserModel.recordLogin(user.id);
    res.json(sessionPayload(publicUser));
  }),

  recover: asyncHandler(async (req, res) => {
    const raw = String(req.body.identifier || '').trim();
    let user = null;
    if (raw.includes('@')) user = await UserModel.findByEmail(raw.toLowerCase());
    else user = await UserModel.findByPhone(raw);

    if (user && !user.is_blocked) {
      await issueCode(user.email, 'reset', {});
    }
    res.json({ success: true, email: user?.email || '' });
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const email = req.body.email.toLowerCase();
    const result = await EmailCodeModel.verify(email, 'reset', req.body.code);
    if (!result) throw new AppError('Invalid code', 400);
    if (result.expired) throw new AppError('Code expired', 400);
    if (result.invalid) throw new AppError('Invalid code', 400);

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    let user = await UserModel.findByEmail(email);
    if (!user) throw new AppError('Invalid email or password', 401);
    if (user.is_blocked) throw new AppError('Account is blocked', 403);
    await UserModel.updatePassword(user.id, passwordHash);
    await EmailCodeModel.remove(email, 'reset');
    const publicUser = await UserModel.recordLogin(user.id);
    res.json(sessionPayload(publicUser));
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
