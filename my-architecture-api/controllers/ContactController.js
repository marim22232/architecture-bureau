// ContactController.js
import ContactService from '../services/ContactService.js';
import pool from '../config/db.js'; // ⭐ ДОБАВЬТЕ ИМПОРТ pool

class ContactController {
    async create(req, res) {
        try {
            const contactData = {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                message: req.body.message,
                project_type_id: req.body.project_type_id,
                selected_services: req.body.selected_services,
                area: req.body.area
            };
            
            console.log('Полученные данные:', contactData);
            
            const result = await ContactService.create(contactData, pool);
            
            if (result.success) {
                res.status(201).json({
                    message: result.message,
                    contact: result.contact
                });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const status = req.query.status || null;
            const result = await ContactService.getAll(pool, status);
            
            if (result.success) {
                res.json(result.contacts);
            } else {
                res.status(500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getOne(req, res) {
        try {
            const result = await ContactService.getOne(req.params.id, pool);
            
            if (result.success) {
                res.json(result.contact);
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            
            if (!status) {
                return res.status(400).json({ error: 'Статус не указан' });
            }
            
            const result = await ContactService.updateStatus(req.params.id, status, pool);
            
            if (result.success) {
                res.json({
                    message: result.message,
                    contact: result.contact
                });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await ContactService.delete(req.params.id, pool);
            
            if (result.success) {
                res.json({ message: result.message });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new ContactController();