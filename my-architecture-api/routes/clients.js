// my-architecture-api/routes/clients.js
import { Router } from 'express';
import ClientController from '../controllers/ClientController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Защищённые маршруты (требуют авторизации)
router.post('/create-from-account', authMiddleware, ClientController.createClientFromAccount);
router.get('/by-account/:accauntId', authMiddleware, ClientController.getClientByAccountId);
router.put('/:clientId', authMiddleware, ClientController.updateClient);
router.get('/profile', authMiddleware, ClientController.getProfileData);

// Только для админа
router.get('/all', authMiddleware, ClientController.getAllClients);

export default router;