// services/AwardService.js
//наград
class AwardService {
    async create(awardData, pool) {
        try {
            const { name, organization, year, project_id, description } = awardData;
            
            const query = `
                INSERT INTO awards (name, organization, year, project_id, description) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *
            `;
            
            const values = [name, organization, year, project_id, description];
            
            const result = await pool.query(query, values);
            
            return {
                success: true,
                message: 'Награда успешно добавлена',
                award: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при создании награды:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getAll(pool) {
        try {
            const result = await pool.query(
                `SELECT a.*, p.title as project_title 
                 FROM awards a
                 LEFT JOIN projects p ON a.project_id = p.id
                 ORDER BY a.year DESC, a.name`
            );
            
            return {
                success: true,
                awards: result.rows
            };
        } catch (error) {
            console.error('Ошибка при получении наград:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getOne(id, pool) {
        try {
            const result = await pool.query(
                `SELECT a.*, p.title as project_title 
                 FROM awards a
                 LEFT JOIN projects p ON a.project_id = p.id
                 WHERE a.id = $1`,
                [id]
            );
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Награда не найдена',
                    status: 404
                };
            }
            
            return {
                success: true,
                award: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при получении награды:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async update(id, updateData, pool) {
        try {
            const checkResult = await pool.query('SELECT * FROM awards WHERE id = $1', [id]);
            
            if (checkResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'Награда не найдена',
                    status: 404
                };
            }
            
            let query = 'UPDATE awards SET ';
            const updateValues = [];
            let paramIndex = 1;
            
            const fields = ['name', 'organization', 'year', 'project_id', 'description'];
            
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
                message: 'Награда обновлена',
                award: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при обновлении награды:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async delete(id, pool) {
        try {
            const result = await pool.query('DELETE FROM awards WHERE id = $1 RETURNING *', [id]);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Награда не найдена',
                    status: 404
                };
            }
            
            return {
                success: true,
                message: 'Награда удалена',
                award: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при удалении награды:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default new AwardService();