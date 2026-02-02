import { useQuery } from '@tanstack/react-query';
import { getJobInfo, getJobProgress } from '../../../api/pdfJobs.api';

export function usePdfJob(jobId: string | undefined | null) {
  return useQuery({
    queryKey: ['pdfJob', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('jobId required');
      return await getJobInfo(jobId);
    },
    enabled: !!jobId,
  });
}

export function useJobProgress(jobId: string | undefined | null) {
  return useQuery({
    queryKey: ['jobProgress', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('jobId required');
      return await getJobProgress(jobId);
    },
    enabled: !!jobId,
    refetchInterval: 3000,
  });
}
