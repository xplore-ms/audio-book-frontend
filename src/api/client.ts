import axios from 'axios';

const envApiUrl = (import.meta as any).env?.VITE_API_URL;
const secureApiUrl =
  envApiUrl && envApiUrl.startsWith('http://') && !envApiUrl.includes('localhost') && !envApiUrl.includes('127.0.0.1')
    ? envApiUrl.replace('http://', 'https://')
    : envApiUrl;

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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      if (token) prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Automatic Token Refresh Interceptor
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/refresh-token')
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('narrio_refresh_token');
        if (!refreshToken) throw error;

        const form = new FormData();
        form.append('refresh_token', refreshToken);

        const res = await api.post('/auth/refresh-token', form);
        const { access_token, refresh_token } = res.data;

        localStorage.setItem('narrio_token', access_token);
        localStorage.setItem('narrio_refresh_token', refresh_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        processQueue(null, access_token);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        // Redirect to login or handle as needed
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
