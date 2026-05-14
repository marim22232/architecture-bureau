import { Router } from 'express';
import SiteSettingsController from '../controllers/SiteSettingsController.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Публичные маршруты (чтение настроек - нужно для сайта)
router.get('/', optionalAuth, SiteSettingsController.get);

// Админские маршруты (изменение настроек)
router.put('/', authMiddleware, adminOnly, SiteSettingsController.update);

export default router;