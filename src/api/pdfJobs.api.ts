import api from './client';
import type { UploadResponse, StartJobResponse, TaskStatusResponse } from '../types';

export async function uploadPdf(file: File, title: string): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  form.append('title', title);
  const res = await api.post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
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
  const res = await api.post(`/job/${job_id}/reupload`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data;
}

export async function startJob(job_id: string, start: number = 1, end?: number): Promise<StartJobResponse> {
  const res = await api.post('/start', null, {
    params: { job_id, start, end }
  });
  return res.data;
}

export async function requestFullReview(job_id: string): Promise<any> {
  const res = await api.post('/request-full-review', null, { params: { job_id } });
  return res.data;
}

export async function getStatus(taskId: string): Promise<TaskStatusResponse> {
  const res = await api.get(`/status/${taskId}`);
  return res.data;
}

export async function getJobProgress(jobId: string) {
  const res = await api.get(`/job/${jobId}/progress`);
  return res.data;
}

export async function shareAudiobook(
  jobId: string,
  emails: string[]
) {
  const res = await api.post(
    `/audio/share/${jobId}/emails`,
    { emails }
  );
  return res.data;
}
