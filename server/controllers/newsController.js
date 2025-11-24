// server/controllers/newsController.js
import News from '../models/News.js';

export const getNews = async (req, res, next) => {
  try {
    // Fetch published news, sorted by newest first
    const news = await News.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: news });
  } catch (error) {
    next(error);
  }
};

export const createNews = async (req, res, next) => {
  try {
    const { title, summary, content, category, imageUrl } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and Content are required' });
    }

    const article = await News.create({
      title,
      summary: summary || content.substring(0, 147) + '...',
      content,
      category,
      imageUrl
    });

    res.status(201).json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

// NEW: Update existing news
export const updateNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await News.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    
    if (!article) {
      return res.status(404).json({ success: false, message: 'News article not found' });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

// NEW: Delete news
export const deleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await News.findByIdAndDelete(id);
    
    if (!article) {
      return res.status(404).json({ success: false, message: 'News article not found' });
    }

    res.json({ success: true, message: 'News article deleted' });
  } catch (error) {
    next(error);
  }
};