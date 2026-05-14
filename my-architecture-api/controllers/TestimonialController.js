// my-architecture-api/controllers/TestimonialController.js
import TestimonialService from '../services/TestimonialService.js';

class TestimonialController {
    async create(req, res) {
        try {
            const isAdmin = req.user?.role === 'admin';
            const isClient = !!req.clientInfo;

            let testimonialData;

            if (isClient) {
                testimonialData = {
                    client_name: req.clientInfo.full_name || req.body.client_name,
                    client_email: req.user.email,
                    client_id: req.clientInfo.client_id,
                    project_id: req.body.project_id,
                    text: req.body.text,
                    rating: req.body.rating,
                    date: new Date(),
                    is_published: false,
                    is_featured: false
                };

                const existingCheck = await req.pool.query(
                    `SELECT id FROM testimonials 
                     WHERE project_id = $1 AND client_email = $2`,
                    [testimonialData.project_id, testimonialData.client_email]
                );

                if (existingCheck.rows.length > 0) {
                    return res.status(400).json({
                        error: 'Вы уже оставляли отзыв на этот проект'
                    });
                }
            } else if (isAdmin) {
                testimonialData = {
                    client_name: req.body.client_name,
                    client_company: req.body.client_company,
                    project_id: req.body.project_id,
                    text: req.body.text,
                    rating: req.body.rating,
                    date: req.body.date || new Date(),
                    is_published: req.body.is_published === 'true' || req.body.is_published === true,
                    is_featured: req.body.is_featured === 'true' || req.body.is_featured === true
                };
            } else {
                return res.status(403).json({ error: 'У вас нет прав для создания отзыва' });
            }

            const result = await TestimonialService.create(testimonialData, req.pool);

            if (result.success) {
                res.status(201).json({
                    success: true,
                    message: isClient
                        ? 'Спасибо за отзыв! Он будет опубликован после проверки модератором.'
                        : result.message,
                    testimonial: result.testimonial
                });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при создании отзыва:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async checkExisting(req, res) {
        try {
            const { projectId } = req.params;
            const userEmail = req.user?.email;

            if (!userEmail) {
                return res.status(401).json({ error: 'Не авторизован' });
            }

            const result = await req.pool.query(
                `SELECT id, is_published FROM testimonials 
                 WHERE project_id = $1 AND client_email = $2`,
                [projectId, userEmail]
            );

            res.json({
                hasReview: result.rows.length > 0,
                review: result.rows[0] || null
            });
        } catch (error) {
            console.error('Ошибка при проверке отзыва:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async publish(req, res) {
        try {
            const { id } = req.params;
            const { is_published } = req.body;

            const result = await req.pool.query(
                `UPDATE testimonials 
                 SET is_published = $1, updated_at = NOW()
                 WHERE id = $2 RETURNING *`,
                [is_published, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Отзыв не найден' });
            }

            res.json({
                success: true,
                message: is_published ? 'Отзыв опубликован' : 'Отзыв скрыт',
                testimonial: result.rows[0]
            });
        } catch (error) {
            console.error('Ошибка публикации отзыва:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const publishedOnly = req.query.published !== 'false';
            const result = await TestimonialService.getAll(req.pool, publishedOnly);

            if (result.success) {
                res.json(result.testimonials);
            } else {
                res.status(500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении отзывов:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getFeatured(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 5;
            const result = await TestimonialService.getFeatured(req.pool, limit);

            if (result.success) {
                res.json(result.testimonials);
            } else {
                res.status(500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении избранных отзывов:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getOne(req, res) {
        try {
            const result = await TestimonialService.getOne(req.params.id, req.pool);

            if (result.success) {
                res.json(result.testimonial);
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении отзыва:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const updateData = {
                client_name: req.body.client_name,
                client_company: req.body.client_company,
                project_id: req.body.project_id,
                text: req.body.text,
                rating: req.body.rating,
                date: req.body.date,
                is_published: req.body.is_published,
                is_featured: req.body.is_featured
            };

            Object.keys(updateData).forEach(key =>
                updateData[key] === undefined && delete updateData[key]
            );

            const result = await TestimonialService.update(req.params.id, updateData, req.pool);

            if (result.success) {
                res.json({
                    message: result.message,
                    testimonial: result.testimonial
                });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при обновлении отзыва:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await TestimonialService.delete(req.params.id, req.pool);

            if (result.success) {
                res.json({ message: result.message });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при удалении отзыва:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getMyTestimonials(req, res) {
        try {
            const userEmail = req.user?.email;
            const result = await req.pool.query(
                `SELECT t.*, p.title as project_title, p.slug as project_slug
                 FROM testimonials t
                 LEFT JOIN projects p ON t.project_id = p.id
                 WHERE t.client_email = $1 
                 ORDER BY t.date DESC`,
                [userEmail]
            );
            res.json({
                success: true,
                testimonials: result.rows
            });
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // ⭐ РЕДАКТИРОВАНИЕ СВОЕГО ОТЗЫВА
    async updateMyTestimonial(req, res) {
        try {
            console.log('🔧 updateMyTestimonial вызван');
            const { id } = req.params;
            const userEmail = req.user?.email;
            const { text, rating } = req.body;
            
            if (!id || !text) {
                return res.status(400).json({ error: 'Неверные параметры' });
            }
            
            // Проверяем, принадлежит ли отзыв этому клиенту
            const checkResult = await req.pool.query(
                `SELECT id, client_email FROM testimonials WHERE id = $1`,
                [id]
            );
            
            if (checkResult.rows.length === 0) {
                return res.status(404).json({ error: 'Отзыв не найден' });
            }
            
            const testimonial = checkResult.rows[0];
            
            if (testimonial.client_email !== userEmail) {
                return res.status(403).json({ error: 'Вы можете редактировать только свои отзывы' });
            }
            
            // Обновляем отзыв
            const result = await req.pool.query(
                `UPDATE testimonials 
                 SET text = $1, rating = $2, updated_at = NOW()
                 WHERE id = $3 RETURNING *`,
                [text, rating, id]
            );
            
            res.json({
                success: true,
                message: 'Отзыв успешно обновлен',
                testimonial: result.rows[0]
            });
        } catch (error) {
            console.error('Ошибка при обновлении отзыва:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // ⭐ УДАЛЕНИЕ СВОЕГО ОТЗЫВА
    async deleteMyTestimonial(req, res) {
        try {
            console.log('🗑️ deleteMyTestimonial вызван');
            const { id } = req.params;
            const userEmail = req.user?.email;
            
            // Проверяем, принадлежит ли отзыв этому клиенту
            const checkResult = await req.pool.query(
                `SELECT id, client_email FROM testimonials WHERE id = $1`,
                [id]
            );
            
            if (checkResult.rows.length === 0) {
                return res.status(404).json({ error: 'Отзыв не найден' });
            }
            
            const testimonial = checkResult.rows[0];
            
            if (testimonial.client_email !== userEmail) {
                return res.status(403).json({ error: 'Вы можете удалять только свои отзывы' });
            }
            
            await req.pool.query(`DELETE FROM testimonials WHERE id = $1`, [id]);
            
            res.json({
                success: true,
                message: 'Отзыв успешно удален'
            });
        } catch (error) {
            console.error('Ошибка при удалении отзыва:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new TestimonialController();