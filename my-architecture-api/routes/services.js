import { Router } from 'express';
import ServiceController from '../controllers/ServiceController.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = Router(); // ✅ исправлено: Router() вместо new Router()

// Публичные маршруты (только чтение)
router.get('/', optionalAuth, ServiceController.getAll);
router.get('/popular', optionalAuth, ServiceController.getPopular);
router.get('/categories/:slug', optionalAuth, ServiceController.getByCategorySlug);
router.get('/:id', optionalAuth, ServiceController.getOne);

// Админские маршруты (требуют авторизацию и права admin)
router.post('/', authMiddleware, adminOnly, ServiceController.create);
router.put('/:id', authMiddleware, adminOnly, ServiceController.update);
router.delete('/:id', authMiddleware, adminOnly, ServiceController.delete);
router.post('/upload-icon', authMiddleware, adminOnly, ServiceController.uploadIcon);

export default router;