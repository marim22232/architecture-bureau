import ProjectTypeService from '../services/ProjectTypeService.js';

class ProjectTypeController {
    static async getByCategory(req, res) {
        try {
            const { category } = req.query;

            if (!category) {
                return res.status(400).json({ error: 'Category is required' });
            }

            const projectTypes = await ProjectTypeService.getByCategory(category);
            res.json(projectTypes);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }
    }

    static async getAll(req, res) {
        try {
            const data = await ProjectTypeService.getAll();
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    }

    static async getById(req, res) {
        try {
            const data = await ProjectTypeService.getById(req.params.id);
            res.json(data);
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    }
}

export default ProjectTypeController;