// my-architecture-api/routes/admin.js
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

// ✅ Защищённые данные сотрудников
router.get('/team-secure/:teamId', AdminController.getTeamSecureData);
router.post('/team-secure/:teamId', AdminController.createTeamSecureData);
router.put('/team-secure/:teamId', AdminController.updateTeamSecureData);  // ← ДОБАВИТЬ ЭТОТ

// ✅ Защищённые данные клиентов
router.get('/client-secure/:clientId', AdminController.getClientSecureData);
router.post('/client-secure/:clientId', AdminController.createClientSecureData);
router.put('/client-secure/:clientId', AdminController.updateClientSecureData);  // ← ДОБАВИТЬ ЭТОТ

export default router;