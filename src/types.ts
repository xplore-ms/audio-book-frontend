export interface UploadResponse {
  job_id: string;
  folder_name: string;
  remote_pdf_path: string;
  num_pages: number;
  digits: number;
}

export interface StartJobResponse {
  job_id: string;
  task_ids: string[];
}

export interface TaskStatusResponse {
  state: 'PENDING' | 'STARTED' | 'PROGRESS' | 'RETRY' | 'FAILURE' | 'SUCCESS';
  result?: any;
}

export interface MergeResponse {
  merge_task_id: string;
}

export type AppStep =
  | 'UPLOAD'
  | 'CONFIG'
  | 'PROCESSING'
  | 'MERGING'
  | 'SUCCESS'
  | 'ERROR';

export type AppView =
  | 'HOME'
  | 'HOW_IT_WORKS'
  | 'ABOUT'
  | 'DONATE';
