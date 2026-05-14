// services/PartnerService.js
//для партнеров
class PartnerService {
    async create(partnerData, pool) {
        try {
            const { name, logo, website, description, is_active } = partnerData;
            
            const query = `
                INSERT INTO partners (name, logo, website, description, is_active) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *
            `;
            
            const values = [name, logo, website, description, is_active !== false];
            
            const result = await pool.query(query, values);
            
            return {
                success: true,
                message: 'Партнер успешно добавлен',
                partner: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при создании партнера:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getAll(pool, activeOnly = true) {
        try {
            let query = 'SELECT * FROM partners';
            if (activeOnly) {
                query += ' WHERE is_active = true';
            }
            query += ' ORDER BY name';
            
            const result = await pool.query(query);
            
            return {
                success: true,
                partners: result.rows
            };
        } catch (error) {
            console.error('Ошибка при получении партнеров:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getOne(id, pool) {
        try {
            const result = await pool.query('SELECT * FROM partners WHERE id = $1', [id]);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Партнер не найден',
                    status: 404
                };
            }
            
            return {
                success: true,
                partner: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при получении партнера:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async update(id, updateData, pool) {
        try {
            const checkResult = await pool.query('SELECT * FROM partners WHERE id = $1', [id]);
            
            if (checkResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'Партнер не найден',
                    status: 404
                };
            }
            
            let query = 'UPDATE partners SET ';
            const updateValues = [];
            let paramIndex = 1;
            
            const fields = ['name', 'logo', 'website', 'description', 'is_active'];
            
            fields.forEach(field => {
                if (updateData[field] !== undefined) {
                    query += `${field} = $${paramIndex}, `;
                    updateValues.push(updateData[field]);
                    paramIndex++;
                }
            });
            
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
                message: 'Партнер обновлен',
                partner: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при обновлении партнера:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async delete(id, pool) {
        try {
            const result = await pool.query('DELETE FROM partners WHERE id = $1 RETURNING *', [id]);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Партнер не найден',
                    status: 404
                };
            }
            
            return {
                success: true,
                message: 'Партнер удален',
                partner: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при удалении партнера:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default new PartnerService();