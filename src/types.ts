export interface Sentence {
  text: string;
  start: number;
  end: number;
}

export interface User {
  id: string;
  email: string;
  credits: number;
  isLoggedIn: boolean;
  token?: string;
  refreshToken?: string;
  socialsClaimed: {
    x: boolean;
    telegram: boolean;
    whatsapp: boolean;
  };
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  credits: number;
}

export interface UserAudiobook {
  job_id: string;
  final_parts: string[];
  final_size_mb: number;
  title?: string;
  created_at: string;
}

export interface PageSyncInfo {
  audio_url: string;
  sync_url: string;
  duration: number;
}

export interface SyncResponse {
  pages: Record<string, PageSyncInfo>;
}
export interface AudioResponse {
  pages: Record<string, PageSyncInfo>[];
}

export interface Audiobook {
  job_id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  duration: string;
  required_credits: number;
  streamUrl: string;
  content?: Sentence[];
  created_at: string;
  isFreeDemo?: boolean;
}

export interface UploadResponse {
  job_id: string;
  pages: number;
  folder_name?: string;
  remote_pdf_path?: string;
  digits?: number;
}

export interface StartJobResponse {
  status: string;
  pages: number;
  job_id: string;
  task_ids: string[];
}

export interface TaskStatusResponse {
  state: 'PENDING' | 'STARTED' | 'RETRY' | 'FAILURE' | 'SUCCESS' | 'PROGRESS';
  result?: any;
}

export interface PriceQuote {
  credits: number;
  currency: string;
  amount: number;
  display: string;
}

export type AppStep =
  | 'UPLOAD'
  | 'CONFIG'
  | 'PROCESSING'
  | 'SUCCESS'
  | 'ERROR'
  | 'AUTH'
  | 'STORE';