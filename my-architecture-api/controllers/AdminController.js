import AdminService from '../services/AdminService.js';

class AdminController {

    async getAllAccounts(req, res) {
        try {
            const { type, search } = req.query;
            const accounts = await AdminService.getAllAccounts({ type, search });

            res.json({ success: true, accounts, total: accounts.length });
        } catch (error) {
            console.error('❌ Ошибка:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getAccountById(req, res) {
        try {
            const { id } = req.params;
            const account = await AdminService.getAccountById(id);

            if (!account) {
                return res.status(404).json({ error: 'Аккаунт не найден' });
            }

            res.json({ success: true, account });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateAccount(req, res) {
        try {
            const { id } = req.params;
            const { roleId, isActive, isEmailVerified } = req.body;

            const updated = await AdminService.updateAccount(id, { roleId, isActive, isEmailVerified });

            if (!updated) {
                return res.status(404).json({ error: 'Аккаунт не найден' });
            }

            res.json({ success: true, message: 'Аккаунт обновлён' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateClient(req, res) {
        try {
            const { clientId } = req.params;
            const client = await AdminService.updateClient(clientId, req.body);

            if (!client) {
                return res.status(404).json({ error: 'Клиент не найден' });
            }

            res.json({ success: true, message: 'Клиент обновлён', client });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateTeam(req, res) {
        try {
            const { teamId } = req.params;
            const team = await AdminService.updateTeam(teamId, req.body);

            if (!team) {
                return res.status(404).json({ error: 'Сотрудник не найден' });
            }

            res.json({ success: true, message: 'Сотрудник обновлён', team });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async createClient(req, res) {
        try {
            const result = await AdminService.createClientWithAccount(req.body);
            res.status(201).json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // my-architecture-api/controllers/AdminController.js
    // Добавь эти методы в конец класса AdminController

    async getTeamSecureData(req, res) {
        try {
            const { teamId } = req.params;
            const { name } = req.query;

            const data = await AdminService.getTeamSecureData(teamId, name);

            if (!data) {
                return res.status(404).json({
                    success: false,
                    error: 'Данные сотрудника не найдены'
                });
            }

            res.json({ success: true, data });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getClientSecureData(req, res) {
        try {
            const { clientId } = req.params;
            const { name } = req.query;

            const data = await AdminService.getClientSecureData(clientId, name);

            if (!data) {
                return res.status(404).json({
                    success: false,
                    error: 'Данные клиента не найдены'
                });
            }

            res.json({ success: true, data });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
    // my-architecture-api/controllers/AdminController.js
// Добавь эти методы в конец класса AdminController

async createTeamSecureData(req, res) {
    try {
        const { teamId } = req.params;
        const data = req.body;
        
        console.log('📝 Создание приватных данных для сотрудника:', teamId);
        
        // Проверяем, есть ли уже данные
        const existing = await req.pool.query(
            `SELECT id FROM team_secure WHERE team_id = $1`,
            [teamId]
        );
        
        if (existing.rows.length > 0) {
            // Обновляем существующие данные
            const result = await AdminService.updateTeamSecureData(teamId, data);
            return res.json({ success: true, message: 'Данные обновлены', data: result });
        } else {
            // Создаём новые данные
            const result = await AdminService.createTeamSecureData(teamId, data);
            return res.status(201).json({ success: true, message: 'Данные созданы', data: result });
        }
    } catch (error) {
        console.error('❌ Ошибка создания приватных данных сотрудника:', error);
        res.status(500).json({ error: error.message });
    }
}

async createClientSecureData(req, res) {
    try {
        const { clientId } = req.params;
        const data = req.body;
        
        console.log('📝 Создание приватных данных для клиента:', clientId);
        
        // Проверяем, есть ли уже данные
        const existing = await req.pool.query(
            `SELECT id FROM clients_private WHERE client_id = $1`,
            [clientId]
        );
        
        if (existing.rows.length > 0) {
            // Обновляем существующие данные
            const result = await AdminService.updateClientSecureData(clientId, data);
            return res.json({ success: true, message: 'Данные обновлены', data: result });
        } else {
            // Создаём новые данные
            const result = await AdminService.createClientSecureData(clientId, data);
            return res.status(201).json({ success: true, message: 'Данные созданы', data: result });
        }
    } catch (error) {
        console.error('❌ Ошибка создания приватных данных клиента:', error);
        res.status(500).json({ error: error.message });
    }
}
}

export default new AdminController();