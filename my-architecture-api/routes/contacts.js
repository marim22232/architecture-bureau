// my-architecture-api/routes/contacts.js
import { Router } from 'express';
import ContactController from '../controllers/ContactController.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

// Публичный маршрут (для отправки формы с сайта)
router.post('/', ContactController.create);

// Админские маршруты (просмотр и управление сообщениями)
router.get('/', authMiddleware, adminOnly, ContactController.getAll);
router.get('/:id', authMiddleware, adminOnly, ContactController.getOne);
router.put('/:id/status', authMiddleware, adminOnly, ContactController.updateStatus);
router.delete('/:id', authMiddleware, adminOnly, ContactController.delete);

export default router;