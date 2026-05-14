class SiteSettingsController {
    async get(req, res) {
        try {
            const result = await req.pool.query('SELECT * FROM site_settings LIMIT 1');
            
            if (result.rows.length === 0) {
                // Если настроек нет, создаем пустые
                const newSettings = await req.pool.query(
                    'INSERT INTO site_settings DEFAULT VALUES RETURNING *'
                );
                return res.json(newSettings.rows[0]);
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Ошибка при получении настроек:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const { phone, email, address, instagram, facebook, linkedin } = req.body;
            
            // Проверяем, есть ли запись
            const checkResult = await req.pool.query('SELECT id FROM site_settings LIMIT 1');
            
            let result;
            
            if (checkResult.rows.length === 0) {
                // Создаем новую запись
                result = await req.pool.query(
                    `INSERT INTO site_settings (phone, email, address, instagram, facebook, linkedin)
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                    [phone, email, address, instagram, facebook, linkedin]
                );
            } else {
                // Обновляем существующую
                result = await req.pool.query(
                    `UPDATE site_settings 
                     SET phone = COALESCE($1, phone),
                         email = COALESCE($2, email),
                         address = COALESCE($3, address),
                         instagram = COALESCE($4, instagram),
                         facebook = COALESCE($5, facebook),
                         linkedin = COALESCE($6, linkedin)
                     WHERE id = $7 RETURNING *`,
                    [phone, email, address, instagram, facebook, linkedin, checkResult.rows[0].id]
                );
            }
            
            res.json({
                message: 'Настройки сохранены',
                settings: result.rows[0]
            });
        } catch (error) {
            console.error('Ошибка при обновлении настроек:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new SiteSettingsController();