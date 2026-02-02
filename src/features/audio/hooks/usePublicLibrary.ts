import { useQuery } from '@tanstack/react-query';
import { fetchPublicLibrary } from '../../../api/audio.api';
import type { Audiobook } from '../../../types';

export function usePublicLibrary() {
  return useQuery<Audiobook[]>({
    queryKey: ['publicLibrary'],
    queryFn: fetchPublicLibrary,
  });
}
