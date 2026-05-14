import { Router } from 'express';
import TeamController from '../controllers/TeamController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = new Router();

// ============================================
// ⭐ КОНКРЕТНЫЕ МАРШРУТЫ (без параметров в URL)
// ============================================

// Публичные маршруты
router.get('/active', TeamController.getActive);

// Защищенные маршруты для текущего пользователя
router.get('/my-projects', authMiddleware, TeamController.getMyProjects);
router.put('/profile', authMiddleware, TeamController.updateProfile);
router.post('/upload-photo', authMiddleware, TeamController.uploadPhoto);

// CRUD операции (требуют админских прав)
router.post('/', authMiddleware, TeamController.create);

// ============================================
// ⭐ ДИНАМИЧЕСКИЕ МАРШРУТЫ (с параметром :id) - ВСЕГДА В КОНЦЕ
// ============================================
router.get('/:id', TeamController.getOne);
router.put('/:id', authMiddleware, TeamController.update);
router.delete('/:id', authMiddleware, TeamController.delete);

export default router;