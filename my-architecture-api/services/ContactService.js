// ContactService.js
class ContactService {
   
  async create(contactData, pool) {
    try {
        const { 
            name, email, phone, message,
            project_type_id, selected_services, area
        } = contactData;
        
        const query = `
            INSERT INTO contacts (name, email, phone, message, project_type_id, selected_services, area, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'new') 
            RETURNING *
        `;
        
        const values = [
            name, 
            email || null, 
            phone, 
            message || null,
            project_type_id || null,
            selected_services || null,
            area || null
        ];
        
        const result = await pool.query(query, values);
        
        return {
            success: true,
            message: 'Заявка успешно отправлена',
            contact: result.rows[0]
        };
    } catch (error) {
        console.error('Ошибка при создании контакта:', error);
        return {
            success: false,
            error: error.message
        };
    }
  }

  // ⭐ ИСПРАВЛЕННЫЙ МЕТОД getAll - используем s.title
  async getAll(pool, status = null) {
    try {
        let query = `
            SELECT c.*,
                   array_agg(s.title) FILTER (WHERE s.id IS NOT NULL) as service_names
            FROM contacts c
            LEFT JOIN services s ON s.id = ANY(c.selected_services)
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `;
        let values = [];
        
        if (status) {
            query = `
                SELECT c.*,
                       array_agg(s.title) FILTER (WHERE s.id IS NOT NULL) as service_names
                FROM contacts c
                LEFT JOIN services s ON s.id = ANY(c.selected_services)
                WHERE c.status = $1
                GROUP BY c.id
                ORDER BY c.created_at DESC
            `;
            values = [status];
        }
        
        const result = await pool.query(query, values);
        
        const contacts = result.rows.map(contact => ({
            ...contact,
            service_names: contact.service_names || [],
            selected_services: contact.selected_services || []
        }));
        
        return {
            success: true,
            contacts: contacts
        };
    } catch (error) {
        console.error('Ошибка при получении контактов:', error);
        return {
            success: false,
            error: error.message
        };
    }
  }

  // ⭐ ИСПРАВЛЕННЫЙ МЕТОД getOne - используем s.title
  async getOne(id, pool) {
    try {
        const query = `
            SELECT c.*,
                   array_agg(s.title) FILTER (WHERE s.id IS NOT NULL) as service_names,
                   array_agg(s.id) FILTER (WHERE s.id IS NOT NULL) as service_ids
            FROM contacts c
            LEFT JOIN services s ON s.id = ANY(c.selected_services)
            WHERE c.id = $1
            GROUP BY c.id
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return {
                success: false,
                error: 'Заявка не найдена',
                status: 404
            };
        }
        
        const contact = {
            ...result.rows[0],
            service_names: result.rows[0].service_names || [],
            service_ids: result.rows[0].service_ids || []
        };
        
        return {
            success: true,
            contact: contact
        };
    } catch (error) {
        console.error('Ошибка при получении контакта:', error);
        return {
            success: false,
            error: error.message
        };
    }
  }

  async updateStatus(id, status, pool) {
    try {
        const validStatuses = ['new', 'in_progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return {
                success: false,
                error: 'Некорректный статус',
                status: 400
            };
        }
        
        const result = await pool.query(
            'UPDATE contacts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [status, id]
        );
        
        if (result.rows.length === 0) {
            return {
                success: false,
                error: 'Заявка не найдена',
                status: 404
            };
        }
        
        return {
            success: true,
            message: 'Статус обновлен',
            contact: result.rows[0]
        };
    } catch (error) {
        console.error('Ошибка при обновлении статуса:', error);
        return {
            success: false,
            error: error.message
        };
    }
  }

  async delete(id, pool) {
    try {
        const result = await pool.query('DELETE FROM contacts WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return {
                success: false,
                error: 'Заявка не найдена',
                status: 404
            };
        }
        
        return {
            success: true,
            message: 'Заявка удалена'
        };
    } catch (error) {
        console.error('Ошибка при удалении контакта:', error);
        return {
            success: false,
            error: error.message
        };
    }
  }
}

export default new ContactService();