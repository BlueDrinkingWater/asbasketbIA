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
  headers: { 'Content-Type': 'multipart/form-data' } // Important for file upload
});
export const loginUser = (data) => API.post('/auth/login', data);
export const fetchGames = () => API.get('/games');
export const createGame = (data) => API.post('/games', data); // Admin only

export default API;