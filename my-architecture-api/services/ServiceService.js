class ServiceService {
    // ServiceService.js

// ServiceService.js - исправьте create метод
async create(serviceData, pool) {
    try {
        const {
            title, description, icon,
            price_range, price_per_sqm, price_fixed,
            category_id, is_active  // ✅ добавить is_active
        } = serviceData;

        const query = `
            INSERT INTO services (title, description, icon, price_range, price_per_sqm, price_fixed, category_id, is_active) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *
        `;

        const iconValue = typeof icon === 'object' ? JSON.stringify(icon) : icon;
        const values = [title, description, iconValue, price_range, price_per_sqm, price_fixed, category_id, is_active !== false];

        const result = await pool.query(query, values);

        return {
            success: true,
            message: 'Услуга успешно создана',
            service: result.rows[0]
        };
    } catch (error) {
        console.error('Ошибка при создании услуги:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

    async update(id, updateData, pool) {
        try {
            const checkResult = await pool.query('SELECT * FROM services WHERE id = $1', [id]);

            if (checkResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'Услуга не найдена',
                    status: 404
                };
            }

            let query = 'UPDATE services SET ';
            const updateValues = [];
            let paramIndex = 1;

            // ✅ ДОБАВИТЬ: обработка price_per_sqm и price_fixed
            if (updateData.title !== undefined) {
                query += `title = $${paramIndex}, `;
                updateValues.push(updateData.title);
                paramIndex++;
            }
            if (updateData.description !== undefined) {
                query += `description = $${paramIndex}, `;
                updateValues.push(updateData.description);
                paramIndex++;
            }
            if (updateData.icon !== undefined) {
                const iconValue = typeof updateData.icon === 'object' ?
                    JSON.stringify(updateData.icon) : updateData.icon;
                query += `icon = $${paramIndex}, `;
                updateValues.push(iconValue);
                paramIndex++;
            }
            if (updateData.price_range !== undefined) {
                query += `price_range = $${paramIndex}, `;
                updateValues.push(updateData.price_range);
                paramIndex++;
            }
            // ✅ КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: проверка на null
            if (updateData.price_per_sqm !== undefined) {
                query += `price_per_sqm = $${paramIndex}, `;
                // Если null или пустая строка - отправляем null
                const priceValue = (updateData.price_per_sqm === '' || updateData.price_per_sqm === 'null')
                    ? null
                    : updateData.price_per_sqm;
                updateValues.push(priceValue);
                paramIndex++;
            }
            if (updateData.price_fixed !== undefined) {
                query += `price_fixed = $${paramIndex}, `;
                const priceValue = (updateData.price_fixed === '' || updateData.price_fixed === 'null')
                    ? null
                    : updateData.price_fixed;
                updateValues.push(priceValue);
                paramIndex++;
            }
            if (updateData.is_active !== undefined) {
                query += `is_active = $${paramIndex}, `;
                updateValues.push(updateData.is_active);
                paramIndex++;
            }

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
                message: 'Услуга обновлена',
                service: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при обновлении услуги:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    // В getByCategorySlug тоже добавьте поля цены (они уже есть, так как SELECT *)

    async getAll(pool) {
        try {
            const result = await pool.query('SELECT * FROM services ORDER BY title')
            return {
                success: true,
                services: result.rows
            }
        } catch (error) {
            console.error('Ошибка при получении услуг:', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    async getOne(id, pool) {
        try {
            const result = await pool.query('SELECT * FROM services WHERE id = $1', [id])

            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Услуга не найдена',
                    status: 404
                }
            }
            return {
                success: true,
                service: result.rows[0]
            }
        } catch (error) {
            console.error('Ошибка при получении услуги:', error)
            return {
                success: false,
                error: error.message
            }
        }
    }


    async delete(id, pool) {
        try {
            const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING *', [id])

            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Услуга не найдена',
                    status: 404
                }
            }

            return {
                success: true,
                message: 'Услуга удалена',
                service: result.rows[0]
            }
        } catch (error) {
            console.error('Ошибка при удалении услуги:', error)
            return {
                success: false,
                error: error.message
            }
        }
    }


    async getByCategorySlug(slug, pool) {
        try {
            // Сначала получаем ID категории по slug
            const catResult = await pool.query('SELECT id FROM service_categories WHERE slug = $1', [slug]);

            if (catResult.rows.length === 0) {
                return { success: true, services: [] };
            }

            const categoryId = catResult.rows[0].id;

            // Простой запрос без JOIN
            const query = `SELECT * FROM services WHERE category_id = $1 AND is_active = true ORDER BY title`;
            const result = await pool.query(query, [categoryId]);

            console.log(`Найдено услуг для категории ${slug} (id=${categoryId}):`, result.rows.length);

            return {
                success: true,
                services: result.rows
            };
        } catch (error) {
            console.error('Ошибка при получении услуг по категории:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

}

export default new ServiceService();