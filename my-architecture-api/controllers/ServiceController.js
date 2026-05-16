import ServiceService from "../services/ServiceService.js";
class ServiceController {
    async create(req, res) {
        try {
            let iconPath = null;
            let iconData = null;

            // Проверяем, есть ли загруженный файл
            if (req.files && req.files.icon) {
                const icon = req.files.icon;
                const fileName = Date.now() + '_' + icon.name.replace(/\s/g, '_');
                const uploadPath = 'uploads/' + fileName;

                // Сохраняем файл
                await icon.mv(uploadPath);
                iconPath = `/uploads/${fileName}`;
            }

            // Проверяем, пришли ли данные иконки как JSON
            if (req.body.icon && typeof req.body.icon === 'string') {
                try {
                    iconData = JSON.parse(req.body.icon);
                } catch (e) {
                    iconData = req.body.icon;
                }
            }

            const serviceData = {
                title: req.body.title,
                description: req.body.description,
                icon: iconData || req.body.icon || null,
                price_range: req.body.price_range,
                category_id: req.body.category_id,  // ← ДОБАВИТЬ ЭТУ СТРОКУ!
                is_active: req.body.is_active === 'false' ? false : true,
            };

            const result = await ServiceService.create(serviceData, req.pool);

            if (result.success) {
                res.status(201).json({
                    message: result.message,
                    service: result.service
                });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при создании:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const result = await ServiceService.getAll(req.pool);

            if (result.success) {
                res.json(result.services);
            } else {
                res.status(500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении всех:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getOne(req, res) {
        try {
            const result = await ServiceService.getOne(req.params.id, req.pool);

            if (result.success) {
                res.json(result.service);
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении одной:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            let iconPath = null;
            let iconData = null;

            // Проверяем, есть ли новый загруженный файл
            if (req.files && req.files.icon) {
                const icon = req.files.icon;
                const fileName = Date.now() + '_' + icon.name.replace(/\s/g, '_');
                const uploadPath = 'uploads/' + fileName;

                // Сохраняем файл
                await icon.mv(uploadPath);
                iconPath = `/uploads/${fileName}`;
            }

            // Проверяем, пришли ли данные иконки как JSON
            if (req.body.icon && typeof req.body.icon === 'string') {
                try {
                    iconData = JSON.parse(req.body.icon);
                } catch (e) {
                    iconData = req.body.icon;
                }
            }

            // Подготавливаем данные для обновления
            const updateData = {
                title: req.body.title,
                description: req.body.description,
                icon: iconData || req.body.icon,
                price_range: req.body.price_range,
                is_active: req.body.is_active,
            };

            // Удаляем undefined поля
            Object.keys(updateData).forEach(key =>
                updateData[key] === undefined && delete updateData[key]
            );

            const result = await ServiceService.update(req.params.id, updateData, req.pool);

            if (result.success) {
                res.json({
                    message: result.message,
                    service: result.service
                });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при обновлении:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await ServiceService.delete(req.params.id, req.pool);

            if (result.success) {
                res.json({
                    message: result.message,
                    service: result.service
                });
            } else {
                res.status(result.status || 500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при удалении:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getPopular(req, res) {
        try {
            const result = await ServiceService.getPopular(req.pool);

            if (result.success) {
                res.json(result.services);
            } else {
                res.status(500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка в контроллере при получении популярных:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Новый метод для загрузки только иконки
    async uploadIcon(req, res) {
        try {
            if (!req.files || !req.files.icon) {
                return res.status(400).json({ error: 'Файл не загружен' });
            }

            const icon = req.files.icon;
            const fileName = Date.now() + '_' + icon.name.replace(/\s/g, '_');
            const uploadPath = 'uploads/' + fileName;

            // Сохраняем файл
            await icon.mv(uploadPath);

            res.json({
                message: 'Файл успешно загружен',
                fileName: fileName,
                path: `/uploads/${fileName}`
            });
        } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async getByCategorySlug(req, res) {
        try {
            const { slug } = req.params;
            const result = await ServiceService.getByCategorySlug(slug, req.pool);

            if (result.success) {
                res.json(result.services);
            } else {
                res.status(500).json({ error: result.error });
            }
        } catch (error) {
            console.error('Ошибка:', error);
            res.status(500).json({ error: error.message });
        }

    }
    async getCategories(req, res) {
  try {
    console.log('📡 getCategories вызван');
    const result = await req.pool.query(
      'SELECT id, name, slug FROM service_categories ORDER BY id'
    );
    console.log('✅ Найдено категорий:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Ошибка получения категорий:', error);
    res.status(500).json({ error: error.message });
  }
}

}

export default new ServiceController();