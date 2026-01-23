import axios from 'axios';
import type { UploadResponse, StartJobResponse, TaskStatusResponse, Audiobook, LoginResponse, UserAudiobook, SyncResponse, PriceQuote, AudioResponse } from '../types';


export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  'https://audio-book-elji.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


api.interceptors.request.use(config => {
  const token = localStorage.getItem('narrio_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Automatic Token Refresh Interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
          });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('narrio_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const form = new FormData();
        form.append('refresh_token', refreshToken);

        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          form
        );

        const { access_token, refresh_token } = res.data;

        localStorage.setItem('narrio_token', access_token);
        localStorage.setItem('narrio_refresh_token', refresh_token);

        api.defaults.headers.Authorization = `Bearer ${access_token}`;
        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // Hard logout
        localStorage.removeItem('narrio_user');
        localStorage.removeItem('narrio_token');
        localStorage.removeItem('narrio_refresh_token');

        window.location.href = '/signin';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// --------------------
// Payments (Paystack)
// --------------------

export interface InitiatePaymentResponse {
  authorization_url: string;
  reference: string;
}

export async function initiatePayment(
  credits: number
): Promise<InitiatePaymentResponse> {
  const res = await api.post('/payments/initiate', { credits });
  return res.data;
}

export async function verifyPayment(reference: string): Promise<any> {
  const res = await api.post(`/payments/verify/${reference}`);
  return res.data;
}

export async function getPriceQuote(credits: number, currency: string): Promise<PriceQuote> {
  const res = await api.get('/payments/quote', {
    params: { credits, currency }
  });
  return res.data;
}

export async function wakeBackend() {
  try {
    await api.get('/health/wake');
  } catch (e) {}
}

export async function checkBackendReady(): Promise<boolean> {
  try {
    const res = await api.get('/health/ready');
    return res.data?.ready === true;
  } catch (e) {
    return false;
  }
}

// --------------------
// Auth
// --------------------

export async function registerUser(email: string, password: string): Promise<{ message: string }> {
  const form = new FormData();
  form.append('email', email);
  form.append('password', password);
  const res = await api.post('/auth/register', form);
  return res.data;
}

export async function verifyEmailCode(email: string, code: string): Promise<{ message: string }> {
  const form = new FormData();
  form.append('email', email);
  form.append('code', code);
  const res = await api.post('/auth/verify-email-code', form);
  return res.data;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const form = new FormData();
  form.append('email', email);
  form.append('password', password);
  const res = await api.post('/auth/login', form);
  return res.data;
}

export async function getUserInfo(): Promise<{ email: string, credits: number }> {
  const res = await api.get('/auth/me');
  return res.data;
}

// --------------------
// PDF Jobs
// --------------------

export async function uploadPdf(file: File, title: string): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  form.append('title', title);
  const res = await api.post('/upload', form, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  });
  return res.data;
}

export async function getJobInfo(job_id: string): Promise<UploadResponse> {
  const res = await api.get(`/job/${job_id}`);
  return res.data;
}

export async function updateJobTitle(job_id: string, title: string): Promise<any> {
  const res = await api.patch(`/job/${job_id}`, { title });
  return res.data;
}

export async function reuploadPdf(job_id: string, file: File): Promise<any> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post(`/job/${job_id}/reupload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function startJob(job_id: string, start: number = 1, end?: number): Promise<StartJobResponse> {
  const res = await api.post('/start', null, {
    params: { job_id, start, end }
  });
  return res.data;
}

export async function requestFullReview(job_id: string): Promise<any> {
  const res = await api.post('/request-full-review', null, {
    params: { job_id }
  });
  return res.data;
}
export async function shareAudiobook(job_id: string): Promise<any> {
  const res = await api.post(`/audio/share/${job_id}`, null, {
    
  });
  return res.data;
}

export async function getStatus(taskId: string): Promise<TaskStatusResponse> {
  const res = await api.get(`/status/${taskId}`);
  return res.data;
}

// --------------------
// Audio & Library
// --------------------

export async function fetchMyLibrary(): Promise<UserAudiobook[]> {
  const res = await api.get('/audio/my');
  return res.data;
}

export async function getJobPages(url: string): Promise<AudioResponse> {
  const res = await api.get(url);
  return res.data;
}

export async function getJobSync(url: string): Promise<SyncResponse> {
  const res = await api.get(url);
  return res.data;
}

export async function getExternalSyncData(url: string): Promise<any> {
  const res = await axios.get(url);
  return res.data;
}

export async function fetchPublicLibrary(): Promise<Audiobook[]> {
  try {
    const res = await api.get('/public/');
    return res.data;
  } catch (err) {
    return [];
  }
}