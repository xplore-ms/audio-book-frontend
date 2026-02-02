import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shareAudiobook } from '../../../api/pdfJobs.api';

interface SharePayload {
  jobId: string;
  emails: string[];
}

export function useShareAudiobook() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, emails }: SharePayload) =>
      shareAudiobook(jobId, emails),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myLibrary'] });
    },
  });
}
