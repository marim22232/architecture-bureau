import { Router } from 'express';
import AwardController from '../controllers/AwardController.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Публичные маршруты (только чтение)
router.get('/', optionalAuth, AwardController.getAll);
router.get('/:id', optionalAuth, AwardController.getOne);

// Админские маршруты (требуют авторизацию и права admin)
router.post('/', authMiddleware, adminOnly, AwardController.create);
router.put('/:id', authMiddleware, adminOnly, AwardController.update);
router.delete('/:id', authMiddleware, adminOnly, AwardController.delete);

export default router;