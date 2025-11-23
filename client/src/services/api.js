import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const fetchUsers = () => API.get('/auth/users');
export const updateUserStatus = (userId, status) => API.put('/auth/status', { userId, status });

// Teams
export const fetchTeams = () => API.get('/teams');
export const createTeam = (data) => API.post('/teams', data);

// Players
export const fetchPlayers = () => API.get('/players');
export const createPlayer = (data) => API.post('/players', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Games
export const fetchGames = () => API.get('/games');
export const createGame = (data) => API.post('/games', data);
export const updateGameStats = (gameId, data) => API.put(`/games/${gameId}/stats`, data);

export default API;