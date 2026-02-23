import axios from 'axios';

const envApiUrl = (import.meta as any).env?.VITE_API_URL;
const secureApiUrl = envApiUrl

export const API_BASE_URL = secureApiUrl || 'https://audio-book-elji.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(config => {
  if (config.url?.includes('/auth/refresh-token')) {
    return config;
  }

  const token = localStorage.getItem('narrio_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic Token Refresh Interceptor
api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('narrio_refresh_token');
        if (!refreshToken) throw error;

        const form = new FormData();
        form.append('refresh_token', refreshToken);

        const res = await api.post('/auth/refresh-token', form);
        localStorage.setItem('narrio_token', res.data.access_token);
        localStorage.setItem('narrio_refresh_token', res.data.refresh_token);

        originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
        return api(originalRequest);
      } catch {
        localStorage.clear();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
