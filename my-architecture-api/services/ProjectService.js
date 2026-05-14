class ProjectService {
   /* async create(projectData, pool) {
        try {
            const {
                title, slug, description, location, area, project_year,
                status, project_type_id, client, awards, main_image
            } = projectData;

            // Генерируем slug из title, если не указан
            const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            const query = `
                INSERT INTO projects (
                    title, slug, description, location, area, project_year, 
                    status, project_type_id, client, awards, main_image
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
                RETURNING *
            `;

            const values = [title, finalSlug, description, location, area, project_year,
                status, project_type_id, client, awards, main_image];

            const result = await pool.query(query, values);

            return {
                success: true,
                message: 'Проект успешно создан',
                project: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при создании проекта:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }*/

    async getAll(pool, filters = {}, pagination = {}) {
        try {
            let query = 'SELECT * FROM projects WHERE 1=1';
            const values = [];
            let paramIndex = 1;

            // Фильтрация
            if (filters.status) {
                query += ` AND status = $${paramIndex}`;
                values.push(filters.status);
                paramIndex++;
            }
            if (filters.project_type_id) {
                query += ` AND project_type_id = $${paramIndex}`;
                values.push(filters.project_type_id);
                paramIndex++;
            }
            if (filters.year) {
                query += ` AND project_year = $${paramIndex}`;
                values.push(filters.year);
                paramIndex++;
            }

            // Сортировка
            query += ' ORDER BY created_at DESC';

            // Пагинация
            const page = pagination.page || 1;
            const limit = pagination.limit || 10;
            const offset = (page - 1) * limit;

            query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            values.push(limit, offset);

            // Получаем общее количество для пагинации
            const countResult = await pool.query('SELECT COUNT(*) FROM projects');
            const total = parseInt(countResult.rows[0].count);

            const result = await pool.query(query, values);

            return {
                success: true,
                projects: result.rows,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Ошибка при получении проектов:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getBySlug(slug, pool) {
        try {
            const result = await pool.query(
                `SELECT p.*, pt.name as project_type_name, pt.description as project_type_description
                 FROM projects p
                 LEFT JOIN project_types pt ON p.project_type_id = pt.id
                 WHERE p.slug = $1`,
                [slug]
            );

            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Проект не найден',
                    status: 404
                };
            }

            // Получаем изображения проекта
            const imagesResult = await pool.query(
                'SELECT * FROM project_images WHERE project_id = $1 ORDER BY sort_order',
                [result.rows[0].id]
            );

            // Получаем команду проекта
            const teamResult = await pool.query(
                `SELECT t.*, pt.role 
                 FROM team t
                 JOIN project_team pt ON t.id = pt.team_id
                 WHERE pt.project_id = $1`,
                [result.rows[0].id]
            );

            const project = {
                ...result.rows[0],
                images: imagesResult.rows,
                team: teamResult.rows
            };

            return {
                success: true,
                project
            };
        } catch (error) {
            console.error('Ошибка при получении проекта:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getFeatured(pool, limit = 6) {
        try {
            const result = await pool.query(
                'SELECT * FROM projects WHERE is_featured = true ORDER BY created_at DESC LIMIT $1',
                [limit]
            );

            return {
                success: true,
                projects: result.rows
            };
        } catch (error) {
            console.error('Ошибка при получении избранных проектов:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async update(id, updateData, pool) {
        try {
            const checkResult = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);

            if (checkResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'Проект не найден',
                    status: 404
                };
            }

            let query = 'UPDATE projects SET ';
            const updateValues = [];
            let paramIndex = 1;

            const fields = ['title', 'slug', 'description', 'location', 'area',
                'project_year', 'status', 'project_type_id', 'client',
                'awards', 'main_image', 'is_featured'];

            fields.forEach(field => {
                if (updateData[field] !== undefined) {
                    query += `${field} = $${paramIndex}, `;
                    updateValues.push(updateData[field]);
                    paramIndex++;
                }
            });

            query += 'updated_at = CURRENT_TIMESTAMP, ';

            if (updateValues.length === 0) {
                return {
                    success: false,
                    error: 'Нет полей для обновления',
                    status: 400
                };
            }

            query = query.slice(0, -2);
            query += ` WHERE id = $${paramIndex} RETURNING *`;
            updateValues.push(id);

            const result = await pool.query(query, updateValues);

            return {
                success: true,
                message: 'Проект обновлен',
                project: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при обновлении проекта:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async delete(id, pool) {
        try {
            const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);

            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Проект не найден',
                    status: 404
                };
            }

            return {
                success: true,
                message: 'Проект удален',
                project: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при удалении проекта:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Добавьте эти методы в существующий класс ProjectService

    // Получить полный проект с комнатами и изображениями
    async getFullProjectBySlug(slug, pool) {
        try {
            // Основная информация с JOIN для получения названий
            const projectQuery = `
            SELECT 
                p.*, 
                pt.name as project_type_name,
                c.first_name, c.last_name, c.patronymic,
                c.email, c.phone
            FROM projects p
            LEFT JOIN project_types pt ON p.project_type_id = pt.id
            LEFT JOIN clients c ON p.client_id = c.id
            WHERE p.slug = $1
        `;

            const result = await pool.query(projectQuery, [slug]);

            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Проект не найден',
                    status: 404
                };
            }

            const project = result.rows[0];

            // Получаем ВСЕ изображения проекта (не только main_image)
            const imagesResult = await pool.query(
                `SELECT id, image_url, caption, sort_order, is_main 
             FROM project_images 
             WHERE project_id = $1 
             ORDER BY sort_order NULLS LAST, created_at ASC`,
                [project.id]
            );

            // Получаем комнаты/помещения проекта
            const roomsResult = await pool.query(
                `SELECT id, name, area, description 
             FROM project_rooms 
             WHERE project_id = $1 
             ORDER BY area DESC`,
                [project.id]
            );

            // Получаем команду проекта (если есть)
            const teamResult = await pool.query(
                `SELECT t.id, t.name, t.position, t.photo, pt.role 
             FROM team t
             JOIN project_team pt ON t.id = pt.team_id
             WHERE pt.project_id = $1`,
                [project.id]
            );

            // Формируем полный объект проекта
            const fullProject = {
                ...project,
                images: imagesResult.rows,
                rooms: roomsResult.rows,
                team: teamResult.rows,
                // Форматируем ФИО клиента для удобства
                client_full_name: project.first_name || project.last_name
                    ? `${project.last_name || ''} ${project.first_name || ''} ${project.patronymic || ''}`.trim()
                    : project.client // если client поле как текст
            };

            return {
                success: true,
                project: fullProject
            };
        } catch (error) {
            console.error('Ошибка при получении полного проекта:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Получить проекты с фильтрацией по типу и году (для страницы списка)
    // В ProjectService.js добавьте:

async getAllWithFilters(pool, filters = {}, pagination = {}) {
     console.log('📦 getAllWithFilters in SERVICE called!');
    console.log('Filters:', filters);
    
    try {
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

        // Фильтры
        if (filters.status) {
            query += ` AND p.status = $${paramIndex++}`;
            values.push(filters.status);
        }
        
        if (filters.type) {
            query += ` AND p.project_type_id = $${paramIndex++}`;
            values.push(parseInt(filters.type));
        }
        
        if (filters.year) {
            query += ` AND p.project_year = $${paramIndex++}`;
            values.push(parseInt(filters.year));
        }
        
        if (filters.search) {
            query += ` AND p.title ILIKE $${paramIndex++}`;
            values.push(`%${filters.search}%`);
        }

        // Сортировка
        const sortField = filters.sort_field || 'p.created_at';
        const sortOrder = filters.sort_order || 'DESC';
        query += ` ORDER BY ${sortField} ${sortOrder}`;

        // Пагинация
        const page = pagination.page || 1;
        const limit = pagination.limit || 12;
        const offset = (page - 1) * limit;
        
        query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        values.push(limit, offset);

        const result = await pool.query(query, values);

        // Count query
        let countQuery = `SELECT COUNT(*) as total FROM projects p WHERE 1=1`;
        const countValues = [];
        let countIndex = 1;
        
        if (filters.status) {
            countQuery += ` AND status = $${countIndex++}`;
            countValues.push(filters.status);
        }
        if (filters.type) {
            countQuery += ` AND project_type_id = $${countIndex++}`;
            countValues.push(parseInt(filters.type));
        }
        if (filters.year) {
            countQuery += ` AND project_year = $${countIndex++}`;
            countValues.push(parseInt(filters.year));
        }
        if (filters.search) {
            countQuery += ` AND title ILIKE $${countIndex++}`;
            countValues.push(`%${filters.search}%`);
        }
        
        const countResult = await pool.query(countQuery, countValues);
        const total = parseInt(countResult.rows[0].total);

        return {
            success: true,
            projects: result.rows,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Ошибка в getAllWithFilters:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

    // Добавление комнаты к проекту
    async addRoom(projectId, roomData, pool) {
        try {
            const { name, area, description } = roomData;

            const query = `
            INSERT INTO project_rooms (project_id, name, area, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

            const result = await pool.query(query, [projectId, name, area, description]);

            return {
                success: true,
                room: result.rows[0],
                message: 'Комната добавлена'
            };
        } catch (error) {
            console.error('Ошибка при добавлении комнаты:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Удаление комнаты
    async deleteRoom(roomId, pool) {
        try {
            const result = await pool.query(
                'DELETE FROM project_rooms WHERE id = $1 RETURNING *',
                [roomId]
            );

            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Комната не найдена',
                    status: 404
                };
            }

            return {
                success: true,
                message: 'Комната удалена'
            };
        } catch (error) {
            console.error('Ошибка при удалении комнаты:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    // services/ProjectService.js - добавьте этот метод в конец класса

    /*async getMyProjects(accauntId, pool) {
        try {
            // 1. Находим client_id по accaunt_id из таблицы clients
            const clientResult = await pool.query(
                `SELECT client_id FROM clients WHERE accaunt_id = $1`,
                [accauntId]
            );

            let clientId = null;
            if (clientResult.rows.length > 0) {
                clientId = clientResult.rows[0].client_id;
            } else {
                // Если клиент не найден, возможно это сотрудник (team)
                // Для сотрудников показываем все проекты? Или только свои?
                // Пока возвращаем пустой массив
                return {
                    success: true,
                    projects: []
                };
            }

            // 2. Получаем проекты по client_id с дополнительной информацией
            const query = `
            SELECT 
                p.id, p.title, p.slug, p.location, p.area, 
                p.project_year, p.status, p.main_image, p.description,
                pt.name as project_type_name,
                COALESCE(
                    (SELECT json_agg(json_build_object('image_url', image_url, 'caption', caption)) 
                     FROM project_images i 
                     WHERE i.project_id = p.id LIMIT 1),
                    NULL
                ) as images
            FROM projects p
            LEFT JOIN project_types pt ON p.project_type_id = pt.id
            WHERE p.client_id = $1
            ORDER BY p.created_at DESC
        `;

            const result = await pool.query(query, [clientId]);

            return {
                success: true,
                projects: result.rows
            };
        } catch (error) {
            console.error('Ошибка при получении проектов пользователя:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }*/

        async createFullProject(projectData, files, pool) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // 1. Создаем или находим клиента
            let clientId = null;
            if (projectData.client_id) {
                clientId = projectData.client_id;
            }
            
            // 2. Создаем основной проект
            const slug = projectData.slug || this.generateSlug(projectData.title);
            const projectResult = await client.query(`
                INSERT INTO projects (
                    title, slug, description, location, area, project_year,
                    status, project_type_id, client_id, awards, is_featured
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `, [
                projectData.title, slug, projectData.description, projectData.location, projectData.area,
                projectData.project_year, projectData.status, projectData.project_type_id, clientId,
                projectData.awards, projectData.is_featured || false
            ]);
            
            const project = projectResult.rows[0];
            
            // 3. Сохраняем главное изображение
            if (files?.main_image) {
                const mainImagePath = await this.saveImage(files.main_image, 'projects');
                await client.query(
                    `UPDATE projects SET main_image = $1 WHERE id = $2`,
                    [mainImagePath, project.id]
                );
            }
            
            await client.query('COMMIT');
            
            return {
                success: true,
                message: 'Проект успешно создан',
                project: project
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Ошибка:', error);
            return {
                success: false,
                error: error.message
            };
        } finally {
            client.release();
        }
    }

    // Вспомогательные методы
    generateSlug(title) {
        return title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
    }

    async saveImage(file, subfolder) {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        const uploadDir = path.join('uploads', subfolder);
        await fs.mkdir(uploadDir, { recursive: true });
        
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const filePath = path.join(uploadDir, fileName);
        
        await file.mv(filePath);
        
        return `/${uploadDir.replace(/\\/g, '/')}/${fileName}`;
    }


}

export default new ProjectService();