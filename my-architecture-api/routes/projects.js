// my-architecture-api/routes/projects.js

import { Router } from 'express';
import ProjectController from '../controllers/ProjectController.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

// ============================================
// ПУБЛИЧНЫЕ МАРШРУТЫ
// ============================================

// ✅ СНАЧАЛА КОНКРЕТНЫЕ МАРШРУТЫ
router.get('/featured', ProjectController.getFeatured);
router.get('/my-projects', authMiddleware, ProjectController.getMyProjects);
router.get('/types', ProjectController.getTypes);
router.get('/full/:slug', ProjectController.getFullProjectBySlug);

// ✅ ПОТОМ ДИНАМИЧЕСКИЕ (которые могут перехватить)
router.get('/', ProjectController.getAllWithFilters);


router.get('/:slug', ProjectController.getBySlug);  // ← это ДОЛЖНО БЫТЬ ПОСЛЕДНИМ!
// ============================================
// АДМИНСКИЕ МАРШРУТЫ
// ============================================

// ⭐ ВАЖНО: конкретные маршруты ДО общих с параметрами
router.post('/full', authMiddleware, adminOnly, (req, res) => {
    ProjectController.create(req, res);
});

router.post('/', authMiddleware, adminOnly, (req, res) => {
    ProjectController.create(req, res);
});

router.put('/:id', authMiddleware, adminOnly, (req, res) => {
    ProjectController.update(req, res);
});

router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
    ProjectController.delete(req, res);
});

router.post('/:id/images', authMiddleware, adminOnly, (req, res) => {
    ProjectController.uploadImage(req, res);
});

router.delete('/images/:imageId', authMiddleware, adminOnly, (req, res) => {
    ProjectController.deleteImage(req, res);
});

router.post('/:id/rooms', authMiddleware, adminOnly, (req, res) => {
    ProjectController.addRoom(req, res);
});

router.delete('/rooms/:roomId', authMiddleware, adminOnly, (req, res) => {
    ProjectController.deleteRoom(req, res);
});

router.get('/:id/full', authMiddleware, adminOnly, (req, res) => {
    ProjectController.getProjectForAdmin(req, res);
});

export default router;