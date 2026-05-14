import { Router } from 'express';
import PartnerController from '../controllers/PartnerController.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Публичные маршруты (только чтение)
router.get('/', optionalAuth, PartnerController.getAll);
router.get('/:id', optionalAuth, PartnerController.getOne);

// Админские маршруты (требуют авторизацию и права admin)
router.post('/', authMiddleware, adminOnly, PartnerController.create);
router.put('/:id', authMiddleware, adminOnly, PartnerController.update);
router.delete('/:id', authMiddleware, adminOnly, PartnerController.delete);
router.post('/upload-logo', authMiddleware, adminOnly, PartnerController.uploadLogo);

export default router;