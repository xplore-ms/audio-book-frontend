import { useQuery } from '@tanstack/react-query';
import { getJobPages } from '../../../api/audio.api';

export function useJobPages(jobId: string | undefined, mode: 'public' | 'private') {
  return useQuery({
    queryKey: ['jobPages', jobId, mode],
    queryFn: async () => {
      if (!jobId) throw new Error('jobId required');
      const path = mode === 'private' ? '/audio/pages/' : '/public/listen/';
      const res = await getJobPages(`${path}${jobId}`);
      return res;
    },
    enabled: !!jobId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}
