import { Router } from 'express';
import ServiceController from '../controllers/ServiceController.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = Router();

// ✅ СНАЧАЛА КОНКРЕТНЫЕ МАРШРУТЫ (БЕЗ ПАРАМЕТРОВ)
router.get('/categories', ServiceController.getCategories);  // ← ДО /:id!
router.get('/popular', optionalAuth, ServiceController.getPopular);
router.get('/categories/:slug', optionalAuth, ServiceController.getByCategorySlug);

// ✅ ПОТОМ МАРШРУТЫ С ПАРАМЕТРАМИ
router.get('/:id', optionalAuth, ServiceController.getOne);

// ✅ ПОТОМ ВСЕ ОСТАЛЬНЫЕ
router.get('/', optionalAuth, ServiceController.getAll);

// Админские маршруты
router.post('/', authMiddleware, adminOnly, ServiceController.create);
router.put('/:id', authMiddleware, adminOnly, ServiceController.update);
router.delete('/:id', authMiddleware, adminOnly, ServiceController.delete);
router.post('/upload-icon', authMiddleware, adminOnly, ServiceController.uploadIcon);

export default router;