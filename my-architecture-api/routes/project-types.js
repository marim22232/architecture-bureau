import { Router } from 'express';
import ProjectTypeController from '../controllers/ProjectTypeController.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = Router();

/**
 * Публичные маршруты (только чтение)
 */
router.get('/', optionalAuth, ProjectTypeController.getByCategory);
router.get('/all', optionalAuth, ProjectTypeController.getAll);
router.get('/:id', optionalAuth, ProjectTypeController.getById);

/**
 * Админские маршруты (если нужно добавлять/редактировать типы проектов)
 * Раскомментируйте, если требуется функционал CRUD для типов проектов
 */
// router.post('/', authMiddleware, adminOnly, ProjectTypeController.create);
// router.put('/:id', authMiddleware, adminOnly, ProjectTypeController.update);
// router.delete('/:id', authMiddleware, adminOnly, ProjectTypeController.delete);

export default router;