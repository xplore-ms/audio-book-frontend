import api from './client';
import axios from 'axios';
import type { Audiobook, UserAudiobook, AudioResponse, SyncResponse } from '../types';

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
