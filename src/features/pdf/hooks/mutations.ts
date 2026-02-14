import { useMutation, useQueryClient } from '@tanstack/react-query';
import { startJob, requestFullReview, updateJobTitle, reuploadPdf } from '../../../api/pdfJobs.api';

export function useStartJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, start, end, voiceId }: { jobId: string; start: number; end?: number; voiceId?: string }) => startJob(jobId, start, end, voiceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pdfJob'] });
      qc.invalidateQueries({ queryKey: ['jobProgress'] });
      qc.invalidateQueries({ queryKey: ['myLibrary'] });
    }
  });
}

export function useRequestFullReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => requestFullReview(jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pdfJob'] });
      qc.invalidateQueries({ queryKey: ['myLibrary'] });
    }
  });
}

export function useUpdateJobTitle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, title }: { jobId: string; title: string }) => updateJobTitle(jobId, title),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['pdfJob', (vars as any).jobId] });
    }
  });
}

export function useReuploadPdf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, file }: { jobId: string; file: File }) => reuploadPdf(jobId, file),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['pdfJob', (vars as any).jobId] });
    }
  });
}

import { uploadPdf } from '../../../api/pdfJobs.api';

export function useUploadPdf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, title }: { file: File; title: string }) => uploadPdf(file, title),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['myLibrary'] });
      qc.invalidateQueries({ queryKey: ['pdfJob', (data as any).job_id] });
    }
  });
}
