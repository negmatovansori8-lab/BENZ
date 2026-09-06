import axios from 'axios';

const FALLBACK_API = 'https://benz-production.up.railway.app';
const API_ROOT = String(import.meta.env.VITE_API_URL || (import.meta.env.PROD ? FALLBACK_API : ''))
  .replace(/\/$/, '')
  .replace(/\/api$/, '');

export const api = axios.create({
  baseURL: API_ROOT ? `${API_ROOT}/api` : '/api',
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ah_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      (err.code === 'ERR_NETWORK' ? 'Cannot reach the server. Please try again.' : 'Something went wrong. Please try again.');
    return Promise.reject({ ...err, displayMessage: message });
  }
);
