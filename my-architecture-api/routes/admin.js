import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import AdminController from '../controllers/AdminController.js';

const router = Router();

// Все роуты требуют админских прав
router.use(authMiddleware, adminOnly);

// Управление аккаунтами
router.get('/accounts', AdminController.getAllAccounts);
router.get('/accounts/:id', AdminController.getAccountById);
router.put('/accounts/:id', AdminController.updateAccount);

// Управление клиентами
router.put('/clients/:clientId', AdminController.updateClient);
router.post('/clients', AdminController.createClient);

// Управление сотрудниками
router.put('/team/:teamId', AdminController.updateTeam);

// Защищённые данные сотрудников (только для админов)
router.get('/team-secure/:teamId', AdminController.getTeamSecureData);

// Защищённые данные клиентов (только для админов)
router.get('/client-secure/:clientId', AdminController.getClientSecureData);
router.post('/team-secure/:teamId', AdminController.createTeamSecureData);
router.post('/client-secure/:clientId', AdminController.createClientSecureData);
export default router;