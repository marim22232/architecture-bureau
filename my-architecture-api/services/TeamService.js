// services/TeamService.js
class TeamService {
    async create(memberData, pool) {
        try {
            const { 
                name, position, bio, photo, email, phone, 
                specialization, sort_order, is_active, 
                instagram, linkedin, website,
                // Новые поля
                experience_years, projects_count, awards, education,
                birth_date, telegram, rating, software_skills,
                employment_type, start_date, team_lead
            } = memberData;
            
            const query = `
                INSERT INTO team (
                    name, position, bio, photo, email, phone, 
                    specialization, sort_order, is_active, 
                    instagram, linkedin, website,
                    experience_years, projects_count, awards, education,
                    birth_date, telegram, rating, software_skills,
                    employment_type, start_date, team_lead
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) 
                RETURNING *
            `;
            
            const values = [
                name, position, bio, photo, email, phone, 
                specialization, sort_order || 0, is_active !== false, 
                instagram || null, linkedin || null, website || null,
                experience_years || 0, projects_count || 0, awards || null, education || null,
                birth_date || null, telegram || null, rating || 5.0, software_skills || null,
                employment_type || 'full', start_date || null, team_lead || false
            ];
            
            const result = await pool.query(query, values);
            
            return {
                success: true,
                message: 'Сотрудник успешно добавлен',
                member: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при создании сотрудника:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getAll(pool, activeOnly = false) {
        try {
            let query = 'SELECT * FROM team';
            if (activeOnly) {
                query += ' WHERE is_active = true';
            }
            query += ' ORDER BY sort_order, name';
            
            const result = await pool.query(query);
            
            return {
                success: true,
                team: result.rows
            };
        } catch (error) {
            console.error('Ошибка при получении команды:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getActive(pool) {
        return this.getAll(pool, true);
    }

    async getOne(id, pool) {
        try {
            const result = await pool.query('SELECT * FROM team WHERE id = $1', [id]);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Сотрудник не найден',
                    status: 404
                };
            }
            
            return {
                success: true,
                member: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при получении сотрудника:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async update(id, updateData, pool) {
        try {
            const checkResult = await pool.query('SELECT * FROM team WHERE id = $1', [id]);
            
            if (checkResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'Сотрудник не найден',
                    status: 404
                };
            }
            
            let query = 'UPDATE team SET ';
            const updateValues = [];
            let paramIndex = 1;
            
            const fields = [
                'name', 'position', 'bio', 'photo', 'email', 'phone', 
                'specialization', 'sort_order', 'is_active', 
                'instagram', 'linkedin', 'website',
                'experience_years', 'projects_count', 'awards', 'education',
                'birth_date', 'telegram', 'rating', 'software_skills',
                'employment_type', 'start_date', 'team_lead'
            ];
            
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
                message: 'Сотрудник обновлен',
                member: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при обновлении сотрудника:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async delete(id, pool) {
        try {
            const result = await pool.query('DELETE FROM team WHERE id = $1 RETURNING *', [id]);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Сотрудник не найден',
                    status: 404
                };
            }
            
            return {
                success: true,
                message: 'Сотрудник удален',
                member: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при удалении сотрудника:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default new TeamService();