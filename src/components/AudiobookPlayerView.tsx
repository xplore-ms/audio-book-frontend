import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getJobPages } from '../api/audio.api';
import AudioPlayer from './AudioPlayer';
import { PlayIcon, PauseIcon, SpinnerIcon } from './Icons';
import type { PageSyncInfo } from '../types';

interface PageAudio extends PageSyncInfo {
  download_url: any;
  expires_at: any;
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

export function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 3v12m0 0l4-4m-4 4l-4-4" />
      <path d="M5 21h14" />
    </svg>
  );
}


export default function AudiobookPlayerView({
  mode,
}: {
  mode: 'public' | 'private';
}) {
  const { jobId: jobIdParam } = useParams();
  const { state } = useLocation();
  const bookTitle = state?.title ?? 'Audiobook';

  const [showPages, setShowPages] = useState(false);
  const [pages, setPages] = useState<PageAudio[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const [skip, setSkip] = useState(0);
  const limit = 3;
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /* ----------------------- HELPERS ----------------------- */

  const isExpired = (expiresAt: number, buffer = 30) =>
    Date.now() / 1000 > expiresAt - buffer;

  /* ----------------------- LOAD PAGES ----------------------- */

  const forceDownload = async (url: string, filename: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Download failed');

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
};


  const loadPages = useCallback(async () => {
    if (!jobIdParam || !hasMore || isFetching || error) return;

    setIsFetching(true);

    try {
      const path = mode === 'private' ? '/audio/pages/' : '/public/listen/';
      const res = await getJobPages(
        `${path}${jobIdParam}?skip=${skip}&limit=${limit}`
      );

      const newPages: PageAudio[] = res.pages.map((p: any) => ({
        page: Number(p.page.split('_')[1]),
        ...p,
      }));

      setPages(prev => [...prev, ...newPages]);
      setTracks(prev => [
        ...prev,
        ...newPages.map(p => ({
          title: `Page ${p.page}`,
          artist: bookTitle,
          color: '#6366f1',
          image: '/vite.svg',
          audioSrc: p.audio_url,
          expires_at: p.expires_at,
        })),
      ]);

      const nextSkip = skip + limit;
      setSkip(nextSkip);

      if (nextSkip >= res.total_pages) {
        setHasMore(false);
      }

      setLoading(false);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('Access denied');
      } else {
        setError('An error has occurred');
      }
      setLoading(false);
      setHasMore(false);
    } finally {
      setIsFetching(false);
    }
  }, [jobIdParam, hasMore, isFetching, skip, limit, mode, bookTitle, error]);


  /* ----------------------- RESET ON JOB CHANGE ----------------------- */

  useEffect(() => {
    setPages([]);
    setTracks([]);
    setSkip(0);
    setHasMore(true);
    setCurrentIndex(0);
    setIsPlaying(false);
    setLoading(true);
  }, [jobIdParam, mode, bookTitle]);

  /* ----------------------- INITIAL LOAD ----------------------- */

  useEffect(() => {
    loadPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobIdParam]);

  /* ----------------------- INFINITE SCROLL ----------------------- */

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadPages();
      }
    });

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, loadPages]);

  /* ----------------------- AUDIO REFRESH ----------------------- */

  const refreshPlaylist = async (resumeIndex?: number) => {
    if (!jobIdParam || resumeIndex === undefined) return;

    const path = mode === 'private' ? '/audio/pages/' : '/public/listen/';
    const res = await getJobPages(`${path}${jobIdParam}`);

    const pagesArray: PageAudio[] = res.pages
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
      expires_at: p.expires_at,
    }));

    setTracks(tracksArray);

    if (resumeIndex < tracksArray.length) {
      setCurrentIndex(resumeIndex);
      setIsPlaying(true);
    }
  };

  const handleAudioError = async () => {
    await refreshPlaylist(currentIndex);
  };

  const playPage = async (index: number) => {
    const track = tracks[index];
    if (!track) return;

    if (isExpired(track.expires_at)) {
      await refreshPlaylist(index);
    } else {
      setCurrentIndex(index);
      setIsPlaying(true);
    }
  };

  /* ----------------------- EXPIRE CHECK ----------------------- */

  useEffect(() => {
    const interval = setInterval(() => {
      const track = tracks[currentIndex];
      if (track && isExpired(track.expires_at, 60)) {
        refreshPlaylist(currentIndex);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [currentIndex, tracks]);

  /* ----------------------- TITLE ----------------------- */

  useEffect(() => {
    document.title = `${bookTitle} Page ${currentIndex + 1} • Narrio Audiobook`;
    return () => {
      document.title = 'Narrio';
    };
  }, [bookTitle, currentIndex]);

  /* ----------------------- RENDER ----------------------- */

  if (loading) {
    return (
      <div className="p-24 flex justify-center">
        <SpinnerIcon className="w-10 h-10 text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-24 flex flex-col items-center text-center">
        <h2 className="text-xl font-black text-slate-900 mb-2 uppercase">
          {error}
        </h2>
        <p className="text-sm text-slate-400">
          You don’t have permission to access this audiobook.
        </p>
      </div>
    );
  }


  const currentTrack = tracks[currentIndex];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 text-center">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
          {bookTitle}
        </h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          Select a page to begin listening
        </p>
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
          <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Currently Playing: {currentTrack.title}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setShowPages(p => !p)}
          className="px-6 py-2 rounded-full bg-black text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800"
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
              className={`w-full p-5 rounded-2xl flex items-center justify-between
                ${
                  idx === currentIndex
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-100'
                }`}
            >
              <span className="font-black">{p.page}</span>
              {idx === currentIndex && isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6 text-indigo-600" />
              )}
              {p.download_url && (
                <button
                  onClick={async e => {
                    e.stopPropagation();
                    try {
                      await forceDownload(
                        p.download_url,
                        `${bookTitle}_page_${p.page}.mp3`
                      );
                    } catch (err) {
                      alert('Download failed. Please try again.');
                    }
                  }}
                  className={`p-2 rounded-full transition
                    ${
                      idx === currentIndex
                        ? 'hover:bg-indigo-500'
                        : 'hover:bg-slate-100'
                    }`}
                  title="Download page audio"
                >
                  <DownloadIcon
                    className={`w-5 h-5 ${
                      idx === currentIndex ? 'text-white' : 'text-slate-600'
                    }`}
                  />
                </button>
              )}

            </button>
            
          ))}

          {hasMore && (
            <div
              ref={sentinelRef}
              className="flex justify-center py-6"
            >
              <SpinnerIcon className="w-5 h-5 text-indigo-400" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
