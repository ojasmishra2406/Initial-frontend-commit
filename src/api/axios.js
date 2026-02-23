import axios from 'axios';

// Debug: Log environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log('🔧 [DEBUG] API Base URL:', API_BASE_URL);
console.log('🔧 [DEBUG] Environment:', import.meta.env.MODE);

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Attach token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('📡 [API REQUEST]', config.method?.toUpperCase(), config.baseURL + config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ [REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ [API RESPONSE]', response.config.method?.toUpperCase(), response.config.url, '- Status:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ [API ERROR]', error.config?.method?.toUpperCase(), error.config?.url);
    console.error('❌ [ERROR DETAILS]', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
