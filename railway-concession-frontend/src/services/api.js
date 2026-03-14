import axios from 'axios';

const API_BASE_URL = 'http://localhost:8181/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true   // ✅ ADD THIS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    

    // ✅ IMPORTANT FIX:
    // If data is NOT FormData, set JSON content-type
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if NOT already on login page
    if (error.response?.status === 401 &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/verify-otp') {

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
