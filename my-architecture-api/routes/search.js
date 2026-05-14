//для поиска
import { Router } from 'express';
import SearchController from '../controllers/SearchController.js';

const router = new Router();

router.get('/', SearchController.search);

export default router;