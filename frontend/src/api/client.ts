import axios from 'axios';

const API_URL = 'http://localhost:18080/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API wrapper functions
export const getDevices = () => api.get('/devices').then(r => r.data.data);
export const getCVEs = () => api.get('/cves').then(r => r.data.data);
export const getStats = () => api.get('/stats').then(r => r.data.data);