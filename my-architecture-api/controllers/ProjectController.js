import ProjectService from '../services/ProjectService.js';

class ProjectController {


    async create(req, res) {
        try {  // 1. Обработка клиента (если создается новый)
            // 1. Обработка клиента
            let clientId = null;

            if (req.body.new_client) {
                try {
                    const newClient = JSON.parse(req.body.new_client);
                    const clientResult = await req.pool.query(
                        `INSERT INTO clients (first_name, last_name, patronymic, email, phone) 
             VALUES ($1, $2, $3, $4, $5) RETURNING client_id`,
                        [newClient.first_name, newClient.last_name, newClient.patronymic, newClient.email, newClient.phone]
                    );
                    clientId = clientResult.rows[0].client_id;
                    console.log('✅ Создан новый клиент с ID:', clientId);
                } catch (err) {
                    console.error('Ошибка создания клиента:', err);
                    console.log('📌 raw client_id from frontend:', req.body.client_id);
                    console.log('📌 cleaned client_id:', clientId);
                    console.log('📌 project_type_id:', projectTypeId);
                }
            } else if (req.body.client_id && req.body.client_id !== '') {
                // ⭐ ОЧИЩАЕМ client_id от фигурных скобок и лишних символов
                let rawClientId = req.body.client_id;

                // Если массив - берём первый элемент
                if (Array.isArray(rawClientId)) {
                    rawClientId = rawClientId[0];
                    console.log('⚠️ client_id был массивом, взят первый элемент:', rawClientId);
                }

                // Удаляем фигурные скобки и кавычки
                let cleanClientId = String(rawClientId)
                    .replace(/[{}]/g, '')
                    .replace(/^["']|["']$/g, '')
                    .trim();

                console.log('📌 raw client_id:', rawClientId);
                console.log('📌 clean client_id:', cleanClientId);

                clientId = cleanClientId;
                console.log('✅ Используем существующего клиента с ID:', clientId);
            } else {
                console.log('⚠️ Клиент не указан, будет NULL');
            }

            // 2. Создаем проект
            const slug = req.body.slug || req.body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            // ⭐ Очищаем project_type_id — должно быть число или null
            let projectTypeId = null;
            if (req.body.project_type_id && req.body.project_type_id !== '') {
                projectTypeId = parseInt(req.body.project_type_id);
                if (isNaN(projectTypeId)) {
                    projectTypeId = null;
                }
            }

            console.log('📌 project_type_id после очистки:', projectTypeId);

            const projectResult = await req.pool.query(
                `INSERT INTO projects (
        title, slug, description, location, area, project_year,
        status, project_type_id, client_id, is_featured
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                [
                    req.body.title,
                    slug,
                    req.body.description || null,
                    req.body.location || null,
                    req.body.area ? parseFloat(req.body.area) : null,
                    req.body.project_year ? parseInt(req.body.project_year) : null,
                    req.body.status || 'in_progress',
                    projectTypeId,  // ⭐ используем очищенное значение
                    clientId,
                    req.body.is_featured === 'true' || req.body.is_featured === true
                ]
            );

            const project = projectResult.rows[0];
            const projectId = project.id;

            // 3. Обработка главного изображения
            if (req.files && req.files.main_image) {
                const image = req.files.main_image;
                const fileName = Date.now() + '_' + image.name.replace(/\s/g, '_');
                const uploadPath = 'uploads/projects/' + fileName;
                await image.mv(uploadPath);
                await req.pool.query(`UPDATE projects SET main_image = $1 WHERE id = $2`, [`/uploads/projects/${fileName}`, projectId]);
            }

            // 4. Обработка комнат
            if (req.body.rooms) {
                try {
                    const rooms = JSON.parse(req.body.rooms);
                    for (const room of rooms) {
                        await req.pool.query(
                            `INSERT INTO project_rooms (project_id, name, area, description) VALUES ($1, $2, $3, $4)`,
                            [projectId, room.name, room.area || null, room.description || null]
                        );
                    }
                } catch (err) {
                    console.error('Ошибка добавления комнат:', err);
                }
            }

            // 5. Обработка команды
if (req.body.team_data) {
    try {
        const teamData = JSON.parse(req.body.team_data);
        
        for (const member of teamData) {
            // ⭐ ОЧИЩАЕМ ID от фигурных скобок и кавычек
            let cleanTeamId = String(member.id)
                .replace(/[{}]/g, '')
                .replace(/^["']|["']$/g, '');
            
            await req.pool.query(
                `INSERT INTO project_team (project_id, team_id, role) VALUES ($1, $2, $3)`,
                [projectId, cleanTeamId, member.role || 'architect']
            );
        }
        console.log('✅ Команда сохранена');
    } catch (err) {
        console.error('Ошибка обработки team_data:', err);
    }
}

            // 6. Обработка галереи
            if (req.files && req.files.gallery_images) {
                const images = Array.isArray(req.files.gallery_images) ? req.files.gallery_images : [req.files.gallery_images];
                for (let i = 0; i < images.length; i++) {
                    const fileName = Date.now() + '_' + images[i].name.replace(/\s/g, '_');
                    const uploadPath = 'uploads/projects/' + fileName;
                    await images[i].mv(uploadPath);
                    await req.pool.query(
                        `INSERT INTO project_images (project_id, image_url, sort_order) VALUES ($1, $2, $3)`,
                        [projectId, `/uploads/projects/${fileName}`, i]
                    );
                }
            }

            res.status(201).json({
                success: true,
                message: 'Проект успешно создан',
                project: project
            });

        } catch (error) {
            console.error('Ошибка в create:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getAll(req, res) {
        try {
            const filters = {
                status: req.query.status,
                project_type_id: req.query.type,
                year: req.query.year
            };

            const pagination = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10
            };

            const result = await ProjectService.getAll(req.pool, filters, pagination);

            if (result.success) {
                res.json({
                    projects: result.projects,
                    pagination: result.pagination
                });
            } else {
                res.status(500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении проектов:', error);
            res.status(500).json({ error: error.message });
        }
    }


    async getBySlug(req, res) {
        try {
            const result = await ProjectService.getBySlug(req.params.slug, req.pool);

            if (result.success) {
                res.json(result.project);
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении проекта:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getFeatured(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 6;
            const result = await ProjectService.getFeatured(req.pool, limit);

            if (result.success) {
                res.json(result.projects);
            } else {
                res.status(500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении избранных проектов:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getTypes(req, res) {
        try {
            const result = await req.pool.query('SELECT * FROM project_types WHERE is_active = true ORDER BY name');
            res.json(result.rows);
        } catch (error) {
            console.error('Ошибка при получении типов проектов:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const existingProject = await req.pool.query(
                'SELECT id FROM projects WHERE id = $1',
                [req.params.id]
            );

            if (existingProject.rows.length === 0) {
                return res.status(404).json({ error: 'Проект не найден' });
            }

            let mainImagePath = null;
            if (req.files && req.files.main_image) {
                const image = req.files.main_image;
                const fileName = Date.now() + '_' + image.name.replace(/\s/g, '_');
                const uploadPath = 'uploads/projects/' + fileName;
                await image.mv(uploadPath);
                mainImagePath = `/uploads/projects/${fileName}`;
            }

            // ⭐⭐⭐ ОЧИСТКА CLIENT_ID ⭐⭐⭐
            let clientId = req.body.client_id;
            if (Array.isArray(clientId)) {
                clientId = clientId[0];
                console.log('⚠️ client_id был массивом, взят первый элемент:', clientId);
            }
            if (typeof clientId === 'string' && clientId) {
                clientId = clientId
                    .replace(/[{}]/g, '')
                    .replace(/^["']|["']$/g, '');
                console.log('🧹 Очищенный client_id:', clientId);
            }

            // Обновляем проект
            const updateData = {
                title: req.body.title,
                slug: req.body.slug,
                description: req.body.description,
                location: req.body.location,
                area: req.body.area,
                project_year: req.body.project_year,
                status: req.body.status,
                project_type_id: req.body.project_type_id,
                client_id: clientId,
                main_image: mainImagePath || req.body.main_image,
                is_featured: req.body.is_featured === 'true' || req.body.is_featured === true
            };

            Object.keys(updateData).forEach(key =>
                updateData[key] === undefined && delete updateData[key]
            );

            let query = 'UPDATE projects SET ';
            const updateValues = [];
            let paramIndex = 1;

            const allowedFields = ['title', 'slug', 'description', 'location', 'area',
                'project_year', 'status', 'project_type_id', 'client_id',
                'main_image', 'is_featured'];

            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    query += `${field} = $${paramIndex}, `;
                    updateValues.push(updateData[field]);
                    paramIndex++;
                }
            });

            if (updateValues.length === 0) {
                return res.status(400).json({ error: 'Нет полей для обновления' });
            }

            query = query.slice(0, -2);
            query += `, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;
            updateValues.push(req.params.id);

            console.log('📝 SQL Query:', query);
            console.log('📝 Values:', updateValues);

            const result = await req.pool.query(query, updateValues);

            // ⭐⭐⭐ ОБРАБОТКА КОМАНДЫ (ВАЖНО!) ⭐⭐⭐
            if (req.body.team_data) {
                try {
                    const teamData = JSON.parse(req.body.team_data);
                    console.log('👥 Сохранение команды:', teamData);

                    // Удаляем старые связи
                    await req.pool.query('DELETE FROM project_team WHERE project_id = $1', [req.params.id]);

                    // Добавляем новые
                    for (const member of teamData) {
                        // Очищаем ID от возможных скобок
                        let cleanTeamId = String(member.id)
                            .replace(/[{}]/g, '')
                            .replace(/^["']|["']$/g, '');

                        await req.pool.query(
                            `INSERT INTO project_team (project_id, team_id, role) VALUES ($1, $2, $3)`,
                            [req.params.id, cleanTeamId, member.role || 'architect']
                        );
                    }
                    console.log('✅ Команда успешно обновлена');
                } catch (err) {
                    console.error('Ошибка обработки team_data:', err);
                }
            }

            // ⭐⭐⭐ ОБРАБОТКА КОМНАТ ⭐⭐⭐
            if (req.body.rooms) {
                try {
                    const rooms = JSON.parse(req.body.rooms);
                    console.log('🏠 Сохранение комнат:', rooms);

                    // Удаляем старые комнаты
                    await req.pool.query('DELETE FROM project_rooms WHERE project_id = $1', [req.params.id]);

                    // Добавляем новые
                    for (const room of rooms) {
                        await req.pool.query(
                            `INSERT INTO project_rooms (project_id, name, area, description) VALUES ($1, $2, $3, $4)`,
                            [req.params.id, room.name, room.area || null, room.description || null]
                        );
                    }
                    console.log('✅ Комнаты успешно обновлены');
                } catch (err) {
                    console.error('Ошибка обработки rooms:', err);
                }
            }

            // ⭐⭐⭐ ОБРАБОТКА ГАЛЕРЕИ (новые изображения) ⭐⭐⭐
            if (req.files && req.files.gallery_images) {
                const images = Array.isArray(req.files.gallery_images)
                    ? req.files.gallery_images
                    : [req.files.gallery_images];

                for (let i = 0; i < images.length; i++) {
                    const fileName = Date.now() + '_' + images[i].name.replace(/\s/g, '_');
                    const uploadPath = 'uploads/projects/' + fileName;
                    await images[i].mv(uploadPath);
                    await req.pool.query(
                        `INSERT INTO project_images (project_id, image_url, sort_order) VALUES ($1, $2, $3)`,
                        [req.params.id, `/uploads/projects/${fileName}`, i]
                    );
                }
            }

            // ⭐⭐⭐ УДАЛЕНИЕ ИЗОБРАЖЕНИЙ ⭐⭐⭐
            if (req.body.delete_images) {
                try {
                    const deleteImages = JSON.parse(req.body.delete_images);
                    for (const imageId of deleteImages) {
                        await req.pool.query('DELETE FROM project_images WHERE id = $1', [imageId]);
                    }
                    console.log('🗑️ Удалены изображения:', deleteImages);
                } catch (err) {
                    console.error('Ошибка удаления изображений:', err);
                }
            }

            // Обновляем награды
            if (req.body.awards) {
                await req.pool.query('DELETE FROM awards WHERE project_id = $1', [req.params.id]);

                const awards = req.body.awards.split(',');
                for (const awardName of awards) {
                    if (awardName.trim()) {
                        await req.pool.query(
                            `INSERT INTO awards (name, project_id, year) VALUES ($1, $2, $3)`,
                            [awardName.trim(), req.params.id, req.body.project_year]
                        );
                    }
                }
            }

            res.json({
                success: true,
                message: 'Проект обновлен',
                project: result.rows[0]
            });

        } catch (error) {
            console.error('Ошибка при обновлении проекта:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await ProjectService.delete(req.params.id, req.pool);

            if (result.success) {
                res.json({ message: result.message });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при удалении проекта:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async uploadImage(req, res) {
        try {
            if (!req.files || !req.files.image) {
                return res.status(400).json({ error: 'Файл не загружен' });
            }

            const image = req.files.image;
            const fileName = Date.now() + '_' + image.name.replace(/\s/g, '_');
            const uploadPath = 'uploads/projects/' + fileName;

            await image.mv(uploadPath);

            // Сохраняем информацию об изображении в БД
            const query = `
                INSERT INTO project_images (project_id, image_url, caption, sort_order, is_main)
                VALUES ($1, $2, $3, $4, $5) RETURNING *
            `;

            const values = [
                req.params.id,
                `/uploads/projects/${fileName}`,
                req.body.caption,
                req.body.sort_order || 0,
                req.body.is_main === 'true'
            ];

            const result = await req.pool.query(query, values);

            res.json({
                message: 'Изображение успешно загружено',
                image: result.rows[0]
            });
        } catch (error) {
            console.error('Ошибка при загрузке изображения:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async deleteImage(req, res) {
        try {
            const result = await req.pool.query(
                'DELETE FROM project_images WHERE id = $1 RETURNING *',
                [req.params.imageId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Изображение не найдено' });
            }

            res.json({ message: 'Изображение удалено' });
        } catch (error) {
            console.error('Ошибка при удалении изображения:', error);
            res.status(500).json({ error: error.message });
        }
    }
    // В ProjectController.js, в начало метода getAllWithFilters добавьте:
    async getAllWithFilters(req, res) {
        try {
            console.log('\n========== PROJECTS API CALLED ==========');
            console.log('Full URL:', req.originalUrl);
            console.log('Query params:', req.query);
            console.log('🔥🔥🔥 getAllWithFilters in CONTROLLER called! 🔥🔥🔥');
            console.log('Query params:', req.query);
            const {
                status,
                type,           // от фронтенда приходит как 'type'
                year,
                search,
                sort,           // от фронтенда приходит как 'sort' (date_desc, title_asc и т.д.)
                page = 1,
                limit = 12
            } = req.query;

            console.log('📥 Распарсенные параметры:', {
                status,
                type,
                year,
                search,
                sort,
                page,
                limit
            });

            // Преобразуем sort из формата фронтенда в формат для SQL
            let sortField = 'p.created_at';
            let sortOrder = 'DESC';

            if (sort) {
                console.log('🔄 Применяем сортировку:', sort);
                switch (sort) {
                    case 'date_desc':
                        sortField = 'p.project_year';
                        sortOrder = 'DESC';
                        break;
                    case 'date_asc':
                        sortField = 'p.project_year';
                        sortOrder = 'ASC';
                        break;
                    case 'title_asc':
                        sortField = 'p.title';
                        sortOrder = 'ASC';
                        break;
                    case 'title_desc':
                        sortField = 'p.title';
                        sortOrder = 'DESC';
                        break;
                    case 'area_desc':
                        sortField = 'p.area';
                        sortOrder = 'DESC';
                        break;
                    case 'area_asc':
                        sortField = 'p.area';
                        sortOrder = 'ASC';
                        break;
                    default:
                        sortField = 'p.created_at';
                        sortOrder = 'DESC';
                }
                console.log('📊 SQL сортировка:', { sortField, sortOrder });
            }

            // Строим запрос
            let query = `
            SELECT 
                p.id, p.title, p.slug, p.location, p.area, 
                p.project_year, p.status, p.main_image, p.description,
                pt.name as project_type_name,
                pt.id as project_type_id
            FROM projects p
            LEFT JOIN project_types pt ON p.project_type_id = pt.id
            WHERE 1=1
        `;

            const values = [];
            let paramIndex = 1;

            // Фильтр по статусу
            if (status && status !== '') {
                query += ` AND p.status = $${paramIndex++}`;
                values.push(status);
                console.log(`🏷️ Фильтр по статусу: ${status}`);
            }

            // Фильтр по типу проекта
            if (type && type !== '') {
                query += ` AND p.project_type_id = $${paramIndex++}`;
                values.push(parseInt(type));
                console.log(`🏷️ Фильтр по типу: ${type}`);
            }

            // Фильтр по году
            if (year && year !== '') {
                query += ` AND p.project_year = $${paramIndex++}`;
                values.push(parseInt(year));
                console.log(`🏷️ Фильтр по году: ${year}`);
            }

            // Поиск по названию
            if (search && search !== '') {
                query += ` AND p.title ILIKE $${paramIndex++}`;
                values.push(`%${search}%`);
                console.log(`🔍 Поиск: ${search}`);
            }

            // Добавляем сортировку
            query += ` ORDER BY ${sortField} ${sortOrder}`;

            // Пагинация
            const offset = (parseInt(page) - 1) * parseInt(limit);
            query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
            values.push(parseInt(limit), offset);

            console.log('\n📝 SQL Query:', query);
            console.log('📝 Values:', values);
            console.log('📝 Offset:', offset, 'Limit:', limit);

            // Выполняем запрос
            const result = await req.pool.query(query, values);
            console.log(`✅ Найдено проектов в БД: ${result.rows.length}`);

            // Получаем общее количество (для пагинации)
            let countQuery = `
            SELECT COUNT(*) as total 
            FROM projects p
            WHERE 1=1
        `;

            const countValues = [];
            let countIndex = 1;

            if (status && status !== '') {
                countQuery += ` AND p.status = $${countIndex++}`;
                countValues.push(status);
            }
            if (type && type !== '') {
                countQuery += ` AND p.project_type_id = $${countIndex++}`;
                countValues.push(parseInt(type));
            }
            if (year && year !== '') {
                countQuery += ` AND p.project_year = $${countIndex++}`;
                countValues.push(parseInt(year));
            }
            if (search && search !== '') {
                countQuery += ` AND p.title ILIKE $${countIndex++}`;
                countValues.push(`%${search}%`);
            }

            console.log('\n📊 Count Query:', countQuery);
            console.log('📊 Count Values:', countValues);

            const countResult = await req.pool.query(countQuery, countValues);
            const total = parseInt(countResult.rows[0].total);

            console.log(`📊 Всего проектов по фильтрам: ${total}`);
            console.log(`📄 Страница: ${page}, Всего страниц: ${Math.ceil(total / parseInt(limit))}`);
            console.log('========== END ==========\n');

            res.json({
                success: true,
                projects: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            });

        } catch (error) {
            console.error('❌ Ошибка в getAllWithFilters:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }


    // Добавить комнату к проекту
    async addRoom(req, res) {
        try {
            const { id } = req.params;
            const { name, area, description } = req.body;

            if (!name || !area) {
                return res.status(400).json({ error: 'Название и площадь обязательны' });
            }

            const result = await ProjectService.addRoom(id, { name, area, description }, req.pool);

            if (result.success) {
                res.status(201).json({
                    message: result.message,
                    room: result.room
                });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка при добавлении комнаты:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Удалить комнату
    async deleteRoom(req, res) {
        try {
            const { roomId } = req.params;
            const result = await ProjectService.deleteRoom(roomId, req.pool);

            if (result.success) {
                res.json({ message: result.message });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка при удалении комнаты:', error);
            res.status(500).json({ error: error.message });
        }
    }
    // В ProjectController.js - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ версия
    async getFullProjectBySlug(req, res) {
        try {
            const { slug } = req.params;

            console.log('Fetching project with slug:', slug);

            // Оптимизированный запрос с JSON агрегацией
            const query = `
            SELECT 
                p.id, p.title, p.slug, p.location, p.area, 
                p.project_year, p.status, p.main_image, p.description,
                c.first_name, c.last_name, c.patronymic, 
                pt.name as project_type,
                COALESCE(
    (SELECT json_agg(json_build_object('image_url', image_url, 'caption', caption, 'sort_order', sort_order) ORDER BY sort_order) 
     FROM public.project_images i 
     WHERE i.project_id = p.id),
    '[]'::json
) as images,
                COALESCE(
                    (SELECT json_agg(
                        json_build_object('name', name, 'area', area, 'description', description) 
                        ORDER BY area DESC)
                     FROM public.project_rooms r 
                     WHERE r.project_id = p.id),
                    '[]'::json
                ) as rooms,
                COALESCE(
    (SELECT json_agg(
        json_build_object(
            'id', t.id,
            'name', t.name,
            'position', t.position,
            'role', pt.role,
            'photo', t.photo,
            'bio', t.bio,
            'email', t.email,
            'phone', t.phone,
            'specialization', t.specialization,
            'experience_years', t.experience_years,
            'projects_count', t.projects_count,
            'awards', t.awards,
            'education', t.education,
            'telegram', t.telegram,
            'linkedin', t.linkedin,
            'rating', t.rating,
            'software_skills', t.software_skills,
            'employment_type', t.employment_type,
            'team_lead', t.team_lead
        ) ORDER BY pt.role, t.sort_order
     ) FROM public.project_team pt
     JOIN public.team t ON pt.team_id = t.id
     WHERE pt.project_id = p.id),
    '[]'::json
) as team
            FROM public.projects p
            LEFT JOIN public.project_types pt ON p.project_type_id = pt.id
            LEFT JOIN public.clients c ON p.client_id = c.client_id
            WHERE p.slug = $1
        `;

            const result = await req.pool.query(query, [slug]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Проект не найден'
                });
            }

            const project = result.rows[0];

            // Формируем полное имя клиента
            let clientFullName = null;
            if (project.first_name || project.last_name) {
                clientFullName = `${project.last_name || ''} ${project.first_name || ''} ${project.patronymic || ''}`.trim();
            }

            // Формируем ответ
            const fullProject = {
                id: project.id,
                title: project.title,
                slug: project.slug,
                location: project.location,
                area: parseFloat(project.area),
                project_year: project.project_year,
                status: project.status,
                main_image: project.main_image,
                description: project.description,
                project_type_name: project.project_type,
                images: project.images || [],
                rooms: project.rooms || [],
                team: project.team || []
            };

            // Добавляем клиента, если есть
            if (clientFullName) {
                fullProject.client = {
                    first_name: project.first_name,
                    last_name: project.last_name,
                    patronymic: project.patronymic,
                    full_name: clientFullName
                };
            }

            console.log('=== SENDING FULL PROJECT ===');
            console.log('Project ID:', fullProject.id);
            console.log('Title:', fullProject.title);
            console.log('Images count:', fullProject.images.length);
            console.log('Rooms count:', fullProject.rooms.length);
            console.log('Team count:', fullProject.team.length);

            res.json({
                success: true,
                data: fullProject
            });

        } catch (error) {
            console.error('Ошибка в getFullProjectBySlug:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getMyProjects(req, res) {
        try {
            const accauntId = req.user?.id;

            console.log('🔍 getMyProjects для клиента, accauntId:', accauntId);

            // Находим клиента
            const clientResult = await req.pool.query(
                `SELECT client_id FROM clients WHERE accaunt_id = $1`,
                [accauntId]
            );

            if (clientResult.rows.length === 0) {
                return res.json({ success: true, projects: [] });
            }

            const clientId = clientResult.rows[0].client_id;
            console.log('✅ Найден clientId:', clientId);

            // ⭐ РАСШИРЕННЫЙ ЗАПРОС с дополнительной информацией
            const projects = await req.pool.query(`
            SELECT 
                p.id, 
                p.title, 
                p.slug, 
                p.location, 
                p.area, 
                p.project_year, 
                p.status, 
                p.main_image, 
                p.description,
                p.created_at,
                pt.name as project_type_name,
                -- Добавляем информацию о команде (если есть)
                COALESCE(
                    (SELECT json_agg(json_build_object('role', pt.role, 'name', t.name))
                     FROM project_team pt
                     JOIN team t ON pt.team_id = t.id
                     WHERE pt.project_id = p.id),
                    '[]'::json
                ) as team_info,
                -- Добавляем количество комнат
                (SELECT COUNT(*) FROM project_rooms WHERE project_id = p.id) as rooms_count
            FROM projects p
            LEFT JOIN project_types pt ON p.project_type_id = pt.id
            WHERE p.client_id = $1
            ORDER BY p.created_at DESC
        `, [clientId]);

            console.log(`✅ Найдено проектов: ${projects.rows.length}`);

            res.json({
                success: true,
                projects: projects.rows
            });

        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Добавьте в конец класса ProjectController (перед export default)

    async getProjectForAdmin(req, res) {
        try {
            const { id } = req.params;

            const query = `
            SELECT 
                p.*,
                pt.name as project_type_name,
                c.first_name, c.last_name, c.patronymic, c.email, c.phone,
                COALESCE(
                    (SELECT json_agg(json_build_object('id', i.id, 'image_url', i.image_url, 'caption', i.caption, 'sort_order', i.sort_order) ORDER BY i.sort_order)
                     FROM project_images i WHERE i.project_id = p.id),
                    '[]'::json
                ) as images,
                COALESCE(
                    (SELECT json_agg(json_build_object('id', r.id, 'name', r.name, 'area', r.area, 'description', r.description) ORDER BY r.area DESC)
                     FROM project_rooms r WHERE r.project_id = p.id),
                    '[]'::json
                ) as rooms,
                COALESCE(
                    (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'role', pt.role))
                     FROM project_team pt
                     JOIN team t ON pt.team_id = t.id
                     WHERE pt.project_id = p.id),
                    '[]'::json
                ) as team
            FROM projects p
            LEFT JOIN project_types pt ON p.project_type_id = pt.id
            LEFT JOIN clients c ON p.client_id = c.client_id
            WHERE p.id = $1
        `;

            const result = await req.pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Проект не найден' });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Ошибка в getProjectForAdmin:', error);
            res.status(500).json({ error: error.message });
        }
    }

}

export default new ProjectController();