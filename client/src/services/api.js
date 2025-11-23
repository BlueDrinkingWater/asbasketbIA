import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

export const fetchPlayers = (params) => api.get('/players', { params });
export const fetchStandings = () => api.get('/teams');
export const createPlayer = (data) => api.post('/players', data);

export default api;