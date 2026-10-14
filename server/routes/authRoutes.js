import express from 'express';
import {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  loginAdmin,
  forgotPassword,
  resetPassword,
  getMe,
  getDevEmails,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/verify-email', verifyEmail);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/login', loginUser);
router.post('/admin-login', loginAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.get('/dev-emails', getDevEmails);

export default router;
