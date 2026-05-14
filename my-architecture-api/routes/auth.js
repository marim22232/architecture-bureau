// my-architecture-api/routes/auth.js
import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Публичные маршруты
router.post('/register', AuthController.register);
router.post('/verify', AuthController.verify);
router.post('/send-code', AuthController.sendVerificationCode);
router.post('/login', AuthController.login);
router.post('/reset-password', AuthController.resetPassword);

// Защищенные маршруты
router.get('/me', authMiddleware, AuthController.getCurrentUser);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.post('/logout', authMiddleware, AuthController.logout);

export default router;