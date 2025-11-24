import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Calendar, User, Tag } from 'lucide-react';

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get('/news')
      .then(res => {
        setArticles(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load news feed. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center text-white">Loading News...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-8 border-l-4 border-orange-500 pl-4 uppercase tracking-wide">
          League News & Updates
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((news) => (
            <div key={news._id} className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl transition duration-300 border border-gray-700 group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={news.imageUrl} 
                  alt={news.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                />
                <span className="absolute top-2 right-2 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                  {news.category}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center text-gray-400 text-xs mb-3 space-x-4">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {new Date(news.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center"><User className="w-3 h-3 mr-1"/> {news.author}</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-3 group-hover:text-orange-500 transition">
                  {news.title}
                </h2>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {news.summary}
                </p>
                <button className="text-orange-400 font-bold text-sm hover:text-orange-300 flex items-center">
                  Read Full Story &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;