import { Router } from 'express';
import {
  AuthController,
  registerRules,
  loginRules,
  emailCodeRules,
  confirmCodeRules,
  recoverRules,
  resetPasswordRules,
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

const router = Router();
router.post('/register', authLimiter, registerRules, validate, AuthController.register);
router.post('/register/confirm', authLimiter, confirmCodeRules, validate, AuthController.confirmRegister);
router.post('/register/resend', authLimiter, emailCodeRules, validate, AuthController.resendRegister);
router.post('/login', authLimiter, loginRules, validate, AuthController.login);
router.post('/recover', authLimiter, recoverRules, validate, AuthController.recover);
router.post('/reset-password', authLimiter, resetPasswordRules, validate, AuthController.resetPassword);
router.get('/me', requireAuth, AuthController.me);
router.put('/me', requireAuth, AuthController.updateMe);

export default router;
