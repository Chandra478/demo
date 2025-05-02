// src/api/project.js
import axios from 'axios';
import auth from './auth';

const API_URL = 'http://localhost:8000/api';

const getAll = async (params = {}) => {
  const response = await axios.get(`${API_URL}/projects`, {
    params,
    headers: auth.authHeader(),
  });
  return response.data;
};

const get = async (id) => {
  const response = await axios.get(`${API_URL}/projects/${id}`, {
    headers: auth.authHeader(),
  });
  return response.data;
};

const create = async (data) => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('file', data.file);

  const response = await axios.post(`${API_URL}/projects`, formData, {
    headers: {
      ...auth.authHeader(),
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const approve = async (id) => {
  const response = await axios.patch(`${API_URL}/projects/${id}/approve`, {}, {
    headers: auth.authHeader(),
  });
  return response.data;
};

const reject = async (id, reason) => {
  const response = await axios.patch(`${API_URL}/projects/${id}/reject`, { reason }, {
    headers: auth.authHeader(),
  });
  return response.data;
};

const bulkAction = async (action, projectIds, reason = null) => {
  const response = await axios.post(`${API_URL}/projects/bulk-action`, {
    action,
    project_ids: projectIds,
    reason,
  }, {
    headers: auth.authHeader(),
  });
  return response.data;
};

export default {
  getAll,
  get,
  create,
  approve,
  reject,
  bulkAction,
};