import { useQuery } from '@tanstack/react-query';
import { fetchMyLibrary } from '../../../api/audio.api';
import type { UserAudiobook } from '../../../types';

export function useMyLibrary() {
  return useQuery<UserAudiobook[]>({
    queryKey: ['myLibrary'],
    queryFn: fetchMyLibrary,
  });
}
