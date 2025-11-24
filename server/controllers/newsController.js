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
    
    // Basic Validation
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