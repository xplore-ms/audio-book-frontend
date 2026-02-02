import api from './client';

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
