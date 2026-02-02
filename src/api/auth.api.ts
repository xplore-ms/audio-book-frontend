import api from './client';
import type { LoginResponse } from '../types';

export async function registerUser(email: string, password: string, deviceFingerprintHash: any): Promise<{ message: string }> {
  const form = new FormData();
  form.append('email', email);
  form.append('password', password);
  form.append('device_fingerprint_hash', deviceFingerprintHash);
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

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const form = new FormData();
  form.append('email', email);
  const res = await api.post('/auth/forgot-password', form);
  return res.data;
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
  const form = new FormData();
  form.append('email', email);
  form.append('code', code);
  form.append('new_password', newPassword);
  const res = await api.post('/auth/reset-password', form);
  return res.data;
}
