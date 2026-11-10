import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://bulk-mail-app-backend-dg5p.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Auth token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bulk_mail_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const mailApi = {
  sendMail: (data) => api.post('/mail/send', data),
  getHistory: (page = 1, limit = 20) => api.get(`/mail/history?page=${page}&limit=${limit}`),
  getMailById: (id) => api.get(`/mail/history/${id}`),
  deleteHistoryItem: (id) => api.delete(`/mail/history/${id}`),
  getStats: () => api.get('/mail/stats'),
};

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  initAdmin: () => api.post('/auth/init'),
};

export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
