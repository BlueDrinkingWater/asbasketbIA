import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'News title is required'],
    trim: true 
  },
  summary: {
    type: String,
    required: [true, 'Summary is required for the card view'],
    maxLength: 150
  },
  content: { 
    type: String, 
    required: [true, 'Article content is required'] 
  },
  category: {
    type: String,
    enum: ['Recap', 'Announcement', 'Trade', 'Interview', 'Highlight'],
    default: 'Recap'
  },
  imageUrl: { 
    type: String, 
    // FIX: Changed to ui-avatars.com
    default: 'https://ui-avatars.com/api/?name=News&background=random&size=800' 
  },
  author: { type: String, default: 'League Official' },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('News', newsSchema);