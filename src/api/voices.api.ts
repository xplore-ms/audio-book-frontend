import api from './client';

export type VoiceRecord = {
  id: string;
  voice_name: string;
  display_name?: string;
  language_codes?: string[];
  ssml_gender?: string;
  sample_text?: string;
  supabase_path?: string;
  url?: string | null;
  expires_at?: number | null;
};

export async function fetchVoices(): Promise<VoiceRecord[]> {
  const res = await api.get('/voices');
  return res.data?.voices || [];
}

export async function getVoiceSignedUrl(id: string, ttl = 900): Promise<string> {
  const res = await api.get(`/voices/${id}/url?ttl=${ttl}`);
  return res.data?.url;
}
