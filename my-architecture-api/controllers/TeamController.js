import TeamService from '../services/TeamService.js';

class TeamController {
    async create(req, res) {
        try {
            let photoPath = null;

            if (req.files && req.files.photo) {
                const photo = req.files.photo;
                const fileName = Date.now() + '_' + photo.name.replace(/\s/g, '_');
                const uploadPath = 'uploads/team/' + fileName;

                await photo.mv(uploadPath);
                photoPath = `/uploads/team/${fileName}`;
            }

            const memberData = {
                name: req.body.name,
                position: req.body.position,
                bio: req.body.bio,
                photo: photoPath || req.body.photo || null,
                email: req.body.email,
                phone: req.body.phone,
                specialization: req.body.specialization,
                sort_order: req.body.sort_order || 0,
                is_active: req.body.is_active !== 'false' && req.body.is_active !== false,
                instagram: req.body.instagram || null,
                linkedin: req.body.linkedin || null,
                website: req.body.website || null
            };

            const result = await TeamService.create(memberData, req.pool);

            if (result.success) {
                res.status(201).json({
                    message: result.message,
                    member: result.member
                });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при создании сотрудника:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const result = await TeamService.getAll(req.pool);

            if (result.success) {
                res.json(result.team);
            } else {
                res.status(500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении команды:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getActive(req, res) {
        try {
            const result = await TeamService.getActive(req.pool);

            if (result.success) {
                res.json(result.team);
            } else {
                res.status(500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении активных сотрудников:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getOne(req, res) {
        try {
            const result = await TeamService.getOne(req.params.id, req.pool);

            if (result.success) {
                res.json(result.member);
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении сотрудника:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            let photoPath = null;

            if (req.files && req.files.photo) {
                const photo = req.files.photo;
                const fileName = Date.now() + '_' + photo.name.replace(/\s/g, '_');
                const uploadPath = 'uploads/team/' + fileName;

                await photo.mv(uploadPath);
                photoPath = `/uploads/team/${fileName}`;
            }

            const updateData = {
                name: req.body.name,
                position: req.body.position,
                bio: req.body.bio,
                photo: photoPath || req.body.photo,
                email: req.body.email,
                phone: req.body.phone,
                specialization: req.body.specialization,
                sort_order: req.body.sort_order,
                is_active: req.body.is_active,
                instagram: req.body.instagram,
                linkedin: req.body.linkedin,
                website: req.body.website
            };

            // Удаляем undefined поля
            Object.keys(updateData).forEach(key =>
                updateData[key] === undefined && delete updateData[key]
            );

            const result = await TeamService.update(req.params.id, updateData, req.pool);

            if (result.success) {
                res.json({
                    message: result.message,
                    member: result.member
                });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при обновлении сотрудника:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await TeamService.delete(req.params.id, req.pool);

            if (result.success) {
                res.json({ message: result.message });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при удалении сотрудника:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async uploadPhoto(req, res) {
        try {
            if (!req.files || !req.files.photo) {
                return res.status(400).json({ error: 'Файл не загружен' });
            }

            const photo = req.files.photo;
            const fileName = Date.now() + '_' + photo.name.replace(/\s/g, '_');
            const uploadPath = 'uploads/team/' + fileName;

            await photo.mv(uploadPath);

            res.json({
                message: 'Фото успешно загружено',
                path: `/uploads/team/${fileName}`
            });
        } catch (error) {
            console.error('Ошибка при загрузке фото:', error);
            res.status(500).json({ error: error.message });
        }
    }
    // TeamController.js - добавить новый метод
    async updateProfile(req, res) {
        try {
            // Получаем ID пользователя из токена (установлено middleware authenticate)
            const userId = req.user.id;
            const userType = req.user.userType;

            if (userType !== 'team') {
                return res.status(403).json({
                    success: false,
                    message: 'Только сотрудники могут обновлять профиль'
                });
            }

            // Данные для обновления (только разрешённые поля)
            const updateData = {};

            // Разрешённые поля для обновления профиля сотрудником
            const allowedFields = [
                'name', 'position', 'specialization', 'telegram', 'linkedin',
                'birthDate', 'education', 'awards', 'experienceYears',
                'projectsCount', 'softwareSkills'
            ];

            // Маппинг camelCase → snake_case для БД
            const fieldMapping = {
                birthDate: 'birth_date',
                experienceYears: 'experience_years',
                projectsCount: 'projects_count',
                softwareSkills: 'software_skills'
            };

            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    const dbField = fieldMapping[field] || field;
                    updateData[dbField] = req.body[field];
                }
            }

            // Ищем сотрудника по accaunt_id
            const checkQuery = 'SELECT * FROM team WHERE accaunt_id = $1';
            const checkResult = await req.pool.query(checkQuery, [userId]);

            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Профиль сотрудника не найден'
                });
            }

            // Обновляем
            const updateResult = await TeamService.update(
                checkResult.rows[0].id,
                updateData,
                req.pool
            );

            if (updateResult.success) {
                res.json({
                    success: true,
                    message: 'Профиль успешно обновлён',
                    user: {
                        ...updateResult.member,
                        userType: 'team'
                    }
                });
            } else {
                res.status(updateResult.status || 500).json({
                    success: false,
                    message: updateResult.error
                });
            }
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    // В TeamController.js или AuthController.js
async getMyProjects(req, res) {
    try {
        const accountId = req.user.id; // ID из таблицы accaunt (после авторизации)
        
        // Находим сотрудника в таблице team по accaunt_id
        const teamQuery = `
            SELECT id FROM public.team 
            WHERE accaunt_id = $1
        `;
        const teamResult = await req.pool.query(teamQuery, [accountId]);
        
        if (teamResult.rows.length === 0) {
            return res.json({
                success: true,
                projects: []
            });
        }
        
        const teamId = teamResult.rows[0].id;
        
        // Получаем проекты, связанные с этим сотрудником
        const projectsQuery = `
            SELECT 
                p.id, p.title, p.slug, p.location, p.area, 
                p.project_year, p.status, p.main_image, p.description,
                pt.role as team_role
            FROM public.projects p
            JOIN public.project_team pt ON p.id = pt.project_id
            WHERE pt.team_id = $1
            ORDER BY p.created_at DESC
        `;
        
        const projectsResult = await req.pool.query(projectsQuery, [teamId]);
        
        console.log(`Found ${projectsResult.rows.length} projects for team member ${teamId}`);
        
        res.json({
            success: true,
            projects: projectsResult.rows
        });
    } catch (error) {
        console.error('Ошибка получения проектов сотрудника:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}
}

export default new TeamController();