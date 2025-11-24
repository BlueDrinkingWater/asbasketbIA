import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// --- Auth & User ---
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);

// --- Subscriber Actions ---
export const submitTeam = (data) => API.post('/auth/submit-team', data);
export const submitStats = (data) => API.post('/auth/submit-stats', data);
export const registerForGame = (data) => API.post('/auth/submit-game', data);

// --- Admin Dashboard Actions ---
export const fetchAdminData = () => API.get('/auth/admin-data');
export const updateSubscription = (data) => API.put('/auth/admin/subscription', data);
export const updateTeamRequest = (data) => API.put('/auth/admin/team-request', data);
export const updateStatRequest = (data) => API.put('/auth/admin/stat-request', data);
export const updateGameRequest = (data) => API.put('/auth/admin/game-request', data);

// --- League Settings ---
export const fetchSettings = () => API.get('/admin/settings');
export const updateSettings = (data) => API.put('/admin/settings', data);

// --- News & Content ---
export const fetchNews = () => API.get('/news');
export const createNews = (data) => API.post('/news', data);
export const updateNews = (id, data) => API.put(`/news/${id}`, data);
export const deleteNews = (id) => API.delete(`/news/${id}`);

// --- Tickets (NEW) ---
export const fetchAllTickets = () => API.get('/tickets/all');

// --- Trades (NEW) ---
export const fetchTrades = () => API.get('/trades');
export const processTrade = (data) => API.post('/trades/execute', data);

// --- Public Data & Management ---
export const fetchTeams = () => API.get('/teams');
export const fetchStandings = () => API.get('/standings'); 
export const createTeam = (data) => API.post('/teams', data);

// Players
export const fetchPlayers = (params) => API.get('/players', { params });
export const createPlayer = (data) => API.post('/players', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updatePlayer = (id, data) => API.put(`/players/${id}`, data); 

// Games
export const fetchGames = () => API.get('/games');
export const createGame = (data) => API.post('/games', data);

export default API;