import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Attach token to every request if it exists
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

export const registerUser = (formData) => API.post('/auth/register', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const loginUser = (data) => API.post('/auth/login', data);

// --- Fixed: Added missing exports ---
export const fetchPlayers = (params) => API.get('/players', { params });
export const fetchStandings = () => API.get('/teams');
// ------------------------------------

export const fetchGames = () => API.get('/games');
export const createGame = (data) => API.post('/games', data);

export default API;