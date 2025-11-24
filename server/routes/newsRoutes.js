import express from 'express';
import { getNews, createNews } from '../controllers/newsController.js';
const router = express.Router();
router.get('/', getNews);
router.post('/', createNews); // Add auth middleware here later
export default router;