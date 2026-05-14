// controllers/ClientController.js
import ClientService from '../services/ClientService.js';

class ClientController {
    
    async createClientFromAccount(req, res) {
        try {
            const { accauntId, firstName, lastName, patronymic, companyName, clientTypeId } = req.body;
            
            if (!accauntId) {
                return res.status(400).json({ error: 'ID аккаунта обязателен' });
            }
            
            const result = await ClientService.createClientFromAccount(accauntId, {
                firstName, lastName, patronymic, companyName, clientTypeId
            });
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json({ error: result.error });
            }
            
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
    async getClientByAccountId(req, res) {
        try {
            const { accauntId } = req.params;
            const result = await ClientService.getClientByAccountId(accauntId);
            
            if (result.success) {
                res.json({ success: true, client: result.client });
            } else {
                res.status(404).json({ error: result.error });
            }
            
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
    async updateClient(req, res) {
        try {
            const { clientId } = req.params;
            const { firstName, lastName, patronymic, companyName, clientTypeId } = req.body;
            
            const result = await ClientService.updateClient(clientId, {
                firstName, lastName, patronymic, companyName, clientTypeId
            });
            
            if (result.success) {
                res.json({ success: true, client: result.client });
            } else {
                res.status(404).json({ error: result.error });
            }
            
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
    async getAllClients(req, res) {
        try {
            const result = await ClientService.getAllClients();
            
            if (result.success) {
                res.json({ success: true, clients: result.clients });
            } else {
                res.status(500).json({ error: result.error });
            }
            
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ error: error.message });
        }
    }
    
    async getProfileData(req, res) {
        try {
            const userId = req.user.id;
            const result = await ClientService.getProfileData(userId);
            
            if (result.success) {
                res.json({ success: true, profile: result.profile });
            } else {
                res.status(404).json({ error: result.error });
            }
            
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new ClientController();