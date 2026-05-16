import { Router } from 'express';
import TestimonialController from '../controllers/TestimonialController.js';
import { authMiddleware, adminOnly, optionalAuth, clientOnly } from '../middleware/auth.js';

const router = Router();

// ============================================
// ⭐ АДМИНСКИЕ МАРШРУТЫ (ДОЛЖНЫ БЫТЬ ПЕРВЫМИ!)
// ============================================
router.get('/admin/all', authMiddleware, adminOnly, TestimonialController.getAllForAdmin);
router.patch('/admin/:id/publish', authMiddleware, adminOnly, TestimonialController.publish);
router.put('/admin/:id', authMiddleware, adminOnly, TestimonialController.update);
router.delete('/admin/:id', authMiddleware, adminOnly, TestimonialController.delete);

// ============================================
// МАРШРУТЫ ДЛЯ КЛИЕНТОВ
// ============================================
router.get('/my', authMiddleware, TestimonialController.getMyTestimonials);
router.post('/', authMiddleware, clientOnly, TestimonialController.create);
router.get('/check/:projectId', authMiddleware, TestimonialController.checkExisting);
router.put('/my/:id', authMiddleware, clientOnly, TestimonialController.updateMyTestimonial);
router.delete('/my/:id', authMiddleware, clientOnly, TestimonialController.deleteMyTestimonial);

// ============================================
// ПУБЛИЧНЫЕ МАРШРУТЫ (только чтение)
// ============================================
router.get('/', optionalAuth, TestimonialController.getAll);
router.get('/featured', optionalAuth, TestimonialController.getFeatured);
router.get('/:id', optionalAuth, TestimonialController.getOne);

export default router;