import pool from '../config/db.js';

class ProjectTypeService {
   static async getByCategory(categorySlug) {

    const categoryMap = {
        architecture: 1,
        interior: 2
    };

    const categoryId = categoryMap[categorySlug];

    if (!categoryId) {
        throw new Error('Invalid category');
    }

    const result = await pool.query(
        `SELECT id, name, description, category_id 
         FROM project_types 
         WHERE category_id = $1`,
        [categoryId]
    );

    return result.rows;
}

    static async getAll() {
        const result = await pool.query(
            `SELECT id, name, description, category_id 
             FROM project_types `
        );

        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(
            `SELECT * FROM project_types WHERE id = $1`,
            [id]
        );

        return result.rows[0];
    }
}

export default ProjectTypeService;