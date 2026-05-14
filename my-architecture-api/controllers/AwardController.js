//награды
import AwardService from '../services/AwardService.js';

class AwardController {
    async create(req, res) {
        try {
            const awardData = {
                name: req.body.name,
                organization: req.body.organization,
                year: req.body.year,
                project_id: req.body.project_id,
                description: req.body.description
            };
            
            const result = await AwardService.create(awardData, req.pool);
            
            if (result.success) {
                res.status(201).json({
                    message: result.message,
                    award: result.award
                });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при создании награды:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const result = await AwardService.getAll(req.pool);
            
            if (result.success) {
                res.json(result.awards);
            } else {
                res.status(500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении наград:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getOne(req, res) {
        try {
            const result = await AwardService.getOne(req.params.id, req.pool);
            
            if (result.success) {
                res.json(result.award);
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении награды:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const updateData = {
                name: req.body.name,
                organization: req.body.organization,
                year: req.body.year,
                project_id: req.body.project_id,
                description: req.body.description
            };
            
            Object.keys(updateData).forEach(key => 
                updateData[key] === undefined && delete updateData[key]
            );
            
            const result = await AwardService.update(req.params.id, updateData, req.pool);
            
            if (result.success) {
                res.json({
                    message: result.message,
                    award: result.award
                });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при обновлении награды:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await AwardService.delete(req.params.id, req.pool);
            
            if (result.success) {
                res.json({ message: result.message });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при удалении награды:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new AwardController();