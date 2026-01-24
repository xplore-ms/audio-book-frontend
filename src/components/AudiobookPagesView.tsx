import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation  } from 'react-router-dom';
import { getJobPages } from '../api/api';
import { PlayIcon, PauseIcon, SpinnerIcon } from './Icons';
import type { PageSyncInfo } from '../types';

interface PageAudio extends PageSyncInfo {
  page: number;
}

export default function AudiobookPagesView({ mode }: { mode: 'public' | 'private' }) {
  const { jobId: jobIdParam } = useParams();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [pages, setPages] = useState<PageAudio[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const { state } = useLocation();
  const bookTitle = state?.title ?? 'Audiobook';

  useEffect(() => {
    document.title = `${bookTitle} • Narrio`;
    
    return () => {
      document.title = 'Narrio Audiobooks';
    };
  }, [bookTitle]);

  const currentTrack = currentIndex !== null ? pages[currentIndex] : null;
  const isSeekable = currentTrack ? (currentTrack.format !== 'wav' && !currentTrack.audio_url.toLowerCase().endsWith('.wav')) : true;

  useEffect(() => {
    if (!jobIdParam) return;
    const path = mode === 'private' ? '/audio/pages/' : '/public/listen/';
    getJobPages(`${path}${jobIdParam}`)
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
    }, [jobIdParam, mode]);


    const refreshPlaylist = async (resumeIndex?: number | null) => {
        if (!jobIdParam || resumeIndex === null || resumeIndex === undefined) return;

        const path = mode === 'private' ? '/audio/pages/' : '/public/listen/';
        const res = await getJobPages(`${path}${jobIdParam}`);

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

  if (currentIndex !== index) {
    setCurrentIndex(index);
    audio.src = pages[index].audio_url;
    audio.play();
    setIsPlaying(true);
    return;
  }

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
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 text-center">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
          {bookTitle}
        </h2>

         <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Select a page to begin listening</p>
      </div>

      <div className="bg-slate-900 rounded-[2rem] p-8 shadow-inner border border-slate-800">
        <audio 
          ref={audioRef} 
          onEnded={handleEnded} 
          onError={handleAudioError}
          controls
          className="w-full"
        />
        {currentIndex !== null && (
          <div className="mt-4 flex items-center justify-between">
             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isSeekable ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {isSeekable ? 'Seeking Supported' : 'Seeking Not Supported'}
             </span>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
               Currently Playing: Page {pages[currentIndex].page}
             </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {pages.map((p, idx) => (
          <button
            key={p.page}
            onClick={() => playPage(idx)}
            className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all group
              ${idx === currentIndex ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white hover:bg-slate-50 border border-slate-100'}
            `}
          >
            <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${idx === currentIndex ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                 {p.page}
               </div>
               <span className="font-black uppercase tracking-tight">Page {p.page}</span>
            </div>

            <div className="flex items-center gap-4">
              <span className={`text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity ${idx === currentIndex ? 'text-white/60' : 'text-slate-300'}`}>
                {p.audio_url.toLowerCase().endsWith('.wav') ? 'WAV Format' : 'Neural M4A'}
              </span>
              {idx === currentIndex && isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className={`w-6 h-6 ${idx === currentIndex ? 'text-white' : 'text-indigo-600'}`} />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
