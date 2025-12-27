import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobSync, getExternalSyncData, API_BASE_URL } from '../api/api';
import { SpinnerIcon, DownloadIcon } from './Icons';

interface Segment {
  text: string;
  start: number;
  end: number;
}

export default function PlayerView({ mode }: { mode: 'public' | 'private' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("narrio_token");

  const totalDurationFromSegments = useMemo(() => {
    if (segments.length === 0) return 0;
    return segments[segments.length - 1].end;
  }, [segments]);

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return null;
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const syncUrl =
          mode === 'public'
          ? `/public/sync/${id}`
          : `/audio/sync/${id}`;
        const syncRes = await getJobSync(syncUrl);
        const pages = syncRes.pages;
        const sortedPageKeys = Object.keys(pages).sort((a, b) => parseInt(a) - parseInt(b));
        
        let offset = 0;
        const allSegments: Segment[] = [];

        for (const key of sortedPageKeys) {
          const page = pages[key];
          if (!page.sync_url) {
            offset += page.duration || 0;
            continue;
          }

          try {
            const data = await getExternalSyncData(page.sync_url);
            if (data.segments) {
              const adjustedSegments = data.segments.map((seg: any) => ({
                text: seg.text,
                start: seg.start + offset,
                end: seg.end + offset
              }));
              allSegments.push(...adjustedSegments);
            }
          } catch (e) {
            console.error(`Failed to load sync part for page ${key}:`, e);
          }
          
          offset += page.duration || 0;
        }

        setSegments(allSegments);
        setLoading(false);
      } catch (err) {
        console.error("Failed to initialize player:", err);
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Refined highlighting logic to solve the "off-by-one" or "lag" issue.
  // We use a very small forward-looking buffer (0.05s) to ensure the 
  // UI stays in sync with what the user is hearing.
  useEffect(() => {
    const lookAheadTime = currentTime + 0.05;
    const idx = segments.findIndex(s => lookAheadTime >= s.start && lookAheadTime < s.end);
    
    if (idx !== activeSegmentIndex) {
      setActiveSegmentIndex(idx);
      if (idx !== -1 && scrollRef.current) {
        const activeEl = scrollRef.current.querySelector(`[data-index="${idx}"]`);
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentTime, segments, activeSegmentIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += seconds;
  };

  const handleSeek = (time: number) => {
    if (!audioRef.current) return;
    // Seek to exactly the start time of the clicked segment.
    // Adding 0.001 ensures we are strictly within the segment's range for highlighting detection.
    audioRef.current.currentTime = time + 0.001;
  };

  const handleDownload = () => {
    if (!id || !token) return;
    const downloadUrl = 
    mode === 'public'
          ? `${API_BASE_URL}/public/download/${id}?token=${token}`
          : `${API_BASE_URL}/audio/download/${id}?token=${token}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `audiobook-${id.slice(0, 6)}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-slate-400">
      <SpinnerIcon className="w-12 h-12 text-indigo-600 mb-6" />
      <p className="animate-pulse font-black uppercase tracking-widest text-xs">Streaming Neural Sync Data...</p>
    </div>
  );

  if (!id || (segments.length === 0 && !loading)) return (
    <div className="text-center p-24">
      <h2 className="text-2xl font-black text-slate-900">Audiobook Not Ready.</h2>
      <p className="text-slate-500 mb-8">It might still be processing or the file was not found.</p>
      <button onClick={() => navigate('/my-library')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold">Return to Library</button>
    </div>
  );

  const streamUrl =
  mode === 'public'
    ? `${API_BASE_URL}/public/listen/${id}?token=${token}`
    : `${API_BASE_URL}/audio/stream/${id}?token=${token}`;

  const effectiveDuration = (audioRef.current?.duration && audioRef.current.duration !== Infinity) 
    ? audioRef.current.duration 
    : totalDurationFromSegments;

  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-14rem)] flex flex-col bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-fade-in-up">
      <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white/95 backdrop-blur-xl sticky top-0 z-20">
        <button onClick={() => navigate('/my-library')} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all hover:scale-110 active:scale-95 group">
          <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        <div className="flex-grow mx-8 text-center truncate">
          <h2 className="text-xl font-black text-slate-900 truncate tracking-tight uppercase">Audiobook Session</h2>
          <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] leading-none mt-2">Active Neural Stream • ID: {id.slice(0,8)}</p>
        </div>

        <div className="w-12 flex justify-end">
           <div className="relative">
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping opacity-75" />
              <div className="absolute inset-0 w-3 h-3 bg-indigo-600 rounded-full" />
           </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto px-10 md:px-24 py-16 space-y-8 scroll-smooth">
        <div className="max-w-3xl mx-auto leading-[1.8]">
          {segments.map((segment, idx) => (
            <span
              key={idx}
              data-index={idx}
              onClick={() => handleSeek(segment.start)}
              className={`inline cursor-pointer transition-all duration-300 rounded-xl px-2.5 py-1 text-2xl md:text-3xl font-medium tracking-tight ${
                idx === activeSegmentIndex 
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-300 scale-[1.03] mx-1 relative z-10' 
                  : 'text-slate-700 opacity-40 hover:opacity-80 hover:bg-slate-50'
              }`}
            >
              {segment.text}{" "}
            </span>
          ))}
          <div className="h-64" />
        </div>
      </div>

      <div className="bg-slate-950 text-white p-10 relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900">
           <div className="h-full bg-indigo-500 transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(99,102,241,0.8)]" style={{ width: `${progressPercent}%` }} />
        </div>

        <audio 
          ref={audioRef}
          src={streamUrl}
          crossOrigin="anonymous"
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          autoPlay
        />
        
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
             <div className="flex flex-col min-w-[60px]">
               <span className="text-lg font-black tabular-nums tracking-tighter text-white">
                  {formatTime(currentTime) || '0:00'}
               </span>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Elapsed</span>
             </div>
             
             <div className="h-10 w-px bg-slate-800" />

             <div className="flex items-center gap-4">
                <select 
                  value={speed}
                  onChange={(e) => {
                    const s = parseFloat(e.target.value);
                    setSpeed(s);
                    if (audioRef.current) audioRef.current.playbackRate = s;
                  }}
                  className="bg-transparent text-xs font-black text-indigo-400 uppercase tracking-widest border-none p-0 focus:ring-0 cursor-pointer hover:text-white transition-colors"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1">1.0x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2.0x</option>
                </select>

                <button 
                  onClick={handleDownload}
                  className="p-2 text-slate-400 hover:text-indigo-400 transition-all hover:scale-110 active:scale-95"
                  title="Download Audiobook"
                >
                  <DownloadIcon className="w-5 h-5" />
                </button>
             </div>
          </div>

          <div className="flex items-center gap-10">
            <button onClick={() => skip(-10)} className="text-slate-400 hover:text-white transition-all transform hover:scale-125 active:scale-90">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
            </button>
            
            <button onClick={togglePlay} className="w-24 h-24 bg-white text-slate-950 rounded-full flex items-center justify-center hover:bg-indigo-50 hover:scale-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {isPlaying ? (
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg className="w-12 h-12 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>

            <button onClick={() => skip(10)} className="text-slate-400 hover:text-white transition-all transform hover:scale-125 active:scale-90">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg>
            </button>
          </div>

          <div className="flex flex-col items-end min-w-[80px]">
             <span className="text-lg font-black tabular-nums tracking-tighter text-indigo-400">
                {formatTime(effectiveDuration) || 'Calculating...'}
             </span>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Length</span>
          </div>
        </div>
      </div>
    </div>
  );
}