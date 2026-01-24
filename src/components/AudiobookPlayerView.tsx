import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getJobPages } from '../api/api';
import AudioPlayer from './AudioPlayer';
import { PlayIcon, PauseIcon, SpinnerIcon } from './Icons';
import type { PageSyncInfo } from '../types';

interface PageAudio extends PageSyncInfo {
  page: number;
}

interface Track {
  title: string;
  artist: string;
  color: string;
  image: string;
  audioSrc: string;
  expires_at: number;
}

export default function AudiobookPlayerView({ mode }: { mode: 'public' | 'private' }) {
  const { jobId: jobIdParam } = useParams();
  const [showPages, setShowPages] = useState(false);
  const [pages, setPages] = useState<PageAudio[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { state } = useLocation();
  const bookTitle = state?.title ?? 'Audiobook';


  const isExpired = (expiresAt: number, buffer = 30) => {
    return Date.now() / 1000 > expiresAt - buffer;
  };

 


  useEffect(() => {
    document.title = `${bookTitle} Page ${currentIndex + 1} • Narrio Audiobook`;

    return () => {
      document.title = 'Narrio';
    };
  }, [bookTitle, currentIndex]);

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

        const tracksArray: Track[] = pagesArray.map(p => ({
          title: `Page ${p.page}`,
          artist: bookTitle,
          color: '#6366f1', // indigo-500
          image: '/vite.svg', // default image
          audioSrc: p.audio_url,
          expires_at: p.expires_at
        }));

        setTracks(tracksArray);
      })
      .finally(() => setLoading(false));
  }, [jobIdParam, mode, bookTitle]);

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

    const tracksArray: Track[] = pagesArray.map(p => ({
      title: `Page ${p.page}`,
      artist: bookTitle,
      color: '#6366f1',
      image: '/vite.svg',
      audioSrc: p.audio_url,
      expires_at: p.expires_at
    }));

    setTracks(tracksArray);

    if (
      resumeIndex !== undefined &&
      resumeIndex < tracksArray.length
    ) {
      setCurrentIndex(resumeIndex);
      setIsPlaying(true);
    }
  };

  const handleAudioError = async () => {
    console.warn('Audio expired, refreshing signed URLs…');

    const resumeIndex = currentIndex;
    await refreshPlaylist(resumeIndex);
  };

  const playPage = async (index: number) => {
    const track = tracks[index];

    if (isExpired(track.expires_at)) {
      await refreshPlaylist(index);
    } else {
      setCurrentIndex(index); 
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const track = tracks[currentIndex];
      if (!track) return;

      if (isExpired(track.expires_at, 60)) {
        refreshPlaylist(currentIndex);
      }
    }, 15000); // check every 15s

    return () => clearInterval(interval);
  }, [currentIndex, tracks]);


  const currentTrack = tracks[currentIndex];
  // const isSeekable = currentTrack ? (currentTrack.audioSrc.toLowerCase().indexOf('.wav') === -1) : true;

  if (loading) {
    return (
      <div className="p-24 flex justify-center">
        <SpinnerIcon className="w-10 h-10 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 text-center">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
          {bookTitle}
        </h2>

        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Select a page to begin listening</p>
      </div>

      <div className="bg-slate-900 rounded-[2rem] p-8 shadow-inner border border-slate-800">
        <AudioPlayer
          tracks={tracks}
          initialTrackIndex={currentIndex}
          onTrackIndexChange={setCurrentIndex}
          initialIsPlaying={isPlaying}
          onIsPlayingChange={setIsPlaying}
          onError={handleAudioError}
        />
        {currentTrack && (
          <div className="mt-4 flex items-center justify-between">
            {/* <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isSeekable ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {isSeekable ? 'Seeking Supported' : 'Seeking Not Supported'}
            </span> */}
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Currently Playing: {currentTrack.title}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setShowPages(prev => !prev)}
          className="px-6 py-2 rounded-full bg-black text-xs font-black uppercase tracking-widest
           text-white hover:bg-slate-800 transition"
        >
          {showPages ? 'Hide Pages' : 'Show Pages'}
        </button>
      </div>

        {showPages && (
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
              {/* <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${idx === currentIndex ? 'bg-white/20 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
                {p.page}
              </div> */}
              <span className="font-black uppercase tracking-tight text-black">{p.page}</span>
            </div>

            <div className="flex items-center gap-4">
              <span className={`text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity ${idx === currentIndex ? 'text-white/60' : 'text-slate-300'}`}>
                {p.audio_url.toLowerCase().endsWith('.wav') ? 'WAV Format' : 'Neural M4A'}
              </span>
              {idx === currentIndex && isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className={`w-6 h-6 ${idx === currentIndex ? 'text-black' : 'text-indigo-600'}`} />
              )}
            </div>
          </button>
        ))}
      </div>)}
    </div>
  );
}