// services/TestimonialService.js
//для отзывов
class TestimonialService {
   async create(testimonialData, pool) {
        try {
            const { 
                client_name, client_company, client_email, client_id,
                project_id, text, rating, date, is_published, is_featured 
            } = testimonialData;
            
            // Обновленный запрос с полем client_email
            const query = `
                INSERT INTO testimonials (
                    client_name, client_company, client_email, client_id,
                    project_id, text, rating, date, is_published, is_featured
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                RETURNING *
            `;
            
            const values = [
                client_name, client_company || null, client_email || null, client_id || null,
                project_id, text, rating, date || new Date(), 
                is_published || false, is_featured || false
            ];
            
            const result = await pool.query(query, values);
            
            return {
                success: true,
                message: 'Отзыв успешно создан',
                testimonial: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при создании отзыва:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getAll(pool, publishedOnly = true) {
    try {
        let query = 'SELECT t.*, p.title as project_title, p.slug as project_slug FROM testimonials t';
        query += ' LEFT JOIN projects p ON t.project_id = p.id';
        
        if (publishedOnly) {
            query += ' WHERE t.is_published = true';
        }
        
        query += ' ORDER BY t.date DESC';
        
        const result = await pool.query(query);
        
        return {
            success: true,
            testimonials: result.rows
        };
    } catch (error) {
        console.error('Ошибка при получении отзывов:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

    async getFeatured(pool, limit = 5) {
        try {
            const result = await pool.query(
                `SELECT t.*, p.title as project_title 
                 FROM testimonials t
                 LEFT JOIN projects p ON t.project_id = p.id
                 WHERE t.is_published = true AND t.is_featured = true 
                 ORDER BY t.date DESC LIMIT $1`,
                [limit]
            );
            
            return {
                success: true,
                testimonials: result.rows
            };
        } catch (error) {
            console.error('Ошибка при получении избранных отзывов:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getOne(id, pool) {
        try {
            const result = await pool.query(
                `SELECT t.*, p.title as project_title 
                 FROM testimonials t
                 LEFT JOIN projects p ON t.project_id = p.id
                 WHERE t.id = $1`,
                [id]
            );
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Отзыв не найден',
                    status: 404
                };
            }
            
            return {
                success: true,
                testimonial: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при получении отзыва:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async update(id, updateData, pool) {
        try {
            const checkResult = await pool.query('SELECT * FROM testimonials WHERE id = $1', [id]);
            
            if (checkResult.rows.length === 0) {
                return {
                    success: false,
                    error: 'Отзыв не найден',
                    status: 404
                };
            }
            
            let query = 'UPDATE testimonials SET ';
            const updateValues = [];
            let paramIndex = 1;
            
            const fields = ['client_name', 'client_company', 'project_id', 'text', 
                           'rating', 'date', 'is_published', 'is_featured'];
            
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
                message: 'Отзыв обновлен',
                testimonial: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при обновлении отзыва:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async delete(id, pool) {
        try {
            const result = await pool.query('DELETE FROM testimonials WHERE id = $1 RETURNING *', [id]);
            
            if (result.rows.length === 0) {
                return {
                    success: false,
                    error: 'Отзыв не найден',
                    status: 404
                };
            }
            
            return {
                success: true,
                message: 'Отзыв удален',
                testimonial: result.rows[0]
            };
        } catch (error) {
            console.error('Ошибка при удалении отзыва:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default new TestimonialService();