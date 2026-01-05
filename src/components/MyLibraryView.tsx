import { useEffect, useState, useRef } from 'react';
import { fetchMyLibrary, API_BASE_URL } from '../api/api';
import { SpinnerIcon, FileIcon, PlayIcon, PauseIcon, DownloadIcon } from './Icons';
import type { UserAudiobook } from '../types';

export default function MyLibraryView() {
  const [books, setBooks] = useState<UserAudiobook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingJobId, setPlayingJobId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [durations, setDurations] = useState<Record<string, string>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const token = localStorage.getItem("narrio_token");

  useEffect(() => {
    fetchMyLibrary()
      .then(data => {
        setBooks(data);
        setLoading(false);
      })
      .catch(_ => {
        setError("Failed to load your library. Please try again later.");
        setLoading(false);
      });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    if (typeof seconds !== 'number' || isNaN(seconds) || !isFinite(seconds)) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };


  const handlePlayToggle = (book: UserAudiobook) => {
    if (playingJobId === book.job_id && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPaused(false);
      } else {
        audioRef.current.pause();
        setIsPaused(true);
      }
      return;
    }

    setPlayingJobId(book.job_id);
    setIsPaused(false);
    const streamUrl = `${API_BASE_URL}/audio/stream/${book.job_id}?token=${token}`;
    if (audioRef.current) {
      audioRef.current.src = streamUrl;
      audioRef.current.play();
    }
  };

  const handleDownload = (book: UserAudiobook) => {
    const downloadUrl = `${API_BASE_URL}/audio/download/${book.job_id}?token=${token}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${book.title || 'audiobook'}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && playingJobId) {
      const timeStr = formatDuration(audioRef.current.duration);
      if (timeStr) {
        setDurations(prev => ({ ...prev, [playingJobId]: timeStr }));
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 text-slate-400">
      <SpinnerIcon className="w-10 h-10 text-indigo-600 mb-4" />
      <p className="animate-pulse font-bold uppercase tracking-widest text-xs">Opening your bookshelf...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-24 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <audio 
        ref={audioRef} 
        onEnded={() => { setPlayingJobId(null); setIsPaused(false); }}
        onLoadedMetadata={handleLoadedMetadata}
        onError={() => {
          setPlayingJobId(null);
          setIsPaused(false);
        }}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-none uppercase">
            My <span className="text-indigo-600">Collection</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
            Listen to your conversions instantly
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
             <FileIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="pr-4">
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Storage</p>
            <p className="text-lg font-black text-slate-900 leading-none">{books.length} Docs</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-center mb-8 font-bold">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {books.map((book) => {
          const isActive = playingJobId === book.job_id;
          const isPlaying = isActive && !isPaused;
          const duration = durations[book.job_id];

          return (
            <div 
              key={book.job_id} 
              className={`group bg-white rounded-3xl p-5 border shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-6 ${isActive ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-50'}`}
            >
              <button 
                onClick={() => handlePlayToggle(book)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${isPlaying ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-300 hover:bg-indigo-600 hover:text-white active:scale-95'}`}
              >
                 {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7 ml-1" />}
              </button>

              <div className="flex-grow min-w-0">
                 <h3 className="text-lg font-black text-slate-900 truncate tracking-tight uppercase">
                   {book.title || `Untitled Session ${book.job_id.slice(0, 4)}`}
                 </h3>
                 
                 {/* Metadata row always visible */}
                 <div className="flex items-center gap-4 text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">
                    <span className="flex items-center gap-1.5">{formatDate(book.created_at)}</span>
                    <span className="w-1 h-1 bg-slate-100 rounded-full" />
                    {/* <span className="text-indigo-400 font-bold">{book.final_size_mb?.toFixed(1) || '0.0'} MB</span> */}
                    {duration && (
                      <>
                        <span className="w-1 h-1 bg-slate-100 rounded-full" />
                        <span className="text-indigo-600 font-black animate-pulse">{duration}</span>
                      </>
                    )}
                 </div>
              </div>

              <div className="flex items-center gap-2 pr-2">
                 <button 
                  onClick={() => handleDownload(book)}
                  className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                  title="Download WAV"
                 >
                   <DownloadIcon className="w-6 h-6" />
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      {books.length === 0 && !loading && (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <FileIcon className="w-8 h-8 text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Your bookshelf is empty</h3>
          <p className="text-slate-400 text-sm mb-10 max-w-xs mx-auto font-medium text-center">Upload your first PDF on the dashboard to start listening.</p>
        </div>
      )}
    </div>
  );
}
