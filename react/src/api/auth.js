import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for CSRF token
});

// Get CSRF token first
const getCsrfToken = async () => {
    await api.get('/sanctum/csrf-cookie');
  };

const register = async (userData) => {
  await getCsrfToken(); 
  const response = await api.post('/register', userData);
  if (response.data.access_token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (userData) => {
    await getCsrfToken();
  try {
    const response = await api.post('/login', userData);
    if (response.data.access_token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const logout = async () => {
  await getCsrfToken();
  const response = await api.post('/logout');
  localStorage.removeItem('user');
  return response.data;
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const authHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.access_token) {
    return { Authorization: `Bearer ${user.access_token}` };
  }
  return {};
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  authHeader,
};