import { useQuery } from '@tanstack/react-query';
import { fetchVoices, type VoiceRecord } from '../../../api/voices.api';

export function useVoices() {
  return useQuery<VoiceRecord[]>({
    queryKey: ['voices'],
    queryFn: fetchVoices,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
