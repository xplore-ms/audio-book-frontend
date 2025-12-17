import axios from 'axios';
import type { UploadResponse, StartJobResponse, TaskStatusResponse, MergeResponse } from '../types';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://audio-book-elji.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL
});


export async function uploadPdf(file: File, email: string): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  form.append('email', email); // Added email to FormData
  
  const res = await api.post('/upload', form, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  });
  return res.data;
}

export async function startJob(job_id: string, remote_pdf_path: string, start = 1, end?: number): Promise<StartJobResponse> {
  const params: any = { job_id, remote_pdf_path, start };
  if (end) params.end = end;
  
  const res = await api.post('/start-job', null, { params });
  return res.data;
}

export async function getStatus(taskId: string): Promise<TaskStatusResponse> {
  const res = await api.get(`/status/${taskId}`);
  return res.data;
}

export async function mergeJob(jobId: string): Promise<MergeResponse> {
  const res = await api.post(`/merge/${jobId}`);
  return res.data;
}