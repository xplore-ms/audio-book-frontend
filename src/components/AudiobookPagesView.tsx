import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getJobPages } from '../api/api';
import { PlayIcon, PauseIcon, SpinnerIcon } from './Icons';

interface PageAudio {
  page: number;
  duration: number;
  audio_url: string;
}

export default function AudiobookPagesView({ mode }: { mode: 'public' | 'private' }) {
  const { jobId } = useParams();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [pages, setPages] = useState<PageAudio[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    const path = mode === 'private' ? '/audio/pages/' : '/public/listen/';
    getJobPages(`${path}${jobId}`)
        .then(res => {
        const pagesArray = res.pages
            .map((p: any) => {
            const pageNum = parseInt(p.page.split('_')[1], 10);
            return { page: pageNum, ...p };
            })
            .sort((a: any, b: any) => a.page - b.page);

        setPages(pagesArray);
        })
        .finally(() => setLoading(false));
    }, [jobId, mode]);


    const refreshPlaylist = async (resumeIndex?: number | null) => {
        if (!jobId || !resumeIndex) return;

        const path = mode === 'private' ? '/audio/pages/' : '/public/listen/';
        const res = await getJobPages(`${path}${jobId}`);

        const pagesArray = res.pages
            .map((p: any) => ({
            page: parseInt(p.page.split('_')[1], 10),
            ...p,
            }))
            .sort((a: any, b: any) => a.page - b.page);

        setPages(pagesArray);

        if (
            resumeIndex !== undefined &&
            audioRef.current &&
            pagesArray[resumeIndex]
        ) {
            audioRef.current.src = pagesArray[resumeIndex].audio_url;
            audioRef.current.play();
            setIsPlaying(true);
        }
        };
const handleAudioError = async () => {
  console.warn('Audio expired, refreshing signed URLs…');

  const resumeIndex = currentIndex;
  await refreshPlaylist(resumeIndex);
};
const playPage = (index: number) => {
  if (!audioRef.current) return;

  const audio = audioRef.current;

  // First ever play OR new page selected
  if (currentIndex !== index) {
    setCurrentIndex(index);
    audio.src = pages[index].audio_url;
    audio.play();
    setIsPlaying(true);
    return;
  }

  // Same page clicked → toggle
  if (audio.paused) {
    audio.play();
    setIsPlaying(true);
  } else {
    audio.pause();
    setIsPlaying(false);
  }
};




  const handleEnded = () => {
  if (currentIndex === null) return;

  const next = currentIndex + 1;
  if (next < pages.length) {
    playPage(next);
  } else {
    setIsPlaying(false);
    setCurrentIndex(null);
  }
};


  if (loading)
    return (
      <div className="p-24 flex justify-center">
        <SpinnerIcon className="w-10 h-10 text-indigo-600" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <audio ref={audioRef} onEnded={handleEnded} 
  onError={handleAudioError}/>

      {pages.map((p, idx) => (
        <button
          key={p.page}
          onClick={() => playPage(idx)}
          className={`w-full p-4 rounded-2xl flex items-center justify-between
            ${idx === currentIndex ? 'bg-indigo-600 text-white' : 'bg-white'}
          `}
        >
          <span className="font-black uppercase">Page {p.page}</span>
          {idx === currentIndex && isPlaying ? (
            <PauseIcon className="w-6 h-6" />
          ) : (
            <PlayIcon className="w-6 h-6" />
          )}
        </button>
      ))}
    </div>
  );
}
