class SearchController {
    async search(req, res) {
        try {
            const { q } = req.query;
            
            if (!q || q.length < 2) {
                return res.json({ projects: [], posts: [] });
            }
            
            const searchTerm = `%${q}%`;
            
            // Поиск по проектам
            const projectsResult = await req.pool.query(
                `SELECT id, title, slug, description, location, main_image 
                 FROM projects 
                 WHERE title ILIKE $1 OR description ILIKE $1 OR location ILIKE $1
                 LIMIT 10`,
                [searchTerm]
            );
            
            // Поиск по статьям блога
            const postsResult = await req.pool.query(
                `SELECT id, title, slug, excerpt, cover_image 
                 FROM posts 
                 WHERE is_published = true AND (title ILIKE $1 OR excerpt ILIKE $1 OR content ILIKE $1)
                 LIMIT 10`,
                [searchTerm]
            );
            
            // Поиск по услугам
            const servicesResult = await req.pool.query(
                `SELECT id, title, description 
                 FROM services 
                 WHERE is_active = true AND (title ILIKE $1 OR description ILIKE $1)
                 LIMIT 5`,
                [searchTerm]
            );
            
            res.json({
                query: q,
                projects: projectsResult.rows,
                posts: postsResult.rows,
                services: servicesResult.rows
            });
        } catch (error) {
            console.error('Ошибка при поиске:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new SearchController();