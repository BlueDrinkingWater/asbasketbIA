// server/routes/newsRoutes.js
import express from 'express';
import { getNews, createNews, updateNews, deleteNews } from '../controllers/newsController.js';
import { protect, admin } from '../middleware/auth.js'; // Import auth middleware

const router = express.Router();

router.get('/', getNews);
router.post('/', protect, admin, createNews);
router.put('/:id', protect, admin, updateNews);
router.delete('/:id', protect, admin, deleteNews);

export default router;