import axios from 'axios';
import type { UploadResponse, StartJobResponse, TaskStatusResponse, Audiobook, LoginResponse, UserAudiobook, SyncResponse } from '../types';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://audio-book-elji.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('narrio_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export async function registerUser(email: string, password: string): Promise<{ message: string }> {
  const form = new FormData();
  form.append('email', email);
  form.append('password', password);
  const res = await api.post('/auth/register', form);
  return res.data;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const form = new FormData();
  form.append('email', email);
  form.append('password', password);
  const res = await api.post('/auth/login', form);
  return res.data;
}

// PDF Jobs
export async function uploadPdf(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post('/upload', form, { 
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

export async function getStatus(taskId: string): Promise<TaskStatusResponse> {
  const res = await api.get(`/status/${taskId}`);
  return res.data;
}

// New Audio Routes
export async function fetchMyLibrary(): Promise<UserAudiobook[]> {
  const res = await api.get('/audio/my');
  return res.data;
}

export async function getJobPages(jobId: string): Promise<SyncResponse> {
  const res = await api.get(`/audio/pages/${jobId}`);
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