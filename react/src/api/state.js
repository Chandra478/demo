// src/api/stats.js
import axios from 'axios';
import auth from './auth';

const API_URL = 'http://localhost:8000/api';

const getStats = async () => {
  const response = await axios.get(`${API_URL}/stats`, {
    headers: auth.authHeader(),
  });
  return response.data;
};

export default {
  getStats,
};