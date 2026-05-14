import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import ProfileRequestController from '../controllers/ProfileRequestController.js';

const router = express.Router();

// Отправить запрос на изменение профиля (только авторизованные)
router.post('/update-request', authMiddleware, ProfileRequestController.sendUpdateRequest);

export default router;