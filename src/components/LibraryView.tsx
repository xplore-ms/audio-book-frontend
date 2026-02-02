import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublicLibrary } from '../features/audio/hooks/usePublicLibrary';
import { API_BASE_URL } from '../api/client';
import { useUser } from '../context/UserContext';
import type { Audiobook } from '../types';
import { SpinnerIcon, PlayIcon, PauseIcon, DownloadIcon } from './Icons';

function InsufficientCreditsModal({ required, current, onClose, onBuy }: { required: number, current: number, onClose: () => void, onBuy: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full text-center border border-slate-100 animate-fade-in-up">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
           <svg className="w-10 h-10 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Low Credits</h3>
        <p className="text-slate-500 mb-8 leading-relaxed">
          You need <span className="font-bold text-slate-900">{required} credits</span> to unlock this audiobook. You currently have <span className="font-bold text-indigo-600">{current} credits</span>.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={onBuy} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95">
            Get More Credits
          </button>
          <button onClick={onClose} className="w-full py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl hover:bg-slate-100 transition-all">
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LibraryView() {
  const [books, setBooks] = useState<Audiobook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLowCredits, setShowLowCredits] = useState<number | null>(null);
  const [playingJobId, setPlayingJobId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [durations, setDurations] = useState<Record<string, string>>({});
  
  const { user, refreshUser } = useUser();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const token = localStorage.getItem("narrio_token");

  const publicLibraryQuery = usePublicLibrary();

  useEffect(() => {
    if (publicLibraryQuery.data) {
      setBooks(publicLibraryQuery.data);
      setLoading(false);
    }

    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [publicLibraryQuery.data]);

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

  const handleAction = async (book: Audiobook) => {
    // 1. Local Toggle Cache: If same track, just play/pause the existing element
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

    // 2. Auth & Credits check for new tracks
    if (book.required_credits > 0) {
      if (!user) {
        navigate('/signin');
        return;
      }
      if (user.credits < book.required_credits) {
        setShowLowCredits(book.required_credits);
        return;
      }
    }

    // 3. Setup New Stream
    setPlayingJobId(book.job_id);
    setIsPaused(false);
    const streamUrl = `${API_BASE_URL}/public/listen/${book.job_id}?token=${token}`;
    
    if (audioRef.current) {
      audioRef.current.src = streamUrl;
      audioRef.current.play();
      if (book.required_credits > 0) {
        setTimeout(() => refreshUser(), 1500);
      }
    }
  };

  const handleDownload = async (book: Audiobook) => {
    if (!token) return navigate('/signin');
    
    if (book.required_credits > 0 && user && user.credits < book.required_credits) {
      setShowLowCredits(book.required_credits);
      return;
    }

    const downloadUrl = `${API_BASE_URL}/public/download/${book.job_id}?token=${token}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${book.title}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (book.required_credits > 0) {
      setTimeout(() => refreshUser(), 1500);
    }
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
      <p className="animate-pulse font-bold uppercase tracking-widest text-xs">Accessing community library...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-24 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <audio 
        ref={audioRef} 
        onEnded={() => { setPlayingJobId(null); setIsPaused(false); }}
        onLoadedMetadata={handleLoadedMetadata}
        onError={() => { setPlayingJobId(null); setIsPaused(false); }}
      />

      {showLowCredits !== null && user && (
        <InsufficientCreditsModal 
          required={showLowCredits} 
          current={user.credits} 
          onClose={() => setShowLowCredits(null)} 
          onBuy={() => navigate('/store')} 
        />
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter leading-none uppercase">
            Public <span className="text-indigo-600">Archive</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
            Listen to community narrations instantly
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {books.map(book => {
          const isActive = playingJobId === book.job_id;
          const isPlaying = isActive && !isPaused;
          const duration = durations[book.job_id];

          return (
            <div 
              key={book.job_id} 
              className={`group bg-white rounded-3xl p-5 border shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-6 ${isActive ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-50'}`}
            >
              <button 
                onClick={() => handleAction(book)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${isPlaying ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200' : 'bg-indigo-50 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors active:scale-95'}`}
              >
                 {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7 ml-1" />}
              </button>

              <div className="flex-grow min-w-0">
                 <h3 className="text-lg font-black text-slate-900 truncate tracking-tight uppercase">
                   {book.title}
                 </h3>

                 <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                  {formatDate(book.created_at)}
                </div>
                 
                 {/* Metadata row only visible when active/playing */}
                 {isActive && (
                   <div className="flex items-center gap-4 text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1 animate-fade-in">
                      <span className="text-indigo-600 font-black">{book.author}</span>
                      {duration && (
                        <>
                          <span className="w-1 h-1 bg-slate-100 rounded-full" />
                          <span className="text-indigo-500 font-bold">{duration}</span>
                        </>
                      )}
                   </div>
                 )}
              </div>

              <div className="flex flex-col items-end pr-2 gap-2">
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDownload(book)}
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-indigo-600 transition-all"
                      title="Download"
                    >
                      <DownloadIcon className="w-5 h-5" />
                    </button>
                    {book.required_credits > 0 && (
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-2 py-1 bg-slate-50 rounded-lg">
                        {book.required_credits} CR
                      </span>
                    )}
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {books.length === 0 && !loading && (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
           <svg className="w-12 h-12 text-slate-100 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight text-center">Library Archive Empty</h3>
        </div>
      )}
    </div>
  );
}