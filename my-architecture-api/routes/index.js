// my-architecture-api/routes/index.js
import { Router } from 'express';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';

import servicesRouter from './services.js';
import projectsRouter from './projects.js';
import teamRouter from './team.js';
import testimonialsRouter from './testimonials.js';
import partnersRouter from './partners.js';
import awardsRouter from './awards.js';
import contactsRouter from './contacts.js';
import authRouter from './auth.js';
import searchRouter from './search.js';
import siteSettingsRouter from './site-settings.js';
import projectTypesRouter from './project-types.js';
import clientsRouter from './clients.js';
import profileRoutes from './profileRoutes.js';
import adminRouter from './admin.js';

const router = Router();

// ============================================
// ✅ ПУБЛИЧНЫЕ МАРШРУТЫ (не требуют авторизации)
// ============================================

// Аутентификация (регистрация, логин)
router.use('/auth', authRouter);

// Поиск (публичный)
router.use('/search', searchRouter);

// Публичные данные для отображения на сайте
// В каждом роутере уже есть optionalAuth для GET запросов
router.use('/services', servicesRouter);
router.use('/projects', projectsRouter);
router.use('/team', teamRouter);
router.use('/testimonials', testimonialsRouter);
router.use('/partners', partnersRouter);
router.use('/awards', awardsRouter);
router.use('/site-settings', siteSettingsRouter);
router.use('/project-types', projectTypesRouter);

// Формы обратной связи (публичные, но с rate limiting)
router.use('/contacts', contactsRouter);
//router.use('/admin', adminRouter);
// ============================================
// ✅ ЗАЩИЩЕННЫЕ МАРШРУТЫ (требуют авторизацию)
// ============================================
// ⭐ АДМИН-ПАНЕЛЬ (требует авторизацию И права админа)
// adminRouter уже имеет внутри authMiddleware и adminOnly
router.use('/admin', adminRouter);
// Клиенты (только для авторизованных пользователей)
router.use('/clients', authMiddleware, clientsRouter);
router.use('/profile', authMiddleware, profileRoutes);
// ============================================
// ТЕСТОВЫЙ МАРШРУТ
// ============================================
router.post('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Тест работает',
        receivedData: req.body
    });
});

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

export default router;