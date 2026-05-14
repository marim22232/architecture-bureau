// my-architecture-api/routes/testimonials.js
import { Router } from 'express';
import TestimonialController from '../controllers/TestimonialController.js';
import { authMiddleware, adminOnly, optionalAuth, clientOnly } from '../middleware/auth.js';

const router = Router();

// Маршруты для клиентов
router.get('/my', authMiddleware, TestimonialController.getMyTestimonials);
router.post('/', authMiddleware, clientOnly, TestimonialController.create);
router.get('/check/:projectId', authMiddleware, TestimonialController.checkExisting);

// ⭐ НОВЫЕ МАРШРУТЫ: редактирование и удаление отзыва клиентом
router.put('/my/:id', authMiddleware, clientOnly, TestimonialController.updateMyTestimonial);
router.delete('/my/:id', authMiddleware, clientOnly, TestimonialController.deleteMyTestimonial);

// Публичные маршруты (только чтение)
router.get('/', optionalAuth, TestimonialController.getAll);
router.get('/featured', optionalAuth, TestimonialController.getFeatured);
router.get('/:id', optionalAuth, TestimonialController.getOne);

// Админские маршруты
router.put('/:id', authMiddleware, adminOnly, TestimonialController.update);
router.delete('/:id', authMiddleware, adminOnly, TestimonialController.delete);
router.patch('/:id/publish', authMiddleware, adminOnly, TestimonialController.publish);

export default router;