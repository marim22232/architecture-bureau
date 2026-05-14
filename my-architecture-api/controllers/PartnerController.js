import PartnerService from '../services/PartnerService.js';

class PartnerController {
    async create(req, res) {
        try {
            let logoPath = null;
            
            if (req.files && req.files.logo) {
                const logo = req.files.logo;
                const fileName = Date.now() + '_' + logo.name.replace(/\s/g, '_');
                const uploadPath = 'uploads/partners/' + fileName;
                
                await logo.mv(uploadPath);
                logoPath = `/uploads/partners/${fileName}`;
            }
            
            const partnerData = {
                name: req.body.name,
                logo: logoPath || req.body.logo,
                website: req.body.website,
                description: req.body.description,
                is_active: req.body.is_active === 'false' ? false : true
            };
            
            const result = await PartnerService.create(partnerData, req.pool);
            
            if (result.success) {
                res.status(201).json({
                    message: result.message,
                    partner: result.partner
                });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при создании партнера:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const activeOnly = req.query.active !== 'false';
            const result = await PartnerService.getAll(req.pool, activeOnly);
            
            if (result.success) {
                res.json(result.partners);
            } else {
                res.status(500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении партнеров:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getOne(req, res) {
        try {
            const result = await PartnerService.getOne(req.params.id, req.pool);
            
            if (result.success) {
                res.json(result.partner);
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении партнера:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            let logoPath = null;
            
            if (req.files && req.files.logo) {
                const logo = req.files.logo;
                const fileName = Date.now() + '_' + logo.name.replace(/\s/g, '_');
                const uploadPath = 'uploads/partners/' + fileName;
                
                await logo.mv(uploadPath);
                logoPath = `/uploads/partners/${fileName}`;
            }
            
            const updateData = {
                name: req.body.name,
                logo: logoPath || req.body.logo,
                website: req.body.website,
                description: req.body.description,
                is_active: req.body.is_active
            };
            
            Object.keys(updateData).forEach(key => 
                updateData[key] === undefined && delete updateData[key]
            );
            
            const result = await PartnerService.update(req.params.id, updateData, req.pool);
            
            if (result.success) {
                res.json({
                    message: result.message,
                    partner: result.partner
                });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при обновлении партнера:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await PartnerService.delete(req.params.id, req.pool);
            
            if (result.success) {
                res.json({ message: result.message });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при удалении партнера:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async uploadLogo(req, res) {
        try {
            if (!req.files || !req.files.logo) {
                return res.status(400).json({ error: 'Файл не загружен' });
            }

            const logo = req.files.logo;
            const fileName = Date.now() + '_' + logo.name.replace(/\s/g, '_');
            const uploadPath = 'uploads/partners/' + fileName;

            await logo.mv(uploadPath);

            res.json({ 
                message: 'Логотип успешно загружен',
                path: `/uploads/partners/${fileName}`
            });
        } catch (error) {
            console.error('Ошибка при загрузке логотипа:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new PartnerController();